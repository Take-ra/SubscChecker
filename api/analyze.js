// api/analyze.js (Vercel Serverless Function)

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    profile_type: { type: "STRING" },
    summary: { type: "STRING" },
    actions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING" },
          service: { type: "STRING" },
          action_type: { type: "STRING" },
          title: { type: "STRING" },
          annual_saving: { type: "INTEGER" },
          effort: { type: "STRING" },
          time_required_min: { type: "INTEGER" },
          current_state: { type: "STRING" },
          proposed_state: { type: "STRING" },
          reason_short: { type: "STRING" },
        },
        required: [
          "id",
          "service",
          "action_type",
          "title",
          "annual_saving",
          "effort",
          "time_required_min",
          "current_state",
          "proposed_state",
          "reason_short",
        ],
      },
    },
    investment_impact: {
      type: "OBJECT",
      properties: {
        yearly_amount: { type: "INTEGER" },
        monthly_amount: { type: "INTEGER" },
        principal_20y: { type: "INTEGER" },
        profit_20y: { type: "INTEGER" },
        total_20y: { type: "INTEGER" },
        note: { type: "STRING" },
      },
      required: [
        "yearly_amount",
        "monthly_amount",
        "principal_20y",
        "profit_20y",
        "total_20y",
        "note",
      ],
    },
  },
  required: ["profile_type", "summary", "actions", "investment_impact"],
};

const SYSTEM_INSTRUCTION = `あなたは固定費削減の専門アドバイザーです。
ユーザーの契約サブスク一覧を分析し、ユーザーがすぐ実行できる「具体的なToDoアクション（作業リスト）」を生成してください。

【出力要件】
1. 冗長な解説文は避け、ユーザーがサクサク片付けられるタスク形式に徹してください。
2. アクションの title は必ず動詞の命令形（例：「年払いに切り替える」「隔月ローテーション運用にする」「片方を休止する」）にしてください。
3. action_type は "plan_change"（プラン変更・年払いなど）、"duplicate"（重複解消）、"cancel"（不要なものの見直し）、"review" のいずれかにしてください。
4. effort は "low"（Webで数クリック・所要1〜3分）、"medium"（解約・切替手続き・所要3〜5分）、"high"（データ移行や家族調整・所要5分以上）の3段階。
5. 契約が1件のみの場合は、重複（duplicate）のアクションは絶対に出さず、年払い等への変更余地（または無理な削減を強要しないアドバイス）に留めてください。
6. actions は効果の高い順に最大3〜4件までに厳選してください。
7. actions 各項目の annual_saving の合計値と、investment_impact の yearly_amount を必ず一致させてください。
8. investment_impact は、上記 yearly_amount を年利5%・20年間積立投資した場合の複利試算（概算元本・運用益・総額）を整数で算出してください。
9. 必ず指定されたJSONスキーマに従い、日本語で出力してください。`;

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

    const rawSubscriptions = body?.subscriptions;
    if (!Array.isArray(rawSubscriptions) || rawSubscriptions.length === 0) {
      return res.status(400).json({ error: "サブスクリプション一覧が指定されていないか空です。" });
    }
    if (rawSubscriptions.length > 50) {
      return res.status(400).json({ error: "一度に診断できるサブスクリプションは最大50件までです。" });
    }

    // 悪意のある長大文字列や不正フィールドを排除・サニタイズ
    const subscriptions = rawSubscriptions.slice(0, 50).map((sub) => ({
      name: String(sub?.name || "").slice(0, 50).trim() || "サブスク",
      category: String(sub?.category || "").slice(0, 30).trim() || "その他",
      monthly: Math.max(0, Math.min(10000000, Number(sub?.monthly) || 0)),
      yearly: Math.max(0, Math.min(120000000, Number(sub?.yearly) || 0)),
    }));

    // ユーザープロンプトの構成
    const userPrompt = `以下は現在契約しているサブスクリプションの一覧です。\n${JSON.stringify(subscriptions, null, 2)}\n\nこの契約内容を診断し、指定スキーマのJSONで結果を返してください。`;

    // 優先的に試行するモデル一覧（最軽量・高速な gemini-3.1-flash-lite を最優先、混雑時に自動フォールバック）
    const candidateModels = [
      "gemini-3.1-flash-lite",
      "gemini-3-flash-preview",
      "gemini-2.5-flash",
    ];
    let rawJsonText = null;
    let lastError = null;

    for (const model of candidateModels) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      // 各モデルごとに最大2回リトライ（一時的混雑への指数バックオフ）
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          if (attempt > 0) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }

          const generationConfig = {
            response_mime_type: "application/json",
            response_schema: RESPONSE_SCHEMA,
            temperature: 0.2,
          };

          // Gemini 2.5系では思考バジェットを512トークンに制限して高速化＆API負荷・コストを大幅削減
          if (model.includes("2.5")) {
            generationConfig.thinkingConfig = { thinkingBudget: 512 };
          }

          const geminiRes = await fetch(geminiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            signal: AbortSignal.timeout(15000), // 15秒タイムアウトで関数のハングを防止
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: userPrompt }],
                },
              ],
              system_instruction: {
                parts: [{ text: SYSTEM_INSTRUCTION }],
              },
              generationConfig,
            }),
          });

          if (geminiRes.ok) {
            const geminiData = await geminiRes.json();
            rawJsonText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawJsonText) break;
          } else {
            const errText = await geminiRes.text();
            lastError = `[${geminiRes.status}] ${errText}`;
            console.warn(`Model ${model} attempt ${attempt + 1} failed with ${geminiRes.status}:`, errText);
            // 503(混雑)や429(レート制限)以外はリトライせず別モデルへ
            if (geminiRes.status !== 503 && geminiRes.status !== 429) {
              break;
            }
          }
        } catch (fetchErr) {
          lastError = fetchErr.message;
          console.warn(`Fetch error on ${model}:`, fetchErr);
        }
      }

      if (rawJsonText) break;
    }

    if (!rawJsonText) {
      console.error("All Gemini models failed. Last error:", lastError);
      return res.status(502).json({
        error: "AIサーバーが現在大変混雑しています。数十秒後に再度お試しください。",
      });
    }

    let analysisResult;
    try {
      const cleanJson = rawJsonText.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
      analysisResult = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr, "Raw output:", rawJsonText);
      return res.status(502).json({
        error: "AIの応答形式が正しくありませんでした。再度お試しください。",
      });
    }
    return res.status(200).json(analysisResult);
  } catch (error) {
    console.error("Handler error:", error);
    return res.status(500).json({ error: "内部サーバーエラーが発生しました。" });
  }
}
