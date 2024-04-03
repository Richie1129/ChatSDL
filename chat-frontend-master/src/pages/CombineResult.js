import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AppContext } from "../context/appContext";
import { useContext } from "react";
import { useLocation } from 'react-router-dom';
import { useSelector } from "react-redux";
import Swal from 'sweetalert2';
import axios from 'axios';

function CombineResult() {
    const { showinferenceData } = useContext(AppContext);
    const infresult = showinferenceData?.data;
    const location = useLocation();
    const currentRoom = new URLSearchParams(location.search).get('currentRoom');
    const user = useSelector((state) => state.user);
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

    const handleSaveResult = () => {
        Swal.fire({
            title: '是否要將此次推論結果儲存？',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: '是',
            cancelButtonText: '否',
        }).then((result) => {
            if (result.isConfirmed) {
                const config = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                };

                const params = new URLSearchParams();
                params.append('to', currentRoom);
                params.append('user', JSON.stringify(user));
                params.append('imagesrc', base64imageSrc);
                params.append('infresult', infresult);

                axios.post('http://localhost:5001/admin/resultsave', params.toString(), config)
                    .then(() => {
                        Swal.fire('儲存成功', '', 'success');
                    })
                    .catch(() => {
                        Swal.fire('儲存失敗', '', 'error');
                    });
            }
        });
    };


    return (
        <Container className="mt-4">
            <Row>
                <Col md={{ span: 8, offset: 2 }}>
                    <Card>
                        <Card.Header className="bg-primary text-white">
                            <h4 className="mb-0"><strong>推論結果</strong></h4>
                        </Card.Header>
                        <Card.Body>
                            {infresult ? (
                                <ul className="list-unstyled mb-0">
                                    {infresult
                                        .replace(/\\r\\n/g, '')
                                        .replace(/\r?\n|\r/g, '')
                                        .split('.')
                                        .map((sentence, index) => (
                                            <li key={index} className="mb-3">
                                                <span className="text-muted"><strong>{sentence.trim()}</strong></span>
                                            </li>
                                        ))}
                                </ul>
                            ) : (
                                <p className="text-muted mb-0">沒有推論結果</p>
                            )}
                        </Card.Body>
                        <Card.Footer className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">InferenceCombine Result by <strong>{currentRoom}</strong> room</small>
                            <Button as={Link} to="/chat" variant="secondary">返回上一頁</Button>
                        </Card.Footer>
                    </Card>
                    <div className="mt-4">
                        <img src={base64imageSrc} alt="文字雲" className="img-fluid" />
                    </div>
                    <div className="mt-4">
                        <Button onClick={handleSaveResult}>儲存結果</Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default CombineResult;
