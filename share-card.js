// share-card.js (固定費カルテ画像Canvas動的生成 & 高CVR・短文Xシェアモジュール)
import { escapeHtml } from "./utils.js";

// カテゴリ別カラー定義（Canvas円グラフおよびUI共通）
const GENRE_COLORS = {
  video: { color: "#f43f5e", label: "動画配信" },
  music: { color: "#10b981", label: "音楽配信" },
  ebook: { color: "#f59e0b", label: "電子書籍" },
  game: { color: "#6366f1", label: "ゲーム" },
  tool: { color: "#3b82f6", label: "業務ツール" },
  storage: { color: "#0ea5e9", label: "クラウド" },
  delivery: { color: "#f97316", label: "配送・EC" },
  lifestyle: { color: "#a855f7", label: "生活・習慣" },
  other: { color: "#64748b", label: "その他" },
};

/**
 * 契約サブスク一覧とAI診断結果からシェア用統計データを算出
 */
export function calculateShareStats(items = [], data = {}) {
  const totalMonthly = items.reduce((sum, i) => sum + (Number(i.monthly) || 0), 0);
  const totalYearly = items.reduce(
    (sum, i) => sum + (Number(i.yearly) || (Number(i.monthly) || 0) * 12),
    0
  );
  const serviceCount = items.length;

  // ジャンル別集計
  const genreAmounts = {};
  items.forEach((item) => {
    const cat = item.category || "other";
    const monthly = Number(item.monthly) || 0;
    genreAmounts[cat] = (genreAmounts[cat] || 0) + monthly;
  });

  // 最大ジャンルの特定
  let topGenreKey = "other";
  let topGenreAmount = 0;
  Object.entries(genreAmounts).forEach(([cat, amount]) => {
    if (amount > topGenreAmount) {
      topGenreAmount = amount;
      topGenreKey = cat;
    }
  });

  const topGenrePercent =
    totalMonthly > 0 ? Math.round((topGenreAmount / totalMonthly) * 100) : 0;
  const topGenreLabel = GENRE_COLORS[topGenreKey]?.label || "サブスク";

  // 削減余地額（優先ToDoまたはactionsの合計）
  let potentialSaving = 0;
  if (Array.isArray(data?.actions) && data.actions.length > 0) {
    potentialSaving = data.actions.reduce(
      (sum, a) => sum + (Number(a.annual_saving) || 0),
      0
    );
  } else if (data?.priority_action?.annual_saving) {
    potentialSaving = Number(data.priority_action.annual_saving) || 0;
  }

  // 診断タイプ名
  let profileType = data?.profile_type || "";
  if (!profileType) {
    if (topGenrePercent >= 50) {
      profileType = `${topGenreLabel}特化型`;
    } else if (serviceCount >= 5) {
      profileType = "サブスク多重エンジョイ型";
    } else {
      profileType = "スマート活用型";
    }
  }

  // タイプ別の一言コメント
  let typeComment = "バランス重視型";
  if (topGenreKey === "video") typeComment = "完全にインドア派。";
  else if (topGenreKey === "music") typeComment = "音楽漬けの毎日。";
  else if (topGenreKey === "game") typeComment = "ゲーマー魂全開。";
  else if (topGenreKey === "ebook") typeComment = "読書家スタイル。";
  else if (topGenreKey === "delivery") typeComment = "通販・お急ぎ便マニア。";

  return {
    totalMonthly,
    totalYearly,
    serviceCount,
    topGenreKey,
    topGenreLabel,
    topGenrePercent,
    genreAmounts,
    potentialSaving,
    profileType,
    typeComment,
    items,
  };
}

/**
 * Xポスト用テキスト生成（1〜2行 ＋ ハッシュタグ1個に最適化）
 */
export function buildShortTweetText({ mode = "normal", stats, completedAction = null }) {
  const yearlyStr = stats.totalYearly.toLocaleString();
  const savingStr = stats.potentialSaving.toLocaleString();

  if (completedAction) {
    const actSaving = completedAction.annual_saving
      ? `年間${Number(completedAction.annual_saving).toLocaleString()}円`
      : "固定費";
    return `サブスク見直して${actSaving}浮いた！\nhttps://subsc-checker.com/ #SubscChecker`;
  }

  if (mode === "hidden") {
    return `サブスクの${stats.topGenrePercent}%が${stats.topGenreLabel}だった。${stats.typeComment}\nhttps://subsc-checker.com/ #SubscChecker`;
  }

  // 通常モード（金額表示）
  if (stats.potentialSaving > 0) {
    return `サブスクに年${yearlyStr}円払ってた。${savingStr}円減らせるらしい。\nhttps://subsc-checker.com/ #SubscChecker`;
  }
  return `サブスクに年${yearlyStr}円（${stats.serviceCount}契約）払ってた。\nhttps://subsc-checker.com/ #SubscChecker`;
}

/**
 * Canvasに「固定費カルテ」画像をレンダリング（1200 × 675px, 16:9）
 */
export function drawShareCardCanvas(canvas, { mode = "normal", stats, completedAction = null }) {
  if (!canvas) return;
  const width = 1200;
  const height = 675;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 1. リッチなダークグラデーション背景
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#090d16");
  bgGrad.addColorStop(0.5, "#0f172a");
  bgGrad.addColorStop(1, "#1e1b4b");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 装飾バックライト（青と紫の光彩）
  const glow1 = ctx.createRadialGradient(200, 150, 20, 200, 150, 450);
  glow1.addColorStop(0, "rgba(37, 99, 235, 0.25)");
  glow1.addColorStop(1, "rgba(37, 99, 235, 0)");
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, width, height);

  const glow2 = ctx.createRadialGradient(1000, 500, 30, 1000, 500, 500);
  glow2.addColorStop(0, "rgba(147, 51, 234, 0.2)");
  glow2.addColorStop(1, "rgba(147, 51, 234, 0)");
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, width, height);

  // 外枠カードフレーム
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 2;
  roundRect(ctx, 30, 30, width - 60, height - 60, 28);
  ctx.stroke();

  // 2. ヘッダー描画
  // ロゴアイコン
  ctx.fillStyle = "#2563eb";
  roundRect(ctx, 60, 60, 48, 48, 14);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("S", 84, 85);

  // ロゴタイトル
  ctx.textAlign = "left";
  ctx.font = "900 28px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("SubscChecker", 122, 78);

  ctx.font = "bold 16px sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("サブスク固定費カルテ", 124, 100);

  // 右上ドメインバッジ
  ctx.textAlign = "right";
  ctx.font = "bold 18px sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText("subsc-checker.com", width - 60, 88);

  // 3. 左カラム：診断結果テキスト
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  if (completedAction) {
    // 【ToDo達成モード】
    ctx.fillStyle = "#10b981";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText("節約タスク達成", 60, 180);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 60px sans-serif";
    const actSaving = completedAction.annual_saving
      ? `年間 -¥${Number(completedAction.annual_saving).toLocaleString()}`
      : "固定費削減に成功！";
    ctx.fillText(actSaving, 60, 225);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText(`【完了】${completedAction.title || completedAction.service}`, 60, 315);

    // 達成バッジ
    ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
    ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
    roundRect(ctx, 60, 380, 520, 80, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#34d399";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText("固定費の最適化を実行しました", 90, 408);
  } else if (mode === "hidden") {
    // 【金額隠し（タイプ・比率重視）モード】
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("サブスク支出タイプ診断", 60, 180);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 52px sans-serif";
    ctx.fillText(stats.profileType, 60, 220);

    ctx.fillStyle = "#f43f5e";
    ctx.font = "900 36px sans-serif";
    ctx.fillText(`支出の ${stats.topGenrePercent}% が ${stats.topGenreLabel}`, 60, 305);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText(`${stats.typeComment}（全${stats.serviceCount}契約）`, 60, 360);

    // バッジ
    ctx.fillStyle = "rgba(56, 189, 248, 0.12)";
    ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
    roundRect(ctx, 60, 420, 520, 75, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#7dd3fc";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText(`ジャンル別割合：${stats.topGenreLabel}が第1位`, 85, 448);
  } else {
    // 【通常モード（金額表示）】
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("毎月のサブスク固定費", 60, 175);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 68px sans-serif";
    ctx.fillText(`月額 ¥${stats.totalMonthly.toLocaleString()}`, 60, 210);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText(
      `年間換算 約 ${stats.totalYearly.toLocaleString()} 円（全 ${stats.serviceCount} 契約）`,
      60,
      300
    );

    // 削減余地バッジ
    if (stats.potentialSaving > 0) {
      ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
      ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
      roundRect(ctx, 60, 360, 530, 80, 20);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#34d399";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(
        `年間最大 -¥${stats.potentialSaving.toLocaleString()} の削減余地あり`,
        85,
        388
      );
      ctx.font = "16px sans-serif";
      ctx.fillStyle = "#a7f3d0";
      ctx.fillText("※年払い化・重複契約の解消プラン試算より", 85, 418);
    }
  }

  // 4. 右カラム：ジャンル内訳ミニ円グラフ（ドーナツチャート）
  const chartCenterX = 890;
  const chartCenterY = 320;
  const outerR = 135;
  const innerR = 80;

  // ジャンル比率でスライスを描画
  let startAngle = -Math.PI / 2;
  const genreEntries = Object.entries(stats.genreAmounts).filter(([, amt]) => amt > 0);

  if (genreEntries.length > 0 && stats.totalMonthly > 0) {
    genreEntries.forEach(([cat, amt]) => {
      const sliceAngle = (amt / stats.totalMonthly) * (Math.PI * 2);
      const color = GENRE_COLORS[cat]?.color || "#64748b";

      ctx.beginPath();
      ctx.arc(chartCenterX, chartCenterY, outerR, startAngle, startAngle + sliceAngle);
      ctx.arc(chartCenterX, chartCenterY, innerR, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      startAngle += sliceAngle;
    });
  } else {
    // 0件時のプレースホルダー円
    ctx.beginPath();
    ctx.arc(chartCenterX, chartCenterY, outerR, 0, Math.PI * 2);
    ctx.arc(chartCenterX, chartCenterY, innerR, Math.PI * 2, 0, true);
    ctx.closePath();
    ctx.fillStyle = "#334155";
    ctx.fill();
  }

  // ドーナツ中央のテキスト
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 16px sans-serif";
  ctx.fillText("契約数", chartCenterX, chartCenterY - 14);

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 34px sans-serif";
  ctx.fillText(`${stats.serviceCount}件`, chartCenterX, chartCenterY + 18);

  // グラフ下部の凡例（上位3ジャンル）
  const sortedGenres = [...genreEntries].sort((a, b) => b[1] - a[1]).slice(0, 3);
  let legendY = 485;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  sortedGenres.forEach(([cat, amt]) => {
    const p = Math.round((amt / stats.totalMonthly) * 100);
    const color = GENRE_COLORS[cat]?.color || "#64748b";
    const label = GENRE_COLORS[cat]?.label || cat;

    // 丸ポチ
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(chartCenterX - 90, legendY, 7, 0, Math.PI * 2);
    ctx.fill();

    // ラベルとパーセント
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText(`${label}`, chartCenterX - 70, legendY);

    ctx.textAlign = "right";
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 18px sans-serif";
    ctx.fillText(`${p}%`, chartCenterX + 120, legendY);
    ctx.textAlign = "left";

    legendY += 30;
  });

  // 5. フッター帯
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.font = "bold 16px sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText("完全無料・登録不要で固定費を診断 | SubscChecker", 60, height - 55);

  ctx.textAlign = "right";
  ctx.font = "bold 16px sans-serif";
  ctx.fillStyle = "#38bdf8";
  ctx.fillText("#SubscChecker", width - 60, height - 55);
}

// 角丸矩形描画ヘルパー
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * シェアモーダルを開く（画像プレビュー・モード切替・ワンタップX投稿）
 */
export function openShareModal({ stats, completedAction = null }) {
  // 既存のモーダルがあれば削除
  const existing = document.getElementById("share-modal-overlay");
  if (existing) existing.remove();

  let currentMode = completedAction ? "achievement" : "normal";

  const modalHtml = `
    <div id="share-modal-overlay" class="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-fade-in">
      <div class="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl p-5 md:p-7 text-white shadow-2xl space-y-4 my-auto">
        <!-- 閉じるボタン -->
        <button
          id="btn-close-share-modal"
          type="button"
          class="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all cursor-pointer"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <!-- モーダルヘッダー -->
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm">
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-base md:text-lg font-black tracking-tight">
              ${completedAction ? "節約タスクの達成をシェア" : "固定費カルテを画像でシェア"}
            </h3>
            <p class="text-xs text-slate-400">画像付きでタイムラインでの注目度が数倍アップします</p>
          </div>
        </div>

        <!-- モード切り替えタブ（金額表示 / 金額を隠す）※達成モードでない場合のみ表示 -->
        ${
          !completedAction
            ? `
          <div class="flex bg-slate-800 p-1 rounded-xl gap-1">
            <button
              id="tab-mode-normal"
              type="button"
              class="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                currentMode === "normal"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }"
            >
              金額を表示
            </button>
            <button
              id="tab-mode-hidden"
              type="button"
              class="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                currentMode === "hidden"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }"
            >
              金額を伏せる（比率・タイプ重視）
            </button>
          </div>
        `
            : ""
        }

        <!-- Canvas 画像プレビュー -->
        <div class="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-inner">
          <canvas id="share-card-canvas" class="w-full h-auto block aspect-[16/9]"></canvas>
        </div>

        <!-- X投稿テキスト（1〜2行）プレビュー -->
        <div class="bg-slate-950/80 rounded-xl p-3 border border-slate-800 text-xs text-slate-300 font-medium whitespace-pre-line leading-relaxed select-all">
          <div class="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">投稿テキストプレビュー:</div>
          <span id="share-modal-tweet-text"></span>
        </div>

        <!-- アクションボタン群 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <!-- ① Xでポストする（メイン） -->
          <button
            id="btn-modal-share-x"
            type="button"
            class="flex items-center justify-center gap-2 py-3 px-5 bg-white hover:bg-slate-100 active:scale-98 text-slate-950 font-black text-sm rounded-xl shadow-md transition-all cursor-pointer"
          >
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span>X でポストする</span>
          </button>

          <!-- ② 画像を保存 / コピー -->
          <button
            id="btn-modal-copy-image"
            type="button"
            class="flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 active:scale-98 text-white font-bold text-xs sm:text-sm rounded-xl border border-slate-700 transition-all cursor-pointer"
          >
            <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
            </svg>
            <span id="btn-modal-copy-image-text">画像を保存・コピー</span>
          </button>
        </div>

        <!-- 案内トースト / 注意書き -->
        <p id="share-modal-hint" class="text-[11px] text-center text-slate-400">
          ※ 画像をコピーしてXの投稿作成画面に「貼り付け（Ctrl+V）」すると画像付きでポストできます
        </p>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHtml);

  const canvas = document.getElementById("share-card-canvas");
  const tweetTextEl = document.getElementById("share-modal-tweet-text");
  const btnClose = document.getElementById("btn-close-share-modal");
  const btnShareX = document.getElementById("btn-modal-share-x");
  const btnCopyImage = document.getElementById("btn-modal-copy-image");
  const btnCopyImageText = document.getElementById("btn-modal-copy-image-text");
  const hintEl = document.getElementById("share-modal-hint");
  const tabNormal = document.getElementById("tab-mode-normal");
  const tabHidden = document.getElementById("tab-mode-hidden");

  // レンダリング更新関数
  const updateModalView = (mode) => {
    currentMode = mode;
    drawShareCardCanvas(canvas, { mode, stats, completedAction });
    const text = buildShortTweetText({ mode, stats, completedAction });
    if (tweetTextEl) tweetTextEl.textContent = text;

    if (tabNormal && tabHidden) {
      if (mode === "normal") {
        tabNormal.className =
          "flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all bg-blue-600 text-white shadow-xs";
        tabHidden.className =
          "flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all text-slate-400 hover:text-white";
      } else {
        tabNormal.className =
          "flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all text-slate-400 hover:text-white";
        tabHidden.className =
          "flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all bg-blue-600 text-white shadow-xs";
      }
    }
  };

  updateModalView(currentMode);

  // モード切り替え
  if (tabNormal) {
    tabNormal.addEventListener("click", () => updateModalView("normal"));
  }
  if (tabHidden) {
    tabHidden.addEventListener("click", () => updateModalView("hidden"));
  }

  // 閉じる
  const closeModal = () => {
    const overlay = document.getElementById("share-modal-overlay");
    if (overlay) overlay.remove();
  };
  if (btnClose) btnClose.addEventListener("click", closeModal);
  const overlay = document.getElementById("share-modal-overlay");
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });
  }

  // Xでポストする
  if (btnShareX) {
    btnShareX.addEventListener("click", () => {
      const text = buildShortTweetText({ mode: currentMode, stats, completedAction });
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(twitterUrl, "_blank", "noopener,noreferrer");
    });
  }

  // 画像をコピー または 保存（Web Share API / Clipboard / Download）
  if (btnCopyImage) {
    btnCopyImage.addEventListener("click", async () => {
      if (!canvas) return;

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        // モバイルの Web Share API（画像添付共有）に対応している場合
        if (navigator.share && navigator.canShare) {
          const file = new File([blob], "subsc-carte.png", { type: "image/png" });
          const text = buildShortTweetText({ mode: currentMode, stats, completedAction });
          if (navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                text: text,
              });
              return;
            } catch (err) {
              if (err.name !== "AbortError") {
                console.warn("navigator.share failed, fallback to clipboard:", err);
              }
            }
          }
        }

        // クリップボードに画像をコピー
        try {
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob }),
            ]);
            if (btnCopyImageText) btnCopyImageText.textContent = "画像コピー完了！";
            if (hintEl) {
              hintEl.textContent = "クリップボードにコピーしました！Xの投稿欄で貼り付け（Ctrl+V）してください";
              hintEl.classList.add("text-emerald-400");
            }
            setTimeout(() => {
              if (btnCopyImageText) btnCopyImageText.textContent = "画像を保存・コピー";
            }, 3000);
            return;
          }
        } catch (clipErr) {
          console.warn("Clipboard copy failed, fallback to download:", clipErr);
        }

        // フォールバック：画像ダウンロード
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "subsc-checker-carte.png";
        a.click();
        URL.revokeObjectURL(url);
        if (btnCopyImageText) btnCopyImageText.textContent = "画像を保存しました！";
        setTimeout(() => {
          if (btnCopyImageText) btnCopyImageText.textContent = "画像を保存・コピー";
        }, 3000);
      }, "image/png");
    });
  }
}

/**
 * 画面最下部のシェアセクションHTMLを生成（洗練されたカルテ画像プレビュー付き）
 */
export function createShareSectionHtml({ data, items }) {
  const stats = calculateShareStats(items, data);

  return `
    <div class="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 md:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-900/60 my-6">
      <div class="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 max-w-xl mx-auto text-center space-y-4">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-black tracking-wide">
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          <span>固定費カルテ</span>
        </div>

        <h3 class="text-lg md:text-2xl font-black text-white tracking-tight">
          診断結果を画像付きでシェア
        </h3>

        <p class="text-xs md:text-sm text-slate-400 leading-relaxed font-medium">
          円グラフと削減余地が入った「固定費カルテ画像」を生成できます。金額を伏せたタイプ診断モードも選べます。
        </p>

        <!-- アクションボタン -->
        <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            id="btn-bottom-open-share"
            type="button"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 py-3.5 px-8 bg-white hover:bg-slate-100 active:scale-98 text-slate-950 font-black text-sm rounded-2xl shadow-lg transition-all cursor-pointer"
          >
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span>カルテ画像を開いてシェアする</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * シェア機能の初期化（最下部シェアボタンのクリックイベントバインド）
 */
export function initShareCardActions({ data, items }) {
  const stats = calculateShareStats(items, data);

  const btnBottomOpen = document.getElementById("btn-bottom-open-share");
  if (btnBottomOpen) {
    btnBottomOpen.addEventListener("click", () => {
      openShareModal({ stats });
    });
  }
}
