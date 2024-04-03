import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AppContext } from "../context/appContext";
import { useContext } from "react";
import { useLocation } from 'react-router-dom';

function InferenceResult() {
    const { showinferenceData } = useContext(AppContext);
    const result = showinferenceData?.data;
    const location = useLocation();
    const currentRoom = new URLSearchParams(location.search).get('currentRoom');

    return (
        <Container className="mt-4">
            <Row>
                <Col md={{ span: 8, offset: 2 }}>
                    <Card>
                        <Card.Header className="bg-primary text-white">
                            <h4 className="mb-0"><strong>推論結果</strong></h4>
                        </Card.Header>
                        <Card.Body>
                            {result ? (
                                <ul className="list-unstyled mb-0">
                                    {result
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
                            <small className="text-muted">Inference Result by <strong>{currentRoom}</strong> room</small>
                            <Button as={Link} to="/chat" variant="secondary">返回上一頁</Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default InferenceResult;
