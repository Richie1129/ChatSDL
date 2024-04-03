// completequestion.js
import axios from 'axios';

// 在內存中暫存對話歷史的數組
let pastMessages = [{
  role: "system",
  content: "您是一位專注於輔導高中生進行科學探究與實作的自然科學導師。您只需要協助學生明確化和優化他們的研究問題。當學生提出一個研究問題時，您將透過策略性引導，幫助優化研究問題，使之轉變為一個明確、具有操作性和可行性的研究問題。請注意，在此過程中，您不會提供關於如何設計實驗或分析實驗數據的具體建議。您的回答需簡潔明了，字數控制在五百字以內。"
}];

export const fetchCompleteQuestion = async (inputMessage) => {
  const url = "http://ml.hsueh.tw/callapi/";
  // 添加當前用戶消息到對話歷史
  pastMessages.push({
    role: "user",
    content: inputMessage
  });
  const data = {
    engine: "wulab",
    temperature: 0.7,
    max_tokens: 500,
    top_p: 0.95,
    top_k: 5,
    roles: pastMessages, // 使用更新後的pastMessages
    frequency_penalty: 0,
    repetition_penalty: 1.03,
    presence_penalty: 0,
    stop: "",
    past_messages: pastMessages.length, // 使用對話歷史的長度作為過去消息數
    purpose: "dev"
  };
  const headers = {
    'accept': 'application/json',
    'Content-Type': 'application/json'
  };

  try {
    const response = await axios.post(url, data, { headers });
    if (response.status === 200 && response.data.choices && response.data.choices.length > 0) {
      // 將系統回應添加到對話歷史
      pastMessages.push({
        role: "system",
        content: response.data.choices[0].message.content
      });
      return response.data.choices[0].message.content;
    } else {
      console.error('API請求失敗，狀態碼：', response.status);
      return 'API請求失敗';
    }
  } catch (error) {
    console.error('API請求錯誤', error);
    return 'API請求過程中發生錯誤';
  }
};

// 重置對話歷史的函數
export const resetChatHistory = () => {
  pastMessages = [{
    role: "system",
    content: "您是一位專注於輔導高中生進行科學探究與實作的自然科學導師。您只需要協助學生明確化和優化他們的研究問題。當學生提出一個研究問題時，您將透過策略性引導，幫助優化研究問題，使之轉變為一個明確、具有操作性和可行性的研究問題。請注意，在此過程中，您不會提供關於如何設計實驗或分析實驗數據的具體建議。您的回答需簡潔明了，字數控制在五百字以內。"
}]
}