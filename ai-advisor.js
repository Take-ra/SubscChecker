// ai-advisor.js (Gemini API 固定費最適化AIアドバイザー)
import {
  findCancelInfo,
  PROMO_CARDS,
  getMatchedPromoCards,
  MOCK_DIAGNOSIS_DATA,
} from "./cancel-promo-data.js";
import {
  createShareSectionHtml,
  initShareCardActions,
  openShareModal,
  calculateShareStats,
} from "./share-card.js";
import { escapeHtml } from "./utils.js";
import { renderBrandIcon } from "./brand-icons.js";
import { renderActionsTab } from "./cancel-support-tab.js";
import { createProgressTracker } from "./ai-progress.js";

// 後方互換性のための再エクスポート
export { renderActionsTab, createProgressTracker };

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

  // 開発用モックモード切り替えボタンの初期化（URLに ?mock=1 または ?mock=true が指定されている場合のみ表示）
  const urlParam = new URLSearchParams(window.location.search).get("mock");
  const showDevMock = urlParam === "true" || urlParam === "1" || localStorage.getItem("subsc_dev_ui") === "true";

  const container = document.getElementById("ai-advisor-container");
  if (showDevMock && container && !document.getElementById("btn-toggle-mock")) {
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

  // 結果画面上部のクイックシェアボタン初期化
  const btnQuickShare = document.getElementById("btn-quick-share");
  if (btnQuickShare) {
    btnQuickShare.addEventListener("click", () => {
      const currentItems = currentSelectedItemsGetter ? currentSelectedItemsGetter() : [];
      const stats = calculateShareStats(currentItems, cachedResult || {});
      openShareModal({ stats });
    });
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
  resetActionStates();
  if (btnTrigger) {
    btnTrigger.disabled = true;
    btnTrigger.classList.add("opacity-50", "cursor-not-allowed");
    btnTrigger.innerHTML = `<svg class="w-4 h-4 animate-spin text-white shrink-0" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg><span>分析中...</span>`;
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

      if (items.length === 1) {
        const item = items[0];
        data = {
          profile_type: "スマート単体契約型",
          summary: `現在「${item.name}」のみをご利用中です。機能の重複はありません。年払い割引があるか確認するだけで固定費を最小限に保てます。`,
          actions: [
            {
              id: `act_${item.name}_annual`,
              service: item.name,
              action_type: "plan_change",
              title: "年払いや長期プランの有無を確認する",
              annual_saving: Math.round((Number(item.monthly) || 1000) * 1.5),
              effort: "low",
              time_required_min: 2,
              current_state: `月払い ¥${Number(item.monthly || 0).toLocaleString()}/月`,
              proposed_state: "年払いへの切り替え検討",
              reason_short:
                "多くのサブスクは年払いで約1〜2ヶ月分割引されます。継続利用予定であれば年払い化が最も確実な節約策です。",
            },
          ],
          investment_impact: {
            yearly_amount: Math.round((Number(item.monthly) || 1000) * 1.5),
            monthly_amount: Math.round(((Number(item.monthly) || 1000) * 1.5) / 12),
            principal_20y: Math.round((Number(item.monthly) || 1000) * 1.5 * 20),
            profit_20y: Math.round((Number(item.monthly) || 1000) * 1.5 * 14),
            total_20y: Math.round((Number(item.monthly) || 1000) * 1.5 * 34),
            note: "浮いた固定費をインデックス投信で20年間運用した場合の試算です。",
          },
        };
      } else {
        data = MOCK_DIAGNOSIS_DATA;
      }
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



// アクションのToDo状態（完了・非表示）を保持するストア
let actionStates = {};

export function getActionStates() {
  return actionStates;
}

export function resetActionStates() {
  actionStates = {};
}

function renderAdvisor(container, data, items = []) {
  if (!data) return;

  // 下位互換用フォールバック（旧スキーマが万一返ってきた場合）
  let rawActions = [];
  if (Array.isArray(data.actions) && data.actions.length > 0) {
    rawActions = data.actions;
  } else if (data.priority_action) {
    rawActions.push({
      id: "priority_action_fallback",
      service: items[0]?.name || "契約サブスク",
      action_type: "plan_change",
      title: data.priority_action.title || "プランの最適化",
      annual_saving: Number(data.priority_action.annual_saving) || 0,
      effort: "low",
      time_required_min: 3,
      current_state: "月払い契約",
      proposed_state: "年払いに切り替え",
      reason_short: data.priority_action.reason || "",
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 実データ整合性ガードレール（信頼性・景表法リスクの根絶）
  // ═══════════════════════════════════════════════════════════
  const userItemNames = (items || []).map((i) => (i.name || "").toLowerCase().trim());

  // ガードレール①: ユーザーが実際に契約していないサービスの提案を100%除外
  let actions = rawActions.filter((act) => {
    if (!act || !act.service) return false;
    const actTarget = act.service.toLowerCase().trim();
    const isMatched = userItemNames.some(
      (uName) => uName.includes(actTarget) || actTarget.includes(uName)
    );
    if (!isMatched) {
      console.warn(`[Guardrail] 契約外サービスの提案を除外しました: ${act.service} (${act.title})`);
      return false;
    }
    return true;
  });

  // ガードレール②: ユーザーの登録実価格（月額）に基づく金額の決定論的バリデーション＆補正
  actions.forEach((act) => {
    const actTarget = (act.service || "").toLowerCase().trim();
    const matchedUserItem = (items || []).find((i) => {
      const uName = (i.name || "").toLowerCase().trim();
      return uName.includes(actTarget) || actTarget.includes(uName);
    });

    if (matchedUserItem) {
      const monthly = Number(matchedUserItem.monthly) || 0;
      const yearly = Number(matchedUserItem.yearly) || monthly * 12;

      if (act.action_type === "plan_change") {
        // 年払い削減額は上限（月額×2.5）を超えないようにし、実登録月額ベースで整合
        const maxSaving = Math.round(monthly * 2.5);
        if (act.annual_saving > maxSaving || act.annual_saving <= 0) {
          act.annual_saving = Math.round(monthly * 2); // 2ヶ月分を標準値として適用
        }
      } else if (act.action_type === "review" || act.title.includes("隔月")) {
        // 隔月契約は年間の半額（月額 × 6）
        const rotationSaving = Math.round(monthly * 6);
        act.annual_saving = rotationSaving;
        act.current_state = `通年契約 (年¥${(monthly * 12).toLocaleString()})`;
        act.proposed_state = `見たい月のみ年6回契約 (年¥${rotationSaving.toLocaleString()})`;
      }
    }
  });

  // アクションを削減見込み額（降順）でソート
  actions.sort((a, b) => (Number(b.annual_saving) || 0) - (Number(a.annual_saving) || 0));

  // アクション状態の初期化
  actions.forEach((act) => {
    if (!actionStates[act.id]) {
      actionStates[act.id] = { completed: false, dismissed: false };
    }
  });

  const renderContent = () => {
    // 1. 合計金額および達成額の決定論的計算（1つの数字で完全一致）
    const activeActions = actions.filter((act) => !actionStates[act.id]?.dismissed);
    const totalPotentialSaving = activeActions.reduce(
      (sum, act) => sum + (Number(act.annual_saving) || 0),
      0
    );
    const completedActions = activeActions.filter((act) => actionStates[act.id]?.completed);
    const completedSaving = completedActions.reduce(
      (sum, act) => sum + (Number(act.annual_saving) || 0),
      0
    );
    const completedCount = completedActions.length;
    const progressPercent =
      activeActions.length > 0
        ? Math.min(100, Math.round((completedCount / activeActions.length) * 100))
        : 0;

    // 2. 画面上部「節約ポテンシャル」バナーを完全一致で更新
    const savingBanner = document.getElementById("res-saving-banner");
    const savingText = document.getElementById("res-saving-text");
    if (savingBanner && savingText) {
      if (totalPotentialSaving > 0) {
        savingText.innerHTML = `削減できる余地: <strong class="text-emerald-700 font-black text-base md:text-lg">年¥${totalPotentialSaving.toLocaleString()}</strong>`;
        savingBanner.classList.remove("hidden");
      } else {
        savingBanner.classList.add("hidden");
      }
    }

    // 3. 1契約のみの場合の親切な空状態ハンドリング
    let singleItemNoticeHtml = "";
    if (items && items.length === 1) {
      singleItemNoticeHtml = `
        <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
          <div class="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <h4 class="text-xs sm:text-sm font-black text-slate-800">契約数1件のため、重複・二重課金の心配はありません</h4>
            <p class="text-xs text-slate-500 mt-0.5 leading-relaxed">
              契約中のサブスクが1件のため、サービス間の重複はありません。年払い化でお得になるかの確認や、他のサブスクを追加登録すると二重課金チェックも行えます。
            </p>
          </div>
        </div>
      `;
    }

    // 4. サマリー ＆ 削減達成プログレスバー（重複した長文解説を廃止しシンプル化）
    const summaryCardHtml = `
      <div class="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-800">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span class="text-[11px] font-bold text-slate-400 block mb-1">削減ポテンシャル</span>
            <div class="flex items-baseline gap-2">
              <span class="text-xs sm:text-sm font-extrabold text-emerald-400">年間</span>
              <span class="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
                ¥${totalPotentialSaving.toLocaleString()}
              </span>
              <span class="text-xs sm:text-sm font-bold text-slate-300">節約可能</span>
            </div>
          </div>

          <!-- 削減達成度メーター -->
          <div class="sm:text-right bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 shrink-0 min-w-[200px]">
            <div class="flex items-center justify-between sm:justify-end gap-2 text-xs font-bold text-slate-300 mb-1.5">
              <span>達成:</span>
              <span class="font-black text-emerald-400 text-sm">¥${completedSaving.toLocaleString()}</span>
              <span class="text-slate-400 text-[11px]">(${completedCount}/${activeActions.length}完了)</span>
            </div>
            <div class="w-full bg-slate-950 rounded-full h-2 overflow-hidden p-0.5 border border-slate-700">
              <div class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300" style="width: ${progressPercent}%;"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    // 5. ToDoアクションカードリスト（1画面1主役：チェックボックス ＋ 公式で設定塗りボタン）
    let actionsListHtml = "";
    if (activeActions.length === 0) {
      actionsListHtml = `
        <div class="bg-slate-50 rounded-2xl p-8 text-center border border-slate-200">
          <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mx-auto mb-2 flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <p class="text-sm font-bold text-slate-800">すべての見直しアクションを完了・整理しました！</p>
          <p class="text-xs text-slate-500 mt-1">固定費の最適化が完了しました。月々の支出管理をこのまま継続しましょう。</p>
        </div>
      `;
    } else {
      actionsListHtml = activeActions
        .map((act) => {
          const isDone = actionStates[act.id]?.completed;
          const cancelInfo = findCancelInfo(act.service);
          const deepLinkUrl = act.deeplink || cancelInfo?.url;

          let effortLabel = "手間: 低";
          if (act.effort === "medium") effortLabel = "手間: 中";
          if (act.effort === "high") effortLabel = "手間: 高";

          const timeLabel = act.time_required_min ? `約${act.time_required_min}分` : "数分";
          const savingBadge =
            act.annual_saving > 0
              ? `<span class="inline-flex items-center text-xs font-black px-2 py-0.5 rounded-md ${
                  isDone
                    ? "bg-slate-100 text-slate-500"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }">-¥${Number(act.annual_saving).toLocaleString()}/年</span>`
              : "";

          return `
            <div
              data-action-id="${escapeHtml(act.id)}"
              class="todo-card bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 relative ${
                isDone
                  ? "border-slate-200 bg-slate-50/60 opacity-60"
                  : "border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs"
              }"
            >
              <!-- カード上部: チェックボックス ＋ サービスロゴ ＋ 見出し ＋ 右上スキップ -->
              <div class="flex items-start gap-3">
                <!-- ① チェックボックス（事後行動は控えめな枠に降格） -->
                <button
                  type="button"
                  data-action-btn="toggle-done"
                  data-action-id="${escapeHtml(act.id)}"
                  class="w-6 h-6 mt-1 rounded-full border-2 transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                    isDone
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-slate-300 hover:border-emerald-500 bg-white"
                  }"
                  title="${isDone ? "未完了に戻す" : "完了にする"}"
                >
                  ${
                    isDone
                      ? `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>`
                      : ""
                  }
                </button>

                <!-- アイコン -->
                ${renderBrandIcon(act.service, "", "w-10 h-10 sm:w-11 sm:h-11 shrink-0", "text-sm")}

                <!-- コンテンツ本体 -->
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2 flex-wrap min-w-0">
                      <span class="text-xs font-bold text-slate-500 truncate">${escapeHtml(act.service)}</span>
                      <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                        ${effortLabel} · ${timeLabel}
                      </span>
                    </div>

                    <!-- 右上: スキップ（興味ない）ボタン -->
                    <button
                      type="button"
                      data-action-btn="dismiss"
                      data-action-id="${escapeHtml(act.id)}"
                      class="text-slate-300 hover:text-slate-500 p-1 -mr-1 transition-colors cursor-pointer"
                      title="この提案を非表示"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>

                  <!-- タイトル（動詞の命令形） -->
                  <h4 class="text-sm sm:text-base font-black text-slate-900 mt-0.5 leading-snug ${
                    isDone ? "line-through text-slate-400" : ""
                  }">
                    ${escapeHtml(act.title)}
                  </h4>

                  <!-- Before / After（箱をなくしスッキリ1行表示） -->
                  ${
                    act.current_state && act.proposed_state
                      ? `
                    <div class="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5 flex-wrap">
                      <span class="text-slate-400">${escapeHtml(act.current_state)}</span>
                      <span class="text-slate-300">→</span>
                      <span class="font-bold text-slate-700">${escapeHtml(act.proposed_state)}</span>
                    </div>
                  `
                      : ""
                  }

                  <!-- 理由アコーディオン ＆ 唯一の主役ボタン（公式で設定） -->
                  <div class="mt-3 pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <details class="group text-xs text-slate-500">
                      <summary class="cursor-pointer font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 select-none transition-colors underline decoration-blue-300 underline-offset-2 hover:decoration-blue-500">
                        <svg class="w-3.5 h-3.5 transition-transform group-open:rotate-90 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path>
                        </svg>
                        <span>なぜ？（理由を見る）</span>
                      </summary>
                      <div class="mt-2 pl-3 py-1.5 text-xs text-slate-600 border-l-2 border-blue-400 leading-relaxed font-medium bg-blue-50/40 rounded-r-lg">
                        ${escapeHtml(act.reason_short)}
                      </div>
                    </details>

                    <div class="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                      ${savingBadge}

                      <!-- ② 公式で設定（画面内の唯一の塗りボタン） -->
                      ${
                        deepLinkUrl
                          ? `
                        <a
                          href="${escapeHtml(deepLinkUrl)}"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="px-3.5 py-1.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>公式で設定</span>
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                          </svg>
                        </a>
                      `
                          : ""
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
        })
        .join("");
    }

    // 6. 新NISA・再投資インパクト試算カード（数字はactionsの合計と完全連動）
    let investmentHtml = "";
    if (totalPotentialSaving > 0) {
      const principal20y = totalPotentialSaving * 20;
      const profit20y = Math.round(totalPotentialSaving * 14.1); // 年利5%・20年の想定運用益倍率
      const total20y = principal20y + profit20y;

      investmentHtml = `
        <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
            <h3 class="text-xs sm:text-sm font-black text-slate-800">
              削減資金の再投資インパクト（新NISA 20年試算）
            </h3>
          </div>

          <div class="grid grid-cols-3 gap-2 my-2.5 text-center">
            <div class="bg-slate-50 rounded-xl p-2 border border-slate-100">
              <span class="text-[10px] font-bold text-slate-400 block">積立元本</span>
              <span class="text-xs sm:text-sm font-black text-slate-700">¥${principal20y.toLocaleString()}</span>
            </div>
            <div class="bg-emerald-50/70 rounded-xl p-2 border border-emerald-100">
              <span class="text-[10px] font-bold text-emerald-600 block">想定運用益</span>
              <span class="text-xs sm:text-sm font-black text-emerald-700">+¥${profit20y.toLocaleString()}</span>
            </div>
            <div class="bg-indigo-50/70 rounded-xl p-2 border border-indigo-100">
              <span class="text-[10px] font-bold text-indigo-600 block">20年後総額</span>
              <span class="text-xs sm:text-sm font-black text-indigo-700">約¥${total20y.toLocaleString()}</span>
            </div>
          </div>

          <p class="text-[11px] text-slate-400 font-medium leading-relaxed">
            ※浮いた固定費（年¥${totalPotentialSaving.toLocaleString()}）を新NISAのインデックス投信（年利5%想定）に20年積立運用した場合の試算です。
          </p>
        </div>
      `;
    }

    // 7. 全体HTMLを結合（重複していた下部の黒い巨大CTAを削除）
    container.innerHTML = `
      <div class="space-y-4 pt-1 animate-in fade-in duration-300">
        ${singleItemNoticeHtml}
        ${summaryCardHtml}

        <!-- ToDoアクション一覧セクション -->
        <div class="space-y-2.5">
          <div class="flex items-center justify-between px-1">
            <h3 class="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <span>優先見直しToDo</span>
              <span class="text-xs font-bold text-slate-400">(${activeActions.length}件)</span>
            </h3>
            <span class="text-[10px] text-slate-400 font-medium">削減効果順</span>
          </div>

          <div class="space-y-2.5">
            ${actionsListHtml}
          </div>
        </div>

        <!-- 完了感・健全性の肯定メッセージ（提案が少なくても整理されている安心感を提示） -->
        <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 text-slate-600">
          <div class="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div class="text-xs leading-relaxed">
            <span class="font-bold text-slate-800">見つかった見直し候補は以上です。</span>
            <span class="text-slate-500 font-medium block sm:inline sm:ml-1">不要な二重契約が少なく、現在の契約状況は良好に整理されています。</span>
          </div>
        </div>

        ${investmentHtml}
      </div>
    `;

    // 8. イベントリスナー（チェックボックス・非表示ボタン）のバインド
    container.querySelectorAll('[data-action-btn="toggle-done"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-action-id");
        if (id && actionStates[id]) {
          const wasCompleted = actionStates[id].completed;
          actionStates[id].completed = !wasCompleted;
          renderContent();

          // 未完了から完了になった瞬間、ドーパミン達成シェアモーダルを起動
          if (!wasCompleted) {
            const completedAction = actions.find((a) => a.id === id);
            if (completedAction) {
              const stats = calculateShareStats(items, data);
              openShareModal({ stats, completedAction });
            }
          }
        }
      });
    });

    container.querySelectorAll('[data-action-btn="dismiss"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-action-id");
        if (id && actionStates[id]) {
          actionStates[id].dismissed = true;
          renderContent();
        }
      });
    });
  };

  renderContent();

  // 9. 解約・代替案タブの事前レンダリング
  renderActionsTab(items);

  // 10. 𝕏 シェアブロックのレンダリング
  // (1) 支出の内訳タブ: メインの巨大シェアカード
  const shareContainer = document.getElementById("res-share-container");
  if (shareContainer) {
    shareContainer.innerHTML = createShareSectionHtml({
      data,
      items,
    });

    initShareCardActions({
      data,
      items,
    });
  }

  // (2) 見直し案タブ ＆ 解約タブ: 各タブの目的に集中できる控えめな1行スリムシェアバー
  const slimShareHtml = `
    <div class="mt-4 pt-4 border-t border-slate-200/80 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500">
      <div class="flex items-center gap-1.5 font-medium">
        <svg class="w-3.5 h-3.5 fill-current text-slate-700" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        <span>診断結果の固定費カルテ画像をシェアできます</span>
      </div>
      <button
        type="button"
        class="btn-trigger-slim-share inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
      >
        <span>カルテ画像をシェアする</span>
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
    </div>
  `;

  const advisorShareBar = document.getElementById("res-advisor-share-bar");
  if (advisorShareBar) advisorShareBar.innerHTML = slimShareHtml;

  const actionsShareBar = document.getElementById("res-actions-share-bar");
  if (actionsShareBar) actionsShareBar.innerHTML = slimShareHtml;

  document.querySelectorAll(".btn-trigger-slim-share").forEach((btn) => {
    btn.addEventListener("click", () => {
      const stats = calculateShareStats(items, data);
      openShareModal({ stats });
    });
  });

  // 11. タブの通知ドット制御
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
