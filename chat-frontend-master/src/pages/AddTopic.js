import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import "./AddTopic.css";

function AddTopic() {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");

    const generatePassword = () => {
        const newPassword = Math.floor(Math.random() * 90000) + 10000;
        setPassword(newPassword.toString());
    };

    const handleNameChange = (e) => {
        setName(e.target.value);
    };


    const handleSubmit = (e) => {
        e.preventDefault();

        Swal.fire({
            title: '確定要創立該議題?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '確定',
            cancelButtonText: '取消',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                // 處理表單提交逻辑
                const formData = {
                    topicName: name,
                    roomKey: password,
                };
                axios.post('http://localhost:5001/admin/topics', formData)
                    .then((response) => {
                        // 成功處理回應
                        Swal.fire('成功', '議題創建成功', 'success');
                        // 重置表單
                        setName('');
                        setPassword('');
                    })
                    .catch((error) => {
                        // 處理錯誤回應
                        Swal.fire('錯誤', '發生錯誤，無法創建議題', 'error');
                        console.error(error);
                    });
            }
        });
    };

    return (
        <Container className="add-topic-container">
            <Row>
                <Col md={4}>
                    <Sidebar />
                </Col>
                <Col md={8} className="add-topic-form">
                    <h2>Add Topic</h2>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formName" className="mb-3">
                            <Form.Label>Topic Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter name"
                                value={name}
                                onChange={handleNameChange}
                            />
                        </Form.Group>

                        <Form.Group controlId="formPassword" className="mb-3">
                            <Form.Label>Room Key</Form.Label>
                            <Row>
                                <Col sm={12}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Auto-generated password"
                                        value={password}
                                        readOnly
                                    />
                                </Col>
                            </Row>
                        </Form.Group>

                        <Row className="add-topic-button-row">
                            <Col sm={6} className="d-flex">
                                <Button
                                    variant="secondary"
                                    onClick={generatePassword}
                                    className="flex-grow-1"
                                >
                                    Generate Password
                                </Button>
                            </Col>
                            <Col sm={6} className="d-flex">
                                <Button variant="primary" type="submit" className="flex-grow-1">
                                    Submit
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

export default AddTopic;
