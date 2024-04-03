import React, { useContext, useState } from "react";
import { Col, Container, Form, Row, Button, Spinner } from "react-bootstrap";
import { useLoginUserMutation } from "../services/appApi";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import { AppContext } from "../context/appContext";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { socket } = useContext(AppContext);
    const [loginUser, { isLoading, error }] = useLoginUserMutation();
    function handleLogin(e) {
        e.preventDefault();
        // login logic
        loginUser({ email, password }).then(({ data }) => {
            if (data) {
                // socket work
                socket.emit("new-user");
                // navigate to the chat
                navigate("/chatroom");
            }
        });
    }
    // input 會接收 value 和 onChange 事件，如 input 輸入的值變更，setEmail 會將 email (State) 變更為新的值，以達成 input 雙向綁定
    return (
        <Container>
            <Row>
                <Col md={5} className="d-flex align-items-center justify-content-center">
                    <div className="embed-responsive embed-responsive-16by9">
                        <video className="embed-responsive-item" autoPlay loop muted>
                            <source src="https://cdn-icons-mp4.flaticon.com/512/8716/8716890.mp4" type="video/mp4" />
                        </video>
                    </div>
                </Col>
                <Col md={7} className="d-flex align-items-center justify-content-center flex-direction-column">
                    <Form style={{ width: "80%", maxWidth: 500 }} onSubmit={handleLogin}>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            {error && <p className="alert alert-danger">{error.data}</p>}
                            <Form.Label>電子郵件</Form.Label>
                            <Form.Control type="email" placeholder="請輸入電子郵件" onChange={(e) => setEmail(e.target.value)} value={email} required />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>密碼</Form.Label>
                            <Form.Control type="password" placeholder="請輸入密碼" onChange={(e) => setPassword(e.target.value)} value={password} required />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            {isLoading ? <Spinner animation="grow" /> : "登入"}
                        </Button>
                        <div className="py-4">
                            <p className="text-center">
                                還沒有帳號 ? <Link to="/signup">註冊</Link>
                            </p>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

export default Login;
