// share-card.js (サブスク利用タイプ診断画像Canvas動的生成 & 高拡散・自然な日本語Xシェアモジュール)
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

// MBTIライクな全10タイプ診断マスターデータ
export const SUBSCRIPTION_TYPES = {
  oshi: {
    id: "oshi",
    name: "推し活全振り型",
    tagline: "推しの供給のためなら月額など誤差",
    traits: "全コンテンツをリアタイ追走中。推しの限定配信・ライブ・サントラのためなら固定費を惜しまない情熱派。",
    advice: "重複した配信プランを見直せば、浮いた固定費を次のグッズや遠征費に回せます。",
    accentColor: "#ec4899",
  },
  cinema: {
    id: "cinema",
    name: "インドア映画館型",
    tagline: "休日はベッドから出ずに映画マラソン",
    traits: "気づけば複数VODに加入中。見たい作品を探して配信サイトを回遊するのが週末の至福のルーティン。",
    advice: "休眠中のVODを一時休会するか、年間プランに切り替えるだけで年間数千円浮きます。",
    accentColor: "#f43f5e",
  },
  bgm: {
    id: "bgm",
    name: "日常BGM浸り型",
    tagline: "イヤホンを忘れたら1日テンション半減",
    traits: "生活のあらゆる瞬間にサントラが必要。散歩・作業・入浴まで気分に合わせたプレイリストを常備。",
    advice: "音楽系サブスクが重複していないか確認し、ファミリープランや年払いの活用がおすすめです。",
    accentColor: "#10b981",
  },
  digital_worker: {
    id: "digital_worker",
    name: "デジタル仕事人型",
    tagline: "自己投資と効率化には糸目をつけない",
    traits: "最新AI・クラウド・プロツールを駆使。時間を買って生産性を最大化するスマート実践派。",
    advice: "個人プランから年払い一括への移行や、使わなくなったツールの解約で固定費をスリムに保てます。",
    accentColor: "#3b82f6",
  },
  minimalist: {
    id: "minimalist",
    name: "固定費ミニマリスト型",
    tagline: "本当に毎日使う神サービスだけを厳選",
    traits: "無駄な固定費を嫌う鉄の意志の持ち主。契約数1〜2件で完璧に使い倒す、家計管理の超優等生。",
    advice: "すでに極めて健全な状態です。この素晴らしいスマート習慣をキープしましょう。",
    accentColor: "#059669",
  },
  smart_rationalist: {
    id: "smart_rationalist",
    name: "スマート合理主義型",
    tagline: "必要十分を心得たサブスクの達人",
    traits: "生活に必要なサブスクをバランスよく契約し、無駄がほぼない。コスパを冷静に見極めて賢く利用中。",
    advice: "年に1度の棚卸しで契約状況をチェックするだけで、無駄ゼロをずっと維持できます。",
    accentColor: "#0ea5e9",
  },
  buffet: {
    id: "buffet",
    name: "サブスクビュッフェ型",
    tagline: "デジタル世界の便利さを全方位で満喫",
    traits: "気になったサービスは即お試し。エンタメから便利ツールまで幅広く契約し、日々の生活をアップデート。",
    advice: "「最近使っていないかも？」と感じるサービスを1つ棚卸しするだけで、大きな節約効果が生まれます。",
    accentColor: "#8b5cf6",
  },
  express_delivery: {
    id: "express_delivery",
    name: "お急ぎ便マスター型",
    tagline: "日用品も買い物もすべて自宅に即日完結",
    traits: "通販・配送・生活支援サブスクをフル活用。買い物に行く時間を節約して快適な生活リズムを構築中。",
    advice: "年間プランへの集約や、同種サービスの特典被りを整理するのが節約の近道です。",
    accentColor: "#f97316",
  },
  intellectual: {
    id: "intellectual",
    name: "知的好奇心探求型",
    tagline: "本と学びのインプットが止まらない読書家",
    traits: "電子書籍や学習系サービスを愛用。気になった知識は即ライブラリに保存し、日々のインプットに余念がない。",
    advice: "定期的に読み放題対象と購入のコストを比較すると、さらにコスパが向上します。",
    accentColor: "#d97706",
  },
  lost: {
    id: "lost",
    name: "サブスク迷子型",
    tagline: "昔登録したあのサービス、今月開いたっけ…？",
    traits: "無料体験からそのまま継続していたり、似たジャンルが被っていたり。気づけば毎月引き落とされるおっとりさん。",
    advice: "ワンタップで解約やプラン変更をすれば、年間で数万円浮くポテンシャルを秘めています。",
    accentColor: "#e11d48",
  },
};

/**
 * 契約一覧と診断結果からユーザーのサブスクタイプを決定論的に判定
 */
export function determineSubscriptionType(items = [], data = {}) {
  const serviceCount = items.length;
  const totalMonthly = items.reduce((sum, i) => sum + (Number(i.monthly) || 0), 0);

  // ジャンル別集計
  const genreAmounts = {};
  items.forEach((item) => {
    const cat = item.category || "other";
    const monthly = Number(item.monthly) || 0;
    genreAmounts[cat] = (genreAmounts[cat] || 0) + monthly;
  });

  // 削減ポテンシャル
  let potentialSaving = 0;
  if (Array.isArray(data?.actions) && data.actions.length > 0) {
    potentialSaving = data.actions.reduce(
      (sum, a) => sum + (Number(a.annual_saving) || 0),
      0
    );
  } else if (data?.priority_action?.annual_saving) {
    potentialSaving = Number(data.priority_action.annual_saving) || 0;
  }

  const videoAmt = genreAmounts.video || 0;
  const musicAmt = genreAmounts.music || 0;
  const toolAmt = (genreAmounts.tool || 0) + (genreAmounts.storage || 0);
  const deliveryAmt = genreAmounts.delivery || 0;
  const ebookAmt = genreAmounts.ebook || 0;

  const videoPct = totalMonthly > 0 ? Math.round((videoAmt / totalMonthly) * 100) : 0;
  const musicPct = totalMonthly > 0 ? Math.round((musicAmt / totalMonthly) * 100) : 0;
  const entertainmentPct = videoPct + musicPct;
  const toolPct = totalMonthly > 0 ? Math.round((toolAmt / totalMonthly) * 100) : 0;

  // 1. 契約数が極小かつ低支出 → ミニマリスト
  if (serviceCount <= 2 && totalMonthly <= 2500) {
    return SUBSCRIPTION_TYPES.minimalist;
  }

  // 2. 年間12,000円以上の大幅な削減余地がある → 迷子型
  if (potentialSaving >= 12000) {
    return SUBSCRIPTION_TYPES.lost;
  }

  // 3. 動画＋音楽のエンタメが60%以上かつ3件以上 → 推し活全振り型
  if (entertainmentPct >= 60 && serviceCount >= 3) {
    return SUBSCRIPTION_TYPES.oshi;
  }

  // 4. 動画が過半数 → インドア映画館型
  if (videoPct >= 45) {
    return SUBSCRIPTION_TYPES.cinema;
  }

  // 5. 音楽が過半数 → 日常BGM浸り型
  if (musicPct >= 40) {
    return SUBSCRIPTION_TYPES.bgm;
  }

  // 6. ツール・クラウドが40%以上 → デジタル仕事人型
  if (toolPct >= 40) {
    return SUBSCRIPTION_TYPES.digital_worker;
  }

  // 7. 配送・ECが最大支出 → お急ぎ便マスター型
  if (deliveryAmt > 0 && deliveryAmt >= videoAmt && deliveryAmt >= musicAmt) {
    return SUBSCRIPTION_TYPES.express_delivery;
  }

  // 8. 電子書籍が主 → 知的好奇心探求型
  if (ebookAmt > 0 && ebookAmt >= videoAmt && ebookAmt >= musicAmt) {
    return SUBSCRIPTION_TYPES.intellectual;
  }

  // 9. 5件以上で多様なジャンル → ビュッフェ型
  if (serviceCount >= 5) {
    return SUBSCRIPTION_TYPES.buffet;
  }

  // 10. その他 → スマート合理主義型
  return SUBSCRIPTION_TYPES.smart_rationalist;
}

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

  // 削減余地額（優先アクションの合計）
  let potentialSaving = 0;
  if (Array.isArray(data?.actions) && data.actions.length > 0) {
    potentialSaving = data.actions.reduce(
      (sum, a) => sum + (Number(a.annual_saving) || 0),
      0
    );
  } else if (data?.priority_action?.annual_saving) {
    potentialSaving = Number(data.priority_action.annual_saving) || 0;
  }

  // タイプ診断
  const subscType = determineSubscriptionType(items, data);

  return {
    totalMonthly,
    totalYearly,
    serviceCount,
    topGenreKey,
    topGenreLabel,
    topGenrePercent,
    genreAmounts,
    potentialSaving,
    subscType,
    profileType: subscType.name,
    typeComment: subscType.tagline,
    items,
  };
}

/**
 * Xポスト用テキスト生成（思わずシェアしたくなる自然な日本語文章）
 */
export function buildShortTweetText({ mode = "type", stats, completedAction = null }) {
  const yearlyStr = stats.totalYearly.toLocaleString();
  const savingStr = stats.potentialSaving.toLocaleString();

  // 1. タスク達成時
  if (completedAction) {
    const actSaving = completedAction.annual_saving
      ? `年間${Number(completedAction.annual_saving).toLocaleString()}円`
      : "固定費";
    return `サブスクを見直して${actSaving}浮いた！\nhttps://subsc-checker.com/ #SubscChecker`;
  }

  // 2. タイプ診断モード（デフォルト：金額非表示で拡散されやすい）
  if (mode === "type" || mode === "hidden") {
    const type = stats.subscType || SUBSCRIPTION_TYPES.smart_rationalist;
    return `【サブスク利用タイプ診断】\n私のタイプは「${type.name}」でした！\n「${type.tagline}」\n\nhttps://subsc-checker.com/ #SubscChecker #サブスクタイプ診断`;
  }

  // 3. 支出レポートモード（金額表示）
  if (stats.potentialSaving > 0) {
    return `サブスクに年${yearlyStr}円払ってた。年間約${savingStr}円節約できるみたい！\nhttps://subsc-checker.com/ #SubscChecker`;
  }
  return `サブスクに年間${yearlyStr}円（全${stats.serviceCount}契約）利用中。あなたの固定費は？\nhttps://subsc-checker.com/ #SubscChecker`;
}

/**
 * Canvasに診断結果画像をレンダリング（1200 × 675px, 16:9）
 */
export function drawShareCardCanvas(canvas, { mode = "type", stats, completedAction = null }) {
  if (!canvas) return;
  const width = 1200;
  const height = 675;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 1. 洗練されたダークグラデーション背景
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#090d16");
  bgGrad.addColorStop(0.5, "#0f172a");
  bgGrad.addColorStop(1, "#1e1b4b");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 装飾バックライト（青とパープルの光彩）
  const glow1 = ctx.createRadialGradient(200, 150, 20, 200, 150, 450);
  glow1.addColorStop(0, "rgba(37, 99, 235, 0.22)");
  glow1.addColorStop(1, "rgba(37, 99, 235, 0)");
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, width, height);

  const glow2 = ctx.createRadialGradient(1000, 500, 30, 1000, 500, 500);
  glow2.addColorStop(0, "rgba(147, 51, 234, 0.18)");
  glow2.addColorStop(1, "rgba(147, 51, 234, 0)");
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, width, height);

  // 外枠カードフレーム
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 2;
  roundRect(ctx, 30, 30, width - 60, height - 60, 28);
  ctx.stroke();

  // 2. ヘッダー描画
  // アプリアイコン
  ctx.fillStyle = "#2563eb";
  roundRect(ctx, 60, 60, 48, 48, 14);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("S", 84, 85);

  // アプリタイトル
  ctx.textAlign = "left";
  ctx.font = "900 28px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("SubscChecker", 122, 78);

  ctx.font = "bold 16px sans-serif";
  ctx.fillStyle = "#94a3b8";
  const headerSubtitle = completedAction
    ? "節約タスク達成レポート"
    : mode === "normal"
    ? "サブスク支出レポート"
    : "サブスク利用タイプ診断";
  ctx.fillText(headerSubtitle, 124, 100);

  // 右上ドメイン
  ctx.textAlign = "right";
  ctx.font = "bold 18px sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText("subsc-checker.com", width - 60, 88);

  // 3. 左カラム：メイン診断結果テキスト
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  const type = stats.subscType || SUBSCRIPTION_TYPES.smart_rationalist;

  if (completedAction) {
    // 【タスク達成モード】
    ctx.fillStyle = "#10b981";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText("節約アクション達成！", 60, 180);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 60px sans-serif";
    const actSaving = completedAction.annual_saving
      ? `年間 -¥${Number(completedAction.annual_saving).toLocaleString()}`
      : "固定費削減に成功！";
    ctx.fillText(actSaving, 60, 225);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText(`【実行】${completedAction.title || completedAction.service}`, 60, 315);

    // 達成バッジ
    ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
    ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
    roundRect(ctx, 60, 380, 520, 80, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#34d399";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText("固定費の最適化を実行しました", 90, 408);
  } else if (mode === "type" || mode === "hidden") {
    // 【タイプ診断モード（デフォルト・金額非表示）】
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("あなたのサブスク診断タイプ", 60, 175);

    // タイプ名（大きく強調）
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 56px sans-serif";
    ctx.fillText(type.name, 60, 210);

    // キャッチコピー
    ctx.fillStyle = type.accentColor || "#38bdf8";
    ctx.font = "900 26px sans-serif";
    ctx.fillText(`“ ${type.tagline} ”`, 60, 290);

    // あるある特徴（2行折り返し描画）
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "bold 20px sans-serif";
    drawWrappedText(ctx, type.traits, 60, 340, 520, 30);

    // おすすめアドバイス枠
    ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    roundRect(ctx, 60, 430, 520, 75, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("アドバイス:", 80, 446);

    ctx.fillStyle = "#f1f5f9";
    ctx.font = "bold 16px sans-serif";
    drawWrappedText(ctx, type.advice, 80, 468, 480, 24);
  } else {
    // 【支出レポートモード（金額表示）】
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
        `年間最大 -¥${stats.potentialSaving.toLocaleString()} の節約余地あり`,
        85,
        388
      );
      ctx.font = "16px sans-serif";
      ctx.fillStyle = "#a7f3d0";
      ctx.fillText("※プラン最適化・重複解消の試算より", 85, 418);
    }
  }

  // 4. 右カラム：ジャンル内訳ミニ円グラフ（ドーナツチャート）
  const chartCenterX = 890;
  const chartCenterY = 320;
  const outerR = 135;
  const innerR = 80;

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
    ctx.beginPath();
    ctx.arc(chartCenterX, chartCenterY, outerR, 0, Math.PI * 2);
    ctx.arc(chartCenterX, chartCenterY, innerR, Math.PI * 2, 0, true);
    ctx.closePath();
    ctx.fillStyle = "#334155";
    ctx.fill();
  }

  // ドーナツ中央テキスト
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
    const p = ((amt / stats.totalMonthly) * 100).toFixed(1);
    const color = GENRE_COLORS[cat]?.color || "#64748b";
    const label = GENRE_COLORS[cat]?.label || cat;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(chartCenterX - 90, legendY, 7, 0, Math.PI * 2);
    ctx.fill();

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

  // 5. フッター
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.font = "bold 16px sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText("完全無料・登録不要でサブスクを診断 | SubscChecker", 60, height - 55);

  ctx.textAlign = "right";
  ctx.font = "bold 16px sans-serif";
  ctx.fillStyle = "#38bdf8";
  ctx.fillText("#SubscChecker", width - 60, height - 55);
}

// テキスト自動折り返し描画ヘルパー
function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
  if (!text) return;
  const chars = text.split("");
  let line = "";
  let currentY = y;

  for (let n = 0; n < chars.length; n++) {
    const testLine = line + chars[n];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, currentY);
      line = chars[n];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
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
 * シェアモーダルを開く（タイプ診断デフォルト・画像プレビュー・ワンタップX投稿）
 */
export function openShareModal({ stats, completedAction = null }) {
  const existing = document.getElementById("share-modal-overlay");
  if (existing) existing.remove();

  // デフォルトは拡散されやすいタイプ診断モード
  let currentMode = completedAction ? "achievement" : "type";

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
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm">
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-base md:text-lg font-black tracking-tight">
              ${completedAction ? "節約アクションの達成をシェア" : "診断結果を画像でシェア"}
            </h3>
            <p class="text-xs text-slate-400">画像付きでタイムラインでの注目度が数倍アップします</p>
          </div>
        </div>

        <!-- モード切り替えタブ（タイプ診断重視 / 金額表示レポート） -->
        ${
          !completedAction
            ? `
          <div class="flex bg-slate-800 p-1 rounded-xl gap-1">
            <button
              id="tab-mode-type"
              type="button"
              class="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                currentMode === "type"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }"
            >
              タイプ診断（金額非表示・おすすめ）
            </button>
            <button
              id="tab-mode-normal"
              type="button"
              class="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                currentMode === "normal"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }"
            >
              支出レポート（金額を表示）
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
  const tabType = document.getElementById("tab-mode-type");
  const tabNormal = document.getElementById("tab-mode-normal");

  const updateModalView = (mode) => {
    currentMode = mode;
    drawShareCardCanvas(canvas, { mode, stats, completedAction });
    const text = buildShortTweetText({ mode, stats, completedAction });
    if (tweetTextEl) tweetTextEl.textContent = text;

    if (tabType && tabNormal) {
      if (mode === "type") {
        tabType.className =
          "flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all bg-blue-600 text-white shadow-xs";
        tabNormal.className =
          "flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all text-slate-400 hover:text-white";
      } else {
        tabType.className =
          "flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all text-slate-400 hover:text-white";
        tabNormal.className =
          "flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all bg-blue-600 text-white shadow-xs";
      }
    }
  };

  updateModalView(currentMode);

  if (tabType) {
    tabType.addEventListener("click", () => updateModalView("type"));
  }
  if (tabNormal) {
    tabNormal.addEventListener("click", () => updateModalView("normal"));
  }

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

  if (btnShareX) {
    btnShareX.addEventListener("click", () => {
      const text = buildShortTweetText({ mode: currentMode, stats, completedAction });
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(twitterUrl, "_blank", "noopener,noreferrer");
    });
  }

  if (btnCopyImage) {
    btnCopyImage.addEventListener("click", async () => {
      if (!canvas) return;

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        if (navigator.share && navigator.canShare) {
          const file = new File([blob], "subsc-type.png", { type: "image/png" });
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

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "subsc-type.png";
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
 * 支出の内訳タブ専用: メインシェアセクションHTML
 */
export function createShareSectionHtml({ data, items }) {
  const stats = calculateShareStats(items, data);
  const type = stats.subscType || SUBSCRIPTION_TYPES.smart_rationalist;

  return `
    <div class="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 md:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-900/60 my-6">
      <div class="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 max-w-xl mx-auto text-center space-y-4">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-black tracking-wide">
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          <span>サブスク利用タイプ診断</span>
        </div>

        <h3 class="text-lg md:text-2xl font-black text-white tracking-tight">
          あなたのタイプは「${escapeHtml(type.name)}」
        </h3>

        <p class="text-xs md:text-sm text-slate-400 leading-relaxed font-medium">
          “${escapeHtml(type.tagline)}”<br>
          金額を伏せてライフスタイルとして気軽にシェアできる画像カードを発行できます。
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
            <span>診断画像を開いてシェアする</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * シェア機能の初期化
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
