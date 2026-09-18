// ai-advisor.js (Gemini API 固定費最適化AIアドバイザー)
import {
  findCancelInfo,
  PROMO_CARDS,
  MOCK_DIAGNOSIS_DATA,
} from "./action-data.js";
import {
  createShareSectionHtml,
  initShareCardActions,
} from "./share-card.js";
import { escapeHtml } from "./utils.js";
import { renderBrandIcon } from "./brand-icons.js";

let currentSelectedItemsGetter = null;
let isAnalyzing = false;
let cachedResult = null;
let lastAnalyzedHash = null;

export function isMockMode() {
  const urlParam = new URLSearchParams(window.location.search).get("mock");
  if (urlParam === "true" || urlParam === "1") return true;
  return localStorage.getItem("subsc_mock_mode") === "true";
}

export function setMockMode(enabled) {
  localStorage.setItem("subsc_mock_mode", enabled ? "true" : "false");
  updateMockToggleUI();
}

function updateMockToggleUI() {
  const toggleBtn = document.getElementById("btn-toggle-mock");
  if (!toggleBtn) return;
  const active = isMockMode();
  toggleBtn.innerHTML = `<svg class="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg><span>開発モック:</span> <span class="font-black ${active ? "text-emerald-700 underline" : "text-slate-400"}">${active ? "ON" : "OFF"}</span>`;
  toggleBtn.className = `text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 cursor-pointer ${
    active
      ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm"
      : "bg-slate-100/90 border-slate-200 text-slate-500 hover:bg-slate-200"
  }`;
  toggleBtn.title = "Gemini APIのクォータを消費せずダミーデータで高速UI検証するモードを切り替えます";
}

export function initAIAdvisor(getSelectedItems) {
  currentSelectedItemsGetter = getSelectedItems;

  const btnTrigger = document.getElementById("btn-trigger-ai");
  if (btnTrigger) {
    btnTrigger.addEventListener("click", () => {
      triggerAnalysis(true);
    });
  }

  // 開発用モックモード切り替えボタンの初期化
  const container = document.getElementById("ai-advisor-container");
  if (container && !document.getElementById("btn-toggle-mock")) {
    const subText = container.querySelector("p");
    if (subText && subText.parentNode) {
      const mockWrapper = document.createElement("div");
      mockWrapper.className = "flex items-center gap-2 mt-1.5 flex-wrap";
      subText.parentNode.insertBefore(mockWrapper, subText.nextSibling);

      const mockBtn = document.createElement("button");
      mockBtn.id = "btn-toggle-mock";
      mockBtn.type = "button";
      mockBtn.addEventListener("click", () => {
        const next = !isMockMode();
        setMockMode(next);
        triggerAnalysis(true);
      });
      mockWrapper.appendChild(mockBtn);
      updateMockToggleUI();
    }
  }

  // 結果画面のタブ切り替え初期化
  initResultTabs();
}

/**
 * 分析結果画面の3タブ（内訳 / AI診断 / 解約・乗り換え）の切り替え制御
 */
export function initResultTabs() {
  const tabs = [
    { id: "breakdown", btn: document.getElementById("tab-btn-breakdown"), content: document.getElementById("tab-content-breakdown") },
    { id: "advisor", btn: document.getElementById("tab-btn-advisor"), content: document.getElementById("tab-content-advisor") },
    { id: "actions", btn: document.getElementById("tab-btn-actions"), content: document.getElementById("tab-content-actions") },
  ];

  window.switchResultTab = function (activeId) {
    tabs.forEach(({ id, btn, content }) => {
      if (!btn || !content) return;
      const isActive = id === activeId;
      if (isActive) {
        content.classList.remove("hidden");
        btn.classList.add("bg-white", "text-blue-600", "shadow-xs");
        btn.classList.remove("text-slate-600", "hover:text-slate-900");
      } else {
        content.classList.add("hidden");
        btn.classList.remove("bg-white", "text-blue-600", "shadow-xs");
        btn.classList.add("text-slate-600", "hover:text-slate-900");
      }
    });

    if (activeId === "advisor") {
      const dot = document.getElementById("tab-advisor-dot");
      if (dot) dot.classList.add("hidden");
    }
  };

  tabs.forEach(({ id, btn }) => {
    if (btn) {
      btn.onclick = () => window.switchResultTab(id);
    }
  });
}

export function resetResultTabs() {
  if (typeof window.switchResultTab === "function") {
    window.switchResultTab("breakdown");
  }
}

/**
 * タブ3（解約・乗り換え）のレンダリング
 */
export function renderActionsTab(items = []) {
  const actionsContainer = document.getElementById("actions-container");
  if (!actionsContainer) return;

  let cancelHtml = "";
  if (items && items.length > 0) {
    const cancelCards = items
      .map((item) => {
        const info = findCancelInfo(item.name);
        const monthlyStr = item.monthly ? `¥${Number(item.monthly).toLocaleString()}/月` : "";
        return `
          <div class="flex flex-col justify-between p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-blue-300 hover:shadow-md transition-all group">
            <div>
              <!-- ヘッダー: アイコン + サービス名 + 金額 -->
              <div class="flex items-start gap-3 mb-3">
                ${renderBrandIcon(item.name, item.category, "w-10 h-10 sm:w-11 sm:h-11", "text-sm sm:text-base")}
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-1">
                    <h4 class="font-extrabold text-sm sm:text-base text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      ${escapeHtml(item.name)}
                    </h4>
                    ${monthlyStr ? `<span class="text-xs sm:text-sm font-black text-slate-600 tabular-nums shrink-0 ml-1">${monthlyStr}</span>` : ""}
                  </div>
                  <span class="text-[11px] font-bold text-slate-400">
                    ${item.category ? escapeHtml(item.category) : "サブスク"}
                  </span>
                </div>
              </div>

              <!-- 解約ステップ案内（視覚的タグスタイル） -->
              <div class="bg-slate-50/90 rounded-xl p-2.5 mb-3.5 border border-slate-100/90">
                <div class="text-[11px] font-medium text-slate-600 leading-relaxed flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span class="truncate">${escapeHtml(info.guide)}</span>
                </div>
              </div>
            </div>

            <!-- 公式アクションボタン -->
            <a
              href="${escapeHtml(info.url)}"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-3 text-xs font-bold text-slate-700 bg-slate-100/80 hover:bg-blue-600 hover:text-white rounded-xl shadow-2xs transition-all text-center group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-sm active:scale-98"
            >
              <span>${info.isDirect ? "公式アカウントで解約・管理" : "公式の解約手順を検索"}</span>
              <svg class="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
            </a>
          </div>
        `;
      })
      .join("");

    cancelHtml = `
      <div class="bg-white rounded-3xl p-5 md:p-6 border border-slate-200 shadow-sm space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <h3 class="text-base md:text-lg font-black text-slate-800 tracking-tight">
              見直し・公式解約サポート
            </h3>
            <span class="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200">公式リンク</span>
          </div>
          <span class="text-[11px] text-slate-400 font-medium">※各サービスの公式管理ページへ安全に遷移します</span>
        </div>
        <p class="text-xs text-slate-500 font-medium leading-relaxed">
          見直しや解約を検討したいサービスは、以下の各社公式ページから直接手続きを行えます。
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          ${cancelCards}
        </div>
      </div>
    `;
  }

  const promoCardsHtml = PROMO_CARDS.map((card) => {
    return `
      <div class="flex flex-col justify-between p-5 rounded-2xl border ${card.theme.border} bg-gradient-to-b ${card.theme.bgGradient} shadow-xs hover:shadow-md transition-all">
        <div>
          <!-- バッジ & PR表記 -->
          <div class="flex items-center justify-between gap-2 mb-2.5">
            <span class="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${card.theme.badgeBg}">
              ${escapeHtml(card.badge)}
            </span>
            <span class="text-[10px] font-bold px-1.5 py-0.5 bg-white/90 text-slate-400 rounded border border-slate-200/80">PR</span>
          </div>

          <!-- タイトル & サブタイトル -->
          <h4 class="text-base font-black text-slate-900 tracking-tight mb-0.5">
            ${escapeHtml(card.title)}
          </h4>
          <p class="text-xs font-bold text-slate-500 mb-3">
            ${escapeHtml(card.subTitle || "")}
          </p>

          <!-- お得度ハイライトバッジ -->
          <div class="mb-3.5 px-3 py-1.5 bg-white/95 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-1.5">
            <svg class="w-4 h-4 ${card.theme.highlightColor} shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
            <span class="text-xs font-black ${card.theme.highlightColor}">
              ${escapeHtml(card.savingHighlight)}
            </span>
          </div>

          <!-- 3行のチェックポイント（箇条書き） -->
          <ul class="space-y-1.5 mb-5 text-xs font-medium text-slate-700">
            ${(card.points || []).map(pt => `
              <li class="flex items-start gap-1.5">
                <svg class="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
                </svg>
                <span class="leading-tight">${escapeHtml(pt)}</span>
              </li>
            `).join("")}
          </ul>
        </div>

        <!-- CTAボタン & 安心のマイクロコピー -->
        <div>
          <a
            href="${escapeHtml(card.url)}"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center gap-1.5 w-full py-3 px-4 text-xs md:text-sm font-black rounded-xl shadow-md ${card.theme.buttonBg} active:scale-95 transition-all text-center cursor-pointer group"
          >
            <span>${escapeHtml(card.buttonText)}</span>
            <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </a>
          <p class="text-[10px] text-center text-slate-400 mt-2 font-medium">
            ${escapeHtml(card.microCopy || "")}
          </p>
        </div>
      </div>
    `;
  }).join("");

  const promoHtml = `
    <div class="bg-gradient-to-br from-slate-50 via-white to-blue-50/40 rounded-3xl p-5 md:p-6 border border-blue-200/70 shadow-sm space-y-4">
      <div class="flex items-center justify-between flex-wrap gap-2 border-b border-blue-100/70 pb-3">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
          </div>
          <h3 class="text-base md:text-lg font-black text-slate-800 tracking-tight">
            固定費を圧縮するお得な代替案・乗り換え特典
          </h3>
        </div>
        <span class="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200">おすすめ提案</span>
      </div>
      <p class="text-xs text-slate-500 font-medium leading-relaxed">
        複数の単体契約からまとめ割や無料体験を活用することで、満足度を下げずに月々の支出だけを抑えられます。
      </p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        ${promoCardsHtml}
      </div>
    </div>
  `;

  actionsContainer.innerHTML = `
    <div class="space-y-6">
      ${cancelHtml}
      ${promoHtml}
    </div>
  `;
}

// サブスクリストの内容が変わったかを判定するための簡易ハッシュ
function getItemsHash(items) {
  if (!items || items.length === 0) return "";
  return items.map((i) => `${i.name}-${i.monthly}`).sort().join("|");
}

export async function triggerAnalysis(force = false) {
  if (isAnalyzing) return;

  const contentContainer = document.getElementById("ai-advisor-content");
  const btnTrigger = document.getElementById("btn-trigger-ai");
  if (!contentContainer) return;

  const items = currentSelectedItemsGetter ? currentSelectedItemsGetter() : [];

  // 解約・代替案タブを事前描画（AI診断を待たずに閲覧可能にする）
  renderActionsTab(items);

  if (!items || items.length === 0) {
    contentContainer.innerHTML = `
      <div class="text-center py-8 px-4 bg-white/90 rounded-2xl border border-slate-200">
        <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto mb-3 flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        </div>
        <p class="text-sm font-bold text-slate-700">サブスクが1つも選択されていません</p>
        <p class="text-xs text-slate-500 mt-1">前の画面に戻り、現在利用しているサブスクにチェックを入れてからAI診断をお試しください。</p>
      </div>
    `;
    return;
  }


  const currentHash = getItemsHash(items);
  if (!force && cachedResult && lastAnalyzedHash === currentHash) {
    renderAdvisor(contentContainer, cachedResult, items);
    return;
  }

  isAnalyzing = true;
  if (btnTrigger) {
    btnTrigger.disabled = true;
    btnTrigger.classList.add("opacity-50", "cursor-not-allowed");
    btnTrigger.innerHTML = `<span>⏳</span><span>分析中...</span>`;
  }

  const tracker = createProgressTracker(contentContainer);
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort(new Error("AIサーバーの応答時間が上限（30秒）を超えました。"));
  }, 30000);

  try {
    let data;

    // 開発用モックモード（APIクォータ消費ゼロ）
    if (isMockMode()) {
      console.log("[SubscChecker] 開発モックモードで実行中（Gemini API消費ゼロ）");
      // アニメーション確認用に0.6秒待機
      await new Promise((resolve) => setTimeout(resolve, 650));
      data = MOCK_DIAGNOSIS_DATA;
    } else {
      const payload = items.map((item) => ({
        name: item.name,
        category: item.category,
        monthly: item.monthly,
        yearly: item.yearly,
      }));

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: abortController.signal,
        body: JSON.stringify({ subscriptions: payload }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `診断エラー (${res.status})`);
      }

      data = await res.json();
    }

    clearTimeout(timeoutId);
    cachedResult = data;
    lastAnalyzedHash = currentHash;

    // 100%のアニメーションを完了させてから結果をレンダリング
    await tracker.finish();
    renderAdvisor(contentContainer, data, items);
  } catch (error) {
    clearTimeout(timeoutId);
    tracker.abort();
    console.error("AI Analysis Error:", error);
    const errorMsg =
      error.name === "AbortError"
        ? "AIサーバーの応答時間が上限（30秒）を超えました。通信環境をご確認のうえ再度お試しください。"
        : error.message;
    renderError(contentContainer, errorMsg);
  } finally {
    isAnalyzing = false;
    if (btnTrigger) {
      btnTrigger.disabled = false;
      btnTrigger.classList.remove("opacity-50", "cursor-not-allowed");
      btnTrigger.innerHTML = `<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg><span>再診断する</span>`;
    }
  }
}

const PROGRESS_STEPS = [
  { id: "scan", label: "契約傾向・ジャンルの整理", icon: `<svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>`, threshold: 10 },
  { id: "duplicate", label: "機能重複・二重課金の検出", icon: `<svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>`, threshold: 35 },
  { id: "plan", label: "年払い・プラン最適化の試算", icon: `<svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>`, threshold: 60 },
  { id: "impact", label: "新NISA・将来資産インパクト算出", icon: `<svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>`, threshold: 82 },
];

function createProgressTracker(container) {
  container.innerHTML = `
    <div class="bg-white/90 backdrop-blur-sm border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-sm space-y-5 transition-all">
      <!-- ヘッダー & パーセンテージ表示 -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <svg class="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h4 class="text-sm font-black text-slate-800 tracking-tight">AIアドバイザー診断中</h4>
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">リアルタイム解析</span>
            </div>
            <p id="ai-progress-status" class="text-xs text-slate-500 font-medium mt-0.5">契約サブスクの支出傾向を分析しています...</p>
          </div>
        </div>
        <div class="text-right">
          <span id="ai-progress-percent" class="text-2xl md:text-3xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tabular-nums">0%</span>
        </div>
      </div>

      <!-- プログレスバー -->
      <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/80 shadow-inner">
        <div id="ai-progress-bar" class="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full transition-all duration-200 ease-out relative overflow-hidden" style="width: 5%;">
          <div class="absolute inset-0 bg-white/30 animate-pulse"></div>
        </div>
      </div>

      <!-- 4ステップインジケーター -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        ${PROGRESS_STEPS.map(
          (step) => `
          <div data-step-id="${step.id}" class="step-card flex items-center justify-between p-3 rounded-xl border bg-slate-50/60 border-slate-200/80 transition-all duration-300">
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="text-base shrink-0">${step.icon}</span>
              <span class="text-xs font-semibold text-slate-600 truncate">${step.label}</span>
            </div>
            <span class="step-badge w-5 h-5 shrink-0 flex items-center justify-center rounded-full bg-slate-200 text-slate-400 text-[10px] font-bold">○</span>
          </div>
        `
        ).join("")}
      </div>

      <!-- プレースホルダープレビュー -->
      <div class="animate-pulse pt-2 space-y-2.5 opacity-40">
        <div class="h-16 bg-slate-200/70 rounded-xl w-full"></div>
        <div class="h-12 bg-slate-100 rounded-xl w-full"></div>
      </div>
    </div>
  `;

  const percentEl = container.querySelector("#ai-progress-percent");
  const barEl = container.querySelector("#ai-progress-bar");
  const statusEl = container.querySelector("#ai-progress-status");

  // ステップ要素を初期化時に一度だけ取得・キャッシュしてアニメーション中のDOM探索負荷をゼロにする
  const cachedStepElements = PROGRESS_STEPS.map((step) => {
    const el = container.querySelector(`[data-step-id="${step.id}"]`);
    return {
      step,
      el,
      badgeEl: el ? el.querySelector(".step-badge") : null,
      titleEl: el ? el.querySelector(".truncate") : null,
    };
  });

  let currentPercent = 5;
  const startTime = Date.now();

  const updateUI = (percent, statusText, isCompleted = false) => {
    if (percentEl) percentEl.textContent = `${Math.round(percent)}%`;
    if (barEl) barEl.style.width = `${Math.min(100, Math.max(5, percent))}%`;
    if (statusEl && statusText) statusEl.textContent = statusText;

    cachedStepElements.forEach(({ step, el, badgeEl, titleEl }, idx) => {
      if (!el) return;

      const nextThreshold = PROGRESS_STEPS[idx + 1]?.threshold ?? 92;
      const isDone = isCompleted || percent >= nextThreshold;
      const isActive = !isDone && percent >= step.threshold;

      if (isDone) {
        el.className =
          "step-card flex items-center justify-between p-3 rounded-xl border bg-emerald-50/80 border-emerald-200 transition-all duration-300";
        if (titleEl) titleEl.className = "text-xs font-bold text-emerald-900 truncate";
        if (badgeEl) {
          badgeEl.className =
            "step-badge w-5 h-5 shrink-0 flex items-center justify-center rounded-full bg-emerald-500 text-white text-[11px] font-black";
          badgeEl.innerHTML = `<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>`;
        }
      } else if (isActive) {
        el.className =
          "step-card flex items-center justify-between p-3 rounded-xl border bg-blue-50/90 border-blue-300 shadow-sm transition-all duration-300";
        if (titleEl) titleEl.className = "text-xs font-bold text-blue-900 truncate";
        if (badgeEl) {
          badgeEl.className =
            "step-badge w-5 h-5 shrink-0 flex items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold";
          badgeEl.innerHTML = "▶";
        }
      } else {
        el.className =
          "step-card flex items-center justify-between p-3 rounded-xl border bg-slate-50/60 border-slate-200/80 opacity-60 transition-all duration-300";
        if (titleEl) titleEl.className = "text-xs font-semibold text-slate-500 truncate";
        if (badgeEl) {
          badgeEl.className =
            "step-badge w-5 h-5 shrink-0 flex items-center justify-center rounded-full bg-slate-200 text-slate-400 text-[10px] font-bold";
          badgeEl.innerHTML = "○";
        }
      }
    });
  };

  const timer = setInterval(() => {
    const elapsed = Date.now() - startTime;
    let target = 5;
    let text = "契約サブスクの支出傾向を分析しています...";

    if (elapsed < 1200) {
      target = 5 + (elapsed / 1200) * 25;
      text = "契約サブスクのジャンル・支出傾向を解析中...";
    } else if (elapsed < 3000) {
      target = 30 + ((elapsed - 1200) / 1800) * 28;
      text = "動画・音楽・配送特典などの機能重複を特定中...";
    } else if (elapsed < 5500) {
      target = 58 + ((elapsed - 3000) / 2500) * 22;
      text = "年払い割引・プラン切り替えの節約効果を試算中...";
    } else if (elapsed < 8500) {
      target = 80 + ((elapsed - 5500) / 3000) * 12;
      text = "新NISA積立換算・将来資産インパクトをシミュレーション中...";
    } else {
      target = Math.min(94, 92 + ((elapsed - 8500) / 4000) * 2);
      text = "AIアドバイザーの診断レポートを最終生成中...";
    }

    currentPercent = target;
    updateUI(currentPercent, text, false);
  }, 100);

  return {
    finish: async () => {
      clearInterval(timer);
      updateUI(100, "分析完了！診断レポートを生成しました", true);
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
    abort: () => {
      clearInterval(timer);
    },
  };
}

function renderAdvisor(container, data, items = []) {
  const {
    profile_type,
    summary,
    priority_action,
    duplicate_warnings = [],
    plan_optimizations = [],
    investment_impact,
  } = data;

  const savingAmount = priority_action?.annual_saving
    ? Number(priority_action.annual_saving).toLocaleString()
    : null;

  // 1. 上部の総額カルテ内「節約ポテンシャル」バナーの更新
  const savingBanner = document.getElementById("res-saving-banner");
  const savingText = document.getElementById("res-saving-text");
  if (savingBanner && savingText) {
    if (savingAmount) {
      savingText.innerHTML = `年間最大 <strong class="text-emerald-700 font-black text-base md:text-lg">約${savingAmount}円</strong> 削減できる余地があります`;
      savingBanner.classList.remove("hidden");
    } else {
      savingBanner.classList.add("hidden");
    }
  }

  // 2. 合計金額の計算（シェア用）
  const totalMonthly = items.reduce((sum, i) => sum + (Number(i.monthly) || 0), 0);
  const totalYearly = items.reduce(
    (sum, i) => sum + (Number(i.yearly) || (Number(i.monthly) || 0) * 12),
    0
  );

  // 3. 重複警告 & プラン最適化のHTML作成
  const safeDuplicateWarnings = Array.isArray(duplicate_warnings) ? duplicate_warnings : [];
  let duplicateHtml = "";
  if (safeDuplicateWarnings.length > 0) {
    duplicateHtml = `
      <div class="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <h3 class="text-sm sm:text-base font-black text-amber-950">重複・二重課金の懸念</h3>
        </div>
        <ul class="space-y-2 text-xs sm:text-sm text-amber-900 leading-relaxed">
          ${safeDuplicateWarnings.map((w) => `
            <li class="flex items-start gap-2 bg-white/70 p-2.5 rounded-xl border border-amber-100">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2"></span>
              <span class="font-medium">${escapeHtml(w)}</span>
            </li>
          `).join("")}
        </ul>
      </div>
    `;
  }

  const safePlanOptimizations = Array.isArray(plan_optimizations) ? plan_optimizations : [];
  let planHtml = "";
  if (safePlanOptimizations.length > 0) {
    planHtml = `
      <div class="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 sm:p-5">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-sm sm:text-base font-black text-blue-950">プラン・契約形態の最適化</h3>
        </div>
        <ul class="space-y-2 text-xs sm:text-sm text-blue-900 leading-relaxed">
          ${safePlanOptimizations.map((p) => `
            <li class="flex items-start gap-2 bg-white/70 p-2.5 rounded-xl border border-blue-100">
              <svg class="w-4 h-4 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
              </svg>
              <span class="font-medium">${escapeHtml(p)}</span>
            </li>
          `).join("")}
        </ul>
      </div>
    `;
  }

  // 4. 再投資インパクトのビジュアルパース（数字を抽出してメトリクス表示）
  let investMetricsHtml = "";
  if (investment_impact) {
    // 例: 元本30万円、運用益21万円、将来約51万円などの数字をハイライト
    const principalMatch = investment_impact.match(/元本(\d+万?円?)/);
    const profitMatch = investment_impact.match(/運用益が?約?(\d+万?円?)/);
    const totalMatch = investment_impact.match(/将来約?(\d+万?円?)/);

    if (totalMatch) {
      investMetricsHtml = `
        <div class="grid grid-cols-3 gap-2 my-3 text-center">
          <div class="bg-white/80 rounded-xl p-2.5 border border-indigo-100">
            <span class="text-[10px] font-bold text-slate-400 block">積立元本</span>
            <span class="text-xs sm:text-sm font-black text-slate-700">${principalMatch ? escapeHtml(principalMatch[1]) : "積立資金"}</span>
          </div>
          <div class="bg-white/80 rounded-xl p-2.5 border border-emerald-100">
            <span class="text-[10px] font-bold text-emerald-600 block">想定運用益</span>
            <span class="text-xs sm:text-sm font-black text-emerald-600">+${profitMatch ? escapeHtml(profitMatch[1]) : "成果"}</span>
          </div>
          <div class="bg-white/80 rounded-xl p-2.5 border border-purple-100">
            <span class="text-[10px] font-bold text-purple-600 block">20年後資産</span>
            <span class="text-xs sm:text-sm font-black text-purple-700">${escapeHtml(totalMatch[1])}</span>
          </div>
        </div>
      `;
    }
  }

  // 5. タブ2（AI診断・提案）のレンダリング
  container.innerHTML = `
    <div class="space-y-5 pt-1 animate-in fade-in duration-300">
      <!-- 診断タイプ & 総評 -->
      <div class="bg-slate-50/90 rounded-2xl p-4 sm:p-6 border border-slate-200/80">
        <div class="flex flex-wrap items-center gap-2 mb-2.5">
          <span class="text-xs font-bold text-slate-400">診断タイプ:</span>
          <span class="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs sm:text-sm rounded-full shadow-xs">
            ${escapeHtml(profile_type || "固定費分析完了")}
          </span>
        </div>
        <p class="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
          ${escapeHtml(summary || "")}
        </p>
      </div>

      <!-- 最優先タスク（視覚的 Before/After 比較カード） -->
      ${
        priority_action
          ? `
      <div class="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white border-2 border-emerald-400/80 rounded-2xl p-4 sm:p-6 shadow-xs relative overflow-hidden">
        <div class="flex items-center justify-between gap-2 mb-2">
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] sm:text-xs font-black tracking-wide">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            <span>最優先タスク</span>
          </div>
          ${
            savingAmount
              ? `
            <div class="inline-flex items-baseline gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-lg text-xs font-black">
              <span>年間</span>
              <span class="text-sm font-black text-emerald-700">約${savingAmount}円</span>
              <span>節約</span>
            </div>
          `
              : ""
          }
        </div>

        <h3 class="text-base sm:text-lg font-black text-slate-900 mb-2">
          ${escapeHtml(priority_action.title || "")}
        </h3>

        <!-- Before / After 視覚的比較ボックス（年払い切り替え等の場合） -->
        <div class="bg-white/90 rounded-xl p-3 border border-emerald-200/90 shadow-2xs my-3 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div class="flex-1 min-w-[100px]">
            <span class="text-[10px] font-bold text-slate-400 block uppercase">現在の運用</span>
            <span class="text-xs font-bold text-slate-600">月々支払い</span>
          </div>
          <svg class="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
          <div class="flex-1 min-w-[100px]">
            <span class="text-[10px] font-bold text-emerald-600 block uppercase">推奨アクション</span>
            <span class="text-xs font-black text-slate-800">年払いに集約</span>
          </div>
          ${
            savingAmount
              ? `
            <div class="bg-emerald-600 text-white font-black text-xs px-3 py-1.5 rounded-lg shrink-0 shadow-xs">
              -¥${savingAmount}/年
            </div>
          `
              : ""
          }
        </div>

        <p class="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
          ${escapeHtml(priority_action.reason || "")}
        </p>
      </div>
      `
          : ""
      }

      <!-- 重複警告 & プラン最適化の2カラム (PC時) -->
      ${
        duplicateHtml || planHtml
          ? `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${duplicateHtml}
          ${planHtml}
        </div>
      `
          : ""
      }

      <!-- 資産形成・再投資インパクト -->
      ${
        investment_impact
          ? `
      <div class="bg-gradient-to-br from-purple-50/80 via-indigo-50/60 to-white border border-purple-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div class="flex items-center gap-2 mb-1">
          <div class="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          </div>
          <h3 class="text-sm sm:text-base font-black text-indigo-950">削減資金の再投資インパクト（新NISA試算）</h3>
        </div>

        ${investMetricsHtml}

        <p class="text-xs sm:text-sm text-indigo-950/80 leading-relaxed font-medium mt-1">
          ${escapeHtml(investment_impact)}
        </p>
      </div>
      `
          : ""
      }

      <!-- タブ3（解約・乗り換え）へのクイック遷移ボタン -->
      <div class="pt-2">
        <button
          type="button"
          onclick="window.switchResultTab('actions')"
          class="w-full py-3.5 px-4 bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 active:scale-98 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer group"
        >
          <svg class="w-4 h-4 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
          </svg>
          <span>公式の解約リンク ＆ お得な代替案を見る</span>
          <svg class="w-3.5 h-3.5 text-indigo-300 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        </button>
      </div>
    </div>
  `;

  // 5. タブ3（解約・乗り換え）のレンダリング
  renderActionsTab(items);


  // 6. 画面最下部: 𝕏 シェアブロックのレンダリング
  const shareContainer = document.getElementById("res-share-container");
  if (shareContainer) {
    shareContainer.innerHTML = createShareSectionHtml({
      data,
      items,
      totalMonthly,
      totalYearly,
    });

    initShareCardActions({
      data,
      items,
      totalMonthly,
      totalYearly,
    });
  }

  // 7. タブの通知ドット（AI診断が完了したことを通知）
  const tabAdvisorContent = document.getElementById("tab-content-advisor");
  const dot = document.getElementById("tab-advisor-dot");
  if (dot && tabAdvisorContent && tabAdvisorContent.classList.contains("hidden")) {
    dot.classList.remove("hidden");
  }
}


function renderError(container, message) {
  container.innerHTML = `
    <div class="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
      <div class="w-10 h-10 mx-auto mb-2 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <p class="text-sm font-bold text-red-800 mb-1">AI診断を取得できませんでした</p>
      <p class="text-xs text-red-600 mb-4">${escapeHtml(message || "通信エラーが発生しました")}</p>
      <button
        onclick="window.retryAIAdvisor()"
        class="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl shadow hover:bg-red-700 transition-colors"
      >
        もう一度試す
      </button>
    </div>
  `;

  window.retryAIAdvisor = () => {
    triggerAnalysis(true);
  };
}
