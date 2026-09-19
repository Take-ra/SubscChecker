// search.js

// 全角/半角、大文字/小文字、ひらがな/カタカナの表記揺れを強力に吸収する関数
function normalizeSearchText(text) {
  if (!text) return "";
  let normalized = text.normalize("NFKC").toLowerCase();
  // ひらがなをカタカナに変換
  normalized = normalized.replace(/[\u3041-\u3096]/g, function (match) {
    return String.fromCharCode(match.charCodeAt(0) + 0x60);
  });
  return normalized;
}

export function initSearch() {
  const searchInput =
    document.getElementById("main-search-input") ||
    document.getElementById("search-input");
  const searchClearBtn =
    document.getElementById("main-search-clear-btn") ||
    document.getElementById("search-clear-btn");
  const emptyState = document.getElementById("empty-state");
  const overlookedContainer = document.getElementById("overlooked-subs-container");
  const quickGuide = document.getElementById("quick-guide");
  const btnEmptyAddCustom = document.getElementById("btn-empty-add-custom");

  if (!searchInput) return;

  // ショートカットキー「/」で検索バーにフォーカス
  window.addEventListener("keydown", (e) => {
    if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      searchInput.focus();
    } else if (e.key === "Escape" && document.activeElement === searchInput) {
      searchInput.value = "";
      searchInput.dispatchEvent(new Event("input"));
      searchInput.blur();
    }
  });

  searchInput.addEventListener("input", (e) => {
    const rawQuery = e.target.value.trim();
    const queryStr = normalizeSearchText(rawQuery);
    const keywords = queryStr.split(/\s+/).filter((k) => k.length > 0);

    const sections = document.querySelectorAll(
      "#subscription-list > section, #section-custom",
    );
    let totalVisibleItems = 0;

    if (searchClearBtn) {
      if (keywords.length > 0) {
        searchClearBtn.classList.remove("hidden");
      } else {
        searchClearBtn.classList.add("hidden");
      }
    }

    // 検索中は見落とし枠やガイドを非表示にして検索結果に集中
    if (keywords.length > 0) {
      if (overlookedContainer) overlookedContainer.classList.add("hidden");
      if (quickGuide) quickGuide.classList.add("hidden");
    } else {
      if (overlookedContainer) overlookedContainer.classList.remove("hidden");
      if (quickGuide) quickGuide.classList.remove("hidden");
    }

    sections.forEach((section) => {
      let visibleCount = 0;
      let scoredItems = [];

      const items = Array.from(
        section.querySelectorAll(".sub-item, .custom-sub-item"),
      );
      const trigger = section.querySelector(".accordion-trigger");
      const wrapper = section.querySelector(".accordion-wrapper");
      const content = section.querySelector(".accordion-content");

      const targetContainer =
        section.querySelector("#custom-list-container") || content;

      items.forEach((item, index) => {
        if (!item.hasAttribute("data-original-index")) {
          item.setAttribute("data-original-index", index);
        }
        const origIndex = parseInt(
          item.getAttribute("data-original-index"),
          10,
        );

        const rawName = item.querySelector("label span, label div")?.textContent || "";
        const name = normalizeSearchText(rawName);
        const searchAttr = normalizeSearchText(
          item.getAttribute("data-search") || "",
        );
        const searchWords = searchAttr.split(" ");

        if (keywords.length === 0) {
          item.style.setProperty("display", "", "important");
          item.classList.remove("hidden");
          item.classList.add("flex");
          scoredItems.push({ el: item, score: 0, index: origIndex });
          visibleCount++;
        } else {
          let isMatch = true;
          let bestScore = 99;

          for (const k of keywords) {
            if (!searchAttr.includes(k) && !name.includes(k)) {
              isMatch = false;
              break;
            }
            if (name.startsWith(k)) {
              bestScore = Math.min(bestScore, 1);
            } else if (searchWords.some((w) => w.startsWith(k))) {
              bestScore = Math.min(bestScore, 2);
            } else {
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

      if (targetContainer) {
        scoredItems.sort((a, b) => {
          if (a.score !== b.score) return a.score - b.score;
          return a.index - b.index;
        });
        scoredItems.forEach((itemObj) =>
          targetContainer.appendChild(itemObj.el),
        );
      }

      if (keywords.length > 0) {
        if (visibleCount === 0 && items.length > 0) {
          section.style.setProperty("display", "none", "important");
        } else {
          section.style.setProperty("display", "", "important");
          section.style.setProperty("margin-top", "0.5rem", "important");
          section.style.setProperty("padding-top", "0", "important");
          section.style.setProperty("border-top", "none", "important");
          if (content)
            content.style.setProperty("padding-top", "0", "important");
          if (trigger)
            trigger.style.setProperty("display", "none", "important");
          if (wrapper) {
            if (wrapper.classList.contains("accordion-wrapper")) {
              wrapper.classList.remove("grid-rows-[0fr]", "opacity-0");
              wrapper.classList.add("grid-rows-[1fr]", "opacity-100");
            } else if (wrapper.classList.contains("accordion-content")) {
              wrapper.classList.remove("hidden");
            }
          }
        }
      } else {
        if (items.length > 0)
          section.style.setProperty("display", "", "important");
        section.style.removeProperty("margin-top");
        section.style.removeProperty("padding-top");
        section.style.removeProperty("border-top");
        if (content) content.style.removeProperty("padding-top");
        if (trigger) trigger.style.removeProperty("display");
      }

      totalVisibleItems += visibleCount;
    });

    if (emptyState) {
      if (keywords.length > 0 && totalVisibleItems === 0) {
        emptyState.classList.remove("hidden");
      } else {
        emptyState.classList.add("hidden");
      }
    }
  });

  if (searchClearBtn) {
    searchClearBtn.addEventListener("click", () => {
      searchInput.value = "";
      searchInput.dispatchEvent(new Event("input"));
      searchInput.focus();
    });
  }

  // 0件ヒット時の「独自のサブスクとして追加」ボタンで検索文字列を引き継ぐ
  if (btnEmptyAddCustom) {
    btnEmptyAddCustom.addEventListener("click", () => {
      const currentQuery = searchInput.value.trim();
      const openModalBtn = document.getElementById("btn-open-custom-modal");
      if (openModalBtn) openModalBtn.click();

      if (currentQuery) {
        setTimeout(() => {
          const nameInput = document.getElementById("custom-name");
          if (nameInput) {
            nameInput.value = currentQuery;
            nameInput.dispatchEvent(new Event("input"));
          }
        }, 50);
      }
    });
  }
}
