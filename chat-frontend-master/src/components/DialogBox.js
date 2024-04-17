import React, { useState } from 'react';
import Lottie from "lottie-react";
import Robot from "../assets/Robot.json";

function DialogBox({ onScaffoldClick }) {
  const scaffoldOptions = [
    '我想研究...',
    '什麼是...?',
    '我對...感到好奇',
    '我想要了解',
    '我想要了解為什麼...?',
    '我還不知道要研究什麼',
    '我的研究問題是：... ?',
    '我想查詢相關作品：請輸入關鍵字',
  ];

  const [showOptions, setShowOptions] = useState(false); // 控制鷹架選項和問候語的顯示狀態
  const [counts, setCounts] = useState(Array(scaffoldOptions.length).fill(0)); // 初始化每個選項的點擊次數為0

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const handleScaffoldClick = (option, index) => {
    const newCounts = [...counts];
    newCounts[index]++; // 增加該選項的點擊次數
    setCounts(newCounts); // 更新點擊次數狀態
    
    // 創建一個字串來格式化輸出按鈕名稱和點擊次數
    const countsDisplay = scaffoldOptions.map((opt, idx) => `${opt}: ${newCounts[idx]}`).join(', ');
    console.log(`點擊次數更新: ${countsDisplay}`); // 在控制台輸出所有選項的點擊次數和名稱

    onScaffoldClick(option); // 執行傳入的onClick事件處理器
  };

  return (
    <div className="dialog-box-container" style={{ textAlign: 'justify', position: 'relative' }}>
      <div onClick={toggleOptions} style={{ cursor: 'pointer', width: '110px', height: '110px' }}>
        <Lottie animationData={Robot} style={{ width: '100%', height: '100%' }} />
      </div>
      {showOptions && (
        <div style={{ top: '100px'}}>
          <p>這裡是探究提問小幫手</p>
          {scaffoldOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => handleScaffoldClick(option, index)}
              style={{ display: '-ms-flexbox', margin: '5px auto', backgroundColor: '#5BA491', color: 'white', padding: '8px 16px', borderRadius: '20px' }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default DialogBox;
