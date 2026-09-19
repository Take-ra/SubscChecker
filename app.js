import * as Logic from "./storage-calc.js";
import * as Render from "./result-view-ui.js";
import * as RenderList from "./subscription-list-ui.js";
import * as CustomModal from "./custom-subscription-modal.js";
import * as ChartApp from "./expense-chart.js";
import * as CalendarApp from "./calendar.js";
import { categories, subscriptions } from "./subscription-data.js";
import { initSearch, buildSearchIndex } from "./search.js";
import { initUIEvents } from "./ui-events.js";
import * as AIAdvisor from "./ai-advisor.js";
import * as SelectedSheet from "./selected-sheet.js";
import { animateValue } from "./utils.js";

export function initApp() {
  // --- グローバル関数の登録 ---
  window.openCalendarModal = CalendarApp.openCalendarModal;
  window.closeCalendarModal = CalendarApp.closeCalendarModal;
  window.handleTimingChange = CalendarApp.handleTimingChange;
  window.addToGoogleCalendar = CalendarApp.addToGoogleCalendar;
  window.addToAppleCalendar = CalendarApp.addToAppleCalendar;

  window.showToast = function (toastId) {
    const toast = document.getElementById(toastId);
    if (toast) {
      toast.classList.remove("translate-y-10", "opacity-0");
      toast.classList.add("translate-y-0", "opacity-100");
      setTimeout(() => {
        toast.classList.remove("translate-y-0", "opacity-100");
        toast.classList.add("translate-y-10", "opacity-0");
      }, 2500);
    }
  };

  // --- アプリのデータ状態 ---
  const subs = subscriptions;
  const cats = categories;
  let customSubscriptions = [];
  let savedState = {};

  // UI要素の取得
  const navContainer = document.getElementById("nav-container");
  const listContainer = document.getElementById("subscription-list");
  const customListContainer = document.getElementById("custom-list-container");
  const overlookedContainer = document.getElementById("overlooked-subs-container");
  const monthlyTotalEl = document.getElementById("monthly-total");
  const yearlyTotalEl = document.getElementById("yearly-total");

  let isFirstLoad = true;
  let analyzedData = null;

  // DOM要素キャッシュ（calculateTotalのDOM走査コストを削減）
  let cachedSubtotalSections = null;
  let cachedCustomSubtotal = null;
  let cachedOverlookedChips = null;

  function invalidateDomCaches() {
    cachedSubtotalSections = null;
    cachedCustomSubtotal = null;
    cachedOverlookedChips = null;
  }

  // --- 初期化処理 ---
  function init() {
    loadData();
    Render.renderNav(cats, navContainer);
    RenderList.renderOverlookedSection(subs, savedState, overlookedContainer);
    RenderList.renderMainList(cats, subs, savedState, listContainer);
    RenderList.renderCustomList(
      customSubscriptions,
      savedState,
      customListContainer,
    );
    if (localStorage.getItem("subsc_guide_closed") === "true") {
      const quickGuide = document.getElementById("quick-guide");
      if (quickGuide) quickGuide.style.display = "none";
    }
    calculateTotal();

    initSearch();
    AIAdvisor.initAIAdvisor(() => {
      const data = aggregateData();
      return data ? data.selectedItems : [];
    });

    // 切り出したUIイベントを起動。app.jsが持っているデータ処理を「リモコン(コールバック)」として渡す
    initUIEvents({
      getAggregatedData: () => aggregateData(),
      onAnalyzeRender: (data) => {
        analyzedData = data;
        Render.renderResultScreen(analyzedData);
        ChartApp.renderChart(analyzedData);
        AIAdvisor.resetResultTabs();
        AIAdvisor.triggerAnalysis();
      },
      onBack: () => {
        ChartApp.clearChart();
      },
      onReset: () => {
        localStorage.removeItem("subscriptionStateV4");
        localStorage.removeItem("customSubscriptions");
        localStorage.removeItem("subsc_guide_closed");
        savedState = {};
        customSubscriptions = [];

        const quickGuide = document.getElementById("quick-guide");
        if (quickGuide) quickGuide.style.display = "";

        const searchInput =
          document.getElementById("main-search-input") ||
          document.getElementById("search-input");
        if (searchInput) {
          searchInput.value = "";
          searchInput.dispatchEvent(new Event("input"));
        }

        invalidateDomCaches();
        RenderList.renderOverlookedSection(subs, savedState, overlookedContainer);
        RenderList.renderMainList(cats, subs, savedState, listContainer);
        RenderList.renderCustomList(
          customSubscriptions,
          savedState,
          customListContainer,
        );
        calculateTotal();
        buildSearchIndex();
        window.showToast("reset-toast");
      },
    });

    // 画面をフワッと表示（main-content のみ opacity-0 が付いている）
    document.getElementById("main-content")?.classList.remove("opacity-0");
  }

  // --- モジュールの初期化 ---
  CustomModal.initCustomModal({
    getCustomSubs: () => customSubscriptions,
    setCustomSubs: (newSubs) => {
      customSubscriptions = newSubs;
    },
    getSavedState: () => savedState,
    onUpdate: () => {
      saveData();
      cachedCustomSubtotal = null;
      RenderList.renderCustomList(
        customSubscriptions,
        savedState,
        customListContainer,
      );
      calculateTotal();
      buildSearchIndex();
    },
  });

  ChartApp.initChartControls(() => analyzedData);

  SelectedSheet.initSelectedSheet({
    getAggregatedData: () => aggregateData(),
    onToggleSub: (subId, isChecked) => {
      if (!savedState[subId]) savedState[subId] = {};
      savedState[subId].checked = isChecked;
      saveData();

      const chk = document.getElementById(`chk-${subId}`);
      if (chk) {
        chk.checked = isChecked;
        const card = chk.closest(".sub-item, .custom-sub-item");
        if (card) Render.updateHighlight(card, isChecked);
      }
      calculateTotal();
    },
    onAnalyze: () => {
      document.getElementById("btn-analyze")?.click();
    },
  });

  // --- データ処理と計算 ---
  function loadData() {
    const loaded = Logic.loadDataFromStorage();
    savedState = loaded.state;
    customSubscriptions = loaded.custom;
  }

  function saveData() {
    Logic.saveDataToStorage(savedState, customSubscriptions);
  }

  function aggregateData() {
    return Logic.calculateAggregation(
      savedState,
      customSubscriptions,
      cats,
      subs,
    );
  }

  function calculateTotal() {
    const data = aggregateData();

    if (!data || !data.genreTotals) {
      console.warn("データの集計結果が正しくありません");
      return;
    }

    const quickGuide = document.getElementById("quick-guide");
    if (quickGuide) {
      if (data.selectedItems.length === 0)
        quickGuide.classList.remove("guide-hidden");
      else quickGuide.classList.add("guide-hidden");
    }

    // ジャンルごとの選択数を集計
    const genreItemCounts = {};
    data.selectedItems.forEach((item) => {
      const gName = item.category || "その他";
      genreItemCounts[gName] = (genreItemCounts[gName] || 0) + 1;
    });
    // ナビゲーションのバッジを更新
    Render.updateNavBadges(genreItemCounts);

    // ジャンルごとの小計を更新（DOM要素をキャッシュして走査負荷をゼロ化）
    if (!cachedSubtotalSections) {
      const sections = document.querySelectorAll("#subscription-list > section");
      if (sections.length > 0) {
        cachedSubtotalSections = Array.from(sections)
          .map((section) => ({
            catName: section.querySelector("h2")?.textContent?.trim() || "",
            subtotalEl: section.querySelector(".subtotal-val"),
            subtotalContainer: section.querySelector(".subtotal-container"),
          }))
          .filter((s) => s.catName && s.subtotalEl);
      }
    }

    if (cachedSubtotalSections) {
      cachedSubtotalSections.forEach(({ catName, subtotalEl, subtotalContainer }) => {
        if (data.genreTotals[catName]) {
          const val = data.genreTotals[catName].monthly;
          if (subtotalContainer) {
            if (val > 0) {
              subtotalContainer.classList.remove("hidden");
              subtotalContainer.classList.add("flex");
            } else {
              subtotalContainer.classList.add("hidden");
              subtotalContainer.classList.remove("flex");
            }
          }
          const currentSub =
            parseInt(subtotalEl.textContent.replace(/,/g, ""), 10) || 0;
          if (isFirstLoad) subtotalEl.textContent = val.toLocaleString();
          else animateValue(subtotalEl, currentSub, val, 500);
        }
      });
    }

    // 独自サブスクの小計を更新
    if (!cachedCustomSubtotal) {
      const el = document.querySelector("#section-custom .subtotal-val");
      const container = document.querySelector("#section-custom .subtotal-container");
      if (el) cachedCustomSubtotal = { el, container };
    }
    if (cachedCustomSubtotal) {
      const { el, container } = cachedCustomSubtotal;
      const val = data.genreTotals["独自のサブスク"]?.monthly || 0;
      if (container) {
        if (val > 0) {
          container.classList.remove("hidden");
          container.classList.add("flex");
        } else {
          container.classList.add("hidden");
          container.classList.remove("flex");
        }
      }
      const currentSub =
        parseInt(el.textContent.replace(/,/g, ""), 10) || 0;
      if (isFirstLoad) el.textContent = val.toLocaleString();
      else animateValue(el, currentSub, val, 500);
    }

    // 全体の合計を更新（モバイルフッター）
    if (isFirstLoad) {
      monthlyTotalEl.textContent = data.totalMonthly.toLocaleString();
      yearlyTotalEl.textContent = data.totalYearly.toLocaleString();
      isFirstLoad = false;
    } else {
      const currentMonthly =
        parseInt(monthlyTotalEl.textContent.replace(/,/g, ""), 10) || 0;
      const currentYearly =
        parseInt(yearlyTotalEl.textContent.replace(/,/g, ""), 10) || 0;
      animateValue(
        monthlyTotalEl,
        currentMonthly,
        data.totalMonthly,
        500,
      );
      animateValue(yearlyTotalEl, currentYearly, data.totalYearly, 500);
    }

    // PC専用右サイドバーの選択中パネルをリアルタイム更新
    Render.renderPcSelectedPanel(data.selectedItems, data.totalMonthly, data.totalYearly);

    // 見落としがちチップの選択状態（チェック状態）を同期
    if (!cachedOverlookedChips) {
      const chips = document.querySelectorAll(".overlooked-chip");
      if (chips.length > 0) cachedOverlookedChips = chips;
    }
    if (cachedOverlookedChips) {
      cachedOverlookedChips.forEach((chip) => {
        const subId = chip.getAttribute("data-sub-id");
        const isChecked = Boolean(savedState[subId]?.checked);
        const icon = chip.querySelector(".chip-check-icon");
        if (isChecked) {
          chip.classList.add("bg-blue-50", "border-blue-500", "text-blue-700", "font-bold");
          chip.classList.remove("bg-white", "border-slate-200/90", "text-slate-700");
          if (icon) icon.classList.remove("hidden");
        } else {
          chip.classList.remove("bg-blue-50", "border-blue-500", "text-blue-700", "font-bold");
          chip.classList.add("bg-white", "border-slate-200/90", "text-slate-700");
          if (icon) icon.classList.add("hidden");
        }
      });
    }

    // フッターの「〇件 選択中」ボタンの更新
    const footerCountEl = document.getElementById("footer-selected-count");
    if (footerCountEl) {
      footerCountEl.textContent = `${data.selectedItems.length}件 選択中`;
    }
    const btnOpenSelected = document.getElementById("btn-open-selected-sheet");
    if (btnOpenSelected) {
      if (data.selectedItems.length > 0) {
        btnOpenSelected.classList.remove("hidden");
        btnOpenSelected.style.display = "inline-flex";
      } else {
        btnOpenSelected.classList.add("hidden");
        btnOpenSelected.style.display = "none";
      }
    }

    // モバイルの「結果を分析」ボタンの活性/非活性
    const btnAnalyze = document.getElementById("btn-analyze");
    if (btnAnalyze) {
      if (data.selectedItems.length === 0) {
        btnAnalyze.classList.add("opacity-50", "cursor-not-allowed");
      } else {
        btnAnalyze.classList.remove("opacity-50", "cursor-not-allowed");
      }
    }

    // ポップアップが開いていればリアルタイムに同期更新
    if (window.updateSelectedSubsPopup) {
      window.updateSelectedSubsPopup();
    }
  }

  // --- お金に関わる重要イベント（チェックボックス・プラン選択） ---
  document.body.addEventListener("change", (e) => {
    if (e.target.classList.contains("sub-checkbox")) {
      const subId = e.target.id.replace("chk-", "");
      const planSel = document.getElementById(`sel-${subId}`);

      if (!savedState[subId]) savedState[subId] = {};
      savedState[subId].checked = e.target.checked;
      if (planSel) savedState[subId].plan = planSel.value;

      Render.updateHighlight(
        e.target.closest(".sub-item, .custom-sub-item"),
        e.target.checked,
      );
      saveData();
      calculateTotal();
    }

    if (e.target.classList.contains("plan-selector")) {
      const subId = e.target.id.replace("sel-", "");
      if (!savedState[subId]) savedState[subId] = {};
      savedState[subId].plan = e.target.value;

      saveData();
      calculateTotal();
    }
  });

  // --- 見落としがちチップ・PC右サイドバー操作・ガイド閉じる ---
  document.body.addEventListener("click", (e) => {
    // 見落としがちチップをクリック
    const chip = e.target.closest(".overlooked-chip");
    if (chip) {
      const subId = chip.getAttribute("data-sub-id");
      if (subId) {
        if (!savedState[subId]) savedState[subId] = {};
        const nextChecked = !Boolean(savedState[subId].checked);
        savedState[subId].checked = nextChecked;
        if (nextChecked && !savedState[subId].plan) {
          const subData = subs.find((s) => s.id === subId);
          savedState[subId].plan = subData?.defaultPlanId || subData?.plans?.[0]?.id || "std";
        }
        saveData();

        const chk = document.getElementById(`chk-${subId}`);
        if (chk) {
          chk.checked = nextChecked;
          const card = chk.closest(".sub-item, .custom-sub-item");
          if (card) Render.updateHighlight(card, nextChecked);
        }
        calculateTotal();
      }
      return;
    }

    // PCサイドバー内の個別サブスク解除ボタン
    const removeBtn = e.target.closest(".pc-btn-remove-sub");
    if (removeBtn) {
      const subId = removeBtn.getAttribute("data-sub-id");
      if (subId) {
        if (!savedState[subId]) savedState[subId] = {};
        savedState[subId].checked = false;
        saveData();

        const chk = document.getElementById(`chk-${subId}`);
        if (chk) {
          chk.checked = false;
          const card = chk.closest(".sub-item, .custom-sub-item");
          if (card) Render.updateHighlight(card, false);
        }
        calculateTotal();
      }
      return;
    }

    // 独自サブスクの削除ボタン（委譲フォールバック）
    const customDeleteBtn = e.target.closest(".btn-delete-custom");
    if (customDeleteBtn) {
      const subId = customDeleteBtn.getAttribute("data-id");
      if (subId && typeof window.deleteCustomSub === "function") {
        window.deleteCustomSub(subId);
      }
      return;
    }

    // PCサイドバー内のリセットボタン
    if (e.target.closest("#pc-btn-reset-all")) {
      document.getElementById("btn-reset-all")?.click();
      return;
    }

    // PCサイドバー内の分析ボタン
    const pcAnalyzeBtn = e.target.closest("#pc-btn-analyze");
    if (pcAnalyzeBtn) {
      if (pcAnalyzeBtn.disabled || pcAnalyzeBtn.classList.contains("cursor-not-allowed")) return;
      document.getElementById("btn-analyze")?.click();
      return;
    }

    // ガイドを閉じるボタン（閉じた状態を保存して再訪時に表示しない）
    if (e.target.closest("#btn-close-guide")) {
      const quickGuide = document.getElementById("quick-guide");
      if (quickGuide) {
        quickGuide.style.display = "none";
        try {
          localStorage.setItem("subsc_guide_closed", "true");
        } catch (_) {}
      }
      return;
    }
  });

  init();
}
