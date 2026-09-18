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
  toggleBtn.innerHTML = `<span>🛠️ 開発モック:</span> <span class="font-black ${active ? "text-emerald-700 underline" : "text-slate-400"}">${active ? "ON" : "OFF"}</span>`;
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
          <div class="flex flex-col justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs transition-all">
            <div>
              <div class="flex items-center justify-between gap-2 mb-1.5">
                <span class="font-extrabold text-xs md:text-sm text-slate-800 truncate">${escapeHtml(item.name)}</span>
                ${monthlyStr ? `<span class="text-[11px] font-black text-slate-500 shrink-0">${monthlyStr}</span>` : ""}
              </div>
              <p class="text-[11px] text-slate-500 mb-3.5 leading-relaxed">
                ${escapeHtml(info.guide)}
              </p>
            </div>
            <a
              href="${escapeHtml(info.url)}"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-3 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-300/80 rounded-xl shadow-2xs hover:bg-slate-100 hover:text-slate-900 active:scale-98 transition-all text-center"
            >
              <span>${info.isDirect ? "公式の解約・設定管理を開く" : "公式の解約手順を検索"}</span>
              <span class="text-xs">↗</span>
            </a>
          </div>
        `;
      })
      .join("");

    cancelHtml = `
      <div class="bg-white rounded-3xl p-5 md:p-6 border border-slate-200 shadow-sm space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-lg">🔒</span>
            <h3 class="text-base md:text-lg font-black text-slate-800">
              見直し・公式解約サポート
            </h3>
            <span class="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">公式リンク</span>
          </div>
          <span class="text-[11px] text-slate-400 font-medium">※各社の公式管理画面へ安全に遷移します</span>
        </div>
        <p class="text-xs text-slate-500 font-medium leading-relaxed">
          見直しや解約を検討したいサービスは、以下の各社公式アカウントページから直接手続きを行えます。
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          ${cancelCards}
        </div>
      </div>
    `;
  }

  const promoCardsHtml = PROMO_CARDS.map((card) => {
    return `
      <div class="flex flex-col justify-between p-4 md:p-5 rounded-2xl border ${card.theme.border} bg-gradient-to-b ${card.theme.bgGradient} shadow-xs hover:shadow-sm transition-all">
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${card.theme.badgeBg}">
              ${escapeHtml(card.badge)}
            </span>
            <span class="text-[9px] font-bold px-1.5 py-0.5 bg-white/90 text-slate-400 rounded border border-slate-200/80">PR</span>
          </div>

          <h4 class="text-xs md:text-sm font-black text-slate-900 leading-snug mb-2">
            ${escapeHtml(card.title)}
          </h4>

          <div class="inline-block mb-2.5 px-2.5 py-1 bg-white/95 rounded-lg border border-slate-200/80 shadow-2xs">
            <p class="text-[11px] md:text-xs font-black ${card.theme.highlightColor}">
              ${escapeHtml(card.savingHighlight)}
            </p>
          </div>

          <p class="text-xs text-slate-600 leading-relaxed mb-4 font-medium">
            ${escapeHtml(card.description)}
          </p>
        </div>

        <a
          href="${escapeHtml(card.url)}"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-3 text-xs font-black rounded-xl shadow-xs ${card.theme.buttonBg} active:scale-95 transition-all text-center"
        >
          <span>${escapeHtml(card.buttonText)}</span>
        </a>
      </div>
    `;
  }).join("");

  const promoHtml = `
    <div class="bg-gradient-to-br from-slate-50 via-white to-blue-50/40 rounded-3xl p-5 md:p-6 border border-blue-200/70 shadow-sm space-y-4">
      <div class="flex items-center justify-between flex-wrap gap-2 border-b border-blue-100/70 pb-3">
        <div class="flex items-center gap-2">
          <span class="text-lg">💡</span>
          <h3 class="text-base md:text-lg font-black text-slate-800">
            固定費を圧縮するお得な代替案・乗り換え特典
          </h3>
        </div>
        <span class="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200">おすすめ提案</span>
      </div>
      <p class="text-xs text-slate-500 font-medium leading-relaxed">
        複数の単体契約から集約プランや無料体験を活用することで、サービスの質を落とさずに月々の支出だけを圧縮できます。
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
      <div class="text-center py-6 px-4 bg-white/90 rounded-2xl border border-slate-200">
        <span class="text-3xl mb-2 block">📝</span>
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
      console.log("🛠️ [SubscChecker] 開発モックモードで実行中（Gemini API消費ゼロ）");
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
      btnTrigger.innerHTML = `<span>🔄</span><span>再診断する</span>`;
    }
  }
}

const PROGRESS_STEPS = [
  { id: "scan", label: "契約傾向・ジャンルの整理", icon: "📊", threshold: 10 },
  { id: "duplicate", label: "機能重複・二重課金の検出", icon: "🔍", threshold: 35 },
  { id: "plan", label: "年払い・プラン最適化の試算", icon: "💡", threshold: 60 },
  { id: "impact", label: "新NISA・将来資産インパクト算出", icon: "📈", threshold: 82 },
];

function createProgressTracker(container) {
  container.innerHTML = `
    <div class="bg-white/90 backdrop-blur-sm border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-sm space-y-5 transition-all">
      <!-- ヘッダー & パーセンテージ表示 -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <span class="text-lg animate-pulse">✨</span>
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
          badgeEl.innerHTML = "✓";
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
      updateUI(100, "✨ 分析完了！診断レポートを生成しました", true);
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
      <div class="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 md:p-5">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-base">⚠️</span>
          <h3 class="text-sm md:text-base font-black text-amber-900">重複・二重課金の懸念</h3>
        </div>
        <ul class="space-y-2 text-xs md:text-sm text-amber-800 leading-relaxed list-disc list-inside">
          ${safeDuplicateWarnings.map((w) => `<li>${escapeHtml(w)}</li>`).join("")}
        </ul>
      </div>
    `;
  }

  const safePlanOptimizations = Array.isArray(plan_optimizations) ? plan_optimizations : [];
  let planHtml = "";
  if (safePlanOptimizations.length > 0) {
    planHtml = `
      <div class="bg-blue-50/90 border border-blue-200/90 rounded-2xl p-4 md:p-5">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-base">💡</span>
          <h3 class="text-sm md:text-base font-black text-blue-900">プラン・契約形態の最適化</h3>
        </div>
        <ul class="space-y-2 text-xs md:text-sm text-blue-800 leading-relaxed list-disc list-inside">
          ${safePlanOptimizations.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}
        </ul>
      </div>
    `;
  }

  // 4. タブ2（AI診断・提案）のレンダリング
  container.innerHTML = `
    <div class="space-y-5 pt-1 animate-in fade-in duration-300">
      <!-- 診断タイプ & 総評 -->
      <div class="bg-slate-50/90 rounded-2xl p-4 md:p-6 border border-slate-200/80">
        <div class="flex flex-wrap items-center gap-2 mb-2.5">
          <span class="text-xs font-bold text-slate-400">あなたの支出傾向:</span>
          <span class="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs md:text-sm rounded-full shadow-xs">
            ${escapeHtml(profile_type || "固定費分析完了")}
          </span>
        </div>
        <p class="text-xs md:text-sm text-slate-700 font-medium leading-relaxed">
          ${escapeHtml(summary || "")}
        </p>
      </div>

      <!-- ★ 最優先アクション（ワンタップ意思決定） -->
      ${
        priority_action
          ? `
      <div class="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border-2 border-emerald-400/80 rounded-2xl p-4 md:p-6 shadow-xs relative overflow-hidden">
        <div class="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] md:text-xs font-black px-3 py-1 rounded-bl-xl tracking-wider">
          ★ 最優先タスク
        </div>
        <div class="flex items-center gap-2 mb-2">
          <span class="text-lg">🎯</span>
          <h3 class="text-base md:text-lg font-black text-slate-900">
            ${escapeHtml(priority_action.title || "")}
          </h3>
        </div>
        ${
          savingAmount
            ? `
          <div class="inline-flex items-baseline gap-1 my-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs md:text-sm font-black">
            <span>年間で約</span>
            <span class="text-base md:text-lg font-extrabold text-emerald-700">${savingAmount}円</span>
            <span>節約可能</span>
          </div>
        `
            : ""
        }
        <p class="text-xs md:text-sm text-slate-600 font-medium mt-2 leading-relaxed">
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
      <div class="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200/80 rounded-2xl p-4 md:p-5">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-base">📈</span>
          <h3 class="text-sm md:text-base font-black text-indigo-950">削減資金の再投資インパクト</h3>
        </div>
        <p class="text-xs md:text-sm text-indigo-900 leading-relaxed font-medium">
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
          class="w-full py-3.5 px-4 bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 active:scale-98 text-white font-black text-xs md:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer group"
        >
          <span>🔒</span>
          <span>公式の解約リンク ＆ お得な代替案を見る</span>
          <span class="text-xs group-hover:translate-x-1 transition-transform">→</span>
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
      <span class="text-2xl mb-1 block">⚠️</span>
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
