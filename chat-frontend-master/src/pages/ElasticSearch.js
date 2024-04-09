import axios from 'axios';

const elasticsearch_url = "http://140.115.126.33:9200"; // Elasticsearch 伺服器地址
const index_name = "科展all"; // 索引名稱
const username = "elastic";
const password = "ytwu35415";

export const fetchElasticSearchResults = async (search_terms, topK = 5) => {
    try {
        const terms = search_terms.split('、'); // 使用“、”作為關鍵字分隔符
        const mustQueries = terms.map(term => ({
            bool: {
                should: [
                    { match_phrase: { "摘要": term.trim() } },
                    { match_phrase: { "關鍵字": term.trim() } }
                ],
                minimum_should_match: Math.ceil(terms.length * 0.2) // 確保至少有50%的關鍵詞匹配
            }
        }));

        const response = await axios.post(`${elasticsearch_url}/${index_name}/_search`, {
            query: {
                bool: {
                    must: mustQueries
                }
            },
            size: topK
        }, {
            auth: {
                username,
                password
            }
        });

        // 取得前 topK 個結果
        const hits = response.data.hits.hits;
        const topHits = hits.length > topK ? hits.slice(0, topK) : hits;

        // 將每個結果格式化為 HTML 字符串
        return topHits.map(hit => {
            const doc_source = hit._source;
            const link = doc_source["連結"] || "#"; // 如果沒有提供連結，則使用預設值
            return `科目: ${doc_source["科目"] || "未提供科目"}<br>` +
                `分數: ${hit['_score']}<br>` +
                `名稱: ${doc_source["名稱"] || "未提供名稱"}<br>` +
                `摘要: ${doc_source["摘要"] || "未提供摘要"}<br>` +
                `關鍵字: ${doc_source["關鍵字"] || "未提供關鍵詞"}<br>` +
                `連結: <a href="${link}" target="_blank">${link}</a>`; // 使用 <a> 標籤創建超連結
        });
    } catch (error) {
        console.error('Elasticsearch 查詢錯誤:', error);
        return [];
    }
};



// // ElasticSearch.js
// import axios from 'axios';

// const elasticsearch_url = "http://140.115.126.33:9200"; // Elasticsearch 伺服器地址
// const index_name = "科展test"; // 索引名稱
// const username = "elastic";
// const password = "ytwu35415";

// export const fetchElasticSearchResults = async (search_terms, topK = 5) => {
//     try {
//         const terms = search_terms.split('、'); // 使用“、”作為關鍵字分隔符
//         const mustQueries = terms.map(term => ({
//             bool: {
//                 should: [
//                     { match_phrase: { "column4": term.trim() } },
//                     { match_phrase: { "column5": term.trim() } }
//                 ],
//                 minimum_should_match: 1
//             }
//         }));

//         const response = await axios.post(`${elasticsearch_url}/${index_name}/_search`, {
//             query: {
//                 bool: {
//                     must: mustQueries
//                 }
//             },
//             size: topK
//         }, {
//             auth: {
//                 username,
//                 password
//             }
//         });

//         // 取得前 topK 個結果
//         const hits = response.data.hits.hits;
//         const topHits = hits.length > topK ? hits.slice(0, topK) : hits;

//         // 將每個結果格式化為字符串
//         return topHits.map(hit => {
//             const doc_source = hit._source;
//             return `科目: ${doc_source["column1"] || "未提供科目"}\n` +
//                    `分數: ${hit['_score']}\n` +
//                    `名稱: ${doc_source["column3"] || "未提供名稱"}\n` +
//                    `摘要: ${doc_source["column5"] || "未提供摘要"}\n` +
//                    `關鍵字: ${doc_source["column4"] || "未提供關鍵詞"}`;
//         });
//     } catch (error) {
//         console.error('Elasticsearch 查詢錯誤:', error);
//         return [];
//     }
// };