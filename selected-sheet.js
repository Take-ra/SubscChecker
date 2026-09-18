import { renderBrandIcon } from "./brand-icons.js";
import { escapeAttr } from "./utils.js";

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

  // ポップアップが開いている場合にリアルタイムで中身を更新する関数
  function updatePopupIfOpen() {
    if (isOpen) {
      renderPopupContent();
      const data = getAggregatedData ? getAggregatedData() : { selectedItems: [] };
      if (!data.selectedItems || data.selectedItems.length === 0) {
        closePopup();
      }
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
        <div class="py-6 text-center text-slate-400 space-y-1.5 flex flex-col items-center justify-center">
          <div class="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-1">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
          </div>
          <p class="text-xs font-bold text-slate-600">選択中のサブスクはありません</p>
          <p class="text-[10px] text-slate-400">リストからチェックを入れてみましょう</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = items
      .map((item) => {
        const priceStr = Number(item.monthly || 0).toLocaleString();
        const iconHtml = renderBrandIcon(item.name, item.categoryId || "lifestyle", "w-8 h-8", "text-xs");

        return `
        <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 hover:bg-blue-50/40 border border-slate-100 hover:border-blue-200/80 transition-all group">
          <div class="flex items-center gap-2.5 min-w-0 mr-2">
            ${iconHtml}
            <span class="text-xs font-black text-slate-800 truncate" title="${escapeAttr(item.name)}">
              ${escapeAttr(item.name)}
            </span>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span class="text-xs font-black text-slate-900 tabular-nums">
              ¥${priceStr}<span class="text-[10px] font-normal text-slate-400 ml-0.5">/月</span>
            </span>
            <button
              type="button"
              data-remove-sub-id="${escapeAttr(item.id)}"
              class="w-6 h-6 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all cursor-pointer"
              title="選択を解除"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
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
  window.updateSelectedSubsPopup = updatePopupIfOpen;

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
        const data = getAggregatedData ? getAggregatedData() : { selectedItems: [] };
        if (!data.selectedItems || data.selectedItems.length === 0) {
          closePopup();
        }
      }
      return;
    }

    // ポップアップの外側をクリックしたら閉じる
    // ※ ただし、サブスクカード(.sub-item, .custom-sub-item)やセレクタ等の操作中は閉じない
    if (
      isOpen &&
      !e.target.closest("#selected-subs-popup") &&
      !e.target.closest(".sub-item") &&
      !e.target.closest(".custom-sub-item") &&
      !e.target.closest(".plan-selector") &&
      !e.target.closest("#btn-open-selected-sheet")
    ) {
      closePopup();
    }
  });

  return {
    openPopup,
    closePopup,
    togglePopup,
    updatePopupIfOpen,
    renderPopupContent,
  };
}
