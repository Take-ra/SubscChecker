// api/analyze.js (Vercel Serverless Function)

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    profile_type: { type: "STRING" },
    summary: { type: "STRING" },
    priority_action: {
      type: "OBJECT",
      properties: {
        title: { type: "STRING" },
        annual_saving: { type: "INTEGER" },
        reason: { type: "STRING" },
      },
      required: ["title", "annual_saving", "reason"],
    },
    duplicate_warnings: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    plan_optimizations: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    investment_impact: { type: "STRING" },
  },
  required: [
    "profile_type",
    "summary",
    "priority_action",
    "duplicate_warnings",
    "plan_optimizations",
    "investment_impact",
  ],
};

const SYSTEM_INSTRUCTION = `あなたはプロの固定費削減・家計診断アドバイザーです。
ユーザーが契約しているサブスクリプション一覧をもとに、高度で実践的な最適化診断を行ってください。
単なる支出の集計ではなく、以下の4つの実用的な切り口で分析・提案を必ず行ってください。

1. 【重複・機能かぶりの特定】
- 単一ジャンル内だけでなく、「Amazonプライム（動画・音楽・配送特典）と他社サービス（単体動画や単体音楽）の重複」や「複数のクラウドストレージ（iCloud+とGoogle Oneなど）」の二重課金を具体的に指摘してください。

2. 【プラン・契約形態の最適化提案】
- 継続利用している場合の月払いから年払いへの切り替えメリット（例: 2ヶ月分お得等）。
- 動画配信サービスなどの「ローテーション契約（見たい作品がある時期だけ交互に単月契約して休会する）」の提案。
- 該当する可能性がある場合の学割・ファミリープランへの切り替え余地。

3. 【削減インパクト・再投資換算】
- 提案通りに見直した場合の「年間節約額」の根拠。
- 「浮いた年間〇〇円を新NISA等の積立投資（年利5%運用等）や自己投資・スキルアップに回した場合の将来価値」を具体的に提示し、行動のモチベーションを高めてください。

4. 【ワンタップ意思決定アクション（最優先タスク）】
- ユーザーを迷わせないよう、直近で真っ先に見直すべき最も効果の高いアクションを1つ具体的に提示してください。

必ず指定されたJSONスキーマに従って日本語で出力してください。`;

export default async function handler(req, res) {
  // CORS & プリフライト対応
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set in environment variables");
    return res.status(500).json({ error: "サーバーの設定エラー: APIキーが設定されていません。" });
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: "不正なJSONリクエストです。" });
      }
    }

    const subscriptions = body?.subscriptions;
    if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
      return res.status(400).json({ error: "サブスクリプション一覧が指定されていないか空です。" });
    }

    // ユーザープロンプトの構成
    const userPrompt = `以下は現在契約しているサブスクリプションの一覧です。\n${JSON.stringify(subscriptions, null, 2)}\n\nこの契約内容を診断し、指定スキーマのJSONで結果を返してください。`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: userPrompt }],
          },
        ],
        system_instruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        generationConfig: {
          response_mime_type: "application/json",
          response_schema: RESPONSE_SCHEMA,
          temperature: 0.2,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API Error:", geminiRes.status, errText);
      return res.status(502).json({ error: "AI診断の実行中にエラーが発生しました。" });
    }

    const geminiData = await geminiRes.json();
    const rawJsonText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawJsonText) {
      return res.status(502).json({ error: "AIから応答を取得できませんでした。" });
    }

    const analysisResult = JSON.parse(rawJsonText);
    return res.status(200).json(analysisResult);
  } catch (error) {
    console.error("Handler error:", error);
    return res.status(500).json({ error: "内部サーバーエラーが発生しました。" });
  }
}
