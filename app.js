// app.js
import * as Logic from "./logic.js";
import * as Render from "./render.js";
import * as CustomModal from "./custom-modal.js";
import * as ChartApp from "./chart.js";
import * as CalendarApp from "./calendar.js";
import { initSearch } from "./search.js";
import { initUIEvents } from "./ui-events.js";
import { analyzeSubscriptions } from "./ai-service.js"; // ★追加：AI通信用の配達員を呼ぶ

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
  const monthlyTotalEl = document.getElementById("monthly-total");
  const yearlyTotalEl = document.getElementById("yearly-total");

  let isFirstLoad = true;
  let analyzedData = null;

  // --- 初期化処理 ---
  function init() {
    loadData();
    Render.renderNav(cats, navContainer);
    Render.renderMainList(cats, subs, savedState, listContainer);
    Render.renderCustomList(
      customSubscriptions,
      savedState,
      customListContainer,
    );
    calculateTotal();

    initSearch();

    // UIイベントの起動
    initUIEvents({
      getAggregatedData: () => aggregateData(),
      onAnalyzeRender: (data) => {
        analyzedData = data;
        Render.renderResultScreen(analyzedData);
        ChartApp.renderChart(analyzedData);
      },
      onBack: () => {
        ChartApp.clearChart();
      },
      onReset: () => {
        localStorage.removeItem("subscriptionStateV4");
        localStorage.removeItem("customSubscriptions");
        savedState = {};
        customSubscriptions = [];

        const searchInput = document.getElementById("search-input");
        if (searchInput) {
          searchInput.value = "";
          searchInput.dispatchEvent(new Event("input"));
        }

        Render.renderMainList(cats, subs, savedState, listContainer);
        Render.renderCustomList(
          customSubscriptions,
          savedState,
          customListContainer,
        );
        isFirstLoad = false;
        calculateTotal();
        window.showToast("reset-toast");
      },

      // ▼▼ ここから追加：AIボタンが押された時の処理 ▼▼
      onAskAI: async (goal, customText) => {
        // 1. 今選ばれているサブスクのデータを計算
        const data = aggregateData();

        // 2. AIが読めるように、きれいな箇条書きテキストに変換
        let formattedData = Logic.formatDataForAI(data);

        // 3. もし「その他（自由入力）」が選ばれた場合は、テキストの下に質問を付け足す
        if (goal === "custom" && customText) {
          formattedData += `\n\n【ユーザーからの特別な要望・質問】\n${customText}\nこれに対して具体的にアドバイスしてください。`;
        }

        // 4. 配達員（ai-service.js）にデータを渡して、結果が返ってくるまで待つ
        const answer = await analyzeSubscriptions(formattedData, goal);

        // 5. 返ってきたAIのアドバイスを画面（ui-events.js）に返す
        return answer;
      },
      // ▲▲ ここまで追加 ▲▲
    });

    // 画面をフワッと表示
    document.getElementById("header-content")?.classList.remove("opacity-0");
    document.getElementById("main-content")?.classList.remove("opacity-0");
    document.getElementById("footer-controls")?.classList.remove("opacity-0");
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
      Render.renderCustomList(
        customSubscriptions,
        savedState,
        customListContainer,
      );
      calculateTotal();
    },
  });

  ChartApp.initChartControls(() => analyzedData);

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

    // ジャンルごとの小計を更新
    const sections = document.querySelectorAll("main > div > section");
    sections.forEach((section) => {
      const catNameText = section.querySelector("h2").textContent.trim();
      const subtotalEl = section.querySelector(".subtotal-val");
      if (subtotalEl && data.genreTotals[catNameText]) {
        const val = data.genreTotals[catNameText].monthly;
        const currentSub =
          parseInt(subtotalEl.textContent.replace(/,/g, ""), 10) || 0;
        if (isFirstLoad) subtotalEl.textContent = val.toLocaleString();
        else Render.animateValue(subtotalEl, currentSub, val, 500);
      }
    });

    // 独自サブスクの小計を更新
    const customSubtotalEl = document.querySelector(
      "#section-custom .subtotal-val",
    );
    if (customSubtotalEl) {
      const val = data.genreTotals["独自のサブスク"].monthly;
      const currentSub =
        parseInt(customSubtotalEl.textContent.replace(/,/g, ""), 10) || 0;
      if (isFirstLoad) customSubtotalEl.textContent = val.toLocaleString();
      else Render.animateValue(customSubtotalEl, currentSub, val, 500);
    }

    // 全体の合計を更新
    if (isFirstLoad) {
      monthlyTotalEl.textContent = data.totalMonthly.toLocaleString();
      yearlyTotalEl.textContent = data.totalYearly.toLocaleString();
      isFirstLoad = false;
    } else {
      const currentMonthly =
        parseInt(monthlyTotalEl.textContent.replace(/,/g, ""), 10) || 0;
      const currentYearly =
        parseInt(yearlyTotalEl.textContent.replace(/,/g, ""), 10) || 0;
      Render.animateValue(
        monthlyTotalEl,
        currentMonthly,
        data.totalMonthly,
        500,
      );
      Render.animateValue(yearlyTotalEl, currentYearly, data.totalYearly, 500);
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

  init();
}
