import React, { useState } from 'react';
import greetrobot from '../assets/greetrobot.png';

function DialogBox({ onScaffoldClick }) {
  const scaffoldOptions = [
    '我想研究...',
    '我對...感到好奇',
    '我想要了解為什麼...?',
    '我還不知道要研究什麼',
    '我的研究問題是...?',
    '我想查詢相關作品：請輸入關鍵字',
  ];

  const [showOptions, setShowOptions] = useState(false); // 控制鷹架選項和問候語的顯示狀態
  const [imageSrc, setImageSrc] = useState(greetrobot); // 初始圖片

  // 點擊圖片時切換顯示鷹架選項和問候語
  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  // // 鼠標懸停時更改圖片
  // const handleMouseEnter = () => {
  //   setImageSrc(robotDrag);
  // };

  // // 鼠標離開時恢復原圖片
  // const handleMouseLeave = () => {
  //   setImageSrc(robotDrag);
  // };

  return (
    <div className="dialog-box-container" style={{ textAlign: 'justify' }}> 
      <img 
        src={imageSrc} 
        alt="Robot" 
        onClick={toggleOptions}
        // onMouseEnter={handleMouseEnter}
        // onMouseLeave={handleMouseLeave}
        style={{ width: 90, height: 90, cursor: 'pointer' }} 
      />
      {showOptions && (
        <>
          <p>這裡是探究提問小幫手</p>
          {scaffoldOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => onScaffoldClick(option)}
              style={{ display: '-ms-flexbox', margin: '5px auto', backgroundColor: '#5BA491', color: 'white', padding: '8px 16px', borderRadius: '20px' }} // 設定按鈕樣式
            >
              {option}
            </button>
          ))}
        </>
      )}
    </div>
  );
}

export default DialogBox;
