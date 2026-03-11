// app.js
import * as Logic from "./logic.js";
import * as Render from "./render.js";
import * as CustomModal from "./custom-modal.js";
import * as ChartApp from "./chart.js";
import * as CalendarApp from "./calendar.js";

export function initApp() {
  window.openCalendarModal = CalendarApp.openCalendarModal;
  window.closeCalendarModal = CalendarApp.closeCalendarModal;
  window.handleTimingChange = CalendarApp.handleTimingChange;
  window.addToGoogleCalendar = CalendarApp.addToGoogleCalendar;
  window.addToAppleCalendar = CalendarApp.addToAppleCalendar;

  const subs = subscriptions;
  const cats = categories;

  let customSubscriptions = [];
  let savedState = {};

  const navContainer = document.getElementById("nav-container"); // 目次を入れる箱
  const listContainer = document.getElementById("subscription-list"); // サブスク一覧を入れる箱
  const customListContainer = document.getElementById("custom-list-container"); // 独自サブスクを入れる箱
  const monthlyTotalEl = document.getElementById("monthly-total"); // 月額合計の数字
  const yearlyTotalEl = document.getElementById("yearly-total"); // 年額合計の数字

  // アプリの状態を管理するフラグ（目印）
  let isFirstLoad = true; // アプリを開いた直後かどうか
  let analyzedData = null; // 分析結果のデータを一時保存する場所
  let isScrollingFromNav = false;

  window.showToast = function (toastId) {
    const toast = document.getElementById(toastId);
    if (toast) {
      // 下からフワッと出す
      toast.classList.remove("translate-y-10", "opacity-0");
      toast.classList.add("translate-y-0", "opacity-100");

      // 2.5秒後にスッと隠す
      setTimeout(() => {
        toast.classList.remove("translate-y-0", "opacity-100");
        toast.classList.add("translate-y-10", "opacity-0");
      }, 2500);
    }
  };

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

    // 画面の主要なパーツの透明(opacity-0)を解除して、フワッと表示させます
    const headerContent = document.getElementById("header-content");
    const mainContent = document.getElementById("main-content");
    const footerControls = document.getElementById("footer-controls");
    if (headerContent) headerContent.classList.remove("opacity-0");
    if (mainContent) mainContent.classList.remove("opacity-0");
    if (footerControls) footerControls.classList.remove("opacity-0");
  }
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

  // 2. calculateTotal の冒頭に「ガード（エラー防止）」を追加
  function calculateTotal() {
    const data = aggregateData();

    // ★重要：もし Logic 側でエラーが出てデータが空なら、ここで処理を止めてクラッシュを防ぐ
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

  // --- イベントリスナー ---
  document.body.addEventListener("change", (e) => {
    // 1. もし変更されたのが「サブスクのチェックボックス」だったら
    if (e.target.classList.contains("sub-checkbox")) {
      const subId = e.target.id.replace("chk-", ""); // ID（例: "chk-netflix"）から "netflix" だけを取り出す
      const planSel = document.getElementById(`sel-${subId}`); // 同じサブスクの「月額/年額」を選ぶプルダウンがあるか探す

      if (!savedState[subId]) savedState[subId] = {}; // 保存用の箱がなければ作る

      // チェックが入ったか外れたか（true / false）を記録する
      savedState[subId].checked = e.target.checked;

      // もし月額/年額のプルダウンがあれば、今どちらが選ばれているかも記録する
      if (planSel) savedState[subId].plan = planSel.value;

      // チェック状態に合わせて、カード（箱）の背景色を水色にしたり白に戻したりする
      Render.updateHighlight(
        e.target.closest(".sub-item, .custom-sub-item"),
        e.target.checked,
      );

      saveData(); // ここまでの変更をスマホやPCの中に保存する
      calculateTotal(); // 合計金額を再計算して、画面下の数字をパラパラッと動かす
    }

    // 2. もし変更されたのが「月額/年額のプルダウン」だったら
    if (e.target.classList.contains("plan-selector")) {
      const subId = e.target.id.replace("sel-", ""); // ID（例: "sel-netflix"）から "netflix" を取り出す
      if (!savedState[subId]) savedState[subId] = {};

      // 選ばれたプラン（"monthly" または "yearly"）を記録する
      savedState[subId].plan = e.target.value;

      saveData(); // 保存する
      calculateTotal(); // プランが変わったので、合計金額を再計算する
    }
  });

  document.body.addEventListener("click", (e) => {
    // クリックされた場所から一番近い「サブスクのカード（箱）」を探す
    const card = e.target.closest(".sub-item, .custom-sub-item");

    // もしカードの中がクリックされたけど、
    // プルダウンやチェックボックス、ラベル自体を直接クリックしたわけではない場合（＝つまりカードの「余白」を押した場合）
    if (
      card &&
      !e.target.classList.contains("plan-selector") &&
      !e.target.classList.contains("sub-checkbox") &&
      !e.target.closest("label") &&
      !e.target.closest("button")
    ) {
      // そのカードの中にあるチェックボックスを探し出す
      const checkbox = card.querySelector(".sub-checkbox");
      if (checkbox) {
        // 見えない手でチェックボックスをクリックした状態にする（チェックを反転させる）
        checkbox.checked = !checkbox.checked;

        // 無理やり「change（値が変わったよ）」というイベントを発生させ、上の①の処理を呼び出す
        checkbox.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
    // もしクリックされたのが、カテゴリー名（例：🎬 動画配信）の部分だったら
    const trigger = e.target.closest(".accordion-trigger");
    if (trigger) {
      const wrapper = trigger.nextElementSibling;
      const icon = trigger.querySelector(".accordion-icon");

      if (wrapper && icon) {
        // 新しいアニメーション（wrapperがある場合）
        if (wrapper.classList.contains("accordion-wrapper")) {
          const isClosed = wrapper.classList.contains("grid-rows-[0fr]");
          if (isClosed) {
            wrapper.classList.remove("grid-rows-[0fr]", "opacity-0");
            wrapper.classList.add("grid-rows-[1fr]", "opacity-100");
            icon.classList.add("rotate-180");
          } else {
            wrapper.classList.remove("grid-rows-[1fr]", "opacity-100");
            wrapper.classList.add("grid-rows-[0fr]", "opacity-0");
            icon.classList.remove("rotate-180");
          }
        }
        // 古いhidden方式（独自のサブスクなどが未対応の場合の保険）
        else if (wrapper.classList.contains("accordion-content")) {
          wrapper.classList.toggle("hidden");
          icon.classList.toggle("rotate-180");
        }
      }
    }
    // もしクリックされたのが、左側（スマホは上）の目次ボタンだったら
    // もしクリックされたのが、左側（スマホは上）の目次ボタンだったら
    const navLink = e.target.closest(".nav-link");
    if (navLink) {
      const targetId = navLink.getAttribute("data-target");
      const targetSection = document.getElementById(targetId);

      // ★ 変更点1：実際にスクロールしている箱（コンテナ）を取得
      const scrollContainer = document.querySelector(
        ".h-full.w-full.overflow-y-auto",
      );

      if (targetSection && scrollContainer) {
        // ★ 変更点2：クリックした目次だけを青く光らせ、他はグレーに戻す
        document.querySelectorAll(".nav-link").forEach((link) => {
          if (link === navLink) {
            link.classList.add(
              "text-blue-600",
              "bg-blue-100",
              "md:bg-blue-50/80",
              "md:border-blue-500",
            );
            link.classList.remove(
              "text-slate-500",
              "bg-slate-100",
              "md:bg-transparent",
              "md:border-transparent",
            );
          } else {
            link.classList.remove(
              "text-blue-600",
              "bg-blue-100",
              "md:bg-blue-50/80",
              "md:border-blue-500",
            );
            link.classList.add(
              "text-slate-500",
              "bg-slate-100",
              "md:bg-transparent",
              "md:border-transparent",
            );
          }
        });

        const isPC = window.innerWidth >= 768;
        const headerOffset = isPC
          ? 0
          : document.querySelector("nav").offsetHeight;

        // ★ 変更点3：コンテナ基準での正確なスクロール位置を計算
        const containerRect = scrollContainer.getBoundingClientRect();
        const targetRect = targetSection.getBoundingClientRect();
        const targetPosition =
          scrollContainer.scrollTop +
          (targetRect.top - containerRect.top) -
          headerOffset -
          20;

        // ★ 変更点4：windowではなく、コンテナ自体をスクロールさせる
        scrollContainer.scrollTo({ top: targetPosition, behavior: "smooth" });

        // （気の利いた処理）もし飛んだ先のカテゴリーが「閉じて」いたら、自動的に「開く」ようにする
        const wrapper = targetSection.querySelector(".accordion-wrapper");
        const icon = targetSection.querySelector(".accordion-icon");
        if (wrapper && wrapper.classList.contains("grid-rows-[0fr]")) {
          wrapper.classList.remove("grid-rows-[0fr]", "opacity-0");
          wrapper.classList.add("grid-rows-[1fr]", "opacity-100");
          if (icon) icon.classList.add("rotate-180");
        }
      }
    }
  });

  const searchInput = document.getElementById("search-input");
  const searchClearBtn = document.getElementById("search-clear-btn");
  const emptyState = document.getElementById("empty-state");

  // 【追加】全角/半角、大文字/小文字、ひらがな/カタカナの表記揺れを強力に吸収する関数
  function normalizeSearchText(text) {
    if (!text) return "";
    // NFKCで全角英数→半角、半角カナ→全角に統一し、小文字化
    let normalized = text.normalize("NFKC").toLowerCase();
    // ひらがなをカタカナに変換（「ねとふり」と「ネトフリ」を同一視するため）
    normalized = normalized.replace(/[\u3041-\u3096]/g, function (match) {
      return String.fromCharCode(match.charCodeAt(0) + 0x60);
    });
    return normalized;
  }

  searchInput.addEventListener("input", (e) => {
    // 1. 検索キーワードを正規化してスペースで分割（AND検索）
    const queryStr = normalizeSearchText(e.target.value).trim();
    const keywords = queryStr.split(/\s+/).filter((k) => k.length > 0);

    // 既存サブスクと独自サブスクの枠をまとめて取得して処理を共通化
    const sections = document.querySelectorAll(
      "#subscription-list > section, #section-custom",
    );
    let totalVisibleItems = 0;

    // クリアボタンの表示・非表示
    if (keywords.length > 0) {
      searchClearBtn.classList.remove("hidden");
    } else {
      searchClearBtn.classList.add("hidden");
    }

    // 2. 各セクションの検索と「スコア順ソート」処理
    sections.forEach((section) => {
      let visibleCount = 0;
      let scoredItems = []; // ソート用の配列

      const items = Array.from(
        section.querySelectorAll(".sub-item, .custom-sub-item"),
      );
      const trigger = section.querySelector(".accordion-trigger");
      const wrapper = section.querySelector(".accordion-wrapper");
      const content = section.querySelector(".accordion-content");

      // 独自サブスクと既存サブスクで要素を入れる親箱が異なるため、適切な方を特定
      const targetContainer =
        section.querySelector("#custom-list-container") || content;

      items.forEach((item, index) => {
        // 検索クリア時に元の並び順に戻すため、初期インデックスを記録
        if (!item.hasAttribute("data-original-index")) {
          item.setAttribute("data-original-index", index);
        }
        const origIndex = parseInt(
          item.getAttribute("data-original-index"),
          10,
        );

        const rawName = item.querySelector("label div")?.textContent || "";
        const name = normalizeSearchText(rawName);
        const searchAttr = normalizeSearchText(
          item.getAttribute("data-search") || "",
        );
        // スペースで区切られた単語リスト（名前＋キーワード群）
        const searchWords = searchAttr.split(" ");

        if (keywords.length === 0) {
          // 【検索クリア時】すべて表示してスコア0（元の順序）とする
          item.style.setProperty("display", "", "important");
          item.classList.remove("hidden");
          item.classList.add("flex");
          scoredItems.push({ el: item, score: 0, index: origIndex });
          visibleCount++;
        } else {
          // 【検索中】AND検索で条件を満たすかチェックし、スコアリング
          let isMatch = true;
          let bestScore = 99; // 小さいほど上位に表示

          for (const k of keywords) {
            if (!searchAttr.includes(k)) {
              isMatch = false; // 1つでも含まれていなければ除外
              break;
            }
            // --- ユーザー体験を高めるスコアリングロジック ---
            // 1. サービス名が検索文字で始まる (例: "n" で "netflix")
            if (name.startsWith(k)) {
              bestScore = Math.min(bestScore, 1);
            }
            // 2. キーワード(タグ)のどれかが検索文字で始まる (例: "ネ" で "ネットフリックス")
            else if (searchWords.some((w) => w.startsWith(k))) {
              bestScore = Math.min(bestScore, 2);
            }
            // 3. 途中から一致する部分一致 (例: "flix" で "netflix")
            else {
              bestScore = Math.min(bestScore, 3);
            }
          }

          if (isMatch) {
            item.style.setProperty("display", "", "important");
            item.classList.remove("hidden");
            item.classList.add("flex");
            scoredItems.push({ el: item, score: bestScore, index: origIndex });
            visibleCount++;
          } else {
            item.style.setProperty("display", "none", "important");
            item.classList.remove("flex");
            item.classList.add("hidden");
          }
        }
      });

      // 3. スコア順（1→2→3）でDOMを並び替え。同じスコアなら元の順序を維持
      if (targetContainer) {
        scoredItems.sort((a, b) => {
          if (a.score !== b.score) return a.score - b.score;
          return a.index - b.index;
        });
        // 物理的にDOM要素を移動させることで見た目もリアルタイムに整列される
        scoredItems.forEach((itemObj) =>
          targetContainer.appendChild(itemObj.el),
        );
      }

      // 4. セクション（ジャンルの箱）自体の表示・非表示とUI調整
      if (keywords.length > 0) {
        if (visibleCount === 0 && items.length > 0) {
          section.style.setProperty("display", "none", "important");
        } else {
          section.style.setProperty("display", "", "important");
          // 検索中は余白と線を詰める
          section.style.setProperty("margin-top", "0.5rem", "important");
          section.style.setProperty("padding-top", "0", "important");
          section.style.setProperty("border-top", "none", "important");
          if (content)
            content.style.setProperty("padding-top", "0", "important");
          if (trigger)
            trigger.style.setProperty("display", "none", "important");
          if (wrapper) {
            wrapper.classList.remove("grid-rows-[0fr]", "opacity-0");
            wrapper.classList.add("grid-rows-[1fr]", "opacity-100");
          }
        }
      } else {
        if (items.length > 0)
          section.style.setProperty("display", "", "important");
        // 検索クリア時は余白を元に戻す
        section.style.removeProperty("margin-top");
        section.style.removeProperty("padding-top");
        section.style.removeProperty("border-top");
        if (content) content.style.removeProperty("padding-top");
        if (trigger) trigger.style.setProperty("display", "", "important");
      }

      totalVisibleItems += visibleCount;
    });

    // 何もヒットしなかった時のメッセージ
    if (emptyState) {
      if (keywords.length > 0 && totalVisibleItems === 0) {
        emptyState.classList.remove("hidden");
      } else {
        emptyState.classList.add("hidden");
      }
    }
  });

  searchClearBtn.addEventListener("click", () => {
    searchInput.value = "";
    searchInput.dispatchEvent(new Event("input"));
    searchInput.focus();
  });

  // 自由入力ボックスの表示・非表示を切り替える
  document.body.addEventListener("change", (e) => {
    if (e.target.id === "custom-plan-type") {
      const container = document.getElementById("custom-cycle-container");
      if (container) {
        if (e.target.value === "custom") {
          container.classList.remove("hidden");
        } else {
          container.classList.add("hidden");
        }
      }
    }
  });

  const resetModal = document.getElementById("reset-modal");
  const btnResetAll = document.getElementById("btn-reset-all");
  const btnConfirmReset = document.getElementById("btn-confirm-reset");

  const openResetModal = () => {
    resetModal.classList.remove("hidden");
    resetModal.classList.add("flex");
    document.body.style.overflow = "hidden";
  };
  const closeResetModal = () => {
    resetModal.classList.add("hidden");
    resetModal.classList.remove("flex");
    document.body.style.overflow = "";
  };

  btnResetAll.addEventListener("click", openResetModal);
  document
    .querySelectorAll(".close-reset-modal-btn")
    .forEach((btn) => btn.addEventListener("click", closeResetModal));
  document
    .querySelector(".modal-overlay-reset")
    .addEventListener("click", closeResetModal);

  btnConfirmReset.addEventListener("click", () => {
    localStorage.removeItem("subscriptionStateV4");
    localStorage.removeItem("customSubscriptions");
    savedState = {};
    customSubscriptions = [];
    searchInput.value = "";
    searchInput.dispatchEvent(new Event("input"));

    Render.renderMainList(cats, subs, savedState, listContainer);
    Render.renderCustomList(
      customSubscriptions,
      savedState,
      customListContainer,
    );

    isFirstLoad = false;
    calculateTotal();
    closeResetModal();

    window.showToast("reset-toast");
  });

  // --- 画面遷移（分析画面への切り替え） ---
  const btnAnalyze = document.getElementById("btn-analyze");
  const btnBack = document.getElementById("btn-back");

  if (btnAnalyze) {
    btnAnalyze.addEventListener("click", () => {
      analyzedData = aggregateData();

      // 必要な要素をその場でしっかり捕まえる
      const inputScr = document.getElementById("input-screen");
      const resultScr = document.getElementById("result-screen");
      const footCtrl = document.getElementById("footer-controls");

      // 入力画面と、問題のフッターを隠す
      if (inputScr) inputScr.style.display = "none";
      if (footCtrl) footCtrl.style.display = "none";

      // 分析結果画面を表示する
      if (resultScr) {
        resultScr.classList.remove("hidden");
        resultScr.style.display = "block";
      }

      window.scrollTo(0, 0);
      setTimeout(() => {
        if (analyzedData) {
          Render.renderResultScreen(analyzedData);
          ChartApp.renderChart(analyzedData);
        }
      }, 250);
    });
  }

  if (btnBack) {
    btnBack.addEventListener("click", () => {
      const inputScr = document.getElementById("input-screen");
      const resultScr = document.getElementById("result-screen");
      const footCtrl = document.getElementById("footer-controls");
      ChartApp.clearChart();

      // 分析結果画面を隠す
      if (resultScr) {
        resultScr.classList.add("hidden");
        resultScr.style.display = "none";
      }

      // 入力画面とフッターを復活させる
      if (inputScr) inputScr.style.display = "";
      if (footCtrl) footCtrl.style.display = "";

      window.scrollTo(0, 0);
    });
  }

  init();
}
