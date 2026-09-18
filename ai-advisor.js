// ai-advisor.js (Gemini API 固定費最適化AIアドバイザー)

let currentSelectedItemsGetter = null;
let isAnalyzing = false;
let cachedResult = null;
let lastAnalyzedHash = null;

export function initAIAdvisor(getSelectedItems) {
  currentSelectedItemsGetter = getSelectedItems;

  const btnTrigger = document.getElementById("btn-trigger-ai");
  if (btnTrigger) {
    btnTrigger.addEventListener("click", () => {
      triggerAnalysis();
    });
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
    renderAdvisor(contentContainer, cachedResult);
    return;
  }

  isAnalyzing = true;
  if (btnTrigger) {
    btnTrigger.disabled = true;
    btnTrigger.classList.add("opacity-50", "cursor-not-allowed");
    btnTrigger.innerHTML = `<span>⏳</span><span>分析中...</span>`;
  }

  const tracker = createProgressTracker(contentContainer);

  try {
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
      body: JSON.stringify({ subscriptions: payload }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `診断エラー (${res.status})`);
    }

    const data = await res.json();
    cachedResult = data;
    lastAnalyzedHash = currentHash;

    // 100%のアニメーションを完了させてから結果をレンダリング
    await tracker.finish();
    renderAdvisor(contentContainer, data);
  } catch (error) {
    tracker.abort();
    console.error("AI Analysis Error:", error);
    renderError(contentContainer, error.message);
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

  let currentPercent = 5;
  const startTime = Date.now();

  const updateUI = (percent, statusText, isCompleted = false) => {
    if (percentEl) percentEl.textContent = `${Math.round(percent)}%`;
    if (barEl) barEl.style.width = `${Math.min(100, Math.max(5, percent))}%`;
    if (statusEl && statusText) statusEl.textContent = statusText;

    PROGRESS_STEPS.forEach((step, idx) => {
      const stepEl = container.querySelector(`[data-step-id="${step.id}"]`);
      if (!stepEl) return;
      const badgeEl = stepEl.querySelector(".step-badge");
      const titleEl = stepEl.querySelector(".truncate");

      const nextThreshold = PROGRESS_STEPS[idx + 1]?.threshold ?? 92;
      const isDone = isCompleted || percent >= nextThreshold;
      const isActive = !isDone && percent >= step.threshold;

      if (isDone) {
        stepEl.className =
          "step-card flex items-center justify-between p-3 rounded-xl border bg-emerald-50/80 border-emerald-200 transition-all duration-300";
        if (titleEl) titleEl.className = "text-xs font-bold text-emerald-900 truncate";
        if (badgeEl) {
          badgeEl.className =
            "step-badge w-5 h-5 shrink-0 flex items-center justify-center rounded-full bg-emerald-500 text-white text-[11px] font-black";
          badgeEl.innerHTML = "✓";
        }
      } else if (isActive) {
        stepEl.className =
          "step-card flex items-center justify-between p-3 rounded-xl border bg-blue-50/90 border-blue-300 shadow-sm transition-all duration-300";
        if (titleEl) titleEl.className = "text-xs font-bold text-blue-900 truncate";
        if (badgeEl) {
          badgeEl.className =
            "step-badge w-5 h-5 shrink-0 flex items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold";
          badgeEl.innerHTML = "▶";
        }
      } else {
        stepEl.className =
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

function renderAdvisor(container, data) {
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

  let duplicateHtml = "";
  if (duplicate_warnings.length > 0) {
    duplicateHtml = `
      <div class="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 md:p-5">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-base">⚠️</span>
          <h3 class="text-sm md:text-base font-black text-amber-900">重複・二重課金の懸念</h3>
        </div>
        <ul class="space-y-2 text-xs md:text-sm text-amber-800 leading-relaxed list-disc list-inside">
          ${duplicate_warnings.map((w) => `<li>${escapeHtml(w)}</li>`).join("")}
        </ul>
      </div>
    `;
  }

  let planHtml = "";
  if (plan_optimizations.length > 0) {
    planHtml = `
      <div class="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 md:p-5">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-base">💡</span>
          <h3 class="text-sm md:text-base font-black text-blue-900">プラン・契約形態の最適化</h3>
        </div>
        <ul class="space-y-2 text-xs md:text-sm text-blue-800 leading-relaxed list-disc list-inside">
          ${plan_optimizations.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}
        </ul>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="space-y-4 pt-1 animate-in fade-in duration-300">
      <!-- 診断タイプ & 総評 -->
      <div class="bg-white/90 rounded-2xl p-4 md:p-6 border border-slate-200 shadow-sm">
        <div class="flex flex-wrap items-center gap-2 mb-2.5">
          <span class="text-xs font-bold text-slate-400">あなたの支出傾向:</span>
          <span class="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs md:text-sm rounded-full shadow-sm">
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
      <div class="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border-2 border-emerald-400/80 rounded-2xl p-4 md:p-6 shadow-sm relative overflow-hidden">
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
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${duplicateHtml}
        ${planHtml}
      </div>

      <!-- 資産形成・再投資インパクト -->
      ${
        investment_impact
          ? `
      <div class="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200/70 rounded-2xl p-4 md:p-5">
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
    </div>
  `;
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

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
