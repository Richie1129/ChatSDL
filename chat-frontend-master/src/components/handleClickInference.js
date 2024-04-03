import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function HandleClickInference(props) {
    // 在組件中定義 useNavigate hook
    const navigate = useNavigate();

    const handleClickInference = async () => {
        try {
            const response = await axios.get('http://localhost:5001/admin/inference?to=' + props.currentRoom);
            const data = response.data;
            const parsedData = JSON.parse(data);
            console.log(parsedData);
            // 在事件處理函數中使用 navigate 方法進行頁面跳轉
            navigate('../pages/inferenceResult', { state: { parsedData } });
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <button onClick={handleClickInference}>推論</button>
    );
}

export default HandleClickInference;