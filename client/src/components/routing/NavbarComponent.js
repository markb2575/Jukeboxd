import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

function NavbarComponent() {

    let navigate = useNavigate();
    const [searchString, setSearchString] = useState("");
    const [username, setUsername] = useState("");

    useEffect(() => {
        if (localStorage.token) {
            fetch('http://localhost:8080/user/', {
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

    const handleSearch = (e) => {
        e.preventDefault();
        const trimmedQuery = searchString.trim();
        if (trimmedQuery) {
            navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
        }
    };

    return (

        <Navbar expand="lg" className="bg-body-tertiary">
            <Container>
                <Navbar.Brand onClick={() => navigate("/")}>Jukeboxd</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse className="justify-content-end">
                    <Nav className="justify-content-end">
                        <Form className="d-flex" onSubmit={handleSearch}>

                            <Form.Control
                                id="searchString"
                                type="text"
                                placeholder="Search"
                                className="me-2"
                                value={searchString} // Bind the value to the state
                                onChange={(e) => setSearchString(e.target.value)} // Update the state on change
                            />

                            <Button type="submit" >Submit</Button>

                        </Form>
                        <NavDropdown title={username} id="basic-nav-dropdown">
                            <NavDropdown.Item onClick={() => navigate(`/user/${username}`, { replace: true })}>Profile</NavDropdown.Item>
                            <NavDropdown.Item onClick={handleLogout}>
                                Log Out
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>

    );
}

export default NavbarComponent;