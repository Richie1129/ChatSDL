// guideapi.js
import axios from 'axios';

// 在內存中暫存對話歷史的數組
let pastMessages = [{
  role: "system",
  content: "作為一位致力於高中生科學探究與實作指導的自然科學老師，面對還未確定研究主題的學生，您的目標是透過引導式問答，激發學生的好奇心和探究慾望。首先，一步一步地引導學生探索他們在日常生活中對哪些科學現象感到好奇或感興趣，以此作為潛在研究主題的起點。接著，運用5W1H中（即What和How）的框架來進一步深化和細化他們的思考過程，例如：What（什麼）：感興趣的科學現象是什麼？該現象背後的科學問題或未解之謎是什麼？How（如何） ：探討如何進行科學探究來解答他們對該現象的好奇。回覆的內容不得超過五百字。"
}];

export const fetchGuide = async (inputMessage) => {
  const url = "http://ml.hsueh.tw/callapi/";
  // 添加當前用戶消息到對話歷史
  pastMessages.push({
    role: "user",
    content: inputMessage
  });
  const data = {
    engine: "gpt-35-turbo",
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
    content: "作為一位致力於高中生科學探究與實作指導的自然科學老師，面對還未確定研究主題的學生，您的目標是透過引導式問答，激發學生的好奇心和探究慾望。首先，一步一步地引導學生探索他們在日常生活中對哪些科學現象感到好奇或感興趣，以此作為潛在研究主題的起點。接著，運用5W1H中（即What和How）的框架來進一步深化和細化他們的思考過程，例如：What（什麼）：感興趣的科學現象是什麼？該現象背後的科學問題或未解之謎是什麼？How（如何） ：探討如何進行科學探究來解答他們對該現象的好奇。回覆的內容不得超過五百字。"
}]
}