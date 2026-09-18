// share-card.js (ワンタップXシェア & ツイート文コピー特化型モジュール)

/**
 * SNSシェア用テキストテンプレート
 */
export function buildShareTweetText({ profileType, totalMonthly, serviceCount, priorityAction }) {
  const formattedMonthly = Number(totalMonthly || 0).toLocaleString();
  const savingStr = priorityAction?.annual_saving
    ? `（年間約${Number(priorityAction.annual_saving).toLocaleString()}円の節約余地あり）`
    : "";
  const actionTitle = priorityAction?.title
    ? `\n💡 改善プラン：${priorityAction.title}${savingStr}`
    : "";

  return `私のサブスク固定費は月額【${formattedMonthly}円】（${serviceCount}契約）でした！

AI診断タイプ：【${profileType || "固定費チェック完了"}】${actionTitle}

あなたの固定費もチェック👇
https://subsc-checker.vercel.app/
#SubscChecker #固定費見直し #サブスク管理 #節約`;
}

/**
 * シェア用HTMLコンポーネント（プレビュー ＆ ワンタップXシェアボタン）を生成
 */
export function createShareSectionHtml({ data, items, totalMonthly, totalYearly }) {
  const profileType = data?.profile_type || "固定費分析完了";
  const priorityAction = data?.priority_action;
  const serviceCount = items?.length || 0;

  const tweetText = buildShareTweetText({
    profileType,
    totalMonthly,
    serviceCount,
    priorityAction,
  });

  return `
    <!-- SNSシェア セクション -->
    <div class="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 md:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-900/60 my-6">
      <!-- 装飾バックライト -->
      <div class="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 max-w-xl mx-auto">
        <!-- ヘッダータイトル -->
        <div class="text-center mb-6">
          <div class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-black tracking-wide mb-2.5">
            <span>✨</span>
            <span>診断結果をシェア</span>
          </div>
          <h3 class="text-lg md:text-2xl font-black text-white tracking-tight">
            あなたの固定費カルテを 𝕏 でポスト
          </h3>
          <p class="text-xs md:text-sm text-slate-400 mt-1.5 font-medium">
            ワンタップで診断結果入りの投稿画面が立ち上がります。フォロワーと固定費を比べ合おう！
          </p>
        </div>

        <!-- ツイート文面プレビュー（投稿吹き出し風） -->
        <div class="bg-slate-950/80 rounded-2xl p-4 md:p-5 border border-white/15 shadow-inner mb-6 space-y-3">
          <div class="flex items-center gap-2.5 border-b border-white/10 pb-3">
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-black text-xs shadow-sm">
              S
            </div>
            <div>
              <p class="text-xs font-black text-white leading-tight">SubscChecker 診断カルテ</p>
              <p class="text-[10px] text-slate-400">@SubscChecker</p>
            </div>
            <span class="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
              投稿プレビュー
            </span>
          </div>

          <!-- 投稿テキストプレビュー -->
          <div class="text-xs md:text-sm text-slate-200 whitespace-pre-line leading-relaxed font-medium pl-1 select-all">
            ${escapeHtml(tweetText)}
          </div>

          <!-- OGPカード風プレビュー -->
          <div class="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300 text-lg shrink-0">
              📊
            </div>
            <div class="min-w-0">
              <p class="text-xs font-bold text-white truncate">SubscChecker | サブスク固定費の見える化・AI診断</p>
              <p class="text-[10px] text-slate-400 truncate">subsc-checker.vercel.app</p>
            </div>
          </div>
        </div>

        <!-- アクションボタン群 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- ① Xでポストする メインボタン -->
          <button
            id="btn-share-x"
            type="button"
            class="flex items-center justify-center gap-2.5 py-3.5 px-6 bg-white hover:bg-slate-100 active:scale-98 text-slate-950 font-black text-sm rounded-2xl shadow-lg transition-all cursor-pointer"
          >
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span>𝕏 でポストする</span>
          </button>

          <!-- ② ツイート文をコピー ボタン -->
          <button
            id="btn-copy-tweet"
            type="button"
            class="flex items-center justify-center gap-2 py-3.5 px-5 bg-white/10 hover:bg-white/20 active:scale-98 text-white font-bold text-sm rounded-2xl border border-white/15 transition-all cursor-pointer"
          >
            <span id="copy-icon">📋</span>
            <span id="copy-label">ツイート文をコピー</span>
          </button>
        </div>

        <!-- トースト案内 -->
        <div id="share-card-toast" class="mt-3 text-center text-xs font-bold text-emerald-400 hidden animate-fade-in">
          ✨ クリップボードにコピーしました！
        </div>
      </div>
    </div>
  `;
}

/**
 * シェアボタンのイベントリスナーを登録
 */
export function initShareCardActions({ data, items, totalMonthly, totalYearly }) {
  const btnShareX = document.getElementById("btn-share-x");
  const btnCopyTweet = document.getElementById("btn-copy-tweet");
  const copyIcon = document.getElementById("copy-icon");
  const copyLabel = document.getElementById("copy-label");
  const toastEl = document.getElementById("share-card-toast");

  const tweetText = buildShareTweetText({
    profileType: data?.profile_type,
    totalMonthly,
    serviceCount: items?.length || 0,
    priorityAction: data?.priority_action,
  });

  const showToast = (msg) => {
    if (toastEl) {
      toastEl.textContent = msg;
      toastEl.classList.remove("hidden");
      setTimeout(() => {
        toastEl.classList.add("hidden");
      }, 3500);
    }
  };

  // ① 𝕏 でポストする ボタン
  if (btnShareX) {
    btnShareX.addEventListener("click", () => {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
      window.open(twitterUrl, "_blank", "noopener,noreferrer");
    });
  }

  // ② ツイート文をコピー ボタン
  if (btnCopyTweet) {
    btnCopyTweet.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(tweetText);
        if (copyIcon && copyLabel) {
          copyIcon.textContent = "✅";
          copyLabel.textContent = "コピー完了！";
          setTimeout(() => {
            copyIcon.textContent = "📋";
            copyLabel.textContent = "ツイート文をコピー";
          }, 2500);
        }
        showToast("✨ ツイート文をコピーしました！Xに貼り付けてポストできます");
      } catch (err) {
        console.error("Clipboard copy error:", err);
        // フォールバック: prompt
        window.prompt("以下のテキストをコピーしてください:", tweetText);
      }
    });
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
