// ai-progress.js (AI診断中のプログレストラッカー・アニメーション制御モジュール)

export const PROGRESS_STEPS = [
  { id: "scan", label: "契約傾向・ジャンルの整理", icon: `<svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>`, threshold: 10 },
  { id: "duplicate", label: "機能重複・二重課金の検出", icon: `<svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>`, threshold: 35 },
  { id: "plan", label: "年払い・プラン最適化の試算", icon: `<svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>`, threshold: 60 },
  { id: "impact", label: "新NISA・将来資産インパクト算出", icon: `<svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>`, threshold: 82 },
];

export function createProgressTracker(container) {
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
          badgeEl.innerHTML = `<svg class="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
        }
      } else {
        el.className =
          "step-card flex items-center justify-between p-3 rounded-xl border bg-slate-50/60 border-slate-200/80 opacity-60 transition-all duration-300";
        if (titleEl) titleEl.className = "text-xs font-semibold text-slate-500 truncate";
        if (badgeEl) {
          badgeEl.className =
            "step-badge w-5 h-5 shrink-0 flex items-center justify-center rounded-full bg-slate-200 text-slate-400 text-[10px] font-bold";
          badgeEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-slate-300"></span>`;
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

