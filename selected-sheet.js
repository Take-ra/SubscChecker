// selected-sheet.js（選択中サブスク確認ボトムシートモジュール）
import { getBrandBadge } from "./render-list.js";
import { escapeAttr } from "./render.js";

export function initSelectedSheet({ getAggregatedData, onToggleSub, onAnalyze }) {
  const sheetEl = document.getElementById("selected-subs-sheet");
  const overlayEl = document.getElementById("selected-sheet-overlay");
  const panelEl = document.getElementById("selected-sheet-panel");
  const btnOpen = document.getElementById("btn-open-selected-sheet");
  const btnClose = document.getElementById("btn-close-selected-sheet");
  const btnSheetClose = document.getElementById("btn-sheet-close");
  const btnSheetAnalyze = document.getElementById("btn-sheet-analyze");
  const listEl = document.getElementById("selected-sheet-list");
  const countBadgeEl = document.getElementById("sheet-count-badge");
  const monthlyTotalEl = document.getElementById("sheet-monthly-total");

  function openSheet() {
    renderSheetContent();
    if (!sheetEl) return;
    sheetEl.classList.remove("hidden");
    sheetEl.classList.add("flex");
    requestAnimationFrame(() => {
      overlayEl?.classList.remove("opacity-0");
      overlayEl?.classList.add("opacity-100");
      panelEl?.classList.remove("translate-y-full", "md:translate-y-4", "md:scale-95");
      panelEl?.classList.add("translate-y-0", "md:translate-y-0", "md:scale-100");
    });
  }

  function closeSheet() {
    if (!sheetEl) return;
    overlayEl?.classList.remove("opacity-100");
    overlayEl?.classList.add("opacity-0");
    panelEl?.classList.remove("translate-y-0", "md:translate-y-0", "md:scale-100");
    panelEl?.classList.add("translate-y-full", "md:translate-y-4", "md:scale-95");
    setTimeout(() => {
      sheetEl.classList.remove("flex");
      sheetEl.classList.add("hidden");
    }, 250);
  }

  function renderSheetContent() {
    const data = getAggregatedData();
    const items = data.selectedItems || [];

    if (countBadgeEl) countBadgeEl.textContent = `${items.length}件`;
    if (monthlyTotalEl) monthlyTotalEl.textContent = Number(data.totalMonthly || 0).toLocaleString();

    if (!listEl) return;

    if (items.length === 0) {
      listEl.innerHTML = `
        <div class="py-10 text-center text-slate-400 space-y-2">
          <span class="text-3xl block">🧺</span>
          <p class="text-xs sm:text-sm font-extrabold text-slate-600">現在選択中のサブスクはありません</p>
          <p class="text-[11px] text-slate-400">リストから使っているサブスクにチェックを入れてみましょう</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = items
      .map((item) => {
        const badge = getBrandBadge(item.name, item.categoryId || "lifestyle");
        const priceStr = Number(item.monthly || 0).toLocaleString();
        return `
        <div class="flex items-center justify-between p-2.5 sm:p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/70 transition-colors">
          <div class="flex items-center gap-2.5 min-w-0 mr-2">
            <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl ${badge.bg} flex items-center justify-center font-black text-xs shadow-2xs shrink-0 select-none">
              ${badge.label}
            </div>
            <span class="text-xs sm:text-sm font-extrabold text-slate-800 truncate" title="${escapeAttr(item.name)}">
              ${escapeAttr(item.name)}
            </span>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span class="text-xs sm:text-sm font-black text-slate-900 tabular-nums">
              ¥${priceStr}<span class="text-[10px] font-normal text-slate-400 ml-0.5">/月</span>
            </span>
            <button
              type="button"
              data-remove-sub-id="${escapeAttr(item.id)}"
              class="w-7 h-7 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
              title="選択を解除"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
      })
      .join("");
  }

  // イベントリスナー
  if (btnOpen) btnOpen.addEventListener("click", openSheet);
  if (btnClose) btnClose.addEventListener("click", closeSheet);
  if (btnSheetClose) btnSheetClose.addEventListener("click", closeSheet);
  if (overlayEl) overlayEl.addEventListener("click", closeSheet);

  if (btnSheetAnalyze) {
    btnSheetAnalyze.addEventListener("click", () => {
      closeSheet();
      if (onAnalyze) onAnalyze();
    });
  }

  // 解除ボタン（イベント委譲）
  if (listEl) {
    listEl.addEventListener("click", (e) => {
      const removeBtn = e.target.closest("[data-remove-sub-id]");
      if (!removeBtn) return;
      const subId = removeBtn.getAttribute("data-remove-sub-id");
      if (subId && onToggleSub) {
        onToggleSub(subId, false);
        renderSheetContent();
      }
    });
  }

  return {
    openSheet,
    closeSheet,
    renderSheetContent,
  };
}
