// ResearchQuestionCheck.js
import axios from 'axios';

// 在內存中暫存對話歷史的數組
let pastMessages = [{
  role: "system",
  content: "作為指導高中生參加科學展覽的老師，判斷學生是否已經擬定了研究問題。如果是，則進一步評估這個問題的完整性和深度。如果問題已經很完整，可以引導學生思考和發展次要問題，以豐富研究的層次和內容。若問題不夠完整，則需要幫助學生優化和精煉他們的研究問題，使之更加具體和明確。回覆的內容以300字內做一個段落。回覆的內容必須是繁體中文。"
}];

export const fetchResearchQuestion = async (inputMessage) => {
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
    content: "作為指導高中生參加科學展覽的老師，判斷學生是否已經擬定了研究問題。如果是，則進一步評估這個問題的完整性和深度。如果問題已經很完整，可以引導學生思考和發展次要問題，以豐富研究的層次和內容。若問題不夠完整，則需要幫助學生優化和精煉他們的研究問題，使之更加具體和明確。回覆的內容以300字內做一個段落。回覆的內容必須是繁體中文。"
}]
}