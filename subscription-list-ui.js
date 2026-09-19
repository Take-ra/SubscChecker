// subscription-list-ui.js（サブスクリプションカード & 見落としがち枠の描画）
import { escapeAttr, escapeHtml } from "./utils.js";
import { renderBrandIcon, getBrandBadge, getBrandDomain } from "./brand-icons.js";

// 後方互換性のための再エクスポート
export { getBrandBadge, getBrandDomain, renderBrandIcon };

/**
 * 見落としがちなサブスク（無料体験自動移行・スマホ特典・クラウド等）のクイック枠を描画
 */
export function renderOverlookedSection(subs = [], savedState = {}, container = null) {
  if (!container) return;
  const overlookedSubs = subs.filter((s) => s.isOverlooked);
  if (overlookedSubs.length === 0) {
    container.innerHTML = "";
    return;
  }

  const chipsHtml = overlookedSubs
    .map((sub) => {
      const isChecked = !!savedState[sub.id]?.checked;
      const defaultPlan =
        (sub.plans || []).find((p) => p.id === sub.defaultPlanId) ||
        (sub.plans || [])[0];
      const priceText = defaultPlan ? `¥${defaultPlan.monthly.toLocaleString()}/月` : "";

      return `
        <button
          type="button"
          data-sub-id="${sub.id}"
          data-overlooked-id="${sub.id}"
          class="overlooked-chip flex items-center gap-2 px-3 py-2 rounded-2xl border transition-all shrink-0 cursor-pointer text-left select-none active:scale-95 ${
            isChecked
              ? "bg-blue-50 border-blue-400 shadow-xs ring-1 ring-blue-300"
              : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
          }"
        >
          ${renderBrandIcon(sub.name, sub.categoryId, "w-6 h-6", "text-xs")}
          <div class="min-w-0">
            <div class="text-xs font-black text-slate-800 truncate leading-tight flex items-center gap-1">
              <span>${escapeAttr(sub.name)}</span>
              <svg class="chip-check-icon w-3.5 h-3.5 text-blue-600 shrink-0 ${isChecked ? "" : "hidden"}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div class="text-[10px] text-slate-400 font-bold tabular-nums">${priceText}</div>
          </div>
        </button>
      `;
    })
    .join("");

  container.innerHTML = `
    <div class="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50/70 to-orange-50/60 border border-amber-200/70">
      <div class="flex items-center justify-between gap-2 mb-2.5">
        <div class="flex items-center gap-1.5">
          <div class="w-5 h-5 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <h3 class="text-xs sm:text-sm font-black text-amber-950">
            見落としがちな定番サブスク
          </h3>
        </div>
        <span class="text-[10px] font-bold text-amber-800/80">無料体験・スマホ特典の放置に注意</span>
      </div>
      <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        ${chipsHtml}
      </div>
    </div>
  `;
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
        planId: sub.defaultPlanId || sub.plans?.[0]?.id,
        plan: sub.defaultPlanId || sub.plans?.[0]?.id,
      };
      const isChecked = !!state.checked;

      const plans = Array.isArray(sub.plans) && sub.plans.length > 0
        ? sub.plans
        : [
            {
              id: "std",
              name: "月額プラン",
              monthly: sub.monthly || 0,
              yearly: sub.yearly || (sub.monthly || 0) * 12,
            },
          ];

      const activePlanId = state.planId || state.plan || sub.defaultPlanId || plans[0].id;

      // プランドロップダウンUI（1サービス1行・完全統一）
      let planUI = "";
      if (plans.length > 1) {
        const optionsHtml = plans
          .map((p) => {
            const isSel = p.id === activePlanId;
            const priceLabel = p.yearly
              ? `年額 ¥${p.yearly.toLocaleString()} (¥${p.monthly.toLocaleString()}/月)`
              : `${p.name} ¥${p.monthly.toLocaleString()}/月`;
            return `<option value="${p.id}" ${isSel ? "selected" : ""}>${priceLabel}</option>`;
          })
          .join("");

        planUI = `
          <select
            id="sel-${sub.id}"
            class="plan-selector w-full h-8 text-xs font-bold text-slate-800 py-0 pl-2.5 pr-7 border border-slate-200 rounded-xl bg-slate-100/80 hover:bg-white focus:bg-white cursor-pointer focus:ring-1 focus:ring-blue-500 shadow-2xs transition-all text-left tabular-nums select-none"
            onclick="event.stopPropagation()"
          >
            ${optionsHtml}
          </select>`;
      } else {
        const p = plans[0];
        const priceLabel = p.yearly
          ? `年額 ¥${p.yearly.toLocaleString()}`
          : `月額 ¥${p.monthly.toLocaleString()}`;

        planUI = `
          <div class="w-full h-8 text-xs font-bold text-slate-800 border border-slate-200 rounded-xl bg-slate-100/70 flex items-center justify-start text-left tabular-nums select-none shadow-2xs pl-2.5 py-0">
            ${priceLabel}
          </div>`;
      }

      // 検索用キーワード文字列（あいまい検索対応）
      const searchText = (
        sub.name +
        " " +
        (sub.keywords ? sub.keywords.join(" ") : "")
      ).toLowerCase();

      const cardBgClass = isChecked
        ? "bg-blue-50/90 border-blue-400 shadow-sm"
        : "bg-white border-slate-200/80 shadow-2xs hover:border-slate-300";

      const safeName = escapeAttr(sub.name);

      // ベルボタン（通知設定）
      const bellBtnHtml = `
        <button
          type="button"
          class="bell-btn w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-blue-500 hover:text-blue-700 hover:bg-white rounded-full transition-colors bg-white/80 shadow-2xs border border-blue-200/80 cursor-pointer ${
            isChecked ? "" : "invisible pointer-events-none"
          }"
          onclick="event.stopPropagation(); window.openCalendarModal('${sub.id}', '${safeName}', '${activePlanId}')"
          title="カレンダーに通知を登録"
        >
          <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
        </button>
      `;

      // アプリアイコン
      const iconHtml = renderBrandIcon(sub.name, cat.id);

      itemsHtml += `
      <div class="sub-item relative flex items-center justify-between py-2.5 pl-3 pr-3 sm:py-3 sm:pl-3.5 sm:pr-4 md:py-3 md:pl-4 md:pr-4 rounded-2xl border transition-all duration-150 active:scale-[0.99] hover:-translate-y-0.5 hover:shadow-md focus-within:border-blue-400 cursor-pointer ${cardBgClass}" data-search="${searchText}" data-sub-id="${sub.id}" data-category-name="${escapeAttr(cat.name)}">
        <!-- 左側: チェックボックス + アプリアイコン + サービス名 + ジャンルバッジ -->
        <div class="flex items-center flex-1 min-w-0 pr-2 gap-2 sm:gap-2.5">
          <input
            type="checkbox"
            id="chk-${sub.id}"
            class="sub-checkbox peer w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
            ${isChecked ? "checked" : ""}
          >
          ${iconHtml}
          <label for="chk-${sub.id}" class="flex-1 cursor-pointer select-none py-1 md:py-0 min-w-0 flex items-center">
            <span class="text-sm md:text-base font-extrabold text-slate-800 leading-snug truncate">${escapeHtml(sub.name)}</span>
          </label>
        </div>

        <!-- 右側: プランドロップダウン -->
        <div class="flex-shrink-0 flex items-center">
          <div class="w-[145px] sm:w-[185px] md:w-[220px] lg:w-[245px] shrink-0">
            ${planUI}
          </div>
        </div>
      </div>`;
    });

    const theme = cat.theme || {
      bg: "bg-blue-50/90",
      text: "text-blue-600",
      border: "border-blue-100",
      hoverBg: "group-hover:bg-blue-100/90",
      accentBar: "bg-blue-600",
    };

    htmlList += `
    <section id="section-${cat.id}" class="scroll-mt-24 md:scroll-mt-8 nav-section pt-6 mt-6 md:pt-8 md:mt-8 border-t border-slate-200 first:border-none first:pt-0 first:mt-0">
      <button class="accordion-trigger sticky top-0 z-20 bg-slate-50/95 backdrop-blur-md w-full flex items-center justify-between py-2.5 pr-4 text-left hover:bg-slate-100/80 transition-colors focus:outline-none rounded-2xl relative group shadow-2xs">
        <div class="flex items-center gap-3 md:gap-4">
          <div class="w-1.5 h-12 md:h-14 ${theme.accentBar} rounded-r-md flex-shrink-0 transition-colors"></div>
          <div class="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 ${theme.bg} ${theme.border} border ${theme.text} ${theme.hoverBg} shadow-2xs rounded-2xl flex-shrink-0 p-2.5 md:p-3 transition-colors">
            ${cat.icon}
          </div>
          <div class="flex flex-col md:flex-row md:items-baseline md:gap-4">
            <h2 class="text-base md:text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <span>${cat.name}</span>
            </h2>
            <div class="subtotal-container text-xs md:text-sm text-slate-400 font-bold hidden items-center gap-2 mt-0.5 md:mt-0">
              <span class="subtotal-label">小計:</span>
              <span class="tabular-nums font-black text-slate-700">¥<span class="subtotal-val text-sm md:text-base">0</span><span class="text-[10px] md:text-xs font-normal text-slate-400 ml-0.5">/月</span></span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2 text-slate-400 group-hover:text-slate-600 transition-colors">
          <svg class="w-5 h-5 transform transition-transform duration-300 accordion-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </button>

      <div class="accordion-wrapper grid grid-rows-[1fr] transition-all duration-300 ease-in-out opacity-100">
        <div class="overflow-hidden">
          <div class="space-y-2 pt-3 pb-1">
            ${itemsHtml}
          </div>
        </div>
      </div>
    </section>
    `;
  });

  container.innerHTML = htmlList;
}

export function renderCustomList(customSubs, savedState, container) {
  if (!container) return;
  if (!customSubs || customSubs.length === 0) {
    container.innerHTML = "";
    return;
  }

  let html = "";
  customSubs.forEach((sub) => {
    const isChecked = !!savedState[sub.id]?.checked;
    const priceVal = parseInt(sub.price, 10) || 0;
    let label = "";

    if (sub.planType === "monthly") label = `月額 ¥${priceVal.toLocaleString()}`;
    else if (sub.planType === "yearly") label = `年額 ¥${priceVal.toLocaleString()}`;
    else label = `${sub.cycle}ヶ月 ¥${priceVal.toLocaleString()}`;

    const safeName = escapeAttr(sub.name);
    const cardBgClass = isChecked
      ? "bg-blue-50/90 border-blue-400 shadow-sm"
      : "bg-white border-slate-200/80 shadow-2xs hover:border-slate-300";

    html += `
    <div class="custom-sub-item relative flex items-center justify-between py-2.5 pl-3 pr-3 sm:py-3 sm:pl-3.5 sm:pr-4 rounded-2xl border transition-all duration-150 active:scale-[0.99] hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${cardBgClass}" data-search="${sub.name.toLowerCase()}" data-sub-id="${sub.id}">
      <div class="flex items-center flex-1 min-w-0 pr-2 gap-2 sm:gap-2.5">
        <input type="checkbox" id="chk-${sub.id}" class="sub-checkbox peer w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0" ${isChecked ? "checked" : ""}>
        ${renderBrandIcon(sub.name, "lifestyle")}
        <label for="chk-${sub.id}" class="flex-1 cursor-pointer select-none py-1 min-w-0">
          <div class="text-xs sm:text-sm md:text-base font-extrabold text-slate-800 leading-snug line-clamp-2">${sub.name}</div>
        </label>
      </div>

      <div class="flex-shrink-0 flex items-center gap-1 sm:gap-1.5">
        <div class="w-[140px] sm:w-[160px] md:w-[180px] shrink-0">
          <div class="w-full h-8 text-xs font-bold text-slate-800 border border-slate-200 rounded-xl bg-slate-100/70 flex items-center justify-start text-left tabular-nums select-none shadow-2xs pl-2.5 py-0">
            ${label}
          </div>
        </div>
        <button type="button" class="btn-delete-custom w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors" data-id="${sub.id}" title="削除">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </div>
    </div>`;
  });

  container.innerHTML = html;
}
