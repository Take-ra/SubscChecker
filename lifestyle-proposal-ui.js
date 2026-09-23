// lifestyle-proposal-ui.js
// ライフスタイル提案・新体験紹介（Audible等）の独立セクション描画モジュール
// ※節約提案とは明確に分離し、追加提案（新しい使い方の紹介）として中立的なトーンで表示します。

import { getAffiliateUrl } from "./affiliate-config.js";
import { escapeHtml } from "./utils.js";

/**
 * ライフスタイル提案（Audible）の表示可否をルールベースで判定
 * @param {Array} items ユーザーが選択したサブスク一覧
 * @returns {object|null}
 */
export function checkAudibleEligibility(items = []) {
  if (!items || items.length === 0) return null;

  // 1. Audibleを既に契約している場合は非表示
  const hasAudible = items.some(
    (i) => i.id === "audible" || /audible|オーディブル/i.test(i.name || "")
  );
  if (hasAudible) return null;

  // 2. 電子書籍・読書関連のサービスを1件以上契約しているか判定
  const ebookItems = items.filter((i) => {
    const catId = (i.categoryId || "").toLowerCase();
    const cat = (i.category || "").toLowerCase();
    const name = (i.name || "").toLowerCase();
    return (
      catId === "ebook" ||
      cat.includes("書籍") ||
      cat.includes("マンガ") ||
      /kindle|マガジン|ピッコマ|lineマンガ|コミック|kobo|ブック/i.test(name)
    );
  });

  if (ebookItems.length === 0) return null;

  // 契約中の電子書籍サービス名を抽出
  const ebookNames = ebookItems.map((i) => i.name).slice(0, 2).join("・");
  const etc = ebookItems.length > 2 ? "など" : "";

  return {
    matched: true,
    ebookNames: `${ebookNames}${etc}`,
  };
}

/**
 * ライフスタイル提案セクションのレンダリング
 * @param {Array} items ユーザーが選択したサブスク一覧
 */
export function renderLifestyleProposal(items = []) {
  const container = document.getElementById("res-lifestyle-proposal-container");
  if (!container) return;

  const match = checkAudibleEligibility(items);
  if (!match) {
    container.innerHTML = "";
    return;
  }

  const destinationUrl = getAffiliateUrl("audible");

  // ※節約を連想させる緑系（emerald/green）は排除し、知的なインディゴ/スレート系の中立トーンで構成
  container.innerHTML = `
    <div class="mt-4 mb-2 bg-indigo-50/50 rounded-3xl p-5 md:p-6 border border-indigo-200/80 shadow-2xs space-y-4">
      <!-- セクションヘッダー：中立的な見出し ＋ PR明示 -->
      <div class="flex items-center justify-between flex-wrap gap-2 border-b border-indigo-200/70 pb-3">
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-black px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 border border-indigo-300/80 tracking-wider">
            PR
          </span>
          <h3 class="text-xs sm:text-sm font-black text-slate-800 tracking-tight">
            こんな使い方もあります
          </h3>
        </div>
        <span class="text-[10px] text-slate-500 font-medium">
          ※新しい読書体験・ライフスタイルのご提案
        </span>
      </div>

      <!-- 提案カード本体（カード自体はクリック不可） -->
      <div class="flex flex-col justify-between p-4 sm:p-5 rounded-2xl border border-indigo-200/80 bg-white shadow-2xs">
        <div>
          <!-- 上部バッジ & タイトル -->
          <div class="flex items-center justify-between gap-2 mb-2.5">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
              音声読書（オーディオブック）
            </span>
            <span class="text-[11px] font-black text-slate-700">
              月額 ¥1,500
            </span>
          </div>

          <h4 class="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            <span>Audible（オーディブル）</span>
          </h4>
          <p class="text-xs font-medium text-slate-500 mt-0.5 mb-3">
            プロのナレーターや声優が朗読する、本を「聴く」サービス
          </p>

          <!-- 契約データに基づく文脈提案 -->
          <div class="text-xs text-slate-700 bg-slate-50 rounded-xl p-3 mb-3.5 border border-slate-200/90 leading-relaxed">
            <div class="text-[10px] font-bold text-indigo-700 mb-1 flex items-center gap-1">
              <svg class="w-3.5 h-3.5 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
              <span>現在のご利用状況に合わせたご案内</span>
            </div>
            <p class="font-medium text-slate-700 break-words">
              現在 <span class="font-bold text-slate-900">${escapeHtml(match.ebookNames)}</span> をご利用中の方へ。通勤中・運動中・家事の最中など、画面を見られない「スキマ時間」を有効活用できる読書スタイルとして注目されています。
            </p>
          </div>

          <!-- 主な特長 -->
          <ul class="space-y-1.5 mb-3 text-xs font-medium text-slate-600">
            <li class="flex items-start gap-1.5">
              <svg class="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
              </svg>
              <span class="leading-tight">20万冊以上の対象作品（ビジネス書・小説・洋書など）が聴き放題</span>
            </li>
            <li class="flex items-start gap-1.5">
              <svg class="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
              </svg>
              <span class="leading-tight">オフライン再生対応・再生速度の調整（0.5倍速〜3.5倍速）も自在</span>
            </li>
          </ul>

          <!-- 【最重要】節約提案ではなく追加提案であることの明示 -->
          <div class="bg-indigo-50/70 border border-indigo-200/90 rounded-xl p-3 mb-4 text-xs text-indigo-950 flex items-start gap-2 leading-relaxed">
            <svg class="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <span class="font-bold text-indigo-900 block mb-0.5 text-[11px]">ご確認ください</span>
              <span class="font-normal text-indigo-900 text-[11px] leading-relaxed block">
                これは固定費の節約・削減提案ではなく、新しいライフスタイル・使い方の紹介です（月額¥1,500が発生します）。ご自身の生活リズムに合うか、まずは30日間の無料体験で試すことができます。
              </span>
            </div>
          </div>
        </div>

        <!-- CTAボタン（ボタンのみクリック可能） -->
        <div>
          <a
            href="${escapeHtml(destinationUrl)}"
            target="_blank"
            rel="noopener noreferrer"
            onclick="window.trackAffiliateClick && window.trackAffiliateClick('audible_card', 'Audible', '${escapeHtml(destinationUrl)}');"
            class="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-2xs transition-all text-center cursor-pointer group"
          >
            <span>詳しく見る（30日間無料体験）</span>
            <svg class="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
          </a>
          <p class="text-[10px] text-center text-slate-400 mt-1.5 font-medium">
            ※無料体験期間中に解約した場合、料金は一切発生しません
          </p>
        </div>
      </div>
    </div>
  `;
}

