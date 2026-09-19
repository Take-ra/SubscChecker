// search.js (ゼロリフロー・メモリインデックス高速サブスク検索モジュール)

/**
 * 全角/半角、大文字/小文字、ひらがな/カタカナの表記揺れを強力に吸収する関数
 */
export function normalizeSearchText(text) {
  if (!text) return "";
  let normalized = text.normalize("NFKC").toLowerCase();
  // ひらがなをカタカナに変換して照合統一
  normalized = normalized.replace(/[\u3041-\u3096]/g, (match) => {
    return String.fromCharCode(match.charCodeAt(0) + 0x60);
  });
  return normalized;
}

// メモリ上にキャッシュする検索インデックス
let searchIndex = null;

/**
 * サブスク一覧DOMから検索用インデックスを1回だけ構築（ゼロリフロー・高速判定用）
 */
export function buildSearchIndex() {
  const sections = document.querySelectorAll(
    "#subscription-list > section, #section-custom",
  );
  const sectionEntries = [];

  sections.forEach((section) => {
    const trigger = section.querySelector(".accordion-trigger");
    const wrapper = section.querySelector(".accordion-wrapper, .accordion-content");
    const titleEl = section.querySelector("h2");
    const catName = titleEl?.textContent?.trim() || "";

    // 検索前の初期開閉状態を記録（検索クリア時に完全復元するため）
    const isInitiallyOpen = wrapper
      ? wrapper.classList.contains("grid-rows-[1fr]") ||
        !wrapper.classList.contains("hidden")
      : true;

    // ヘッダー内のヒット件数表示用バッジを準備（なければ生成）
    let badgeEl = trigger?.querySelector(".search-hit-badge");
    if (!badgeEl && trigger) {
      const headingContainer = trigger.querySelector("h2")?.parentElement;
      if (headingContainer) {
        badgeEl = document.createElement("span");
        badgeEl.className =
          "search-hit-badge hidden text-xs font-black text-blue-600 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full shrink-0 ml-1.5";
        headingContainer.appendChild(badgeEl);
      }
    }

    const itemElements = Array.from(
      section.querySelectorAll(".sub-item, .custom-sub-item"),
    );

    const items = itemElements.map((el) => {
      const rawName =
        el.querySelector("label span, label div")?.textContent || "";
      const rawSearch = el.getAttribute("data-search") || "";

      return {
        el,
        name: normalizeSearchText(rawName),
        search: normalizeSearchText(`${rawName} ${catName} ${rawSearch}`),
      };
    });

    sectionEntries.push({
      sectionEl: section,
      triggerEl: trigger,
      wrapperEl: wrapper,
      badgeEl,
      catName,
      isInitiallyOpen,
      items,
    });
  });

  searchIndex = sectionEntries;
  return searchIndex;
}

export function initSearch() {
  const searchInput =
    document.getElementById("main-search-input") ||
    document.getElementById("search-input");
  const searchClearBtn =
    document.getElementById("main-search-clear-btn") ||
    document.getElementById("search-clear-btn");
  const searchKbd = document.getElementById("main-search-kbd");
  const searchCountBadge = document.getElementById("main-search-count-badge");
  const emptyState = document.getElementById("empty-state");
  const overlookedContainer = document.getElementById("overlooked-subs-container");
  const quickGuide = document.getElementById("quick-guide");
  const btnEmptyAddCustom = document.getElementById("btn-empty-add-custom");

  if (!searchInput) return;

  // 初回インデックス構築
  buildSearchIndex();

  let rafId = null;

  function performSearch(rawQuery) {
    if (!searchIndex) buildSearchIndex();

    const queryStr = normalizeSearchText(rawQuery.trim());
    const keywords = queryStr.split(/\s+/).filter((k) => k.length > 0);
    const isSearching = keywords.length > 0;

    // 検索バー内UIの更新
    if (searchClearBtn) {
      searchClearBtn.classList.toggle("hidden", !isSearching);
    }
    if (searchKbd) {
      searchKbd.classList.toggle("hidden", isSearching);
    }

    // 検索中は定番枠・ガイドを非表示にして検索結果に集中
    if (overlookedContainer) {
      overlookedContainer.classList.toggle("hidden", isSearching);
    }
    if (quickGuide) {
      quickGuide.classList.toggle("hidden", isSearching);
    }

    let totalMatchedItems = 0;

    // メモリインデックスを走査（DOMの再構築や物理的移動はゼロ）
    searchIndex.forEach((sec) => {
      if (!isSearching) {
        // --- 検索クリア時: 検索前の開閉状態を完全復元 ---
        sec.sectionEl.style.display = "";
        sec.sectionEl.style.removeProperty("margin-top");
        sec.sectionEl.style.removeProperty("padding-top");
        sec.sectionEl.style.removeProperty("border-top");

        if (sec.badgeEl) {
          sec.badgeEl.classList.add("hidden");
          sec.badgeEl.textContent = "";
        }

        // 各カードを表示
        sec.items.forEach((item) => {
          item.el.classList.remove("hidden");
          item.el.style.display = "";
        });

        // アコーディオンを開閉状態に合わせて戻す
        if (sec.wrapperEl) {
          if (sec.wrapperEl.classList.contains("accordion-wrapper")) {
            sec.wrapperEl.classList.toggle("grid-rows-[1fr]", sec.isInitiallyOpen);
            sec.wrapperEl.classList.toggle("grid-rows-[0fr]", !sec.isInitiallyOpen);
            sec.wrapperEl.classList.toggle("opacity-100", sec.isInitiallyOpen);
            sec.wrapperEl.classList.toggle("opacity-0", !sec.isInitiallyOpen);
          } else if (sec.wrapperEl.classList.contains("accordion-content")) {
            sec.wrapperEl.classList.toggle("hidden", !sec.isInitiallyOpen);
          }
        }
        const icon = sec.triggerEl?.querySelector(".accordion-icon");
        if (icon) {
          icon.classList.toggle("rotate-180", sec.isInitiallyOpen);
        }
      } else {
        // --- 検索中: あいまい判定 ＆ 一括表示切り替え ---
        let secMatchCount = 0;

        sec.items.forEach((item) => {
          // すべてのキーワードがマッチするか判定（AND検索）
          const isMatch = keywords.every(
            (k) => item.search.includes(k) || item.name.includes(k),
          );

          if (isMatch) {
            item.el.classList.remove("hidden");
            item.el.style.display = "";
            secMatchCount++;
          } else {
            item.el.classList.add("hidden");
            item.el.style.display = "none";
          }
        });

        if (secMatchCount === 0) {
          sec.sectionEl.style.display = "none";
          if (sec.badgeEl) sec.badgeEl.classList.add("hidden");
        } else {
          sec.sectionEl.style.display = "";
          // ヒット件数バッジをヘッダーに明示（例: 3件）
          if (sec.badgeEl) {
            sec.badgeEl.textContent = `${secMatchCount}件`;
            sec.badgeEl.classList.remove("hidden");
          }

          // 検索結果が見えるようにアコーディオンを開く
          if (sec.wrapperEl) {
            if (sec.wrapperEl.classList.contains("accordion-wrapper")) {
              sec.wrapperEl.classList.remove("grid-rows-[0fr]", "opacity-0");
              sec.wrapperEl.classList.add("grid-rows-[1fr]", "opacity-100");
            } else if (sec.wrapperEl.classList.contains("accordion-content")) {
              sec.wrapperEl.classList.remove("hidden");
            }
          }
          const icon = sec.triggerEl?.querySelector(".accordion-icon");
          if (icon) icon.classList.add("rotate-180");
        }

        totalMatchedItems += secMatchCount;
      }
    });

    // 検索バー右側のヒット件数バッジの更新
    if (searchCountBadge) {
      if (isSearching) {
        searchCountBadge.textContent = `${totalMatchedItems}件`;
        searchCountBadge.classList.remove("hidden");
        if (totalMatchedItems === 0) {
          searchCountBadge.className =
            "text-xs font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 border border-slate-200 select-none transition-all";
        } else {
          searchCountBadge.className =
            "text-xs font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200/80 select-none transition-all";
        }
      } else {
        searchCountBadge.classList.add("hidden");
      }
    }

    // 0件空状態UIの制御
    if (emptyState) {
      emptyState.classList.toggle("hidden", !isSearching || totalMatchedItems > 0);
    }
  }

  // 入力イベントハンドラー（requestAnimationFrame で描画最適化）
  searchInput.addEventListener("input", (e) => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      performSearch(e.target.value);
    });
  });

  // クリアボタンのクリック
  if (searchClearBtn) {
    searchClearBtn.addEventListener("click", () => {
      searchInput.value = "";
      performSearch("");
      searchInput.focus();
    });
  }

  // キーボードショートカット（/ でフォーカス、Escape でクリア＆フォーカス解除）
  window.addEventListener("keydown", (e) => {
    if (
      e.key === "/" &&
      !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)
    ) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    } else if (e.key === "Escape" && document.activeElement === searchInput) {
      searchInput.value = "";
      performSearch("");
      searchInput.blur();
    }
  });

  // 0件ヒット時の「独自のサブスクとして追加」ボタン連動
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
