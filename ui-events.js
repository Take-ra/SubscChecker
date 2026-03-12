// ui-events.js

export function initUIEvents(callbacks) {
  // 目次クリックによる「自動スクロール中」かを判定するフラグ
  let isScrollingFromNav = false;

  // 1. 全体のクリックイベント（カード選択、アコーディオン開閉、目次スクロール）
  document.body.addEventListener("click", (e) => {
    // --- カードの余白クリックでチェックボックスを切り替える ---
    const card = e.target.closest(".sub-item, .custom-sub-item");
    if (
      card &&
      !e.target.classList.contains("plan-selector") &&
      !e.target.classList.contains("sub-checkbox") &&
      !e.target.closest("label") &&
      !e.target.closest("button")
    ) {
      const checkbox = card.querySelector(".sub-checkbox");
      if (checkbox) {
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }

    // --- アコーディオン（カテゴリー）の開閉 ---
    const trigger = e.target.closest(".accordion-trigger");
    if (trigger) {
      const wrapper = trigger.nextElementSibling;
      const icon = trigger.querySelector(".accordion-icon");

      if (wrapper && icon) {
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
        } else if (wrapper.classList.contains("accordion-content")) {
          wrapper.classList.toggle("hidden");
          icon.classList.toggle("rotate-180");
        }
      }
    }

    // --- 目次（ナビゲーション）クリック時のスクロール ---
    const navLink = e.target.closest(".nav-link");
    if (navLink) {
      const targetId = navLink.getAttribute("data-target");
      const targetSection = document.getElementById(targetId);
      const scrollContainer = document.querySelector(
        ".h-full.w-full.overflow-y-auto",
      );

      if (targetSection && scrollContainer) {
        // ★追加：スクロール追従を一時停止
        isScrollingFromNav = true;

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
        const containerRect = scrollContainer.getBoundingClientRect();
        const targetRect = targetSection.getBoundingClientRect();
        const targetPosition =
          scrollContainer.scrollTop +
          (targetRect.top - containerRect.top) -
          headerOffset -
          20;

        scrollContainer.scrollTo({ top: targetPosition, behavior: "smooth" });

        const wrapper = targetSection.querySelector(".accordion-wrapper");
        const icon = targetSection.querySelector(".accordion-icon");
        if (wrapper && wrapper.classList.contains("grid-rows-[0fr]")) {
          wrapper.classList.remove("grid-rows-[0fr]", "opacity-0");
          wrapper.classList.add("grid-rows-[1fr]", "opacity-100");
          if (icon) icon.classList.add("rotate-180");
        }

        // ★追加：自動スクロールが完了する頃（約800ミリ秒後）に、手動追従を再開する
        setTimeout(() => {
          isScrollingFromNav = false;
        }, 800);
      }
    }
  });

  // ★新規追加：手動スクロール時の目次追従（スクロールスパイ）
  const scrollContainer = document.querySelector(
    ".h-full.w-full.overflow-y-auto",
  );
  if (scrollContainer) {
    scrollContainer.addEventListener(
      "scroll",
      () => {
        // 目次クリックでの自動移動中は、ここの処理を無視する
        if (isScrollingFromNav) return;

        const sections = document.querySelectorAll(
          "main > div > section, #section-custom",
        );
        let currentId = "";

        // 画面上部から少し下（ヘッダー高＋100px程度のゆとり）に引いた「判定ライン」
        const isPC = window.innerWidth >= 768;
        const headerOffset = isPC
          ? 0
          : document.querySelector("nav").offsetHeight;
        const scrollPos = scrollContainer.scrollTop + headerOffset + 100;

        sections.forEach((section) => {
          const top = section.offsetTop;
          const bottom = top + section.offsetHeight;
          // 判定ラインがそのジャンルの箱の中に入っていれば、それを「今見ているジャンル」とする
          if (scrollPos >= top && scrollPos <= bottom) {
            currentId = section.getAttribute("id");
          }
        });

        // 目次の色を「今見ているジャンル」に合わせて更新
        if (currentId) {
          document.querySelectorAll(".nav-link").forEach((link) => {
            if (link.getAttribute("data-target") === currentId) {
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
        }
      },
      { passive: true },
    );
  }

  // 2. 独自のサブスク追加モーダル内の「支払いサイクル」表示切り替え
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

  // 3. データリセット用モーダル
  const resetModal = document.getElementById("reset-modal");
  const btnResetAll = document.getElementById("btn-reset-all");
  const btnConfirmReset = document.getElementById("btn-confirm-reset");

  const openResetModal = () => {
    if (resetModal) {
      resetModal.classList.remove("hidden");
      resetModal.classList.add("flex");
      document.body.style.overflow = "hidden";
    }
  };
  const closeResetModal = () => {
    if (resetModal) {
      resetModal.classList.add("hidden");
      resetModal.classList.remove("flex");
      document.body.style.overflow = "";
    }
  };

  if (btnResetAll) btnResetAll.addEventListener("click", openResetModal);
  document
    .querySelectorAll(".close-reset-modal-btn")
    .forEach((btn) => btn.addEventListener("click", closeResetModal));

  const overlayReset = document.querySelector(".modal-overlay-reset");
  if (overlayReset) overlayReset.addEventListener("click", closeResetModal);

  if (btnConfirmReset) {
    btnConfirmReset.addEventListener("click", () => {
      callbacks.onReset();
      closeResetModal();
    });
  }

  // 4. 分析画面 ⇔ 入力画面 の切り替え
  const btnAnalyze = document.getElementById("btn-analyze");
  const btnBack = document.getElementById("btn-back");

  if (btnAnalyze) {
    btnAnalyze.addEventListener("click", () => {
      const data = callbacks.getAggregatedData();

      const inputScr = document.getElementById("input-screen");
      const resultScr = document.getElementById("result-screen");
      const footCtrl = document.getElementById("footer-controls");

      if (inputScr) inputScr.style.display = "none";
      if (footCtrl) footCtrl.style.display = "none";

      if (resultScr) {
        resultScr.classList.remove("hidden");
        resultScr.style.display = "block";
      }

      window.scrollTo(0, 0);

      setTimeout(() => {
        if (data) callbacks.onAnalyzeRender(data);
      }, 250);
    });
  }

  if (btnBack) {
    btnBack.addEventListener("click", () => {
      const inputScr = document.getElementById("input-screen");
      const resultScr = document.getElementById("result-screen");
      const footCtrl = document.getElementById("footer-controls");

      callbacks.onBack();

      if (resultScr) {
        resultScr.classList.add("hidden");
        resultScr.style.display = "none";
      }

      if (inputScr) inputScr.style.display = "";
      if (footCtrl) footCtrl.style.display = "";

      window.scrollTo(0, 0);
    });
  }
}
