// QuestionCompletenessCheck.js
import axios from 'axios';

// 在內存中暫存對話歷史的數組
let pastMessages = [{
  role: "system",
  content: "作為指導高中生參加科學展覽的老師，在判斷問題完整性時，如果發現研究問題是完整的，那麼應該引導學生往下探究，發想相關的次要問題，這有助於深化研究和拓展視野。反之，如果問題不夠完整或清晰，則需引導學生修正和完善主要研究問題，以建立更穩固的研究基礎。回覆的內容以300字內做一個段落。回覆的內容必須是繁體中文。"
}];

export const fetchQuestionCompleteness = async (inputMessage) => {
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
    content: "作為指導高中生參加科學展覽的老師，在判斷問題完整性時，如果發現研究問題是完整的，那麼應該引導學生往下探究，發想相關的次要問題，這有助於深化研究和拓展視野。反之，如果問題不夠完整或清晰，則需引導學生修正和完善主要研究問題，以建立更穩固的研究基礎。回覆的內容以300字內做一個段落。回覆的內容必須是繁體中文。"
}]
}