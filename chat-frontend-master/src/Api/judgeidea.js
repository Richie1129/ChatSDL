// judgeidea.js
import axios from 'axios';
import { fetchChatResponse } from './chatapi.js';
import { fetchTopicIdea } from './TopicIdeaCheck.js'; 
import { fetchResearchQuestion } from './ResearchQuestionCheck.js'; 
import { fetchQuestionCompleteness } from './QuestionCompletenessCheck.js'; 
import { fetchOptimizedQuestion } from './OptimizedQuestionCheck.js'; 
import { fetchKeywordExistence } from './KeywordExistenceCheck.js'; 
import { fetchKeywordQuality } from './KeywordQualityCheck.js'; 

let pastMessages = [{
  role: "system",
  content: "判斷inputMessage在哪個階段：\n" +
           "1.「主題確認相關」：result= '1'。\n" +
           "2.「研究問題評估相關」：result='2'。\n" +
           "3.「問題完整性檢查相關」：result='3'。\n" +
           "4.「優化問題確認相關」：result='4'。\n" +
           "5.「關鍵字存在性評估相關」：result='5'。\n" +
           "6.「關鍵字質量檢查相關」：result='6'"
}];

export const fetchJudgeIdea = async (inputMessage) => {
  const url = "http://ml.hsueh.tw/callapi/";
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
    roles: pastMessages,
    frequency_penalty: 0,
    repetition_penalty: 1.03,
    presence_penalty: 0,
    stop: "",
    past_messages: pastMessages.length,
    purpose: "dev"
  };
  const headers = {
    'accept': 'application/json',
    'Content-Type': 'application/json'
  };

  try {
    const response = await axios.post(url, data, { headers });
    if (response.status === 200 && response.data.choices && response.data.choices.length > 0) {
      const messageContent = response.data.choices[0].message.content;
      pastMessages.push({
        role: "system",
        content: messageContent
      });

      console.log('Result Content:', messageContent);
      console.log('Full Response:', response);

      if (messageContent.includes("主題確認")) {
        console.log("主題確認");
        return await fetchTopicIdea(inputMessage);
      } else if (messageContent.includes("研究問題")) {
        console.log("研究問題");
        return await fetchResearchQuestion(inputMessage);
      } else if (messageContent.includes("問題完整性")) {
        console.log("問題完整性");
        return await fetchQuestionCompleteness(inputMessage);
      } else if (messageContent.includes("優化問題確認")) {
        console.log("優化問題確認");
        return await fetchOptimizedQuestion(inputMessage);
      } else if (messageContent.includes("關鍵字存在性評估")) {
        console.log("關鍵字存在性評估");
        return await fetchKeywordExistence(inputMessage);
      } else if (messageContent.includes("關鍵字質量檢查")) {
        console.log("關鍵字質量檢查");
        return await fetchKeywordQuality(inputMessage);
      } else {
        console.log("其他");
        return await fetchChatResponse(inputMessage);
      }
    } else {
      console.error('API request failed, status code:', response.status);
      return 'API request failed';
    }
  } catch (error) {
    console.error('API request error', error);
    return 'Error occurred during API request';
  }
};

export const resetChatHistory = () => {
  pastMessages = [{
    role: "system",
    content: "判斷inputMessage在哪個階段：\n" +
             "1.「主題確認相關」：result= '1'。\n" +
             "2.「研究問題評估相關」：result='2'。\n" +
             "3.「問題完整性檢查相關」：result='3'。\n" +
             "4.「優化問題確認相關」：result='4'。\n" +
             "5.「關鍵字存在性評估相關」：result='5'。\n" +
             "6.「關鍵字質量檢查相關」：result='6'"
  }];
};
