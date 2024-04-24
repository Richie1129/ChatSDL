import axios from 'axios';

export const fetch5W1H = async (inputMessage) => {
  const url = "http://ml.hsueh.tw:1288/query/";

  const data = {
    question: inputMessage
  };

  const headers = {
    'accept': 'application/json',
    'Content-Type': 'application/json'
  };

  try {
    const response = await axios.post(url, data, { headers });
    if (response.status === 200) {
      // 從第一個API獲取的內容作為第二個API的輸入
      const content = response.data.response;  // 確保使用 data.response 獲取實際回應內容
      console.log(content)
      const url2 = "http://ml.hsueh.tw/callapi/";
      const data2 = {
        engine: "gpt-35-turbo",
        temperature: 0.7,
        max_tokens: 500,
        top_p: 0.95,
        top_k: 5,
        roles: [
          { role: "system", content: content },
          { role: "user", content: "你必須使用5W1H框架的問句，只要給我一個問題即可，不要包含任何答案。回答中不要提供任何答案。"}
        ],
        frequency_penalty: 0,
        repetition_penalty: 1.03,
        presence_penalty: 0,
        stop: "",
        past_messages: 10,
        purpose: "dev"
      };

      const response2 = await axios.post(url2, data2, { headers });
      console.log(response2)
      console.log(response2.data)
      if (response2.status === 200) {
        return response2.data;  // 根據需要調整這裡以返回特定的數據
      } else {
        console.error('第二個API請求失敗，狀態碼：', response2.status);
        return { error: '第二個API請求失敗' };
      }
    } else {
      console.error('第一個API請求失敗，狀態碼：', response.status);
      return { error: '第一個API請求失敗' };
    }
  } catch (error) {
    console.error('API請求錯誤', error);
    return { error: 'API請求過程中發生錯誤' };
  }
};