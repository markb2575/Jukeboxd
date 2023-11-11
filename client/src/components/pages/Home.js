import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavbarComponent from "../routing/NavbarComponent";
import Card from 'react-bootstrap/Card';
import CardGroup from 'react-bootstrap/CardGroup';
import Container from "react-bootstrap/esm/Container";
import './Home.css'
// import Col from 'react-bootstrap/Col';
// import Row from 'react-bootstrap/Row';

function Home() {
    let navigate = useNavigate();
    const [getUsername, setUsername] = useState("");

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


    useEffect(() => {

    })

    return (
        <div>
            <NavbarComponent />
            <div className="header">
                <h2>Welcome back, {getUsername}</h2>
            </div>
            <Container>
                <h5>Recent activity from friends</h5>
                <CardGroup className="me-2">
                    <Card>
                        <Card.Img varient="top" src="https://i.scdn.co/image/ab67616d0000b27350bb7ca1fe7e98df87ce41d9" />
                        <Card.Footer>
                            <div>
                                <small>Username</small>
                            </div>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <small>Rating</small>
                                </div>
                                <div>
                                    <small>Date</small>
                                </div>
                            </div>
                        </Card.Footer>
                    </Card>

                    <Card>
                        <Card.Img varient="top" src="https://i.scdn.co/image/ab67616d0000b27350bb7ca1fe7e98df87ce41d9" />
                        <Card.Footer>
                            <div>
                                <small>Username</small>
                            </div>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <small>Rating</small>
                                </div>
                                <div>
                                    <small>Date</small>
                                </div>
                            </div>
                        </Card.Footer>
                    </Card>

                    <Card>
                        <Card.Img varient="top" src="https://i.scdn.co/image/ab67616d0000b27320280fde86d8cf0fea539b8e" />
                        <Card.Footer>
                            <div>
                                <small>Username</small>
                            </div>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <small>Rating</small>
                                </div>
                                <div>
                                    <small>Date</small>
                                </div>
                            </div>
                        </Card.Footer>
                    </Card>

                    <Card>

                    </Card>

                    <Card>

                    </Card>
                </CardGroup>
            </Container>

            {/*
            <Container>
                <h5>Popular Reviews</h5>
                <CardGroup className="me-2">
                    <Card>
                        <Card.Img varient="top" src="https://i.scdn.co/image/ab67616d0000b27350bb7ca1fe7e98df87ce41d9" />
                        <Card.Body>
                            test test test test test test test test test test test test test test test test test test test test test test test test
                        </Card.Body>
                        <Card.Footer>
                            <div>
                                <small>Username</small>
                            </div>
                            <div className="d-flex justify-content-between">
                            <div>
                                <small>Rating</small>
                            </div>
                            <div>
                                <small>Date</small>
                            </div>
                            </div>
                        </Card.Footer>
                    </Card>

                    <Card>
                        <Card.Img varient="top" src="https://i.scdn.co/image/ab67616d0000b27350bb7ca1fe7e98df87ce41d9" />
                        <Card.Body>
                            test test test test test test test test test test test test test test test test test test test test test test test test
                        </Card.Body>
                        <Card.Footer>
                            <div className="d-flex justify-content-between">
                            <div>
                                <small>Username</small>
                            </div>
                            <div>
                                <small>Rating</small>
                            </div>
                            <div>
                                <small>Date</small>
                            </div>
                            </div>
                        </Card.Footer>
                    </Card>

                    <Card>
                        <Card.Img varient="top" src="https://i.scdn.co/image/ab67616d0000b27320280fde86d8cf0fea539b8e" />
                        <Card.Body>
                            test test test test test test test test test test test test test test test test test test test test test test test test
                        </Card.Body>
                        <Card.Footer>
                            <div>
                                <small>Username</small>
                            </div>
                            <div className="d-flex justify-content-between">
                            <div>
                                <small>Rating</small>
                            </div>
                            <div>
                                <small>Date</small>
                            </div>
                            </div>
                        </Card.Footer>
                    </Card>
                    
                    <Card>
                        
                    </Card>

                    <Card>
                        
                    </Card>
                </CardGroup>
            </Container>
            */}

            {/*
            <Container>
                <Row xs={1} md={2} className="g-4">
                    {Array.from({ length: 4 }).map((_, idx) => (
                        <Col key={idx}>
                            <Card>
                                <Card.Img varient="top" src="https://i.scdn.co/image/ab67616d0000b27320280fde86d8cf0fea539b8e" />
                                <Card.Body>
                                    <Card.Title>Card title</Card.Title>
                                    <Card.Text>
                                        This is a longer card with supporting text below as a natural
                                        lead-in to additional content. This content is a little bit
                                        longer.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
            */}


        </div>

    );
}

export default Home;