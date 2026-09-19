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

// MBTIライクな全タイプ診断マスターデータ
export const SUBSCRIPTION_TYPES = {
  oshi: {
    id: "oshi",
    name: "推し活全振り型",
    tagline: "推しの供給のためなら月額など誤差",
    traits: "全コンテンツをリアタイ追走中。推しの限定配信・ライブ・サントラのためなら固定費を惜しまない情熱派。",
    advice: "重複した配信プランを見直せば、浮いた固定費を次のグッズや遠征費に回せます。",
    accentColor: "#ec4899",
    rarity: "6.8%",
    rarityLabel: "情熱のリアタイ追走派（全体上位7%）",
    emblem: "flame",
    bgGradient: ["#180816", "#2d0b2e", "#090d16"],
  },
  cinema: {
    id: "cinema",
    name: "インドア映画館型",
    tagline: "休日はベッドから出ずに映画マラソン",
    traits: "気づけば複数VODに加入中。見たい作品を探して配信サイトを回遊するのが週末の至福のルーティン。",
    advice: "休眠中のVODを一時休会するか、年間プランに切り替えるだけで年間数千円浮きます。",
    accentColor: "#f43f5e",
    rarity: "18.2%",
    rarityLabel: "映像コンテンツ沼（全体平均の2.5倍）",
    emblem: "movie",
    bgGradient: ["#1c0a0e", "#2c0e18", "#090d16"],
  },
  bgm: {
    id: "bgm",
    name: "日常BGM浸り型",
    tagline: "イヤホンを忘れたら1日テンション半減",
    traits: "生活のあらゆる瞬間にサントラが必要。散歩・作業・入浴まで気分に合わせたプレイリストを常備。",
    advice: "音楽系サブスクが重複していないか確認し、ファミリープランや年払いの活用がおすすめです。",
    accentColor: "#10b981",
    rarity: "15.4%",
    rarityLabel: "常時音響没入派（イヤホン着用率No.1）",
    emblem: "headphones",
    bgGradient: ["#061a14", "#0a2820", "#090d16"],
  },
  digital_worker: {
    id: "digital_worker",
    name: "デジタル仕事人型",
    tagline: "自己投資と効率化には糸目をつけない",
    traits: "最新AI・クラウド・プロツールを駆使。時間を買って生産性を最大化するスマート実践派。",
    advice: "個人プランから年払い一括への移行や、使わなくなったツールの解約で固定費をスリムに保てます。",
    accentColor: "#3b82f6",
    rarity: "9.6%",
    rarityLabel: "生産性ガチ勢（課金ツール上位10%）",
    emblem: "terminal",
    bgGradient: ["#07152b", "#0f274a", "#090d16"],
  },
  minimalist: {
    id: "minimalist",
    name: "固定費ミニマリスト型",
    tagline: "本当に毎日使う神サービスだけを厳選",
    traits: "無駄な固定費を嫌う鉄の意志の持ち主。契約数1〜2件で完璧に使い倒す、家計管理の超優等生。",
    advice: "すでに極めて健全な状態です。この素晴らしいスマート習慣をキープしましょう。",
    accentColor: "#059669",
    rarity: "14.5%",
    rarityLabel: "厳選された無駄ゼロ生活（契約数下位15%）",
    emblem: "shield",
    bgGradient: ["#061912", "#0b2b20", "#090d16"],
  },
  oil_king: {
    id: "oil_king",
    name: "デジタル石油王型",
    tagline: "全方位サブスク富豪（固定費の限界突破）",
    traits: "ありとあらゆる最新サービスを契約中。デジタル空間のすべてを手中におさめる豪快なサブスク貴族。",
    advice: "1ヶ月以上開いていないサービスが数件あるはず。一度契約一覧をスクロールしてみましょう。",
    accentColor: "#eab308",
    rarity: "2.1%",
    rarityLabel: "全体上位2%のサブスク富豪（8件以上契約）",
    emblem: "crown",
    bgGradient: ["#1f1805", "#3a2d08", "#090d16"],
  },
  smart_rationalist: {
    id: "smart_rationalist",
    name: "スマート合理主義型",
    tagline: "必要十分を心得たサブスクの達人",
    traits: "生活に必要なサブスクをバランスよく契約し、無駄がほぼない。コスパを冷静に見極めて賢く利用中。",
    advice: "年に1度の棚卸しで契約状況をチェックするだけで、無駄ゼロをずっと維持できます。",
    accentColor: "#0ea5e9",
    rarity: "22.0%",
    rarityLabel: "コスパ最適化マスター（優等生バランス）",
    emblem: "scales",
    bgGradient: ["#081726", "#0e2b45", "#090d16"],
  },
  buffet: {
    id: "buffet",
    name: "サブスクビュッフェ型",
    tagline: "デジタル世界の便利さを全方位で満喫",
    traits: "気になったサービスは即お試し。エンタメから便利ツールまで幅広く契約し、日々の生活をアップデート。",
    advice: "「最近使っていないかも？」と感じるサービスを1つ棚卸しするだけで、大きな節約効果が生まれます。",
    accentColor: "#8b5cf6",
    rarity: "11.5%",
    rarityLabel: "デジタル好奇心旺盛派（マルチジャンル契約）",
    emblem: "buffet",
    bgGradient: ["#140b29", "#241347", "#090d16"],
  },
  express_delivery: {
    id: "express_delivery",
    name: "お急ぎ便マスター型",
    tagline: "日用品も買い物もすべて自宅に即日完結",
    traits: "通販・配送・生活支援サブスクをフル活用。買い物に行く時間を節約して快適な生活リズムを構築中。",
    advice: "年間プランへの集約や、同種サービスの特典被りを整理するのが節約の近道です。",
    accentColor: "#f97316",
    rarity: "7.4%",
    rarityLabel: "自宅即日完結派（タイパ重視生活）",
    emblem: "truck",
    bgGradient: ["#1f0e05", "#351909", "#090d16"],
  },
  intellectual: {
    id: "intellectual",
    name: "知的好奇心探求型",
    tagline: "本と学びのインプットが止まらない読書家",
    traits: "電子書籍や学習系サービスを愛用。気になった知識は即ライブラリに保存し、日々のインプットに余念がない。",
    advice: "定期的に読み放題対象と購入のコストを比較すると、さらにコスパが向上します。",
    accentColor: "#d97706",
    rarity: "4.8%",
    rarityLabel: "知識インプット探求派（読書・学習特化）",
    emblem: "book",
    bgGradient: ["#1c1005", "#331f08", "#090d16"],
  },
  lost: {
    id: "lost",
    name: "サブスク迷子型",
    tagline: "昔登録したあのサービス、今月開いたっけ…？",
    traits: "無料体験からそのまま継続していたり、似たジャンルが被っていたり。気づけば毎月引き落とされるおっとりさん。",
    advice: "ワンタップで解約やプラン変更をすれば、年間で数万円浮くポテンシャルを秘めています。",
    accentColor: "#e11d48",
    rarity: "12.1%",
    rarityLabel: "固定費の眠れる宝庫（大幅節約ポテンシャル）",
    emblem: "compass",
    bgGradient: ["#20070e", "#3a0c18", "#090d16"],
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

  // 0. 契約数1件の場合のサービス名特化パーソナライズ（バズるフック）
  if (serviceCount === 1) {
    const item = items[0] || {};
    const rawName = String(item.name || "").trim();
    const lowerName = rawName.toLowerCase();

    if (lowerName.includes("netflix")) {
      return {
        ...SUBSCRIPTION_TYPES.cinema,
        name: "Netflix一本足打法型",
        tagline: "もうこれ以上減らせない、固定費の鉄人",
        traits: "動画配信はNetflixただ1本。見たい作品だけを集中して楽しみ、無駄な寄り道を一切しない極めて潔いスタイル。",
        rarity: "8.1%",
        rarityLabel: "契約数下位8%の超少数派（全体平均4.2件）",
        emblem: "movie",
      };
    }

    if (lowerName.includes("spotify") || lowerName.includes("apple music")) {
      const sName = lowerName.includes("spotify") ? "Spotify" : "Apple Music";
      return {
        ...SUBSCRIPTION_TYPES.bgm,
        name: `${sName}一本足打法型`,
        tagline: "耳さえあれば生きていける人",
        traits: "動画もゲームも契約せず、音楽さえあれば人生OK。無駄な動画沼にハマらない音響ストイック派。",
        rarity: "6.4%",
        rarityLabel: "契約数下位6%の音響ストイック派",
        emblem: "headphones",
      };
    }

    if (lowerName.includes("youtube")) {
      return {
        ...SUBSCRIPTION_TYPES.digital_worker,
        name: "YouTube一本足打法型",
        tagline: "時間至上主義のタイパ潔癖派",
        traits: "広告という無駄な時間を秒単位で排除。必要な情報と娯楽を最速で摂取するタイムパフォーマンスの鬼。",
        rarity: "7.2%",
        rarityLabel: "タイパ至上主義の少数派（契約数下位7%）",
        emblem: "zap",
      };
    }

    if (lowerName.includes("amazon") || lowerName.includes("prime") || lowerName.includes("プライム")) {
      return {
        ...SUBSCRIPTION_TYPES.express_delivery,
        name: "Amazon一本足打法型",
        tagline: "プライムだけで一生過ごせる人",
        traits: "配送・動画・音楽・本が全部入った万能プランで完結。他のサブスクを寄せ付けない究極のコスパマスター。",
        rarity: "9.5%",
        rarityLabel: "コスパ最強のスマート実践者",
        emblem: "truck",
      };
    }

    // 一般的な単一契約
    const shortName = rawName.slice(0, 10) || "神サービス";
    return {
      ...SUBSCRIPTION_TYPES.minimalist,
      name: `${shortName}一本足打法型`,
      tagline: "もうこれ以上減らせない、固定費の鉄人",
      traits: `${rawName}ただ1本に全集中。無駄な固定費を徹底的に削ぎ落とした、潔いミニマリスト。`,
      rarity: "8.1%",
      rarityLabel: "契約数下位8%の超少数派（全体平均4.2件）",
      emblem: "shield",
    };
  }

  // 1. 契約数8件以上の豪快な課金 → 石油王
  if (serviceCount >= 8) {
    return SUBSCRIPTION_TYPES.oil_king;
  }

  // 2. 年間12,000円以上の大幅な削減余地がある → 迷子型
  if (potentialSaving >= 12000) {
    return SUBSCRIPTION_TYPES.lost;
  }

  // 3. 契約数2件以下かつ低支出 → ミニマリスト
  if (serviceCount <= 2 && totalMonthly <= 2500) {
    return SUBSCRIPTION_TYPES.minimalist;
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

  // 4. 動画＋音楽のエンタメが60%以上かつ3件以上 → 推し活全振り型
  if (entertainmentPct >= 60 && serviceCount >= 3) {
    return SUBSCRIPTION_TYPES.oshi;
  }

  // 5. 動画が過半数 → インドア映画館型
  if (videoPct >= 45) {
    return SUBSCRIPTION_TYPES.cinema;
  }

  // 6. 音楽が過半数 → 日常BGM浸り型
  if (musicPct >= 40) {
    return SUBSCRIPTION_TYPES.bgm;
  }

  // 7. ツール・クラウドが40%以上 → デジタル仕事人型
  if (toolPct >= 40) {
    return SUBSCRIPTION_TYPES.digital_worker;
  }

  // 8. 配送・ECが最大支出 → お急ぎ便マスター型
  if (deliveryAmt > 0 && deliveryAmt >= videoAmt && deliveryAmt >= musicAmt) {
    return SUBSCRIPTION_TYPES.express_delivery;
  }

  // 9. 電子書籍が主 → 知的好奇心探求型
  if (ebookAmt > 0 && ebookAmt >= videoAmt && ebookAmt >= musicAmt) {
    return SUBSCRIPTION_TYPES.intellectual;
  }

  // 10. 5件以上で多様なジャンル → ビュッフェ型
  if (serviceCount >= 5) {
    return SUBSCRIPTION_TYPES.buffet;
  }

  // 11. その他 → スマート合理主義型
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
    rarity: subscType.rarity || "10.0%",
    rarityLabel: subscType.rarityLabel || "サブスク利用タイプ",
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
    const rarityStr = type.rarity ? `（出現率 ${type.rarity}）` : "";
    return `【サブスク利用タイプ診断】\n私のタイプは「${type.name}」でした${rarityStr}！\n“${type.tagline}”\n\nみんなは何型？\nhttps://subsc-checker.com/ #SubscChecker #サブスクタイプ診断`;
  }

  // 3. 支出レポートモード（金額表示）
  if (stats.potentialSaving > 0) {
    return `【サブスク支出レポート】\nサブスクに年間¥${yearlyStr}払ってた。年間約¥${savingStr}節約できるみたい！\nhttps://subsc-checker.com/ #SubscChecker`;
  }
  return `【サブスク支出レポート】\nサブスク年間¥${yearlyStr}（全${stats.serviceCount}契約）利用中。あなたの固定費は？\nhttps://subsc-checker.com/ #SubscChecker`;
}

/**
 * 幾何学ベクターエンブレム描画ヘルパー（絵文字ゼロ厳守）
 */
function drawEmblem(ctx, emblemType, cx, cy, size, color) {
  ctx.save();
  ctx.translate(cx, cy);

  // 外側ソフトグローサークル
  const bgGrad = ctx.createRadialGradient(0, 0, size * 0.2, 0, 0, size * 0.8);
  bgGrad.addColorStop(0, color + "33"); // 20% alpha
  bgGrad.addColorStop(1, color + "00");
  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.8, 0, Math.PI * 2);
  ctx.fill();

  // エンブレム台座リング
  ctx.strokeStyle = color + "66"; // 40% alpha
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.52, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const s = size * 0.28;

  switch (emblemType) {
    case "movie": {
      // フィルム／シネマ再生シンボル
      ctx.beginPath();
      roundRect(ctx, -s * 1.2, -s * 0.8, s * 2.4, s * 1.6, 6);
      ctx.stroke();
      // 再生トライアングル
      ctx.beginPath();
      ctx.moveTo(-s * 0.3, -s * 0.45);
      ctx.lineTo(s * 0.5, 0);
      ctx.lineTo(-s * 0.3, s * 0.45);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "headphones": {
      // ヘッドホンアーチ
      ctx.beginPath();
      ctx.arc(0, -s * 0.1, s * 0.9, Math.PI, 0, false);
      ctx.stroke();
      // 左右イヤーパッド
      roundRect(ctx, -s * 1.1, -s * 0.2, s * 0.4, s * 0.9, 4);
      ctx.fill();
      roundRect(ctx, s * 0.7, -s * 0.2, s * 0.4, s * 0.9, 4);
      ctx.fill();
      // 音波ライン
      ctx.beginPath();
      ctx.moveTo(-s * 0.2, s * 0.2);
      ctx.lineTo(-s * 0.2, s * 0.6);
      ctx.moveTo(0, s * 0.05);
      ctx.lineTo(0, s * 0.75);
      ctx.moveTo(s * 0.2, s * 0.2);
      ctx.lineTo(s * 0.2, s * 0.6);
      ctx.stroke();
      break;
    }
    case "flame": {
      // 情熱の炎
      ctx.beginPath();
      ctx.moveTo(0, -s * 1.1);
      ctx.bezierCurveTo(s * 0.7, -s * 0.3, s * 1.0, s * 0.4, s * 0.6, s * 0.9);
      ctx.bezierCurveTo(s * 0.2, s * 1.2, -s * 0.2, s * 1.2, -s * 0.6, s * 0.9);
      ctx.bezierCurveTo(-s * 1.0, s * 0.4, -s * 0.7, -s * 0.3, 0, -s * 1.1);
      ctx.closePath();
      ctx.fill();
      // 炎の中心ハイライト
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.2);
      ctx.bezierCurveTo(s * 0.3, s * 0.2, s * 0.3, s * 0.6, 0, s * 0.8);
      ctx.bezierCurveTo(-s * 0.3, s * 0.6, -s * 0.3, s * 0.2, 0, -s * 0.2);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "terminal": {
      // ターミナルウィンドウ
      ctx.beginPath();
      roundRect(ctx, -s * 1.1, -s * 0.8, s * 2.2, s * 1.6, 6);
      ctx.stroke();
      // プロンプト >
      ctx.beginPath();
      ctx.moveTo(-s * 0.6, -s * 0.3);
      ctx.lineTo(-s * 0.2, 0);
      ctx.lineTo(-s * 0.6, s * 0.3);
      ctx.stroke();
      // カーソル _
      ctx.beginPath();
      ctx.moveTo(0, s * 0.3);
      ctx.lineTo(s * 0.5, s * 0.3);
      ctx.stroke();
      break;
    }
    case "crown": {
      // 王冠
      ctx.beginPath();
      ctx.moveTo(-s * 1.1, s * 0.7);
      ctx.lineTo(-s * 1.1, -s * 0.2);
      ctx.lineTo(-s * 0.5, s * 0.2);
      ctx.lineTo(0, -s * 0.7);
      ctx.lineTo(s * 0.5, s * 0.2);
      ctx.lineTo(s * 1.1, -s * 0.2);
      ctx.lineTo(s * 1.1, s * 0.7);
      ctx.closePath();
      ctx.fill();
      // 王冠トップのジュエル
      ctx.beginPath();
      ctx.arc(0, -s * 0.85, 3, 0, Math.PI * 2);
      ctx.arc(-s * 1.1, -s * 0.35, 3, 0, Math.PI * 2);
      ctx.arc(s * 1.1, -s * 0.35, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "scales": {
      // 天秤（スマート合理主義）
      ctx.beginPath();
      // 支柱
      ctx.moveTo(0, -s * 0.9);
      ctx.lineTo(0, s * 0.9);
      ctx.moveTo(-s * 0.6, s * 0.9);
      ctx.lineTo(s * 0.6, s * 0.9);
      // 天秤の梁
      ctx.moveTo(-s * 0.9, -s * 0.5);
      ctx.lineTo(s * 0.9, -s * 0.5);
      ctx.stroke();
      // 左右の皿
      ctx.beginPath();
      ctx.moveTo(-s * 0.9, -s * 0.5);
      ctx.lineTo(-s * 1.2, 0);
      ctx.lineTo(-s * 0.6, 0);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(s * 0.9, -s * 0.5);
      ctx.lineTo(s * 0.6, 0);
      ctx.lineTo(s * 1.2, 0);
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case "truck": {
      // デリバリートラック（お急ぎ便）
      ctx.beginPath();
      ctx.moveTo(-s * 1.1, -s * 0.6);
      ctx.lineTo(s * 0.3, -s * 0.6);
      ctx.lineTo(s * 0.3, -s * 0.2);
      ctx.lineTo(s * 0.8, -s * 0.2);
      ctx.lineTo(s * 1.1, s * 0.2);
      ctx.lineTo(s * 1.1, s * 0.6);
      ctx.lineTo(-s * 1.1, s * 0.6);
      ctx.closePath();
      ctx.stroke();
      // タイヤ
      ctx.beginPath();
      ctx.arc(-s * 0.5, s * 0.65, s * 0.22, 0, Math.PI * 2);
      ctx.arc(s * 0.7, s * 0.65, s * 0.22, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "book": {
      // 開いた本（知的好奇心）
      ctx.beginPath();
      ctx.moveTo(0, s * 0.7);
      ctx.lineTo(0, -s * 0.7);
      ctx.bezierCurveTo(-s * 0.4, -s * 0.9, -s * 0.9, -s * 0.7, -s * 1.1, -s * 0.7);
      ctx.lineTo(-s * 1.1, s * 0.5);
      ctx.bezierCurveTo(-s * 0.9, s * 0.5, -s * 0.4, s * 0.7, 0, s * 0.7);
      ctx.bezierCurveTo(s * 0.4, s * 0.7, s * 0.9, s * 0.5, s * 1.1, s * 0.5);
      ctx.lineTo(s * 1.1, -s * 0.7);
      ctx.bezierCurveTo(s * 0.9, -s * 0.7, s * 0.4, -s * 0.9, 0, -s * 0.7);
      ctx.stroke();
      break;
    }
    case "compass": {
      // 羅針盤（迷子型）
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.95, 0, Math.PI * 2);
      ctx.stroke();
      // 針
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.75);
      ctx.lineTo(s * 0.3, 0);
      ctx.lineTo(0, s * 0.75);
      ctx.lineTo(-s * 0.3, 0);
      ctx.closePath();
      ctx.stroke();
      // 上半分塗り
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.75);
      ctx.lineTo(s * 0.3, 0);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "zap": {
      // 稲妻（YouTube／タイパ）
      ctx.beginPath();
      ctx.moveTo(s * 0.1, -s * 1.1);
      ctx.lineTo(-s * 0.7, 0);
      ctx.lineTo(-s * 0.1, 0);
      ctx.lineTo(-s * 0.2, s * 1.1);
      ctx.lineTo(s * 0.7, -s * 0.1);
      ctx.lineTo(s * 0.1, -s * 0.1);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "shield":
    default: {
      // シールド＋チェック（ミニマリスト／鉄人）
      ctx.beginPath();
      ctx.moveTo(0, -s * 1.0);
      ctx.lineTo(s * 0.9, -s * 0.6);
      ctx.lineTo(s * 0.9, s * 0.2);
      ctx.bezierCurveTo(s * 0.9, s * 0.8, 0, s * 1.1, 0, s * 1.1);
      ctx.bezierCurveTo(0, s * 1.1, -s * 0.9, s * 0.8, -s * 0.9, s * 0.2);
      ctx.lineTo(-s * 0.9, -s * 0.6);
      ctx.closePath();
      ctx.stroke();
      // チェックマーク
      ctx.beginPath();
      ctx.moveTo(-s * 0.4, 0);
      ctx.lineTo(-s * 0.1, s * 0.35);
      ctx.lineTo(s * 0.45, -s * 0.3);
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

/**
 * Canvasに診断結果画像をレンダリング（1200 × 675px, 16:9 ポスター形式）
 */
export function drawShareCardCanvas(canvas, { mode = "type", stats, completedAction = null }) {
  if (!canvas) return;
  const width = 1200;
  const height = 675;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const type = stats.subscType || SUBSCRIPTION_TYPES.smart_rationalist;
  const accentColor = type.accentColor || "#38bdf8";

  // 1. タイプ別の美しい深色グラデーション背景
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  if (type.bgGradient && type.bgGradient.length >= 2) {
    bgGrad.addColorStop(0, type.bgGradient[0]);
    bgGrad.addColorStop(0.5, type.bgGradient[1] || type.bgGradient[0]);
    bgGrad.addColorStop(1, type.bgGradient[2] || "#090d16");
  } else {
    bgGrad.addColorStop(0, "#090d16");
    bgGrad.addColorStop(0.5, "#0f172a");
    bgGrad.addColorStop(1, "#1e1b4b");
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 中央アクセントオーラグロー（ポスターの主役を引き立てる発光）
  const auraGlow = ctx.createRadialGradient(width / 2, 280, 10, width / 2, 280, 420);
  auraGlow.addColorStop(0, accentColor + "38"); // 22% alpha
  auraGlow.addColorStop(0.6, accentColor + "10"); // 6% alpha
  auraGlow.addColorStop(1, "transparent");
  ctx.fillStyle = auraGlow;
  ctx.fillRect(0, 0, width, height);

  // 外枠カードフレーム（洗練された細いガラス枠）
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 2;
  roundRect(ctx, 35, 30, width - 70, height - 60, 24);
  ctx.stroke();

  // 2. ヘッダー描画（上部ブランドバー）
  // アプリアイコン
  ctx.fillStyle = "#2563eb";
  roundRect(ctx, 65, 55, 42, 42, 12);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 24px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("S", 86, 76);

  // アプリタイトル & サブタイトル
  ctx.textAlign = "left";
  ctx.font = "900 24px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("SubscChecker", 120, 68);

  ctx.font = "bold 14px sans-serif";
  ctx.fillStyle = "#94a3b8";
  const headerSubtitle = completedAction
    ? "節約タスク達成レポート"
    : mode === "normal"
    ? "サブスク支出レポート"
    : "サブスク利用タイプ診断";
  ctx.fillText(headerSubtitle, 122, 88);

  // 右上ドメインスタンプ
  ctx.textAlign = "right";
  ctx.font = "bold 18px sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText("subsc-checker.com", width - 65, 78);

  // 3. 中央ポスターエリア（Xサムネイル完全最適化）
  if (completedAction) {
    // 【タスク達成モード】
    // ① 達成ピルバッジ
    const badgeText = "固定費の最適化を実行完了！";
    ctx.font = "bold 18px sans-serif";
    const badgeWidth = ctx.measureText(badgeText).width + 50;
    const badgeX = (width - badgeWidth) / 2;
    const badgeY = 135;

    ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
    ctx.strokeStyle = "rgba(16, 185, 129, 0.5)";
    ctx.lineWidth = 1.5;
    roundRect(ctx, badgeX, badgeY, badgeWidth, 38, 19);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#34d399";
    ctx.fillText(badgeText, width / 2, badgeY + 19);

    // ② 達成エンブレム
    drawEmblem(ctx, "shield", width / 2, 225, 72, "#10b981");

    // ③ 巨大削減額タイトル
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 68px sans-serif";
    const actSaving = completedAction.annual_saving
      ? `年間 -¥${Number(completedAction.annual_saving).toLocaleString()}`
      : "固定費削減に成功！";
    ctx.fillText(actSaving, width / 2, 315);

    // ④ アクション名キャッチコピー
    ctx.fillStyle = "#34d399";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText(`“ ${completedAction.title || completedAction.service} を見直し ”`, width / 2, 370);
  } else if (mode === "type" || mode === "hidden") {
    // 【タイプ診断モード（ポスター形式の真骨頂）】
    // ① 出現率・比較ピルバッジ
    const rarityText = stats.rarity ? `出現率 ${stats.rarity}` : "タイプ診断";
    const compLabel = stats.rarityLabel || "超少数派";
    const fullBadgeText = `${rarityText}  │  ${compLabel}`;

    ctx.font = "bold 18px sans-serif";
    const badgeWidth = ctx.measureText(fullBadgeText).width + 50;
    const badgeX = (width - badgeWidth) / 2;
    const badgeY = 135;

    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.strokeStyle = accentColor + "80"; // 50% alpha
    ctx.lineWidth = 1.5;
    roundRect(ctx, badgeX, badgeY, badgeWidth, 38, 19);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#f8fafc";
    ctx.fillText(fullBadgeText, width / 2, badgeY + 19);

    // ② 象徴ベクターエンブレム
    drawEmblem(ctx, type.emblem || "shield", width / 2, 225, 76, accentColor);

    // ③ 超巨大タイプ名（主役：64px〜54pxで自動調整）
    const typeName = type.name;
    ctx.fillStyle = "#ffffff";
    const nameFontSize = typeName.length > 10 ? 54 : 64;
    ctx.font = `900 ${nameFontSize}px sans-serif`;

    // テキストシャドウ
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 4;
    ctx.fillText(typeName, width / 2, 320);
    ctx.restore();

    // ④ キャッチコピー
    ctx.fillStyle = accentColor;
    ctx.font = "bold 24px sans-serif";
    ctx.fillText(`“ ${type.tagline} ”`, width / 2, 375);
  } else {
    // 【支出レポートモード（金額表示のポスター形式）】
    // ① レポートバッジ
    const repBadge = `契約数 ${stats.serviceCount}件  │  サブスク年間支出`;
    ctx.font = "bold 18px sans-serif";
    const badgeWidth = ctx.measureText(repBadge).width + 50;
    const badgeX = (width - badgeWidth) / 2;
    const badgeY = 135;

    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
    ctx.lineWidth = 1.5;
    roundRect(ctx, badgeX, badgeY, badgeWidth, 38, 19);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText(repBadge, width / 2, badgeY + 19);

    // ② 巨大金額表示
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 70px sans-serif";
    ctx.fillText(`月額 ¥${stats.totalMonthly.toLocaleString()}`, width / 2, 235);

    // ③ 年間換算
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "bold 26px sans-serif";
    ctx.fillText(`年間換算 約 ${stats.totalYearly.toLocaleString()} 円`, width / 2, 310);

    // ④ 削減ポテンシャルまたはコメント
    if (stats.potentialSaving > 0) {
      ctx.fillStyle = "#34d399";
      ctx.font = "bold 22px sans-serif";
      ctx.fillText(`年間最大 -¥${stats.potentialSaving.toLocaleString()} の節約余地あり`, width / 2, 365);
    } else {
      ctx.fillStyle = accentColor;
      ctx.font = "bold 22px sans-serif";
      ctx.fillText(`“ ${type.tagline} ”`, width / 2, 365);
    }
  }

  // 4. 下部3分割ステータスバー（比較情報・ミニマルインフォグラフィック）
  const barWidth = 960;
  const barHeight = 92;
  const barX = (width - barWidth) / 2;
  const barY = 435;

  ctx.fillStyle = "rgba(15, 23, 42, 0.78)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 1.5;
  roundRect(ctx, barX, barY, barWidth, barHeight, 20);
  ctx.fill();
  ctx.stroke();

  // 3つの区切り線
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.beginPath();
  ctx.moveTo(barX + barWidth / 3, barY + 15);
  ctx.lineTo(barX + barWidth / 3, barY + barHeight - 15);
  ctx.moveTo(barX + (barWidth / 3) * 2, barY + 15);
  ctx.lineTo(barX + (barWidth / 3) * 2, barY + barHeight - 15);
  ctx.stroke();

  const col1X = barX + barWidth / 6;
  const col2X = barX + barWidth / 2;
  const col3X = barX + (barWidth / 6) * 5;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // カラム1: 契約数
  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 14px sans-serif";
  ctx.fillText("契約数", col1X, barY + 28);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 24px sans-serif";
  ctx.fillText(`${stats.serviceCount} 件`, col1X, barY + 54);
  ctx.fillStyle = "#64748b";
  ctx.font = "12px sans-serif";
  ctx.fillText("全体平均 4.2件", col1X, barY + 74);

  // カラム2: 固定費ステータス
  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 14px sans-serif";
  ctx.fillText(mode === "normal" ? "月額固定費" : "固定費状態", col2X, barY + 28);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 24px sans-serif";
  if (mode === "normal") {
    ctx.fillText(`¥${stats.totalMonthly.toLocaleString()}`, col2X, barY + 54);
  } else if (stats.serviceCount === 1) {
    ctx.fillText("厳選1本", col2X, barY + 54);
  } else if (stats.potentialSaving > 0) {
    ctx.fillText(`削減余地あり`, col2X, barY + 54);
  } else {
    ctx.fillText("無駄ゼロ", col2X, barY + 54);
  }
  ctx.fillStyle = "#64748b";
  ctx.font = "12px sans-serif";
  const col2Sub = mode === "normal"
    ? `年間 ¥${stats.totalYearly.toLocaleString()}`
    : stats.serviceCount === 1
    ? "無駄な重複なし"
    : stats.potentialSaving > 0
    ? `年間約 -¥${stats.potentialSaving.toLocaleString()}`
    : "家計管理の優等生";
  ctx.fillText(col2Sub, col2X, barY + 74);

  // カラム3: 主力ジャンル／主力サービス
  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 14px sans-serif";
  ctx.fillText("主力ジャンル", col3X, barY + 28);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 24px sans-serif";
  ctx.fillText(stats.topGenreLabel, col3X, barY + 54);
  ctx.fillStyle = "#64748b";
  ctx.font = "12px sans-serif";
  const mainServiceName = stats.items[0]?.name ? String(stats.items[0].name).slice(0, 10) : "バランス利用";
  ctx.fillText(mainServiceName, col3X, barY + 74);

  // 5. フッター描画
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.font = "bold 15px sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText("完全無料・登録不要でサブスクを診断 │ SubscChecker", 65, height - 42);

  ctx.textAlign = "right";
  ctx.font = "bold 15px sans-serif";
  ctx.fillStyle = accentColor;
  ctx.fillText("#SubscChecker #サブスクタイプ診断", width - 65, height - 42);
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
  const rarityText = stats.rarity ? `出現率 ${stats.rarity}` : "タイプ診断";
  const compLabel = stats.rarityLabel || "超少数派";

  return `
    <div class="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 md:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-900/60 my-6">
      <div class="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 max-w-xl mx-auto text-center space-y-4">
        <div class="flex flex-wrap items-center justify-center gap-2">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-black tracking-wide">
            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span>サブスク利用タイプ診断</span>
          </div>
          <div class="inline-flex items-center px-3 py-1 rounded-full bg-slate-800/80 text-amber-300 border border-amber-400/30 text-xs font-black">
            <span>${escapeHtml(rarityText)} │ ${escapeHtml(compLabel)}</span>
          </div>
        </div>

        <h3 class="text-xl md:text-3xl font-black text-white tracking-tight">
          あなたのタイプは「${escapeHtml(type.name)}」
        </h3>

        <p class="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
          “${escapeHtml(type.tagline)}”<br>
          <span class="text-slate-400 text-xs">金額を伏せてライフスタイルとして気軽にシェアできるSNSポスター画像を発行できます。</span>
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
