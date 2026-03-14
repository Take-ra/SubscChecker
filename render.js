// render.js

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
    <button data-target="section-${cat.id}" class="nav-link group px-4 py-2 md:py-2.5 md:px-4 text-slate-500 bg-white border border-slate-200 md:border-transparent md:bg-transparent rounded-full md:rounded-r-2xl md:rounded-l-none text-sm md:text-base font-bold hover:bg-slate-50 md:hover:bg-blue-50/50 md:hover:text-blue-600 transition-all duration-200 whitespace-nowrap md:w-full md:text-left flex items-center justify-center md:justify-start border-l-0 md:border-l-4 focus:outline-none"> <span class="flex items-center w-full">
        <span class="w-6 md:w-8 text-lg md:text-xl text-center">${cat.icon}</span>
        <span class="ml-1.5 md:ml-3 text-left flex-1">${cat.name}</span>
      </span>
    </button>`;
  });
  htmlNav += `
  <button data-target="section-custom" class="nav-link group px-4 py-2 md:py-2.5 md:px-4 text-slate-500 bg-white border border-slate-200 md:border-transparent md:bg-transparent rounded-full md:rounded-r-2xl md:rounded-l-none text-sm md:text-base font-bold hover:bg-slate-50 md:hover:bg-blue-50/50 md:hover:text-blue-600 transition-all duration-200 whitespace-nowrap md:w-full md:text-left flex items-center justify-center md:justify-start border-l-0 md:border-l-4 focus:outline-none"> <span class="flex items-center w-full">
      <span class="w-6 md:w-8 text-lg md:text-xl text-center">✨</span>
      <span class="ml-1.5 md:ml-3 text-left flex-1">独自のサブスク</span>
    </span>
  </button>`;
  container.innerHTML = htmlNav;
}

export function renderMainList(cats, subs, savedState, container) {
  if (!container) return;
  let htmlList = "";
  cats.forEach((cat) => {
    const catSubs = subs.filter((s) => s.categoryId === cat.id);
    let itemsHtml = "";
    catSubs.forEach((sub) => {
      const state = savedState[sub.id] || {
        checked: false,
        plan:
          sub.monthly && sub.yearly
            ? "monthly"
            : sub.monthly
              ? "monthly"
              : "yearly",
      };
      const isChecked = state.checked;
      let planUI = "";
      const containerClass =
        "flex-shrink-0 w-[130px] sm:w-[150px] flex items-center";
      const textClass =
        "text-xs sm:text-sm font-bold text-slate-900 transition-all";

      if (sub.monthly && sub.yearly && !sub.hideYearly) {
        planUI = `
        <div class="${containerClass}">
          <select id="sel-${sub.id}" class="plan-selector w-full ${textClass} py-1.5 px-2 border border-slate-200 rounded-lg bg-white/80 cursor-pointer pr-8 focus:ring-blue-500 focus:border-blue-500" onclick="event.stopPropagation()">
            <option value="monthly" ${state.plan === "monthly" ? "selected" : ""}>月額 ${sub.monthly.toLocaleString()}円</option>
            <option value="yearly" ${state.plan === "yearly" ? "selected" : ""}>年額 ${sub.yearly.toLocaleString()}円</option>
          </select>
        </div>`;
      } else {
        const label = sub.displayPrice
          ? sub.displayPrice
          : sub.monthly
            ? `月額 ${sub.monthly.toLocaleString()}円`
            : `年額 ${sub.yearly.toLocaleString()}円`;

        planUI = `
        <div class="${containerClass}">
          <div class="${textClass} text-slate-600 px-2.5 ">
            ${label}
          </div>
        </div>`;
      }
      const searchText = (
        sub.name +
        " " +
        (sub.keywords ? sub.keywords.join(" ") : "")
      ).toLowerCase();
      const cardBgClass = isChecked
        ? "bg-blue-50 border-blue-300 shadow-md"
        : "bg-white border-slate-100 shadow-sm";

      const bellBtnHtml = `
        <button type="button" class="bell-btn ml-1.5 p-2 text-blue-400 hover:text-blue-600 hover:bg-white rounded-full transition-colors flex-shrink-0 bg-white/50 shadow-sm border border-blue-100 ${isChecked ? "" : "invisible"}" onclick="event.stopPropagation(); window.openCalendarModal('${sub.id}', '${sub.name}', '${state.plan}')" title="カレンダーに通知を登録">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
        </button>
      `;

      itemsHtml += `
      <div class="sub-item relative flex items-center justify-between p-3 sm:p-4 md:px-6 md:py-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-within:border-blue-300 hover:border-blue-300 cursor-pointer ${cardBgClass}" data-search="${searchText}">
        <div class="flex items-center flex-1 min-w-0 pr-2">
          <input type="checkbox" id="chk-${sub.id}" class="sub-checkbox peer w-6 h-6 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" ${isChecked ? "checked" : ""}>
          <label for="chk-${sub.id}" class="ml-3 flex-1 cursor-pointer select-none py-1 md:py-0">
            <div class="text-sm md:text-base font-bold text-slate-800 leading-tight line-clamp-2">${sub.name}</div>
          </label>
        </div>
        <div class="flex-shrink-0 flex items-center justify-end" style="width: auto !important; min-width: 150px;">
          <div class="w-32 sm:w-36 flex items-center justify-end">${planUI}</div>
          ${bellBtnHtml}
        </div>
      </div>`;
    });

    htmlList += `
    <section id="section-${cat.id}" class="scroll-mt-40 md:scroll-mt-8 nav-section pt-6 mt-6 md:pt-8 md:mt-8 border-t border-slate-200 first:border-none first:pt-0 first:mt-0">
      <button class="accordion-trigger w-full flex items-center justify-between py-2 pr-4 text-left hover:bg-slate-50 transition-colors focus:outline-none rounded-xl relative group z-10">
        <div class="flex items-center gap-3 md:gap-4">
          <div class="w-1.5 h-12 md:h-14 bg-blue-600 rounded-r-md flex-shrink-0"></div>
          <div class="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-blue-50 rounded-full flex-shrink-0 group-hover:bg-blue-100 transition-colors">
            <span class="text-2xl md:text-3xl">${cat.icon}</span>
          </div>
          <div class="flex flex-col md:flex-row md:items-baseline md:gap-4">
            <h2 class="text-xl md:text-2xl font-black text-slate-900 tracking-wider">${cat.name}</h2>
            <span class="text-sm font-medium text-slate-500 mt-0.5 md:mt-0">
              月額換算 <span class="subtotal-val font-extrabold text-blue-600 text-lg md:text-xl ml-1">0</span><span class="text-xs text-blue-600 font-bold ml-0.5">円</span>
            </span>
          </div>
        </div>
        <svg class="w-6 h-6 text-slate-400 transform transition-transform duration-300 accordion-icon rotate-180 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>
      
      <div class="accordion-wrapper grid transition-[grid-template-rows,opacity] duration-300 ease-in-out grid-rows-[1fr] opacity-100">
        <div class="overflow-hidden">
          <div class="accordion-content space-y-2 md:space-y-3 px-1 md:px-2 pt-4 md:pt-6">${itemsHtml}</div>
        </div>
      </div>
    </section>`;
  });
  container.innerHTML = htmlList;
}

export function renderCustomList(customSubscriptions, savedState, container) {
  if (!container) return;
  if (customSubscriptions.length === 0) {
    container.innerHTML =
      '<div class="text-center py-4 text-sm text-slate-400 font-medium bg-slate-100/50 rounded-xl border border-dashed border-slate-200">登録されていません</div>';
    return;
  }
  let html = "";
  customSubscriptions.forEach((sub) => {
    const state = savedState[sub.id] || { checked: true, plan: sub.planType };
    const isChecked = state.checked;
    const cardBgClass = isChecked
      ? "bg-blue-50 border-blue-300 shadow-md"
      : "bg-white border-slate-100 shadow-sm";
    const price = parseInt(sub.price, 10);
    const cycle = sub.cycle || 1;

    let planText = "";
    if (
      sub.planType === "monthly" ||
      (cycle === 1 && sub.planType !== "custom")
    )
      planText = "月額";
    else if (
      sub.planType === "yearly" ||
      (cycle === 12 && sub.planType !== "custom")
    )
      planText = "年額";
    else {
      if (cycle < 1) planText = `${Math.round(cycle * 4.345)}週間ごとに`;
      else if (cycle >= 12 && cycle % 12 === 0)
        planText = `${cycle / 12}年ごとに`;
      else planText = `${cycle}ヶ月ごとに`;
    }

    html += `
    <div class="custom-sub-item group relative flex items-center justify-between p-3 sm:p-4 md:px-6 md:py-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-within:border-blue-300 hover:border-blue-300 cursor-pointer ${cardBgClass}">
      <div class="flex items-center flex-1 min-w-0 pr-2">
        <input type="checkbox" id="chk-${sub.id}" class="sub-checkbox peer w-6 h-6 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" ${isChecked ? "checked" : ""}>
        <label for="chk-${sub.id}" class="ml-3 flex-1 cursor-pointer select-none py-1 md:py-0">
          <div class="text-sm md:text-base font-bold text-slate-800 leading-tight line-clamp-2">${sub.name}</div>
        </label>
      </div>
      <div class="flex items-center gap-1 relative justify-end" style="width: auto !important; min-width: 150px;">
        <div class="flex-shrink-0 w-28 sm:w-32 text-xs sm:text-sm font-bold text-slate-900 text-right">
          ${planText} ${price.toLocaleString()}円
        </div>
        
<button type="button" class="bell-btn ml-1 p-2 text-blue-400 hover:text-blue-600 hover:bg-white rounded-full transition-colors flex-shrink-0 bg-white/50 shadow-sm border border-blue-100 ${isChecked ? "" : "invisible"}" onclick="event.stopPropagation(); window.openCalendarModal('${sub.id}', '${sub.name}', '${sub.planType}')" title="カレンダーに通知を登録">          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
        </button>

        <div class="relative ml-1">
          <button onclick="event.stopPropagation(); toggleEditMenu('${sub.id}')" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
          </button>
          <div id="edit-menu-${sub.id}" class="hidden absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 z-[60] overflow-hidden">
            <button onclick="event.stopPropagation(); editCustomSub('${sub.id}')" class="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-blue-50 flex items-center gap-2">編集</button>
            <button onclick="event.stopPropagation(); deleteCustomSub('${sub.id}')" class="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-2 border-t border-slate-50">削除</button>
          </div>
        </div>
      </div>
    </div>`;
  });
  container.innerHTML = html;
}

export function renderResultScreen(data) {
  // ① 金額やランキングの更新（既存の処理）
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

  // ② ▼▼ ここから追加：AI分析用のUIをグラフ/ランキングの下に生成 ▼▼
  const resultScreen = document.getElementById("result-screen");
  if (resultScreen && !document.getElementById("ai-analysis-section")) {
    const aiSection = document.createElement("div");
    aiSection.id = "ai-analysis-section";

    // ★変更1：初期状態はスマホ・PCともにコンパクト(max-w-md)。700ミリ秒かけてフワッと変化するアニメーションを追加
    aiSection.className =
      "mt-6 md:mt-8 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 mb-10 max-w-md md:max-w-md mx-auto flex flex-col items-center text-center w-full transition-all duration-700 ease-in-out";

    // ★変更2：ボタンを押した瞬間に、PC幅(md:)の制限を「max-w-md」から「max-w-3xl(横長)」に書き換えるJSコード
    const expandCode =
      "document.getElementById('ai-analysis-section').classList.replace('md:max-w-md', 'md:max-w-3xl');";

    aiSection.innerHTML = `
      <h3 class="text-lg md:text-xl font-black text-slate-800 flex items-center justify-center gap-2 mb-2">
        <span class="text-2xl">🤖</span> AIに相談
      </h3>
      <p class="text-sm text-slate-500 mb-6 font-medium">あなたの契約状況を元に、AIが最適な見直しを提案します。</p>

      <div id="ai-buttons" class="flex flex-col gap-3 w-full">
        <button data-goal="saving" onclick="${expandCode}" class="ai-trigger-btn w-full px-4 py-3.5 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors border border-blue-200 shadow-sm flex items-center justify-center gap-2 active:scale-95">
          💰 とにかく節約したい
        </button>
        <button data-goal="qol" onclick="${expandCode}" class="ai-trigger-btn w-full px-4 py-3.5 bg-purple-50 text-purple-600 font-bold rounded-xl hover:bg-purple-100 transition-colors border border-purple-200 shadow-sm flex items-center justify-center gap-2 active:scale-95">
          ✨ おすすめを知りたい
        </button>
        <button id="btn-ai-custom-toggle" class="w-full px-4 py-3.5 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors border border-slate-200 shadow-sm flex items-center justify-center gap-2 active:scale-95">
          ✍️ その他（自由入力）
        </button>
      </div>

      <div id="ai-custom-input-area" class="hidden mt-3 w-full flex-col gap-2 transition-all">
        <input type="text" id="ai-custom-text" placeholder="例：家族4人で共有できるおすすめは？" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-medium text-left">
        <button id="btn-ai-submit-custom" data-goal="custom" onclick="${expandCode}" class="ai-trigger-btn w-full bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-700 text-sm shadow-sm active:scale-95">
          送信
        </button>
      </div>

      <div id="ai-result-area" class="hidden mt-6 w-full bg-slate-50 p-5 md:p-6 rounded-2xl border border-slate-100 text-left transition-all duration-500">
        <div id="ai-loading" class="hidden flex-col items-center justify-center py-6">
           <div class="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
           <p class="text-sm font-bold text-slate-500 animate-pulse">AIがあなたのデータを分析中...</p>
        </div>
        <div id="ai-answer" class="hidden text-sm md:text-base text-slate-700 leading-relaxed whitespace-pre-wrap font-medium"></div>
      </div>
    `;

    resultScreen.appendChild(aiSection);
  }
}
