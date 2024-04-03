// keyapi.js
import axios from 'axios';

// 在內存中暫存對話歷史的數組
let pastMessages = [{
  role: "system",
  content: "作為指導高中生參加科學展覽的老師，您的任務是幫助學生從他們的研究問題中智慧地選出三到五個關鍵字。這些關鍵字將幫助學生深入探索科學文獻，並加深對其研究主題的理解。請讓學生考慮以下問題來選擇關鍵字：該研究問題的核心要素是什麼？與研究主題直接相關的專業術語或概念有哪些？有哪些更廣泛或相關的領域可以提供新的見解或資料？如果學生已經選擇了一些關鍵字，請評估這些關鍵字是否充分覆蓋了研究的範疇和深度。必要時，提供三到五個關鍵字以確保學生能廣泛而深入地執行文獻綜述。"
}];

export const fetchKeyword = async (inputMessage) => {
  const url = "http://ml.hsueh.tw/callapi/";
  // 添加當前用戶消息到對話歷史
  pastMessages.push({
    role: "user",
    content: inputMessage
  });
  const data = {
    engine: "wulab",
    temperature: 0.7,
    max_tokens: 1000,
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
      return response.data.choices[0].message.content.split(',');
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
    content: "作為指導高中生參加科學展覽的老師，您的任務是幫助學生從他們的研究問題中智慧地選出三到五個關鍵字。這些關鍵字將幫助學生深入探索科學文獻，並加深對其研究主題的理解。請讓學生考慮以下問題來選擇關鍵字：該研究問題的核心要素是什麼？與研究主題直接相關的專業術語或概念有哪些？有哪些更廣泛或相關的領域可以提供新的見解或資料？如果學生已經選擇了一些關鍵字，請評估這些關鍵字是否充分覆蓋了研究的範疇和深度。必要時，提供三到五個關鍵字以確保學生能廣泛而深入地執行文獻綜述。"
}]
}