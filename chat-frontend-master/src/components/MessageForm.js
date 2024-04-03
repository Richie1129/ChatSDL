import { useNavigate } from 'react-router-dom';
import React, { useContext, useEffect, useRef, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import { AppContext } from "../context/appContext";
import "./MessageForm.css";
// import { useWordCloudMutation } from "../services/appApi";
import axios from 'axios';
import HandleClickInference from './handleClickInference';

// const { spawn } = require('child_process');

function MessageForm() {
    const [inferenceLoading, setInferenceLoading] = useState(false);
    const [inferenceData, setInferenceData] = useState(null); // 新增一個狀態 data
    const [wordcloudLoading, setWordcloudLoading] = useState(false);
    const [wordcloudData, setWordcloudData] = useState(null);// 新增一個狀態 data
    const [combineLoading, setCombineLoading] = useState(false);
    const [message, setMessage] = useState("");
    const user = useSelector((state) => state.user);
    const { socket, currentRoom, setMessages, messages, privateMemberMsg, showInferenceData, showWordcloudData } = useContext(AppContext);
    const messageEndRef = useRef(null);
    let navigate = useNavigate();

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    function getFormattedDate() {
        const date = new Date();
        const year = date.getFullYear();
        let month = (1 + date.getMonth()).toString();
        month = month.length > 1 ? month : "0" + month;
        let day = date.getDate().toString();
        day = day.length > 1 ? day : "0" + day;
        return month + "/" + day + "/" + year;
    }

    function handleSubmit(e) {
        e.preventDefault();
    }

    function scrollToBottom() {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    const todayDate = getFormattedDate();
    socket.off("room-messages").on("room-messages", (roomMessages) => {
        setMessages(roomMessages);
    });


    function handleSubmit(e) {
        e.preventDefault();
        if (!message) return;
        const today = new Date();
        const minutes = today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes();
        const time = today.getHours() + ":" + minutes;
        const roomId = currentRoom;
        socket.emit("message-room", roomId, message, user, time, todayDate);
        setMessage("");
    }

    //  Inference click
    async function handleClickInference() {
        try {
            setInferenceLoading(true);
            // const response = await axios.get('http://localhost:5001/admin/inference?to=' + currentRoom + "&user=" + user);

            const params = new URLSearchParams();
            params.append('to', currentRoom);
            params.append('user', JSON.stringify(user));

            const INF_response = await axios.get(`http://localhost:5001/admin/inference?${params.toString()}`);


            const data = INF_response;

            // console.log(typeof (data));
            const parsedData = data; // 將 string 轉換為物件
            console.log(parsedData); // 印出轉換後的物件

            setInferenceData(parsedData);
            setInferenceLoading(false);
            // 處理從後端獲取的資料
            console.log(typeof (parsedData));

            // 將資料傳遞並跳轉到另一個頁面

            showInferenceData(parsedData);



            navigate(`/inferenceResult?currentRoom=${currentRoom}`);

        } catch (error) {
            console.log(error);
            // 處理錯誤
        }
    }

    //  Wordcloud click
    async function handleClickWordcloud() {
        try {
            setWordcloudLoading(true);
            const WC_response = await axios.get('http://localhost:5001/admin/wordCloud?to=' + currentRoom);
            const { base64Image, imagePath } = WC_response.data;

            if (WC_response.data) {
                // response.data 有值
                const imagePath = WC_response.data; // 從後端獲取圖片路徑

                navigate('/wordcloudResult', { state: { base64Image, imagePath } });
            } else {
                // WC_response.data 為空或未定義
                console.log('WC_response data is empty');
            }

        } catch (error) {
            if (error.WC_response) {
                // 伺服器回傳錯誤狀態碼
                console.log('Server Error:', error.WC_response.status);
                console.log('Error WC_response:', error.WC_response.data);
            } else if (error.request) {
                // 請求已發出，但沒有收到回應
                console.log('No WC_response:', error.request);
            } else {
                // 發生錯誤時的其他情況
                console.log('Error:', error.message);
            }
        }
    }

    async function handleClickCombined() {
        try {
            setCombineLoading(true);
            const paramss = new URLSearchParams();
            paramss.append('to', currentRoom);
            paramss.append('user', JSON.stringify(user));

            const INF_response = await axios.get(`http://localhost:5001/admin/inference?${paramss.toString()}`);
            const WC_response = await axios.get('http://localhost:5001/admin/wordCloud?to=' + currentRoom);
            const { base64Image, imagePath } = WC_response.data;

            const WC_data = WC_response.data;
            const INF_data = INF_response;
            const INF_parsedData = INF_data; // 將 string 轉換為物件

            // console.log(INF_parsedData); // 印出轉換後的物件
            setInferenceData(INF_parsedData);
            setCombineLoading(false);
            showInferenceData(INF_parsedData);


            navigate(`/combineResult?currentRoom=${currentRoom}`, { state: { base64Image, imagePath } });


        } catch (error) {
            if (error.response) {
                console.log('Server Error:', error.response.status);
                console.log('Error response:', error.response.data);
            } else if (error.request) {
                console.log('No response:', error.request);
            } else {
                console.log('Error:', error.message);
            }
        }
    }


    return (
        <>
            <div className="messages-output">
                {user && !privateMemberMsg?._id && <div className="alert alert-info">You are in the {currentRoom} room</div>}
                {user && privateMemberMsg?._id && (
                    <>
                        <div className="alert alert-info conversation-info">
                            <div>
                                Your conversation with {privateMemberMsg.name} <img src={privateMemberMsg.picture} className="conversation-profile-pic" />
                            </div>
                        </div>
                    </>
                )}
                {!user && <div className="alert alert-danger">Please login</div>}

                {user &&
                    messages.map(({ _id: date, messagesByDate }, idx) => (
                        <div key={idx}>
                            <p className="alert alert-info text-center message-date-indicator">{date}</p>
                            {messagesByDate?.map(({ content, time, from: sender }, msgIdx) => (
                                <div className={sender?.email == user?.email ? "message" : "incoming-message"} key={msgIdx}>
                                    <div className="message-inner">
                                        <div className="d-flex align-items-center mb-3">
                                            <img src={sender.picture} style={{ width: 35, height: 35, objectFit: "cover", borderRadius: "50%", marginRight: 10 }} />
                                            <p className="message-sender">{sender._id == user?._id ? "You" : sender.name}</p>
                                        </div>
                                        <p className="message-content">{content}</p>
                                        <p className="message-timestamp-left">{time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                <div ref={messageEndRef} />
            </div>
            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col md={10}>
                        <Form.Group>
                            <Form.Control type="text" placeholder="Your message" disabled={!user} value={message} onChange={(e) => setMessage(e.target.value)}></Form.Control>
                        </Form.Group>
                    </Col>
                    <Col md={1}>
                        <Button variant="primary" type="submit" style={{ width: "100%", backgroundColor: "orange" }} disabled={!user}>
                            <i className="fas fa-paper-plane"></i>
                        </Button>
                    </Col>

                </Row>
                <Row>
                    <Col md={3}>
                        <Button variant="primary" onClick={handleClickInference} disabled={inferenceLoading}> {inferenceLoading ? 'Loading...' : 'INFERENCE'} </Button>
                    </Col>
                    {/* <HandleClickInference currentRoom={currentRoom} /> */}

                    <Col md={3}>
                        <Button variant="danger" onClick={handleClickWordcloud} disabled={wordcloudLoading}> {wordcloudLoading ? 'Loading...' : 'WORDCLOUD'} </Button>
                    </Col>

                    <Col md={3}>
                        <Button variant="success" onClick={handleClickCombined} disabled={combineLoading}> {combineLoading ? 'Loading...' : 'GENERATE'} </Button>
                    </Col>
                </Row>
            </Form>
        </>
    );
}

export default MessageForm;
