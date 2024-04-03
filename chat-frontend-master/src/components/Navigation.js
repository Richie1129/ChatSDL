import React from "react";
import { Nav, Navbar, Container, Button, NavDropdown } from "react-bootstrap";
import { useLogoutUserMutation } from "../services/appApi";
import { useSelector } from "react-redux";
import { LinkContainer } from "react-router-bootstrap";
import logo from "../assets/scientific-inquiry.png";
import "./Navigation.css";

function Navigation() {
    const user = useSelector((state) => state.user);
    const [logoutUser] = useLogoutUserMutation();

    async function handleLogout(e) {
        e.preventDefault();
        await logoutUser(user);
        // redirect to home page
        window.location.replace("/");
    }

    return (
        <Navbar expand="lg" className="navbar-custom">
            <Container>
                <LinkContainer to="/">
                    <Navbar.Brand>
                        <img src={logo} alt="Logo" className="navbar-logo" />
                    </Navbar.Brand>
                </LinkContainer>
                <Navbar.Toggle aria-controls="basic-navbar-nav" className="navbar-toggle" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        {!user && (
                            <LinkContainer to="/login">
                                <Nav.Link className="navbar-link">Login</Nav.Link>
                            </LinkContainer>
                        )}
                        {/* <LinkContainer to="/Statistics">
                            <Nav.Link>Statistics</Nav.Link>
                        </LinkContainer> */}
                        {/* <LinkContainer to="/addTopic">
                            <Nav.Link className="navbar-link">Add Topic</Nav.Link>
                        </LinkContainer> */}
                        {/* <LinkContainer>
                            <Nav.Link className="navbar-link ">歷史紀錄</Nav.Link>
                        </LinkContainer> */}
                        <LinkContainer to="/chat">
                            <Nav.Link className="navbar-link ">聊天室</Nav.Link>
                        </LinkContainer>
                        {/* <LinkContainer to="/visgraph">
                            <Nav.Link className="navbar-link ">想法牆</Nav.Link>
                        </LinkContainer> */}
                        {/* <LinkContainer to="/Process">
                            <Nav.Link className="navbar-link">Process</Nav.Link>
                        </LinkContainer> */}
                        {user && (
                            <NavDropdown
                                title={
                                    <>
                                        {/* <img src={user.picture} alt="User" className="navbar-user-image" /> */}
                                        {user.name}
                                    </>
                                }
                                id="basic-nav-dropdown"
                                align="end"
                                className="navbar-dropdown"
                            >
                                <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                                <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                                <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item>
                                    <Button variant="danger" onClick={handleLogout} className="navbar-logout-button">
                                        Logout
                                    </Button>
                                </NavDropdown.Item>
                            </NavDropdown>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Navigation;
