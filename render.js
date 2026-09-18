// render.js（ナビゲーション、ハイライト、結果画面の描画）
import { escapeAttr, animateValue, escapeHtml, formatCurrency } from "./utils.js";
export { escapeAttr, animateValue, escapeHtml, formatCurrency };

export function updateHighlight(card, isChecked) {
  if (!card) return;

  // カードの中にあるベルマークを探す
  const bellBtn = card.querySelector(".bell-btn");

  if (isChecked) {
    card.classList.remove("bg-white", "border-slate-100");
    card.classList.add("bg-blue-50", "border-blue-300", "shadow-md");
    if (bellBtn) bellBtn.classList.remove("invisible", "pointer-events-none");
  } else {
    card.classList.remove("bg-blue-50", "border-blue-300", "shadow-md");
    card.classList.add("bg-white", "border-slate-100");
    if (bellBtn) bellBtn.classList.add("invisible", "pointer-events-none");
  }
}



export function renderNav(cats, container) {
  if (!container) return;
  let htmlNav = "";
  cats.forEach((cat) => {
    htmlNav += `
    <button data-target="section-${cat.id}" class="nav-link group px-4 py-2 md:py-2.5 md:px-4 text-slate-500 bg-white border border-slate-200 md:border-transparent md:bg-transparent rounded-full md:rounded-r-2xl md:rounded-l-none text-sm md:text-base font-bold hover:bg-slate-50 md:hover:bg-blue-50/50 md:hover:text-blue-600 transition-all duration-200 whitespace-nowrap md:w-full md:text-left flex items-center justify-center md:justify-start border-l-0 md:border-l-4 focus:outline-none">
      <span class="flex items-center w-full">
        <span class="w-6 md:w-8 text-lg md:text-xl text-center">${cat.icon}</span>
        <span class="ml-1.5 md:ml-3 text-left flex-1">${cat.name}</span>
      </span>
    </button>`;
  });
  htmlNav += `
  <button data-target="section-custom" class="nav-link group px-4 py-2 md:py-2.5 md:px-4 text-slate-500 bg-white border border-slate-200 md:border-transparent md:bg-transparent rounded-full md:rounded-r-2xl md:rounded-l-none text-sm md:text-base font-bold hover:bg-slate-50 md:hover:bg-blue-50/50 md:hover:text-blue-600 transition-all duration-200 whitespace-nowrap md:w-full md:text-left flex items-center justify-center md:justify-start border-l-0 md:border-l-4 focus:outline-none">
    <span class="flex items-center w-full">
      <span class="w-6 md:w-8 text-lg md:text-xl text-center">✨</span>
      <span class="ml-1.5 md:ml-3 text-left flex-1">独自のサブスク</span>
    </span>
  </button>

<!-- Information セクション -->
  <div class="flex flex-nowrap items-center md:flex-col md:items-stretch gap-1.5 md:gap-1 pt-2 md:pt-4 md:mt-3 border-l md:border-l-0 md:border-t border-slate-200/80 pl-2 md:pl-0">
    <span class="hidden md:block text-[11px] font-bold text-slate-400 tracking-wider uppercase px-4 mb-1">Information</span>

    <a href="/guide.html" class="px-3.5 py-1.5 md:py-2 md:px-4 text-slate-500 hover:text-blue-600 bg-white md:bg-transparent border border-slate-200 md:border-transparent rounded-full md:rounded-xl text-xs md:text-sm font-bold hover:bg-blue-50/60 transition-all whitespace-nowrap flex items-center gap-2">
      <span>📖</span>
      <span>ご利用ガイド・FAQ</span>
    </a>

    <a href="/story.html" class="px-3.5 py-1.5 md:py-2 md:px-4 text-slate-500 hover:text-amber-600 bg-white md:bg-transparent border border-slate-200 md:border-transparent rounded-full md:rounded-xl text-xs md:text-sm font-bold hover:bg-amber-50/60 transition-all whitespace-nowrap flex items-center gap-2">
      <span>💡</span>
      <span>開発背景</span>
    </a>

    <a href="/roadmap.html" class="px-3.5 py-1.5 md:py-2 md:px-4 text-slate-500 hover:text-emerald-600 bg-white md:bg-transparent border border-slate-200 md:border-transparent rounded-full md:rounded-xl text-xs md:text-sm font-bold hover:bg-emerald-50/60 transition-all whitespace-nowrap flex items-center gap-2">
      <span>🗺</span>
      <span>開発ロードマップ</span>
    </a>

    <a href="/about.html" class="px-3.5 py-1.5 md:py-2 md:px-4 text-slate-500 hover:text-purple-600 bg-white md:bg-transparent border border-slate-200 md:border-transparent rounded-full md:rounded-xl text-xs md:text-sm font-bold hover:bg-purple-50/60 transition-all whitespace-nowrap flex items-center gap-2">
      <span>👤</span>
      <span>運営者情報</span>
    </a>

    <a href="https://docs.google.com/forms/d/e/1FAIpQLSdLrJ6cIUE84Elo7LQelJyOHsWM-3415BwIp8oDActYUvmTeg/viewform?usp=header" target="_blank" rel="noopener noreferrer" class="px-3.5 py-1.5 md:py-2 md:px-4 text-slate-500 hover:text-blue-600 bg-white md:bg-transparent border border-slate-200 md:border-transparent rounded-full md:rounded-xl text-xs md:text-sm font-bold hover:bg-blue-50/60 transition-all whitespace-nowrap flex items-center gap-2">
      <span>💬</span>
      <span>追加要望・修正報告</span>
    </a>

    <a href="/policy.html" class="px-3.5 py-1.5 md:py-2 md:px-4 text-slate-500 hover:text-blue-600 bg-white md:bg-transparent border border-slate-200 md:border-transparent rounded-full md:rounded-xl text-xs md:text-sm font-bold hover:bg-blue-50/60 transition-all whitespace-nowrap flex items-center gap-2">
      <span>🛡️</span>
      <span>規約・ポリシー</span>
    </a>
  </div>
  `;
  container.innerHTML = htmlNav;
}

export function renderResultScreen(data) {
  const monthlyEl = document.getElementById("res-monthly-total");
  const yearlyEl = document.getElementById("res-yearly-total");
  const countBadge = document.getElementById("res-count-badge");
  const genreBadge = document.getElementById("res-genre-summary-badge");

  if (monthlyEl) monthlyEl.textContent = Number(data.totalMonthly || 0).toLocaleString();
  if (yearlyEl) yearlyEl.textContent = Number(data.totalYearly || 0).toLocaleString();

  const count = data.selectedItems?.length || 0;
  if (countBadge) {
    countBadge.textContent = `${count}件 契約中`;
  }

  const genreCount = Object.keys(data.genreTotals || {}).filter(
    (g) => (data.genreTotals[g]?.monthly || 0) > 0
  ).length;
  if (genreBadge && genreCount > 0) {
    genreBadge.textContent = `（${genreCount}ジャンル）`;
  }

  const rankContainer = document.getElementById("res-top3-list");
  if (!rankContainer) return;

  if (!data.top5 || data.top5.length === 0) {
    rankContainer.innerHTML =
      '<p class="text-slate-400 text-xs text-center py-6">サブスクが選択されていません</p>';
  } else {
    const rankIcons = [
      "🥇",
      "🥈",
      "🥉",
      '<span class="text-xs font-black text-slate-500 bg-slate-200/80 rounded-full w-5 h-5 flex items-center justify-center">4</span>',
      '<span class="text-xs font-black text-slate-500 bg-slate-200/80 rounded-full w-5 h-5 flex items-center justify-center">5</span>',
    ];
    rankContainer.innerHTML = data.top5
      .map(
        (item, i) => `
      <div class="flex items-center justify-between w-full bg-slate-50/80 hover:bg-slate-100/70 p-3 rounded-2xl border border-slate-200/70 transition-colors">
        <div class="flex items-center gap-2.5 min-w-0 mr-2">
          <div class="w-6 shrink-0 flex justify-center items-center text-base">${rankIcons[i]}</div>
          <span class="font-extrabold text-slate-800 truncate text-xs md:text-sm" title="${escapeAttr(item.name)}">
            ${escapeAttr(item.name)}
          </span>
        </div>
        <div class="shrink-0 font-black text-slate-900 text-xs md:text-sm text-right">
          ¥${Number(item.monthly || 0).toLocaleString()}<span class="text-[10px] font-normal text-slate-400 ml-0.5">/月</span>
        </div>
      </div>
    `,
      )
      .join("");
  }
}

