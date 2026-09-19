// cancel-support-tab.js (解約サポート & お得な代替案タブの描画モジュール)
import { findCancelInfo, getMatchedPromoCards } from "./cancel-promo-data.js";
import { escapeHtml } from "./utils.js";
import { renderBrandIcon } from "./brand-icons.js";

/**
 * タブ3（解約・乗り換え）のレンダリング
 */
export function renderActionsTab(items = []) {
  const actionsContainer = document.getElementById("actions-container");
  if (!actionsContainer) return;

  let cancelHtml = "";
  if (items && items.length > 0) {
    const cancelCards = items
      .map((item) => {
        const info = findCancelInfo(item.name);
        const monthlyStr = item.monthly ? `¥${Number(item.monthly).toLocaleString()}/月` : "";
        return `
          <div class="flex flex-col justify-between p-4 sm:p-5 rounded-2xl border border-slate-300/90 border-l-4 border-l-blue-500/80 bg-white hover:border-l-blue-600 hover:border-blue-400 hover:shadow-md transition-all shadow-xs group">
            <div>
              <!-- ヘッダー: アイコン + サービス名 + 金額 -->
              <div class="flex items-start gap-3 mb-3 pb-2.5 border-b border-slate-100">
                ${renderBrandIcon(item.name, item.category, "w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-xl shadow-2xs", "text-sm sm:text-base")}
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-1">
                    <h4 class="font-extrabold text-sm sm:text-base text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      ${escapeHtml(item.name)}
                    </h4>
                    ${monthlyStr ? `<span class="text-xs sm:text-sm font-black text-slate-700 tabular-nums shrink-0 ml-1">${monthlyStr}</span>` : ""}
                  </div>
                  <span class="text-[11px] font-bold text-slate-400">
                    ${item.category ? escapeHtml(item.category) : "サブスク"}
                  </span>
                </div>
              </div>

              <!-- 解約ステップ案内（視認性を高めたタグスタイル） -->
              <div class="bg-slate-50/90 rounded-xl p-3 mb-3.5 border border-slate-200/80">
                <div class="text-[11px] font-medium text-slate-700 leading-relaxed flex items-start gap-2">
                  <svg class="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span class="break-words">${escapeHtml(info.guide)}</span>
                </div>
              </div>
            </div>

            <!-- 公式アクションボタン（全カード統一レイアウト） -->
            <a
              href="${escapeHtml(info.url)}"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-3 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-blue-600 hover:text-white rounded-xl border border-slate-200/90 shadow-2xs transition-all text-center group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:shadow-xs active:scale-98"
            >
              <span>${info.isDirect ? "公式アカウントで解約・管理" : "公式の解約手順を検索"}</span>
              <svg class="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
            </a>
          </div>
        `;
      })
      .join("");

    cancelHtml = `
      <div class="bg-white rounded-3xl p-5 md:p-6 border border-slate-200 shadow-sm space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <h3 class="text-base md:text-lg font-black text-slate-800 tracking-tight">
              見直し・公式解約サポート
            </h3>
            <span class="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200">公式リンク</span>
          </div>
          <span class="text-[11px] text-slate-400 font-medium">※各サービスの公式管理ページへ安全に遷移します</span>
        </div>
        <p class="text-xs text-slate-500 font-medium leading-relaxed">
          見直しや解約を検討したいサービスは、以下の各社公式ページから直接手続きを行えます。
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 pt-1">
          ${cancelCards}
        </div>
        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <span class="text-xs text-slate-500">損をしない解約タイミングや日割り・返金ルールを解説</span>
          <a href="/cancel/" class="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1">
            主要サブスクの解約トラブル対策まとめ（日割り・更新日ルール） →
          </a>
        </div>
      </div>
    `;
  }

  const matchedCards = getMatchedPromoCards(items);

  let promoHtml = "";
  if (matchedCards.length > 0) {
    const promoCardsHtml = matchedCards
      .map((card) => {
        return `
          <div class="flex flex-col justify-between p-4 sm:p-5 rounded-2xl border ${card.theme.border} bg-white shadow-2xs hover:shadow-xs transition-all">
            <div>
              <!-- バッジ & PR表記 -->
              <div class="flex items-center justify-between gap-2 mb-2">
                <span class="text-[10px] font-extrabold px-2 py-0.5 rounded ${card.theme.badgeBg}">
                  ${escapeHtml(card.badge)}
                </span>
                <span class="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200">PR</span>
              </div>

              <!-- 文脈連動の理由メッセージ -->
              ${
                card.contextReason
                  ? `
                <div class="text-[11px] font-bold text-slate-700 bg-slate-50 rounded-xl p-2.5 mb-3 border border-slate-200/80 leading-snug">
                  <span class="text-blue-600 font-extrabold mr-1">提案理由:</span>${escapeHtml(card.contextReason)}
                </div>
              `
                  : ""
              }

              <!-- タイトル & サブタイトル -->
              <h4 class="text-base font-black text-slate-900 tracking-tight mb-0.5">
                ${escapeHtml(card.title)}
              </h4>
              <p class="text-xs font-bold text-slate-500 mb-2.5">
                ${escapeHtml(card.subTitle || "")}
              </p>

              <!-- 2行のチェックポイント（箇条書き） -->
              <ul class="space-y-1.5 mb-3 text-xs font-medium text-slate-600">
                ${(card.points || [])
                  .map(
                    (pt) => `
                  <li class="flex items-start gap-1.5">
                    <svg class="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span class="leading-tight">${escapeHtml(pt)}</span>
                  </li>
                `
                  )
                  .join("")}
              </ul>

              <!-- デメリット・注意点の明記（信頼装置） -->
              ${
                card.demerit
                  ? `
                <div class="bg-amber-50/70 border border-amber-200/60 rounded-xl p-2.5 mb-4 text-[11px] text-amber-900 flex items-start gap-1.5 font-medium leading-relaxed">
                  <svg class="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                  <span>${escapeHtml(card.demerit)}</span>
                </div>
              `
                  : ""
              }
            </div>

            <!-- CTAボタン & マイクロコピー -->
            <div>
              <a
                href="${escapeHtml(card.url)}"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 text-xs sm:text-sm font-black rounded-xl shadow-xs ${card.theme.buttonBg} active:scale-95 transition-all text-center cursor-pointer group"
              >
                <span>${escapeHtml(card.buttonText)}</span>
                <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </a>
              <p class="text-[10px] text-center text-slate-400 mt-1.5 font-medium">
                ${escapeHtml(card.microCopy || "")}
              </p>
            </div>
          </div>
        `;
      })
      .join("");

    promoHtml = `
      <div class="bg-slate-50/80 rounded-3xl p-5 md:p-6 border border-slate-200 shadow-2xs space-y-4">
        <!-- 広告ヘッダー：ステマ規制完全準拠の明瞭表記 -->
        <div class="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200/80 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-[11px] font-black px-2 py-0.5 rounded bg-slate-200 text-slate-700">広告（PR）</span>
            <h3 class="text-sm sm:text-base font-black text-slate-800 tracking-tight">
              あなたの契約に合う可能性のある選択肢
            </h3>
          </div>
          <span class="text-[10px] text-slate-400 font-medium">※条件に合致する提案のみ表示</span>
        </div>

        <div class="grid grid-cols-1 ${matchedCards.length > 1 ? "md:grid-cols-2" : ""} gap-4 pt-1">
          ${promoCardsHtml}
        </div>
      </div>
    `;
  }

  actionsContainer.innerHTML = `
    <div class="space-y-6">
      ${cancelHtml}
      ${promoHtml}
    </div>
  `;
}

