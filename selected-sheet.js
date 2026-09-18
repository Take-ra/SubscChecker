// selected-sheet.js（選択中サブスク確認 コンパクトポップアップモジュール）
import { getBrandBadge } from "./render-list.js";
import { escapeAttr } from "./render.js";

export function initSelectedSheet({ getAggregatedData, onToggleSub, onAnalyze }) {
  const getPopupEl = () => document.getElementById("selected-subs-popup");
  const getListEl = () => document.getElementById("selected-popup-list");
  const getCountBadgeEl = () => document.getElementById("popup-count-badge");
  const getMonthlyTotalEl = () => document.getElementById("popup-monthly-total");

  let isOpen = false;

  function openPopup() {
    renderPopupContent();
    const popupEl = getPopupEl();
    if (!popupEl) return;

    popupEl.classList.remove("hidden");
    popupEl.style.display = "block";
    isOpen = true;
  }

  function closePopup() {
    const popupEl = getPopupEl();
    if (!popupEl) return;

    popupEl.classList.add("hidden");
    popupEl.style.display = "none";
    isOpen = false;
  }

  function togglePopup() {
    if (isOpen) {
      closePopup();
    } else {
      openPopup();
    }
  }

  function renderPopupContent() {
    const data = getAggregatedData ? getAggregatedData() : { selectedItems: [], totalMonthly: 0 };
    const items = data.selectedItems || [];

    const countBadgeEl = getCountBadgeEl();
    const monthlyTotalEl = getMonthlyTotalEl();
    const listEl = getListEl();

    if (countBadgeEl) countBadgeEl.textContent = `${items.length}件`;
    if (monthlyTotalEl) monthlyTotalEl.textContent = Number(data.totalMonthly || 0).toLocaleString();

    if (!listEl) return;

    if (items.length === 0) {
      listEl.innerHTML = `
        <div class="py-6 text-center text-slate-400 space-y-1">
          <span class="text-2xl block">🧺</span>
          <p class="text-xs font-bold text-slate-600">選択中のサブスクはありません</p>
          <p class="text-[10px] text-slate-400">リストからチェックを入れてみましょう</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = items
      .map((item) => {
        const badge = getBrandBadge(item.name, item.categoryId || "lifestyle");
        const priceStr = Number(item.monthly || 0).toLocaleString();
        return `
        <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50/90 hover:bg-slate-100/90 border border-slate-200/70 transition-colors">
          <div class="flex items-center gap-2 min-w-0 mr-2">
            <div class="w-6 h-6 rounded-lg ${badge.bg} flex items-center justify-center font-black text-[11px] shrink-0 select-none">
              ${badge.label}
            </div>
            <span class="text-xs font-black text-slate-800 truncate" title="${escapeAttr(item.name)}">
              ${escapeAttr(item.name)}
            </span>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <span class="text-xs font-black text-slate-900 tabular-nums">
              ¥${priceStr}<span class="text-[10px] font-normal text-slate-400 ml-0.5">/月</span>
            </span>
            <button
              type="button"
              data-remove-sub-id="${escapeAttr(item.id)}"
              class="w-6 h-6 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
              title="選択を解除"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
      })
      .join("");
  }

  // グローバル登録
  window.toggleSelectedSubsPopup = togglePopup;
  window.openSelectedSubsPopup = openPopup;
  window.closeSelectedSubsPopup = closePopup;

  // イベント委譲（DOM読み込み順序に左右されない確実な動作）
  document.addEventListener("click", (e) => {
    // 〇件選択中ボタン（トグル）
    if (e.target.closest("#btn-open-selected-sheet")) {
      e.preventDefault();
      e.stopPropagation();
      togglePopup();
      return;
    }

    // 閉じるボタン
    if (e.target.closest("#btn-close-selected-popup")) {
      e.preventDefault();
      closePopup();
      return;
    }

    // 解除ボタン
    const removeBtn = e.target.closest("[data-remove-sub-id]");
    if (removeBtn) {
      e.preventDefault();
      e.stopPropagation();
      const subId = removeBtn.getAttribute("data-remove-sub-id");
      if (subId && onToggleSub) {
        onToggleSub(subId, false);
        renderPopupContent();
        // 0件になったら閉じる
        const data = getAggregatedData ? getAggregatedData() : { selectedItems: [] };
        if (!data.selectedItems || data.selectedItems.length === 0) {
          closePopup();
        }
      }
      return;
    }

    // ポップアップの外側をクリックしたら閉じる
    if (isOpen && !e.target.closest("#selected-subs-popup")) {
      closePopup();
    }
  });

  return {
    openPopup,
    closePopup,
    togglePopup,
    renderPopupContent,
  };
}
