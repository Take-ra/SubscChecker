// subscription-list-ui.js（サブスクリプションカード & 見落としがち枠の描画）
import { escapeAttr, escapeHtml } from "./utils.js";
import { renderBrandIcon } from "./brand-icons.js";

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
      const reasonText = sub.overlookedReason
        ? `<span class="text-[10px] text-slate-400 font-medium truncate max-w-[130px] sm:max-w-[160px]">・ ${escapeHtml(sub.overlookedReason)}</span>`
        : "";

      return `
        <button
          type="button"
          data-sub-id="${sub.id}"
          data-overlooked-id="${sub.id}"
          class="overlooked-chip flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border transition-colors duration-150 shrink-0 cursor-pointer text-left select-none active:scale-95 ${
            isChecked
              ? "bg-blue-50 border-blue-400 shadow-xs ring-1 ring-blue-300 text-blue-700 font-bold"
              : "bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs text-slate-800"
          }"
        >
          ${renderBrandIcon(sub.name, sub.categoryId, "w-7 h-7", "text-xs")}
          <div class="min-w-0">
            <div class="text-xs font-black truncate leading-tight flex items-center gap-1 ${isChecked ? "text-blue-900" : "text-slate-800"}">
              <span>${escapeAttr(sub.name)}</span>
              <svg class="chip-check-icon w-3.5 h-3.5 text-blue-600 shrink-0 ${isChecked ? "" : "hidden"}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div class="flex items-center gap-1 mt-0.5">
              <span class="text-[10px] ${isChecked ? "text-blue-600 font-bold" : "text-slate-500 font-bold"} tabular-nums">${priceText}</span>
              ${reasonText}
            </div>
          </div>
        </button>
      `;
    })
    .join("");

  container.innerHTML = `
    <div class="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
      <div class="flex items-start justify-between gap-3 mb-3">
        <div class="flex items-start gap-3 min-w-0">
          <div class="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
          </div>
          <div class="min-w-0">
            <h3 class="text-base md:text-xl font-black text-slate-800 tracking-tight leading-tight">
              見落としがちな定番サブスク
            </h3>
            <p class="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              無料体験からの自動移行や、少額の請求で放置されがちなサービスです
            </p>
          </div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0 pt-0.5">
          <button
            type="button"
            id="overlooked-scroll-prev"
            class="w-7 h-7 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-90"
            aria-label="前へスクロール"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <button
            type="button"
            id="overlooked-scroll-next"
            class="w-7 h-7 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-90"
            aria-label="次へスクロール"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
      <div class="relative">
        <div id="overlooked-scroll-container" class="flex items-center gap-2.5 overflow-x-auto pb-1 hide-scrollbar scroll-smooth">
          ${chipsHtml}
        </div>
        <div class="pointer-events-none absolute right-0 top-0 bottom-1 w-12 bg-gradient-to-l from-white via-white/40 to-transparent rounded-r-2xl z-10"></div>
      </div>
    </div>
  `;

  // 左右矢印ボタンのスクロール操作リスナーを登録
  const scrollContainer = container.querySelector("#overlooked-scroll-container");
  const prevBtn = container.querySelector("#overlooked-scroll-prev");
  const nextBtn = container.querySelector("#overlooked-scroll-next");

  if (scrollContainer && prevBtn && nextBtn) {
    prevBtn.addEventListener("click", () => {
      scrollContainer.scrollBy({ left: -260, behavior: "smooth" });
    });
    nextBtn.addEventListener("click", () => {
      scrollContainer.scrollBy({ left: 260, behavior: "smooth" });
    });
  }
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

      const rawPlans = Array.isArray(sub.plans) && sub.plans.length > 0
        ? sub.plans
        : [
            {
              id: "std",
              name: "月額プラン",
              monthly: sub.monthly || 0,
              yearly: sub.yearly || (sub.monthly || 0) * 12,
            },
          ];

      // プランの並び順は定義順を尊重（主要プラン・通常プラン順）
      const plans = rawPlans;

      const activePlanId = state.planId || state.plan || sub.defaultPlanId || plans[0].id;

      // プランドロップダウンUI（1サービス1行・完全統一）
      let planUI = "";
      if (plans.length > 1) {
        const optionsHtml = plans
          .map((p) => {
            const isSel = p.id === activePlanId;
            const priceLabel = (() => {
              if (p.monthly === 0) return `${p.name} (無料)`;
              if (p.yearly) {
                return `${p.name} ¥${p.yearly.toLocaleString()}/年`;
              }
              return `${p.name} ¥${p.monthly.toLocaleString()}/月`;
            })();
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

      // 検索用キーワード文字列（あいまい検索・ジャンル名検索対応）
      const searchText = (
        sub.name +
        " " +
        cat.name +
        " " +
        (sub.keywords ? sub.keywords.join(" ") : "")
      ).toLowerCase();

      const cardBgClass = isChecked
        ? "bg-blue-50/90 border-blue-400 shadow-sm"
        : "bg-white border-slate-200/80 shadow-2xs hover:border-slate-300";

      // ベルボタン（通知設定・枠内に収まるよう配置）
      const bellBtnHtml = `
        <button
          type="button"
          class="bell-btn w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-blue-600 hover:text-blue-700 hover:bg-white bg-white/90 rounded-full transition-colors border border-blue-200/90 shadow-2xs shrink-0 cursor-pointer ${
            isChecked ? "" : "invisible pointer-events-none"
          }"
          data-sub-id="${escapeAttr(sub.id)}"
          data-sub-name="${escapeAttr(sub.name)}"
          data-plan-id="${escapeAttr(activePlanId)}"
          onclick="event.stopPropagation(); const p = document.getElementById('sel-${sub.id}')?.value || this.dataset.planId; window.openCalendarModal(this.dataset.subId, this.dataset.subName, p)"
          title="カレンダーに通知を登録"
          aria-label="カレンダーに通知を登録"
        >
          <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
        </button>
      `;

      // アプリアイコン
      const iconHtml = renderBrandIcon(sub.name, cat.id);

      itemsHtml += `
      <div class="sub-item relative flex items-center justify-between py-2.5 pl-3 pr-2.5 sm:py-3 sm:pl-3.5 sm:pr-3 md:py-3 md:pl-4 md:pr-3.5 rounded-2xl border active:scale-[0.99] hover:-translate-y-0.5 hover:shadow-md focus-within:border-blue-400 cursor-pointer overflow-hidden ${cardBgClass}" data-search="${searchText}" data-sub-id="${sub.id}" data-category-name="${escapeAttr(cat.name)}">
        <!-- 左側: チェックボックス + アプリアイコン + サービス名 -->
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

        <!-- 右側: 金額（プランドロップダウン） + 枠内ベルマーク -->
        <div class="flex-shrink-0 flex items-center gap-1.5 sm:gap-2">
          <div class="w-[130px] sm:w-[165px] md:w-[195px] lg:w-[220px] shrink-0">
            ${planUI}
          </div>
          <div class="w-7 h-7 sm:w-8 sm:h-8 shrink-0 flex items-center justify-center">
            ${bellBtnHtml}
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

    if (sub.planType === "monthly") {
      label = `月額 ¥${priceVal.toLocaleString()}`;
    } else if (sub.planType === "yearly") {
      label = `年額 ¥${priceVal.toLocaleString()}`;
    } else {
      const unitMap = { weeks: "週間ごと", months: "ヶ月ごと", years: "年ごと" };
      if (sub.cycleUnit && unitMap[sub.cycleUnit]) {
        label = `${sub.cycleNum || 1}${unitMap[sub.cycleUnit]} ¥${priceVal.toLocaleString()}`;
      } else {
        label = `${sub.cycle || 1}ヶ月ごと ¥${priceVal.toLocaleString()}`;
      }
    }

    const cardBgClass = isChecked
      ? "bg-blue-50/90 border-blue-400 shadow-sm"
      : "bg-white border-slate-200/80 shadow-2xs hover:border-slate-300";

    const customCycleNumVal = escapeAttr(String(sub.cycleNum || sub.cycle || 1));
    const customCycleUnitVal = escapeAttr(sub.cycleUnit || (sub.planType === "yearly" ? "years" : "months"));

    const bellBtnHtml = `
      <button
        type="button"
        class="bell-btn w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-blue-600 hover:text-blue-700 hover:bg-white bg-white/90 rounded-full transition-colors border border-blue-200/90 shadow-2xs shrink-0 cursor-pointer ${
          isChecked ? "" : "invisible pointer-events-none"
        }"
        data-sub-id="${escapeAttr(sub.id)}"
        data-sub-name="${escapeAttr(sub.name)}"
        data-plan-type="${escapeAttr(sub.planType || "monthly")}"
        data-cycle-num="${customCycleNumVal}"
        data-cycle-unit="${customCycleUnitVal}"
        onclick="event.stopPropagation(); window.openCalendarModal(this.dataset.subId, this.dataset.subName, this.dataset.planType, Number(this.dataset.cycleNum), this.dataset.cycleUnit)"
        title="カレンダーに通知を登録"
        aria-label="カレンダーに通知を登録"
      >
        <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
      </button>
    `;

    html += `
    <div class="custom-sub-item relative flex items-center justify-between py-2.5 pl-3 pr-2.5 sm:py-3 sm:pl-3.5 sm:pr-3 md:py-3 md:pl-4 md:pr-3.5 rounded-2xl border active:scale-[0.99] hover:-translate-y-0.5 hover:shadow-md cursor-pointer overflow-hidden ${cardBgClass}" data-search="${escapeAttr(sub.name.toLowerCase())} 独自 サブスク カスタム" data-sub-id="${sub.id}">
      <div class="flex items-center flex-1 min-w-0 pr-2 gap-2 sm:gap-2.5">
        <input type="checkbox" id="chk-${sub.id}" class="sub-checkbox peer w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0" ${isChecked ? "checked" : ""}>
        ${renderBrandIcon(sub.name, "lifestyle")}
        <label for="chk-${sub.id}" class="flex-1 cursor-pointer select-none py-1 min-w-0">
          <div class="text-xs sm:text-sm md:text-base font-extrabold text-slate-800 leading-snug line-clamp-2">${escapeHtml(sub.name)}</div>
        </label>
      </div>

      <div class="flex-shrink-0 flex items-center gap-1 sm:gap-1.5">
        <div class="w-[115px] sm:w-[145px] md:w-[170px] lg:w-[190px] shrink-0">
          <div class="w-full h-8 text-xs font-bold text-slate-800 border border-slate-200 rounded-xl bg-slate-100/70 flex items-center justify-start text-left tabular-nums select-none shadow-2xs pl-2.5 py-0 truncate">
            ${label}
          </div>
        </div>
        <div class="w-7 h-7 sm:w-8 sm:h-8 shrink-0 flex items-center justify-center">
          ${bellBtnHtml}
        </div>
        <button type="button" class="btn-delete-custom w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors shrink-0 cursor-pointer" data-id="${escapeAttr(sub.id)}" onclick="event.stopPropagation(); window.deleteCustomSub('${escapeAttr(sub.id)}')" title="削除" aria-label="この独自サブスクを削除">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </div>
    </div>`;
  });

  container.innerHTML = html;
}
