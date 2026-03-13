export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "POSTメソッドのみ許可されています" }),
      { status: 405 },
    );
  }

  try {
    const { subscriptions, goal } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "APIキーが設定されていません" }),
        { status: 500 },
      );
    }

    // --- AIへの指示書（プロンプト）の作成 ---
    let systemPrompt =
      "あなたはサブスクリプション管理の専門家であり、優秀なファイナンシャルプランナーです。ユーザーの契約状況を見て、具体的で実行可能、かつ親しみやすいトーンでアドバイスを提示してください。回答は途中で途切れないよう、必ず結論まで完全に書き切ってください。\n\n";

    if (goal === "saving") {
      systemPrompt +=
        "【目的: 徹底的な節約】\n重複しているサービス（例: 複数の音楽配信や動画配信）を厳しく見つけ出し、解約すべき優先順位や、より安い代替プランを提案して、毎月の固定費を削るアドバイスをしてください。";
    } else if (goal === "qol") {
      systemPrompt +=
        "【目的: 生活の質(QOL)向上】\n単に解約を勧めるのではなく、「これとこれをまとめて上位プランにすればもっと楽しめますよ」「この組み合わせは素晴らしいですね」といった、より豊かなサブスク生活のための提案をしてください。";
    } else if (goal === "family") {
      systemPrompt +=
        "【目的: ファミリー向け最適化】\n個人プランを複数契約している場合、ファミリープランへの統合を提案するなど、家族全体でのコストパフォーマンスが良くなる構成をアドバイスしてください。";
    } else {
      systemPrompt +=
        "ユーザーの状況に合わせて、バランスの良い見直し提案をしてください。";
    }

    const prompt = `${systemPrompt}\n\n${subscriptions}`;

    // --- Gemini 2.5 Flash API への通信 ---
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048, // ★ここを倍増して息切れを防止
          },
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return new Response(
        JSON.stringify({ error: "AIの分析中にエラーが発生しました" }),
        { status: 500 },
      );
    }

    const aiText = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ result: aiText }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Backend Error:", error);
    return new Response(
      JSON.stringify({ error: "サーバー内でエラーが発生しました" }),
      { status: 500 },
    );
  }
}
