// render.js（ユーティリティ、ナビゲーション、結果画面の描画）

// HTML属性内に埋め込む文字列をエスケープする（XSS/構文エラー対策）
export function escapeAttr(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/'/g, "&#39;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function updateHighlight(card, isChecked) {
  if (!card) return;

  // カードの中にあるベルマークを探す
  const bellBtn = card.querySelector(".bell-btn");

  if (isChecked) {
    card.classList.remove("bg-white", "border-slate-100");
    card.classList.add("bg-blue-50", "border-blue-300", "shadow-md");
    if (bellBtn) bellBtn.classList.remove("invisible");
  } else {
    card.classList.remove("bg-blue-50", "border-blue-300", "shadow-md");
    card.classList.add("bg-white", "border-slate-100");
    if (bellBtn) bellBtn.classList.add("invisible");
  }
}

export function animateValue(element, start, end, duration) {
  if (start === end) return;
  if (element.animationId) cancelAnimationFrame(element.animationId);
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const t = Math.min((timestamp - startTimestamp) / duration, 1);
    const progress = t * (2 - t);
    const currentVal = Math.floor(start + (end - start) * progress);
    element.textContent = currentVal.toLocaleString();
    if (t < 1) {
      element.animationId = window.requestAnimationFrame(step);
    } else {
      element.textContent = end.toLocaleString();
      element.animationId = null;
    }
  };
  element.animationId = window.requestAnimationFrame(step);
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
  document.getElementById("res-monthly-total").textContent =
    data.totalMonthly.toLocaleString();
  document.getElementById("res-yearly-total").textContent =
    data.totalYearly.toLocaleString();
  const rankContainer = document.getElementById("res-top3-list");

  if (data.top5.length === 0) {
    rankContainer.innerHTML =
      '<p class="text-slate-500 text-sm text-center py-4">サブスクが選択されていません</p>';
  } else {
    const rankIcons = [
      "🥇",
      "🥈",
      "🥉",
      '<span class="text-lg font-bold text-slate-400">4</span>',
      '<span class="text-lg font-bold text-slate-400">5</span>',
    ];
    rankContainer.innerHTML = data.top5
      .map(
        (item, i) => `
      <div class="flex items-center w-full bg-slate-50 p-3 md:px-4 rounded-xl border border-slate-100">
        <div class="w-7 md:w-8 flex-shrink-0 flex justify-center items-center">${rankIcons[i]}</div>
        
        <div class="ml-2 md:ml-3 flex-1 text-left font-extrabold text-slate-900 truncate text-base md:text-lg" title="${item.name}">
          ${item.name}
        </div>
        
        <div class="flex-shrink-0 ml-3 font-bold text-slate-700 text-base md:text-lg text-right whitespace-nowrap">
          ${item.monthly.toLocaleString()}円<span class="text-xs md:text-sm font-normal text-slate-400">/月</span>
        </div>
      </div>
    `,
      )
      .join("");
  }
}
