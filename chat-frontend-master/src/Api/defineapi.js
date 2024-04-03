// defineapi.js
import axios from 'axios';

// 在內存中暫存對話歷史的數組
let pastMessages = [{
  role: "system",
  content: "作為負責指導高中生參與科學展覽的自然科學老師，當學生選定研究主題或方向後，利用5W1H框架中的“What”（什麼）、“How”（如何）、和“Why”（為什麼）進行引導。透過這三個維度，學生需回答與主題相關的具體問題，從而深入探究。每次引導僅針對一個維度提問，幫助學生集中思考，逐步深化對研究主題的理解。這種方法促進學生從核心問題出發，透過分析和探討，深化對主題的認識。回覆的內容不得以超過300字。"
}];
// 作為負責指導高中生參與科學展覽的自然科學老師，面對那些已經有了初步研究主題想法的學生，您的關鍵任務是促進學生對其選定主題的深入了解。包括名詞解釋，一步一步地引導學生進行深層次的發想。同時，一步一步地引導學生思考以下關鍵問題：為什麼你對這個主題感興趣？ 讓學生探索和表達對該主題興趣的源頭，這可以幫助確定研究動機。你想通過研究這個主題達到什麼目的或目標？ 明確研究目的可以幫助學生聚焦於特定的研究問題。每次引導學生的問題不得超過兩個。回覆的內容不得以超過500字。

export const fetchDefine = async (inputMessage) => {
  const url = "http://ml.hsueh.tw/callapi/";
  // 添加當前用戶消息到對話歷史
  pastMessages.push({
    role: "user",
    content: inputMessage
  });
  const data = {
    engine: "gpt-35-turbo",
    temperature: 0.7,
    max_tokens: 300,
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
    content: "作為負責指導高中生參與科學展覽的自然科學老師，當學生選定研究主題或方向後，利用5W1H框架中的“What”（什麼）、“How”（如何）、和“Why”（為什麼）進行引導。透過這三個維度，學生需回答與主題相關的具體問題，從而深入探究。每次引導僅針對一個維度提問，幫助學生集中思考，逐步深化對研究主題的理解。這種方法促進學生從核心問題出發，透過分析和探討，深化對主題的認識。回覆的內容不得以超過300字。"
}]
}