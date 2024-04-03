import axios from 'axios';

export const fetchTechCsv = async (inputMessage) => {
  const url = "http://ml.hsueh.tw:1287/query/";

  const data = {
    question: inputMessage,
    search_result: ""
  };

  const headers = {
    'accept': 'application/json',
    'Content-Type': 'application/json'
  };

  try {
    const response = await axios.post(url, data, { headers });
    if (response.status === 200 && response.data.response) {
      // 轉換search_contents成結構化的數據
      const searchContents = response.data.search_contents.map((content) => {
        if (typeof content === 'string' && content.includes('Link: ') && content.includes('Description: ')) {
          const [titlePart, linkPart] = content.split(' Link: ');
          const [link, description] = linkPart.split(' Description: ');
          return {
            title: titlePart.replace('Title: ', ''),
            link: link,
            description: description
          };
        } else {
          return {
            title: '無標題',
            link: '',
            description: '無描述'
          };
        }
      });

      return {
        response: response.data.response,
        searchContents: searchContents
      };
    } else {
      console.error('API請求失敗，狀態碼：', response.status);
      return { response: 'API請求失敗', searchContents: [] };
    }
  } catch (error) {
    console.error('API請求錯誤', error);
    return { response: 'API請求過程中發生錯誤', searchContents: [] };
  }
};

