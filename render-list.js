// render-list.js（サブスクリプションカードの描画）
import { escapeAttr } from "./utils.js";
import { renderBrandIcon, getBrandBadge, getBrandDomain } from "./brand-icons.js";

// 後方互換性のための再エクスポート
export { getBrandBadge, getBrandDomain, renderBrandIcon };

export function renderMainList(cats, subs, savedState, container) {
  if (!container) return;
  let htmlList = "";
  cats.forEach((cat) => {
    const catSubs = subs.filter((s) => s.categoryId === cat.id);
    let itemsHtml = "";
    catSubs.forEach((sub) => {
      const state = savedState[sub.id] || {
        checked: false,
        plan: sub.monthly ? "monthly" : "yearly",
      };
      const isChecked = state.checked;

      // 金額表示（必ず文字の始まりが縦一直線に揃うように左揃え pl-2.5 に統一）
      let planUI = "";
      if (sub.monthly && sub.yearly) {
        planUI = `
          <select id="sel-${sub.id}" class="plan-selector w-full h-8 text-xs sm:text-sm font-bold text-slate-800 py-0 pl-2.5 pr-6 border border-slate-200 rounded-xl bg-slate-100/70 hover:bg-white focus:bg-white cursor-pointer focus:ring-1 focus:ring-blue-500 shadow-2xs transition-all text-left tabular-nums select-none" onclick="event.stopPropagation()">
            <option value="monthly" ${state.plan === "monthly" ? "selected" : ""}>月額 ¥${sub.monthly.toLocaleString()}</option>
            <option value="yearly" ${state.plan === "yearly" ? "selected" : ""}>年額 ¥${sub.yearly.toLocaleString()}</option>
          </select>`;
      } else {
        const isYearly = !sub.monthly && sub.yearly;
        const priceVal = isYearly ? sub.yearly : sub.monthly;
        const prefix = isYearly ? "年額" : "月額";

        planUI = `
          <div class="w-full h-8 text-xs sm:text-sm font-bold text-slate-800 border border-slate-200 rounded-xl bg-slate-100/70 flex items-center justify-start text-left tabular-nums select-none shadow-2xs pl-2.5 py-0">
            ${prefix} ¥${Number(priceVal || 0).toLocaleString()}
          </div>`;
      }

      const searchText = (
        sub.name +
        " " +
        (sub.keywords ? sub.keywords.join(" ") : "")
      ).toLowerCase();
      const cardBgClass = isChecked
        ? "bg-blue-50/90 border-blue-400 shadow-sm"
        : "bg-white border-slate-200/80 shadow-2xs hover:border-slate-300";

      const safeName = escapeAttr(sub.name);

      // ベルボタン（枠線から離して少し左寄りに収まる配置）
      const bellBtnHtml = `
        <button type="button" class="bell-btn w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-blue-500 hover:text-blue-700 hover:bg-white rounded-full transition-colors bg-white/80 shadow-2xs border border-blue-200/80 cursor-pointer ${isChecked ? "" : "invisible pointer-events-none"}" onclick="event.stopPropagation(); window.openCalendarModal('${sub.id}', '${safeName}', '${state.plan}')" title="カレンダーに通知を登録">
          <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
        </button>
      `;

      // アプリアイコン（brand-icons.js共通関数）
      const iconHtml = renderBrandIcon(sub.name, cat.id);

      itemsHtml += `
      <div class="sub-item relative flex items-center justify-between py-2.5 pl-3 pr-3.5 sm:py-3 sm:pl-3.5 sm:pr-4 md:py-3 md:pl-4 md:pr-5 rounded-2xl border transition-all duration-150 active:scale-[0.99] hover:-translate-y-0.5 hover:shadow-md focus-within:border-blue-400 cursor-pointer ${cardBgClass}" data-search="${searchText}">
        <!-- 左側: チェックボックス + アプリアイコン + サービス名 -->
        <div class="flex items-center flex-1 min-w-0 pr-2 gap-2 sm:gap-2.5">
          <input type="checkbox" id="chk-${sub.id}" class="sub-checkbox peer w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0" ${isChecked ? "checked" : ""}>
          ${iconHtml}
          <label for="chk-${sub.id}" class="flex-1 cursor-pointer select-none py-1 md:py-0 min-w-0">
            <div class="text-xs sm:text-sm md:text-base font-extrabold text-slate-800 leading-snug line-clamp-2">${sub.name}</div>
          </label>
        </div>

        <!-- 右側: 金額（幅を十分確保して矢印被り防止） + ベルボタン -->
        <div class="flex-shrink-0 flex items-center gap-1 sm:gap-1.5">
          <div class="w-[114px] sm:w-[124px] shrink-0">
            ${planUI}
          </div>
          <div class="w-7 h-7 sm:w-8 sm:h-8 shrink-0 flex items-center justify-center">
            ${bellBtnHtml}
          </div>
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
          <div class="accordion-content space-y-2 md:space-y-2.5 px-1 md:px-2 pt-4 md:pt-6">${itemsHtml}</div>
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
      ? "bg-blue-50/90 border-blue-400 shadow-sm"
      : "bg-white border-slate-200/80 shadow-2xs hover:border-slate-300";
    const price = parseInt(sub.price, 10) || 0;
    const cycle = sub.cycle || 1;

    let planText = "";
    if (
      sub.planType === "monthly" ||
      (cycle === 1 && sub.planType !== "custom")
    ) {
      planText = "月額";
    } else if (
      sub.planType === "yearly" ||
      (cycle === 12 && sub.planType !== "custom")
    ) {
      planText = "年額";
    } else if (sub.cycleUnit && sub.cycleNum) {
      if (sub.cycleUnit === "weeks") planText = `${sub.cycleNum}週`;
      else if (sub.cycleUnit === "years") planText = `${sub.cycleNum}年`;
      else planText = `${sub.cycleNum}ヶ月`;
    } else {
      if (cycle < 1 || (cycle > 0 && cycle < 3 && cycle % 1 !== 0)) {
        planText = `${Math.round(cycle * 4.345)}週`;
      } else if (cycle >= 12 && cycle % 12 === 0) {
        planText = `${cycle / 12}年`;
      } else {
        planText = `${Math.round(cycle)}ヶ月`;
      }
    }

    const safeName = escapeAttr(sub.name);
    const searchText = sub.name.toLowerCase();

    // アプリアイコン（brand-icons.js共通関数）
    const iconHtml = renderBrandIcon(sub.name, "lifestyle");

    html += `
    <div class="custom-sub-item group relative flex items-center justify-between py-2.5 pl-3 pr-3.5 sm:py-3 sm:pl-3.5 sm:pr-4 md:py-3 md:pl-4 md:pr-5 rounded-2xl border transition-all duration-150 active:scale-[0.99] hover:-translate-y-0.5 hover:shadow-md focus-within:border-blue-400 cursor-pointer ${cardBgClass}" data-search="${searchText}">
      <div class="flex items-center flex-1 min-w-0 pr-2 gap-2 sm:gap-2.5">
        <input type="checkbox" id="chk-${sub.id}" class="sub-checkbox peer w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0" ${isChecked ? "checked" : ""}>
        ${iconHtml}
        <label for="chk-${sub.id}" class="flex-1 cursor-pointer select-none py-1 md:py-0 min-w-0">
          <div class="text-xs sm:text-sm md:text-base font-extrabold text-slate-800 leading-snug line-clamp-2">${sub.name}</div>
        </label>
      </div>

      <!-- 右側: 金額ボックス + ベル + 編集メニュー -->
      <div class="flex-shrink-0 flex items-center gap-1.5">
        <div class="w-[84px] sm:w-[96px] shrink-0">
          <div class="w-full h-8 text-xs sm:text-sm font-bold text-slate-800 border border-slate-200 rounded-xl bg-slate-100/70 flex items-center justify-start text-left tabular-nums select-none shadow-2xs pl-2.5 py-0">
            ${planText} ¥${price.toLocaleString()}
          </div>
        </div>
        
        <div class="w-7 h-7 sm:w-8 sm:h-8 shrink-0 flex items-center justify-center">
          <button type="button" class="bell-btn w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-blue-500 hover:text-blue-700 hover:bg-white rounded-full transition-colors bg-white/80 shadow-2xs border border-blue-200/80 cursor-pointer ${isChecked ? "" : "invisible pointer-events-none"}" onclick="event.stopPropagation(); window.openCalendarModal('${sub.id}', '${safeName}', '${sub.planType}', ${sub.cycleNum || 1}, '${sub.cycleUnit || "months"}')" title="カレンダーに通知を登録">
            <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          </button>
        </div>

        <div class="relative w-7 h-7 shrink-0 flex items-center justify-center">
          <button onclick="event.stopPropagation(); toggleEditMenu('${sub.id}')" class="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
          </button>
          <div id="edit-menu-${sub.id}" class="hidden absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 z-[60] overflow-hidden">
            <button onclick="event.stopPropagation(); editCustomSub('${sub.id}')" class="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-blue-50 flex items-center gap-2">編集</button>
            <button onclick="event.stopPropagation(); deleteCustomSub('${sub.id}')" class="w-full text-left px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2 border-t border-slate-50">削除</button>
          </div>
        </div>
      </div>
    </div>`;
  });
  container.innerHTML = html;
}
