// main.js
import { initApp } from "./app.js";

async function loadComponents() {
  try {
    const [modalsRes, resultRes] = await Promise.all([
      fetch("./Modals.html"),
      fetch("./ResultScreen.html"),
    ]);

    const modalsHtml = await modalsRes.text();
    const resultHtml = await resultRes.text();

    const modalsContainer = document.getElementById("modals-container");
    const resultContainer = document.getElementById("result-container");

    if (modalsContainer) {
      modalsContainer.innerHTML = modalsHtml;
    } else {
      console.warn("modals-container が見つかりませんでした");
    }

    if (resultContainer) {
      resultContainer.innerHTML = resultHtml;
    } else {
      console.warn("result-container が見つかりませんでした");
    }

    console.log("HTML部品の読み込み完了。アプリの起動を準備します。");
  } catch (error) {
    console.error("HTMLの読み込みに失敗しました:", error);
  } finally {
    // コンポーネント読み込みの成否に関わらず、アプリ起動を試みて画面を表示する
    setTimeout(() => {
      try {
        initApp();
      } catch (e) {
        console.error("initAppの実行中にエラーが発生しました:", e);
      } finally {
        // 画面非表示のままになるのを防ぐ安全措置
        document.getElementById("main-content")?.classList.remove("opacity-0");
      }
    }, 0);
  }
}

loadComponents();
