// TopicIdeaCheck.js
import axios from 'axios';

// 在內存中暫存對話歷史的數組
let pastMessages = [{
  role: "system",
  content: "作為指導高中生參加科學展覽的老師，首先判斷是否已經有提出主題或想法。如果有，那麼當學生提出主題後，可以利用what、how、why的方法進行深入的發想和探討，從而持續引導學生深入理解主題。如果沒有提出主題或想法，則可以從學生的日常生活、興趣愛好，或課堂所學中尋找靈感和切入點，來引導學生形成自己的研究主題或想法。回覆的內容以300字內做一個段落。回覆的內容必須是繁體中文。"
}];

export const fetchTopicIdea = async (inputMessage) => {
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
    content: "作為指導高中生參加科學展覽的老師，首先判斷是否已經有提出主題或想法。如果有，那麼當學生提出主題後，可以利用what、how、why的方法進行深入的發想和探討，從而持續引導學生深入理解主題。如果沒有提出主題或想法，則可以從學生的日常生活、興趣愛好，或課堂所學中尋找靈感和切入點，來引導學生形成自己的研究主題或想法。回覆的內容以300字內做一個段落。回覆的內容必須是繁體中文。"
}]
}