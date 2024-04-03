// KeywordQualityCheck.js
import axios from 'axios';

// 在內存中暫存對話歷史的數組
let pastMessages = [{
  role: "system",
  content: "作為指導高中生參加科學展覽的老師，評估學生選定的關鍵字是否適合進行文獻查詢。如果關鍵字適合，則可使用這些關鍵字進行科學研究或尋找相關科展作品。如果關鍵字不適合，則提供3-5個推薦的關鍵字，幫助學生更有效地進行文獻查詢。回覆的內容以300字內做一個段落。回覆的內容必須是繁體中文。"
}];

export const fetchKeywordQuality = async (inputMessage) => {
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
    content: "評估學生選定的關鍵字是否適合進行文獻查詢。如果關鍵字適合，則可使用這些關鍵字進行科學研究或尋找相關科展作品。如果關鍵字不適合，則提供3-5個推薦的關鍵字，幫助學生更有效地進行文獻查詢。回覆的內容以300字內做一個段落。回覆的內容必須是繁體中文。"
}]
}