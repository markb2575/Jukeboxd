import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function Home() {
    let navigate = useNavigate();
    const [getUsername, setUsername] = useState("");
    const [searchString, setSearchString] = useState("");


    

    useEffect(() => {
        if (localStorage.token) {
            fetch('http://localhost:8080/user', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.token
                }
            }).then(response => {
                if (response.status !== 500) {
                    response.json().then(res => {
                        setUsername(res.username);
                    }).catch(e => {
                        console.log(e);
                    });
                } else {
                    console.log("invalid token");
                    navigate("/login");
                }
            });
        } else {
            navigate("/login");
        }
    }, [navigate]);

    const handleLogout = () => {
        // Clear the token from localStorage
        localStorage.removeItem("token");

        // Navigate to the login page after logging out
        navigate("/login");
    };

    const handleSearch = () => {
        // Use the searchString state when the "Submit" button is clicked
        console.log("Search String:", searchString);
        // You can perform other actions, like sending the search string to an API
        navigate("/search?q=" + searchString);
    };
    return (
        <div>
            <Navbar expand="lg" className="bg-body-tertiary">
                <Container>
                    <Navbar.Brand href="#home">Jukeboxd</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="/">Home</Nav.Link>
                            <Nav.Link > Placeholder</Nav.Link>
                            <Form inline>
                                <Row>
                                    <Col xs="auto">
                                        <Form.Control
                                            id="searchString"
                                            type="text"
                                            placeholder="Search"
                                            className=" mr-sm-2"
                                            value={searchString} // Bind the value to the state
                                            onChange={(e) => setSearchString(e.target.value)} // Update the state on change
                                        />
                                    </Col>
                                    <Col xs="auto">
                                        <Button type="submit" onClick={handleSearch}>Submit</Button>
                                    </Col>
                                </Row>
                            </Form>
                            <NavDropdown title={getUsername} id="basic-nav-dropdown">
                                <NavDropdown.Item href="/profile">Profile</NavDropdown.Item>
                                <NavDropdown.Item onClick={handleLogout}>
                                    Log Out
                                </NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <h1>Home Page</h1>



        </div>
    );
}

export default Home;
