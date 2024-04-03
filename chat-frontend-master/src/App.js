import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import Process from "./pages/Process";
import Statistics from "./pages/Statistics";
import AddTopic from "./pages/AddTopic";
import { useSelector } from "react-redux";
import { AppContext, socket } from "./context/appContext";
import InferenceResult from './pages/InferenceResult';
import WordcloudResult from "./pages/WordcloudResult";
import CombineResult from "./pages/CombineResult";
import ChatRoom from "./pages/ChatRoom";

function App() {
    const [rooms, setRooms] = useState([]);
    const [currentRoom, setCurrentRoom] = useState([]);
    const [members, setMembers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [privateMemberMsg, setPrivateMemberMsg] = useState({});
    const [newMessages, setNewMessages] = useState({});
    const user = useSelector((state) => state.user);
    const [showinferenceData, showInferenceData] = useState([]);

    const SecretKey = "20240116";
    const encrypt = (content, secretKey) => {
        let result = '';
        for (let i = 0; i < content.length; i++) {
            let charCode = content.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length);
            result += String.fromCharCode(charCode);
        }
        return btoa(result);
    };

    const [ipAddress, setIPAddress] = useState('');
    const userId = encrypt(ipAddress, SecretKey);

    useEffect(() => {
        fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => setIPAddress(data.ip))
            .catch(error => console.log(error));
    }, []);

    useEffect(() => {
        if (messages.length === 0) {
            setTimeout(() => {
                const defaultMessage = { id: 1, text: "嗨！我是一位專門輔導高中生科學探究與實作的自然科學導師。我會用適合高中生的語言，保持專業的同時，幫助你探索自然科學的奧秘，並引導你選擇一個有興趣的科展主題，以及更深入了解你的研究問題。今天我們來一起找出一個適合你的科學探究主題。準備好了嗎？還是你已經有的'主題'或是'想法'了嗎？", sender: 'Bot', className_p: "message_bot_p", className_span: "message_bot_span" };
                setMessages([defaultMessage]);
            }, 1000); // 延遲1000毫秒（1秒）
        }
    }, [messages]);

    const sendMessage = (message) => {
        if (message.trim() === "") return;

        const newMessage = { id: messages.length + 1, text: message, sender: 'Me', className_p: "message_user_p", className_span: "message_user_span" };
        setMessages(messages => [...messages, newMessage]);

        // Send message to Rasa
        const rasaEndpoint = 'http://localhost:5005/webhooks/rest/webhook'; // Update this URL if Rasa is running on a different server
        fetch(rasaEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message, sender: userId })
        })
            .then(response => response.json())
            .then(data => {
                data.forEach(message => {
                    setMessages(messages => [...messages, { id: messages.length + 1, text: message.text, sender: 'Bot', className_p: "message_bot_p", className_span: "message_bot_span" }]);
                });
            })
            .catch(error => console.error('Error:', error));
    };

    return (
        <AppContext.Provider value={{ socket, currentRoom, setCurrentRoom, members, setMembers, messages, setMessages, privateMemberMsg, setPrivateMemberMsg, rooms, setRooms, newMessages, setNewMessages, showinferenceData, showInferenceData }}>
            <BrowserRouter>
                <Navigation />
                <Routes>
                    <Route path="/" element={<Home />} />
                    {!user && (
                        <>
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                        </>
                    )}
                    <Route path="/chat" element={<ChatRoom />} />
                    <Route path="/process" element={<Process />} />
                    <Route path="/statistics" element={<Statistics />} />
                    <Route path="/addTopic" element={<AddTopic />} />
                    <Route path="/chatroom" element={<ChatRoom />} />
                    <Route path="/inferenceResult" props={InferenceResult} element={<InferenceResult />} />
                    <Route path="/wordcloudResult" props={WordcloudResult} element={<WordcloudResult />} />
                    <Route path="/combineResult" props={CombineResult} element={<CombineResult />} />
                </Routes>
            </BrowserRouter>
        </AppContext.Provider>
    );
}

export default App;
