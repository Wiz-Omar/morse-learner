import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

interface Props {

}

export const Header: React.FC<Props> = () => {
    return (
        <div>
            <Navbar bg="dark" data-bs-theme="dark" sticky="top">
                <Container>
                    <Navbar.Brand href="#home">Morse Learner</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link href="#home">Home</Nav.Link>
                        <Nav.Link href="#features">Features</Nav.Link>
                        <Nav.Link href="#pricing">Pricing</Nav.Link>
                    </Nav>
                </Container>
            </Navbar>
        </div>
    );
}