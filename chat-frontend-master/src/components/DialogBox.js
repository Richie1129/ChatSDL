import React, { useState } from 'react';
import robotDrag from '../assets/robot-drag.png';
import wuretSdlnew from '../assets/Wuret+sdlnew.png';

function DialogBox({ onScaffoldClick }) {
  const scaffoldOptions = [
    '我想研究...',
    '我的研究問題是...?',
  ];

  const [showOptions, setShowOptions] = useState(false); // 控制鷹架選項和問候語的顯示狀態
  const [imageSrc, setImageSrc] = useState(wuretSdlnew); // 初始圖片

  // 點擊圖片時切換顯示鷹架選項和問候語
  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  // 鼠標懸停時更改圖片
  const handleMouseEnter = () => {
    setImageSrc(robotDrag);
  };

  // 鼠標離開時恢復原圖片
  const handleMouseLeave = () => {
    setImageSrc(wuretSdlnew);
  };

  return (
    <div className="dialog-box-container" style={{ textAlign: 'center' }}>
      <img 
        src={imageSrc} 
        alt="Robot" 
        onClick={toggleOptions}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ width: 90, height: 90, cursor: 'pointer' }} 
      />
      {showOptions && (
        <>
          <p>這裡是探究提問幫手</p>
          {scaffoldOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => onScaffoldClick(option)}
              style={{ display: '-ms-flexbox', margin: '10px auto', backgroundColor: '#5BA491', color: 'white', padding: '10px 20px', borderRadius: '20px' }} // 設定按鈕樣式
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
