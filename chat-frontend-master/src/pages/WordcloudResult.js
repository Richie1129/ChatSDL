import React from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

function WordcloudResult() {
    const location = useLocation();
    const { state } = location;
    const { base64Image, imagePath } = state || {};
    let base64imageSrc = '';

    if (imagePath) {
        // 將圖片路徑作為 base64 字符串設定給圖片的 src 屬性
        base64imageSrc = `data:image/png;base64,${base64Image}`;
    } else {
        // 處理 imagePath 未定義的情況，例如導向其他頁面或顯示錯誤訊息
        return <div>找不到圖片路徑</div>;
    }

    return (
        <div>
            <img src={base64imageSrc} alt="文字雲" />
            <Link to="/">返回</Link>
        </div>
    );
}

export default WordcloudResult;