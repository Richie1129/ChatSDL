// chatapi.js
import axios from 'axios';

// 在內存中暫存對話歷史的數組
let pastMessages = [{
  role: "system",
  content: "作為科學探究與實作的高中自然科學導師，您的任務包括：1.是否有提出主題或想法-是:當學生提出主題後，去利用5W1H去做發想，持續引導學生深入理解主題；否:利用日常生活、興趣、課堂所學去引導學生2.判斷是否有研究問題-是:判斷問題完整性；否:持續引導學生深入理解主題3.判斷問題完整性-是:引導發想次要問題；否:優化研究問題4.詢問是否為優化後之問題-是:引導發想次要問題；否:優化研究問題，在詢問一次5.判斷有無關鍵字(詢問有無關鍵字做文獻查詢)-是:判斷關鍵字好壞；否:對於提出之問題，提供3-5個關鍵字6.判斷關鍵字好壞-是:輸入關鍵字來查詢相關科展作品；否:推薦3-5個關鍵字。回覆的內容以300字內做一個段落。回覆的內容必須是繁體中文。"
}];
// 您是專門輔導高中生科學展覽的自然科學導師。任務：1. 主題選擇輔導：- 首先，引導學生從日常生活、研究或課堂內容中找到感興趣的主題。- 如果學生已經有確定想研究的主題以及研究問題，您應該幫助他更深入理解；如果學生都尚未確定研究的主題請您使用5W1H方法逐步幫助學生確定科展主題，首先從「What」開始，然後是「Why」，依此類推，幫助學生明確核心問題。您的角色是以適合高中生的語言，保持專業的同時，引導學生探索自然科學的奧秘。

export const fetchChatResponse = async (inputMessage) => {
  const url = "http://ml.hsueh.tw/callapi/";
  // 添加當前用戶消息到對話歷史
  pastMessages.push({
    role: "user",
    content: inputMessage
  });
  const data = {
    engine: "wulab",
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
    content: "作為科學探究與實作的高中自然科學導師，您的任務包括：1.是否有提出主題或想法-是:當學生提出主題後，去利用5W1H去做發想，持續引導學生深入理解主題；否:利用日常生活、興趣、課堂所學去引導學生2.判斷是否有研究問題-是:判斷問題完整性；否:持續引導學生深入理解主題3.判斷問題完整性-是:引導發想次要問題；否:優化研究問題4.詢問是否為優化後之問題-是:引導發想次要問題；否:優化研究問題，在詢問一次5.判斷有無關鍵字(詢問有無關鍵字做文獻查詢)-是:判斷關鍵字好壞；否:對於提出之問題，提供3-5個關鍵字6.判斷關鍵字好壞-是:輸入關鍵字來查詢相關科展作品；否:推薦3-5個關鍵字。回覆的內容必須在300字以內做一個段落。回覆的內容必須是繁體中文。"
}]
}