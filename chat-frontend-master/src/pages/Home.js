import React from "react";
import { Row, Col, Button } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { TypeAnimation } from 'react-type-animation';
import "./Home.css";

function Home() {
    return (
        <Row>
            <Col md={6} className="d-flex flex-column align-items-center justify-content-center">
                <div className="text-center">
                    <h1>自主科學探究與實作平台</h1>
                    <p>這裡聚焦於幫助高中生在科學探究學習。</p>
                    <p>特別關注「科學探究能力」和「自我導向學習傾向」。</p>
                    <LinkContainer to="/chat">
                        <Button variant="success">
                            開始聊天吧 <i className="fas fa-comments home-message-icon"></i>
                        </Button>
                    </LinkContainer>
                </div>
            </Col>
            <Col md={6} className="d-flex align-items-center justify-content-center">
                <div className="embed-responsive embed-responsive-16by9">
                    <video className="embed-responsive-item" autoPlay loop muted>
                        <source src="https://cdn-icons-mp4.flaticon.com/512/8716/8716905.mp4" type="video/mp4" />
                    </video>
                </div>
            </Col>
        </Row>
    );
}

export default Home;
