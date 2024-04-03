// ChatRoom.js

import React, { useState, useContext } from 'react';
import { useSelector } from "react-redux";
import { FaUser } from 'react-icons/fa';
import { fetchElasticSearchResults } from './ElasticSearch'; // 引入查詢函數
import { AppContext } from "../context/appContext";
import Swal from 'sweetalert2'
import './ChatRoom.css';
import { fetchTechCsv } from '../Api/techcsv';
import DialogBox from '../components/DialogBox'

const ChatRoom = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [selectedOption, setSelectedOption] = useState('');
    const [tempMessage, setTempMessage] = useState(''); // 用於短期顯示的提示信息
    const { socket } = useContext(AppContext);
    const user = useSelector((state) => state.user);

    const handleSendMessage = async () => {
        if (inputMessage.trim() !== '') { 
            const messageData = {
                role: 'user',
                content: inputMessage,
                time: new Date().toLocaleTimeString(),
                date: new Date().toLocaleDateString(),
                from: user,
                optionText: selectedOption
            };
    
            // 這裡的 'chat-message' 需要與後端監聽的事件名稱一致
            socket.emit('chat-message', messageData); 
            // 更新 messages 狀態以包括新消息
            setMessages(messages => [...messages, { 
              text: inputMessage, 
              type: 'user', 
              time: messageData.time, 
              date: messageData.date,
              optionText: selectedOption
            }]);
            // 清空輸入框
            setInputMessage('');

            if (selectedOption === '相關科展作品') {
                const searchResults = await fetchElasticSearchResults(inputMessage);
                if (Array.isArray(searchResults)) {
                    searchResults.forEach(result => {
                        setMessages(currentMessages => [...currentMessages, { text: result, type: 'response' }]);
                    });
                } else {
                    console.error('返回的數據不是陣列');
                }
            } else if (selectedOption === '關鍵字檢索') {
                const techResult = await fetchTechCsv(inputMessage);
                if (techResult.response && techResult.response !== 'API請求失敗' && techResult.response !== 'API請求過程中發生錯誤') {
                    setMessages(currentMessages => [
                        ...currentMessages, 
                        { text: techResult.response, type: 'response' } // 添加回應文本
                    ]);
                    setMessages(currentMessages => [
                        ...currentMessages,
                        { text: '以下來自科技大觀園的相關資訊...', type: 'response' }
                    ]);
                    techResult.searchContents.forEach(content => {
                        setMessages(currentMessages => [
                            ...currentMessages, 
                            { 
                                text: `${content.title}\n${content.link}\n${content.description}`, 
                                type: 'response',
                                link: content.link // 保存連結用於後續渲染超連結
                            }
                        ]);
                    });
                } else {
                    console.error('API請求失敗或發生錯誤');
                } 
            //     // 儲存研究問題並詢問是否有關鍵字
            //     setResearchQuestion(inputMessage);
            //     setMessages(currentMessages => [...currentMessages, 
            //         { text: `你的研究問題: ${inputMessage}`, type: 'response' },
            //         { text: "那你已經有關鍵字來做文獻查詢了嗎？(有/無)", type: 'response' }
            //     ]);
            //     setAskingForKeywords(true); // 開始詢問是否有關鍵字
            // } else if (askingForKeywords) {
            //     if (inputMessage.trim().toLowerCase() === '有') {
            //         setMessages(currentMessages => [...currentMessages, { text: "請輸入你的關鍵字，讓我們來看看你的關鍵字是否合適。", type: 'response' }]);
            //         setAskingForKeywords(false); // 重置，等待關鍵字輸入
                    
                    
            //     } else if (inputMessage.trim().toLowerCase() === '無'||'沒有'||'還沒有'||'沒') {
            //         // 如果用戶沒有準備好關鍵字，使用研究問題調用API
            //         setMessages(currentMessages => [...currentMessages, { text: "正在使用你的研究問題尋找關鍵字...", type: 'response' }]);
                //     const keywordResults = await fetchKeyword(inputMessage); // 使用研究問題調用API
                //     if (Array.isArray(keywordResults) && keywordResults.length > 0) {
                //         keywordResults.forEach(result => {
                //             setMessages(currentMessages => [...currentMessages, { text: result.trim(), type: 'response' }]);
                //         });
                //         setMessages(currentMessages => [...currentMessages, { text: "希望這些關鍵字能幫助你查詢相關文獻！", type: 'response' }]);
                // //     } else {
                // //         // 處理錯誤或無回應的情況
                // //         setMessages(currentMessages => [...currentMessages, { text: "無法獲取關鍵字，請稍後再試。", type: 'error' }]);
                // //     }
                // //     setAskingForKeywords(false); // 重置狀態，以便進行下一步操作
                // // }
                // // setSelectedOption(''); // 重置用戶選擇，以便重新開始流程
                // }
            } else if (selectedOption === '探究主題') {
                const rasaEndpoint = 'http://localhost:5005/webhooks/rest/webhook';
                try {
                    const response = await fetch(rasaEndpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ message: inputMessage, sender: 'user' })
                    });
                    const rasaMessages = await response.json();
                     // // 處理API回應
                        // if (response && response.trim() !== '') {
                        //     const responseMessageData = {
                        //         role: 'assistant',
                        //         content: response,
                        //         time: new Date().toLocaleTimeString(),
                        //         date: new Date().toLocaleDateString()
                        //     };

                        //     // 發送API回應消息到後端
                        //     socket.emit('chat-message', responseMessageData);

                        //     // 更新 messages 狀態以包括API回應的消息
                        //     setMessages(currentMessages => [...currentMessages, {...responseMessageData, text: response, type: 'response'}]);
                        // }
                    // 將 Rasa 回應的訊息進行分段處理並添加到聊天室 UI
                    rasaMessages.forEach(message => {
                        // 分段處理
                        const splitMessages = message.text.split('\n').filter(msg => msg.trim() !== '');
                        splitMessages.forEach(msg => {
                            setMessages(currentMessages => [...currentMessages, { text: msg, type: 'response' }]);
                        });
            
                        const responseMessageData = {
                            role: 'assistant',
                            content: message.text,
                            time: new Date().toLocaleTimeString(),
                            date: new Date().toLocaleDateString()
                        };
                        
                        // 儲存對話資料到後端或數據庫
                        socket.emit('chat-message', responseMessageData);
                    });
                } catch (error) {
                    console.error('與 Rasa 通信過程中出現錯誤：', error);
                }
            }
            
        }
    };

    const handleInputKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const handleOptionSelect = (option) => {
        console.log("選擇的選項:", option);
        let optionText = "";
        let welcomeMessage = "";
        switch (option) {
            case "option1":
                optionText = "探究主題";
                Swal.fire({
                    title: "尋找探究主題",
                    text: "在這邊你可以探索你有興趣或是想研究的探究主題！",
                    icon: "info"
                  });
                welcomeMessage = "嗨！我是一位專門輔導高中生科學探究與實作的自然科學導師。我會用適合高中生的語言，保持專業的同時，幫助你探索自然科學的奧秘，並引導你選擇一個有興趣的科展主題，以及更深入了解你的研究問題。今天我們來一起找出一個適合你的科學探究主題。準備好了嗎？還是你已經有的'主題'或是'想法'了嗎？";
                break;
            case "option2":
                optionText = "關鍵字檢索";
                Swal.fire({
                    title: "檢索關鍵字",
                    text: "在這邊你可以查詢有關於你研究問題或是主題相關的關鍵字！",
                    icon: "info"
                  });
                  welcomeMessage = "嗨，當你在科學探究與實做到這個階段，你可能需要利用你的研究主題或是研究問題，找出適合的關鍵字來尋找相關科展作品或是找出其他的文獻資料，來做為你科學探究與實作的靈感。首先請你先直接輸入你的研究問題！";
                break;
            case "option3":
                optionText = "相關科展作品";
                Swal.fire({
                    title: "查詢相關科展作品",
                    text: "在這邊你可以查詢的相關科展作品，直接輸入關鍵字即可！",
                    icon: "info"
                  });
                welcomeMessage = "這個功能可以幫助你利用關鍵字來找尋相關科展作品，來給你參考其他人對於你選定的主題會怎麼做，希望這會給你帶來靈感，直接輸入關鍵字即可！如果想查詢多個關鍵字請用 '、' 分開！";
                  break;
            default:
                optionText = "";
        }
        setSelectedOption(optionText);
        setMessages([]); // 清空現有訊息
        if (welcomeMessage) {
            // 使用setTimeout延遲訊息的顯示
            setTimeout(() => {
                setMessages([{ text: welcomeMessage, type: 'response', time: new Date().toLocaleTimeString(), date: new Date().toLocaleDateString() }]);
            }, 1000); // 延遲500毫秒
        }
        setTempMessage(optionText); // 設置短期顯示的提示信息
    };
    
    return (
        
        <div className="chat-room">
            <div className="left-panel">
            
            <div className="chatroom-intro">
            <h1>科學探究與實作學習平台</h1>
            <h2>聊天室介紹</h2>
                <p>歡迎來到專為高中生設計的科學探究與實作聊天室！這裡聚焦於高中生在科學探究學習中的過程，特別關注「科學探究能力」和「自我導向學習傾向」。</p>
                <p>在這個平台上，我們鼓勵學生通過日常生活、科學研究或課堂所學啟發，找到並深入探討他們感興趣的科學主題。</p>
                <h5>在「科學探究與實作」中，你們將學習到什麼呢？</h5>
                <p>1. 發現問題：學習從日常生活中觀察現象，提出問題。這是科學探究的起點，每一項偉大的科學發現都始於一個簡單的問題。</p>
                <p>2. 探究問題：通過實驗、研究和分析來尋找問題的答案。你將學會如何設計實驗、收集數據並從中得出結論。</p>
                <p>3. 批判思考與創新：鼓勵你們對現有知識提出質疑，並嘗試創新方法解決問題。這不僅僅是學習知識，更是培養獨立思考和創新能力。</p>
            </div>
                <div className="options">                
                    <button onClick={() => handleOptionSelect("option1")}>探究主題</button>
                    <button onClick={() => handleOptionSelect("option2")}>關鍵字檢索</button>
                    <button onClick={() => handleOptionSelect("option3")}>相關科展作品</button>
                </div>
                <div>
                    <DialogBox onScaffoldClick={setInputMessage} />
                </div>
            </div>
            <div className="right-panel">
                <div className="selected-option">{selectedOption}</div>
                {tempMessage && <div className="temp-message">{tempMessage}</div>}
                <div className="messages">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.type === 'user' ? 'user-message' : 'response-message'}`}>
                        {message.type === 'user' && <FaUser className="user-icon" />}
                        <div className="message-content">
                            {message.link ? (
                                <>
                                    <div>{message.text.split('\n')[0]}</div>
                                    <a href={message.link} target="_blank" rel="noopener noreferrer">{message.link}</a>
                                    <div>{message.text.split('\n').slice(2).join('\n')}</div>
                                </>
                            ) : (
                                message.text
                            )}
                        </div>
                    </div>
                ))}
                </div>
                <div className="message-input">
                    <FaUser className="user-icon" />
                    <input
                        type="text"
                        value={inputMessage}
                        placeholder='請輸入訊息...'
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleInputKeyPress}
                    />
                    <button onClick={handleSendMessage}>發送</button>
                </div>
            </div>
        </div>
    );
};

export default ChatRoom;
