// share-card.js (SNSシェアカード画像生成 & X投稿連携モジュール)

/**
 * SNSシェア用テキストテンプレート
 */
export function buildShareTweetText({ profileType, totalMonthly, serviceCount }) {
  const formattedMonthly = Number(totalMonthly || 0).toLocaleString();
  return `私のサブスク固定費は月額【${formattedMonthly}円】（${serviceCount}契約）でした！\n\nAI支出診断：【${profileType || "固定費チェック完了"}】\n\nあなたの固定費もチェック👇\nhttps://subsc-checker.vercel.app/\n#SubscChecker #固定費見直し #サブスク管理`;
}

/**
 * シェアカード用HTMLコンポーネント（プレビュー ＆ シェアボタン）を生成
 */
export function createShareSectionHtml({ data, items, totalMonthly, totalYearly }) {
  const profileType = data?.profile_type || "固定費分析完了";
  const priorityAction = data?.priority_action;
  const savingStr = priorityAction?.annual_saving
    ? Number(priorityAction.annual_saving).toLocaleString()
    : null;

  const formattedMonthly = Number(totalMonthly || 0).toLocaleString();
  const formattedYearly = Number(totalYearly || (totalMonthly * 12) || 0).toLocaleString();

  // 上位4つのサブスクを抽出
  const topItems = (items || []).slice(0, 4);

  return `
    <!-- SNSシェアカード セクション -->
    <div class="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 md:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-900/60 my-6">
      <!-- 装飾バックライト -->
      <div class="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10">
        <!-- ヘッダータイトル -->
        <div class="text-center max-w-md mx-auto mb-5">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-black tracking-wide mb-2">
            <span>✨</span>
            <span>SNSシェア用カード</span>
          </div>
          <h3 class="text-base md:text-xl font-black text-white tracking-tight">
            あなたの固定費カルテを画像でシェア
          </h3>
          <p class="text-xs text-slate-400 mt-1">
            ワンタップで画像を保存したり、X（旧Twitter）にポストして固定費を共有できます
          </p>
        </div>

        <!-- プレビューカード（スマホ・PC両対応でリサイズ表示） -->
        <div class="max-w-md mx-auto mb-6">
          <div id="share-card-preview" class="w-full aspect-square rounded-2xl p-5 md:p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-white/10 shadow-2xl flex flex-col justify-between relative overflow-hidden select-none">
            <!-- カード内ヘッダー -->
            <div class="flex items-center justify-between border-b border-white/10 pb-3">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-md">
                  S
                </div>
                <span class="font-black text-sm md:text-base tracking-tight text-white">SubscChecker</span>
              </div>
              <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                固定費カルテ
              </span>
            </div>

            <!-- カード内メイン数値 & AIタイプ -->
            <div class="py-2 text-center">
              <div class="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs md:text-sm shadow-md mb-2">
                ${escapeHtml(profileType)}
              </div>
              <p class="text-[11px] text-slate-400 font-semibold tracking-wider uppercase">Monthly Total</p>
              <div class="flex items-baseline justify-center gap-1 my-1">
                <span class="text-xs font-bold text-slate-400">月額</span>
                <span class="text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent tracking-tight">
                  ¥${formattedMonthly}
                </span>
              </div>
              <p class="text-[11px] text-slate-400 font-medium">
                年間換算: <span class="text-slate-300 font-bold">約¥${formattedYearly}</span>
              </p>
            </div>

            <!-- カード内サブスク一覧（上位チップ） -->
            <div class="space-y-1.5 bg-white/5 rounded-xl p-3 border border-white/10">
              <div class="flex items-center justify-between text-[10px] text-slate-400 font-bold px-1">
                <span>契約中の主なサービス</span>
                <span>${items.length}件利用中</span>
              </div>
              <div class="flex flex-wrap gap-1.5">
                ${
                  topItems.length > 0
                    ? topItems
                        .map(
                          (item) => `
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 text-white text-[11px] font-bold border border-white/10">
                      <span class="truncate max-w-[90px]">${escapeHtml(item.name)}</span>
                      <span class="text-blue-300 text-[10px]">¥${Number(item.monthly).toLocaleString()}</span>
                    </span>
                  `
                        )
                        .join("")
                    : `<span class="text-xs text-slate-400">未登録</span>`
                }
                ${
                  items.length > 4
                    ? `<span class="inline-flex items-center px-2 py-1 rounded-lg bg-white/5 text-slate-400 text-[10px] font-bold">+他${items.length - 4}件</span>`
                    : ""
                }
              </div>
            </div>

            <!-- カード内AIアドバイス -->
            <div class="bg-gradient-to-r from-emerald-500/15 to-teal-500/10 border border-emerald-500/30 rounded-xl p-2.5 text-center">
              <p class="text-[11px] text-emerald-300 font-black truncate">
                💡 ${savingStr ? `年払い等で年間約${savingStr}円の節約余地あり！` : "固定費の最適化で年間数千円〜数万円削減！"}
              </p>
            </div>

            <!-- カード内フッター -->
            <div class="flex items-center justify-between text-[10px] text-slate-400 border-t border-white/10 pt-2.5">
              <span>subsc-checker.vercel.app</span>
              <span class="text-blue-400 font-bold">#SubscChecker</span>
            </div>
          </div>
        </div>

        <!-- アクションボタン群 -->
        <div class="max-w-md mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- ① Xでポスト ボタン -->
          <button
            id="btn-share-x"
            type="button"
            class="flex items-center justify-center gap-2 py-3.5 px-5 bg-black hover:bg-slate-900 active:scale-98 text-white font-black text-sm rounded-2xl shadow-lg border border-white/20 transition-all cursor-pointer"
          >
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span>画像でシェア（Xでポスト）</span>
          </button>

          <!-- ② 画像を保存 ボタン -->
          <button
            id="btn-download-card"
            type="button"
            class="flex items-center justify-center gap-2 py-3.5 px-5 bg-white hover:bg-slate-100 active:scale-98 text-slate-900 font-black text-sm rounded-2xl shadow-lg transition-all cursor-pointer"
          >
            <span>📥</span>
            <span>画像を保存する</span>
          </button>
        </div>

        <!-- 保存完了/共有ガイドのトースト領域 -->
        <div id="share-card-toast" class="max-w-md mx-auto mt-3 text-center text-xs font-bold text-emerald-400 hidden animate-fade-in">
          ✨ 画像を保存しました！Xの投稿画面に貼り付けてシェアしてね
        </div>
      </div>
    </div>

    <!-- 高解像度キャプチャ用 オフスクリーンDOM（600x600 固定解像度） -->
    <div
      id="share-card-capture-target"
      style="position: fixed; left: -9999px; top: 0; width: 600px; height: 600px; z-index: -100; pointer-events: none;"
    >
      <div style="width: 600px; height: 600px; padding: 36px; background: linear-gradient(135deg, #020617 0%, #0f172a 40%, #1e1b4b 100%); color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; border-radius: 0;">
        <!-- ヘッダー -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.15); padding-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 38px; height: 38px; border-radius: 12px; background: linear-gradient(135deg, #2563eb, #4f46e5); display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 20px; color: #fff;">
              S
            </div>
            <span style="font-weight: 900; font-size: 22px; letter-spacing: -0.5px; color: #fff;">SubscChecker</span>
          </div>
          <div style="padding: 6px 14px; border-radius: 9999px; background: rgba(59, 130, 246, 0.25); border: 1px solid rgba(96, 165, 250, 0.4); font-size: 13px; font-weight: 800; color: #93c5fd;">
            サブスク固定費 診断カルテ
          </div>
        </div>

        <!-- 診断タイプ & メイン金額 -->
        <div style="text-align: center; padding: 10px 0;">
          <div style="display: inline-block; padding: 8px 20px; border-radius: 9999px; background: linear-gradient(90deg, #2563eb, #6366f1); color: #ffffff; font-weight: 900; font-size: 16px; margin-bottom: 14px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
            ${escapeHtml(profileType)}
          </div>
          <div style="font-size: 13px; color: #94a3b8; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">
            Monthly Total Subscription Cost
          </div>
          <div style="display: flex; align-items: baseline; justify-content: center; gap: 4px; margin: 6px 0;">
            <span style="font-size: 18px; font-weight: 800; color: #94a3b8;">月額</span>
            <span style="font-size: 52px; font-weight: 900; letter-spacing: -1.5px; color: #ffffff; line-height: 1;">
              ¥${formattedMonthly}
            </span>
          </div>
          <div style="font-size: 14px; color: #cbd5e1; font-weight: 600;">
            年間換算: <strong style="color: #ffffff; font-weight: 800;">約 ¥${formattedYearly}</strong>
          </div>
        </div>

        <!-- 契約サブスク一覧 -->
        <div style="background: rgba(255, 255, 255, 0.07); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 16px; padding: 14px 18px;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 800; color: #94a3b8; margin-bottom: 10px;">
            <span>契約中の主なサービス</span>
            <span style="color: #cbd5e1;">${items.length}件 契約中</span>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${
              topItems.length > 0
                ? topItems
                    .map(
                      (item) => `
                <div style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.18); border-radius: 10px; font-size: 13px; font-weight: 800; color: #ffffff;">
                  <span>${escapeHtml(item.name)}</span>
                  <span style="color: #93c5fd; font-size: 12px; font-weight: 700;">¥${Number(item.monthly).toLocaleString()}</span>
                </div>
              `
                    )
                    .join("")
                : `<span style="font-size: 13px; color: #94a3b8;">未登録</span>`
            }
            ${
              items.length > 4
                ? `<div style="padding: 6px 10px; background: rgba(255, 255, 255, 0.05); border-radius: 10px; font-size: 12px; font-weight: 700; color: #94a3b8;">+他${items.length - 4}件</div>`
                : ""
            }
          </div>
        </div>

        <!-- AIワンポイント -->
        <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(52, 211, 153, 0.35); border-radius: 14px; padding: 12px 16px; text-align: center;">
          <p style="font-size: 13px; font-weight: 800; color: #6ee7b7; margin: 0;">
            💡 ${savingStr ? `年払い切り替え等で年間約${savingStr}円の節約余地あり！` : "固定費の最適化で年間数千円〜数万円削減！"}
          </p>
        </div>

        <!-- フッター -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255, 255, 255, 0.15); padding-top: 14px; font-size: 13px; color: #94a3b8;">
          <span style="font-weight: 600;">subsc-checker.vercel.app</span>
          <span style="color: #60a5fa; font-weight: 800;">#SubscChecker</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * html2canvas を用いて高解像度（Retina 2x）のカードPNG画像を生成する
 */
export async function generateShareCardBlob() {
  const captureEl = document.getElementById("share-card-capture-target");
  if (!captureEl) {
    throw new Error("キャプチャ用要素が見つかりませんでした");
  }

  if (typeof window.html2canvas !== "function") {
    throw new Error("html2canvas ライブラリが読み込まれていません");
  }

  const canvas = await window.html2canvas(captureEl, {
    scale: 2, // 1200x1200px Retina画質
    useCORS: true,
    logging: false,
    backgroundColor: null,
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("画像のBlob生成に失敗しました"));
    }, "image/png");
  });
}

/**
 * シェアボタンのイベントリスナーを登録
 */
export function initShareCardActions({ data, items, totalMonthly, totalYearly }) {
  const btnShareX = document.getElementById("btn-share-x");
  const btnDownload = document.getElementById("btn-download-card");
  const toastEl = document.getElementById("share-card-toast");

  const tweetText = buildShareTweetText({
    profileType: data?.profile_type,
    totalMonthly,
    serviceCount: items?.length || 0,
  });

  const showToast = (msg) => {
    if (toastEl) {
      toastEl.textContent = msg;
      toastEl.classList.remove("hidden");
      setTimeout(() => {
        toastEl.classList.add("hidden");
      }, 4000);
    }
  };

  // ① Xでポスト ボタン
  if (btnShareX) {
    btnShareX.addEventListener("click", async () => {
      const originalText = btnShareX.innerHTML;
      btnShareX.disabled = true;
      btnShareX.innerHTML = `<span>⏳</span><span>画像生成中...</span>`;

      try {
        const blob = await generateShareCardBlob();
        const file = new File([blob], "SubscChecker_固定費カルテ.png", { type: "image/png" });

        // Web Share API（画像ファイル付き）が利用可能な場合
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "SubscChecker 診断結果",
            text: tweetText,
            files: [file],
          });
          showToast("✨ シェア画面を開きました！");
        } else {
          // PCブラウザ等の場合：画像を自動保存しつつXの投稿画面を開く
          downloadBlob(blob, "SubscChecker_固定費カルテ.png");
          showToast("✨ 画像を保存しました！Xに画像を添付してポストしてね");

          // X（Twitter）のWeb Intentを開く
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
          window.open(twitterUrl, "_blank", "noopener,noreferrer");
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Share error:", err);
          // 失敗した場合は通常のテキスト共有のみ開く
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
          window.open(twitterUrl, "_blank", "noopener,noreferrer");
        }
      } finally {
        btnShareX.disabled = false;
        btnShareX.innerHTML = originalText;
      }
    });
  }

  // ② 画像を保存 ボタン
  if (btnDownload) {
    btnDownload.addEventListener("click", async () => {
      const originalText = btnDownload.innerHTML;
      btnDownload.disabled = true;
      btnDownload.innerHTML = `<span>⏳</span><span>保存中...</span>`;

      try {
        const blob = await generateShareCardBlob();
        downloadBlob(blob, "SubscChecker_固定費カルテ.png");
        showToast("✨ 画像（PNG）を端末に保存しました！");
      } catch (err) {
        console.error("Download error:", err);
        alert("画像の生成に失敗しました: " + err.message);
      } finally {
        btnDownload.disabled = false;
        btnDownload.innerHTML = originalText;
      }
    });
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
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
