// render-list.js（サブスクリプションカードの描画）
import { escapeAttr } from "./render.js";

/**
 * サービス名やカテゴリからブランドカラー＆頭文字バッジを導出するヘルパー
 */
export function getBrandBadge(name = "", categoryId = "") {
  const n = (name || "").trim();

  // 有名ブランドの固有カラー
  if (/netflix/i.test(n)) return { label: "N", bg: "bg-red-600 text-white" };
  if (/amazon|prime/i.test(n)) return { label: "A", bg: "bg-amber-500 text-white" };
  if (/youtube/i.test(n)) return { label: "Y", bg: "bg-red-600 text-white" };
  if (/spotify/i.test(n)) return { label: "S", bg: "bg-emerald-500 text-white" };
  if (/apple|icloud/i.test(n)) return { label: "", bg: "bg-slate-900 text-white" };
  if (/disney/i.test(n)) return { label: "D", bg: "bg-blue-700 text-white" };
  if (/u-next/i.test(n)) return { label: "U", bg: "bg-slate-900 text-white" };
  if (/chatgpt|openai/i.test(n)) return { label: "G", bg: "bg-teal-600 text-white" };
  if (/claude|anthropic/i.test(n)) return { label: "C", bg: "bg-amber-700 text-white" };
  if (/notion/i.test(n)) return { label: "N", bg: "bg-slate-900 text-white" };
  if (/line/i.test(n)) return { label: "L", bg: "bg-emerald-500 text-white" };
  if (/google|drive|gemini/i.test(n)) return { label: "G", bg: "bg-blue-600 text-white" };
  if (/playstation|ps\b/i.test(n)) return { label: "P", bg: "bg-blue-700 text-white" };
  if (/nintendo/i.test(n)) return { label: "N", bg: "bg-red-600 text-white" };
  if (/dアニメ/i.test(n)) return { label: "d", bg: "bg-orange-500 text-white" };
  if (/dラボ/i.test(n)) return { label: "D", bg: "bg-indigo-600 text-white" };
  if (/hulu/i.test(n)) return { label: "h", bg: "bg-emerald-600 text-white" };
  if (/abema/i.test(n)) return { label: "A", bg: "bg-emerald-700 text-white" };
  if (/dropbox/i.test(n)) return { label: "D", bg: "bg-blue-500 text-white" };
  if (/microsoft|office|365/i.test(n)) return { label: "M", bg: "bg-red-600 text-white" };
  if (/canva/i.test(n)) return { label: "C", bg: "bg-cyan-600 text-white" };
  if (/adobe/i.test(n)) return { label: "A", bg: "bg-red-600 text-white" };
  if (/uber/i.test(n)) return { label: "U", bg: "bg-slate-950 text-white" };
  if (/kindle/i.test(n)) return { label: "K", bg: "bg-amber-600 text-white" };
  if (/dazn/i.test(n)) return { label: "D", bg: "bg-slate-900 text-yellow-300" };
  if (/audible/i.test(n)) return { label: "A", bg: "bg-amber-500 text-white" };
  if (/dマガジン/i.test(n)) return { label: "d", bg: "bg-red-600 text-white" };

  // カテゴリ別のグラデーションカラー
  const catColors = {
    video: "bg-rose-500 text-white",
    music: "bg-emerald-600 text-white",
    ebook: "bg-amber-600 text-white",
    game: "bg-indigo-600 text-white",
    tool: "bg-blue-600 text-white",
    storage: "bg-sky-500 text-white",
    delivery: "bg-orange-500 text-white",
    lifestyle: "bg-purple-600 text-white",
  };
  const bg = catColors[categoryId] || "bg-slate-700 text-white";

  // 先頭の文字（アルファベット、漢字、カナ）
  const clean = n.replace(/^[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/, "");
  const letter = clean.charAt(0).toUpperCase() || n.charAt(0) || "★";

  return { label: letter, bg };
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
        plan: sub.monthly ? "monthly" : "yearly",
      };
      const isChecked = state.checked;
      let planUI = "";
      const containerClass =
        "flex-shrink-0 w-[130px] sm:w-[150px] flex items-center justify-end";

      if (sub.monthly && sub.yearly) {
        planUI = `
        <div class="${containerClass}">
          <select id="sel-${sub.id}" class="plan-selector w-full text-xs font-black text-slate-900 py-1.5 pl-2.5 pr-7 border border-slate-200 rounded-xl bg-slate-50/80 hover:bg-white cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-2xs transition-all" onclick="event.stopPropagation()">
            <option value="monthly" ${state.plan === "monthly" ? "selected" : ""}>月額 ¥${sub.monthly.toLocaleString()}</option>
            <option value="yearly" ${state.plan === "yearly" ? "selected" : ""}>年額 ¥${sub.yearly.toLocaleString()}</option>
          </select>
        </div>`;
      } else {
        const isYearly = !sub.monthly && sub.yearly;
        const priceVal = isYearly ? sub.yearly : sub.monthly;
        const prefix = isYearly ? "年額" : "月額";
        const cycleSuffix = isYearly ? "/年" : "/月";

        planUI = `
        <div class="${containerClass}">
          <div class="text-right w-full font-black text-slate-900 tracking-tight text-xs sm:text-sm tabular-nums px-1">
            <span class="text-[10px] font-bold text-slate-400 mr-1">${prefix}</span>¥${Number(priceVal || 0).toLocaleString()}<span class="text-[10px] font-normal text-slate-400 ml-0.5">${cycleSuffix}</span>
          </div>
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

      const brandBadge = getBrandBadge(sub.name, cat.id);
      const safeName = escapeAttr(sub.name);
      const bellBtnHtml = `
        <button type="button" class="bell-btn ml-1.5 p-2 text-blue-500 hover:text-blue-700 hover:bg-white rounded-full transition-colors flex-shrink-0 bg-white/60 shadow-2xs border border-blue-200/80 ${isChecked ? "" : "invisible"}" onclick="event.stopPropagation(); window.openCalendarModal('${sub.id}', '${safeName}', '${state.plan}')" title="カレンダーに通知を登録">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
        </button>
      `;

      itemsHtml += `
      <div class="sub-item relative flex items-center justify-between p-3 sm:p-4 md:px-5 md:py-3.5 rounded-2xl border transition-all duration-150 active:scale-[0.99] hover:-translate-y-0.5 hover:shadow-md focus-within:border-blue-400 cursor-pointer ${cardBgClass}" data-search="${searchText}">
        <div class="flex items-center flex-1 min-w-0 pr-2 gap-2.5">
          <input type="checkbox" id="chk-${sub.id}" class="sub-checkbox peer w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0" ${isChecked ? "checked" : ""}>
          <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl ${brandBadge.bg} flex items-center justify-center font-black text-xs sm:text-sm shadow-2xs shrink-0 select-none">
            ${brandBadge.label}
          </div>
          <label for="chk-${sub.id}" class="flex-1 cursor-pointer select-none py-1 md:py-0 min-w-0">
            <div class="text-xs sm:text-sm md:text-base font-extrabold text-slate-800 leading-snug line-clamp-2">${sub.name}</div>
          </label>
        </div>
        <div class="flex-shrink-0 flex items-center justify-end" style="width: auto !important; min-width: 140px;">
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
      if (sub.cycleUnit === "weeks") planText = `${sub.cycleNum}週ごと`;
      else if (sub.cycleUnit === "years") planText = `${sub.cycleNum}年ごと`;
      else planText = `${sub.cycleNum}ヶ月ごと`;
    } else {
      if (cycle < 1 || (cycle > 0 && cycle < 3 && cycle % 1 !== 0)) {
        planText = `${Math.round(cycle * 4.345)}週ごと`;
      } else if (cycle >= 12 && cycle % 12 === 0) {
        planText = `${cycle / 12}年ごと`;
      } else {
        planText = `${Math.round(cycle)}ヶ月ごと`;
      }
    }

    const brandBadge = getBrandBadge(sub.name, "lifestyle");
    const safeName = escapeAttr(sub.name);
    const searchText = sub.name.toLowerCase();

    html += `
    <div class="custom-sub-item group relative flex items-center justify-between p-3 sm:p-4 md:px-5 md:py-3.5 rounded-2xl border transition-all duration-150 active:scale-[0.99] hover:-translate-y-0.5 hover:shadow-md focus-within:border-blue-400 cursor-pointer ${cardBgClass}" data-search="${searchText}">
      <div class="flex items-center flex-1 min-w-0 pr-2 gap-2.5">
        <input type="checkbox" id="chk-${sub.id}" class="sub-checkbox peer w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0" ${isChecked ? "checked" : ""}>
        <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl ${brandBadge.bg} flex items-center justify-center font-black text-xs sm:text-sm shadow-2xs shrink-0 select-none">
          ${brandBadge.label}
        </div>
        <label for="chk-${sub.id}" class="flex-1 cursor-pointer select-none py-1 md:py-0 min-w-0">
          <div class="text-xs sm:text-sm md:text-base font-extrabold text-slate-800 leading-snug line-clamp-2">${sub.name}</div>
        </label>
      </div>
      <div class="flex items-center gap-1 relative justify-end" style="width: auto !important; min-width: 140px;">
        <div class="flex-shrink-0 w-28 sm:w-32 text-right font-black text-slate-900 tracking-tight text-xs sm:text-sm tabular-nums px-1">
          <span class="text-[10px] font-bold text-slate-400 mr-1">${planText}</span>¥${price.toLocaleString()}
        </div>
        
        <button type="button" class="bell-btn ml-1 p-2 text-blue-500 hover:text-blue-700 hover:bg-white rounded-full transition-colors flex-shrink-0 bg-white/60 shadow-2xs border border-blue-200/80 ${isChecked ? "" : "invisible"}" onclick="event.stopPropagation(); window.openCalendarModal('${sub.id}', '${safeName}', '${sub.planType}', ${sub.cycleNum || 1}, '${sub.cycleUnit || "months"}')" title="カレンダーに通知を登録">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
        </button>

        <div class="relative ml-1">
          <button onclick="event.stopPropagation(); toggleEditMenu('${sub.id}')" class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
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
