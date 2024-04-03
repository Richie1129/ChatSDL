import React, { useState } from "react";
import { Col, Container, Form, Row, Button } from "react-bootstrap";
import { useSignupUserMutation } from "../services/appApi";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";

function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [signupUser, { isLoading, error }] = useSignupUserMutation();
    const navigate = useNavigate();

    async function handleSignup(e) {
        e.preventDefault();
        // signup the user
        signupUser({ name, email, password }).then(({ data }) => {
            if (data) {
                console.log(data);
                navigate("/chat");
            }
        });
    }

    return (
        <Container>
            <Row>
                <Col md={7} className="d-flex align-items-center justify-content-center flex-direction-column">
                    <Form style={{ width: "80%", maxWidth: 500 }} onSubmit={handleSignup}>
                        <h1 className="text-center signup-heading">創建帳號</h1>
                        {error && <p className="alert alert-danger">{error.data}</p>}
                        <Form.Group className="mb-3" controlId="formBasicName">
                            <Form.Label>姓名</Form.Label>
                            <Form.Control type="text" placeholder="請輸入姓名" onChange={(e) => setName(e.target.value)} value={name} />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>電子郵件</Form.Label>
                            <Form.Control type="email" placeholder="請輸入電子郵件" onChange={(e) => setEmail(e.target.value)} value={email} />
                            <Form.Text className="text-muted">我們不會洩漏您的資訊！</Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>密碼</Form.Label>
                            <Form.Control type="password" placeholder="請輸入密碼" onChange={(e) => setPassword(e.target.value)} value={password} />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            {isLoading ? "正在註冊..." : "註冊"}
                        </Button>
                        <div className="py-4">
                            <p className="text-center">
                                已經有帳號！ <Link to="/login">登入</Link>
                            </p>
                        </div>
                    </Form>
                </Col>
                <Col md={5}></Col>
            </Row>
        </Container>
    );
}

export default Signup;

