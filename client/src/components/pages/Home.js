import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import NavbarComponent from "../routing/NavbarComponent";
import Card from 'react-bootstrap/Card';
import CardGroup from 'react-bootstrap/CardGroup';
import Container from "react-bootstrap/esm/Container";
import './Home.css'
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { IoStar } from "react-icons/io5";

function Home() {
    let navigate = useNavigate();
    const [getUsername, setUsername] = useState("");
    const [reviews, setReviews] = useState(null)
    const [ratings, setRatings] = useState(null)
    const [reviewsExist, setReviewsExist] = useState(false)
    const [ratingsExist, setRatingsExist] = useState(false)

    const getHome = useCallback(() => {

        fetch(`http://localhost:8080/user/getHome/${getUsername}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        }).then(response => {
            if (response.status === 200) {
                response.json().then(res => {
                    if (res.reviews.length !== 0) {
                        setReviews(res.reviews)
                        setReviewsExist(true)
                    }
                    if (res.ratings.length !== 0) {
                        setRatings(res.ratings)
                        setRatingsExist(true)
                    }
                }).catch(e => {
                    console.log(e);
                });
            } else {
                console.log("something happened")
            }
        }).catch(error => console.error(error));
    }, [getUsername])

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
                        getHome()

                        /*

                        fetch(`http://localhost:8080/user/getHome/${getUsername}`, {
                            method: 'GET',
                            headers: { 'Content-Type': 'application/json' }
                        }).then(response => {
                            if (response.status === 200) {
                                response.json().then(res => {
                                    if (res.reviews.length !== 0) {
                                        setReviews(res.reviews)
                                        setReviewsExist(true)
                                    }
                                    if (res.ratings.length !== 0) {
                                        setRatings(res.ratings)
                                        setRatingsExist(true)
                                    }
                                }).catch(e => {
                                    console.log(e);
                                });
                            } else {
                                console.log("something happened")
                            }
                        }).catch(error => console.error(error));
                        */
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
    }, [navigate, getHome]);

    function convertMariaDBDatetimeToLocalTime(mariaDBDatetime) {
        // Create a Date object from the MariaDB datetime string
        const datetimeObject = new Date(mariaDBDatetime);

        // Format the datetime in your local timezone
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short',
        };

        return datetimeObject.toLocaleString(undefined, options);
    }

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


                <Row>
                    <div className="header">
                        <h3>Reviews:</h3>
                    </div>
                    <div>
                        {reviewsExist ?

                            <Row xs={1} md={1} className="g-4">

                                {reviews.map((result, idx) => (
                                    <Col key={idx}>
                                        <Card>
                                            <Card.Header>Reviewed by <Link to={`/user/${result.username}`}>{result.username}</Link> </Card.Header>
                                            <Card.Body>
                                                <Card.Text>
                                                    {result.review}
                                                </Card.Text>
                                            </Card.Body>
                                            <Card.Footer>{convertMariaDBDatetimeToLocalTime(result.datetime)}</Card.Footer>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>

                            :
                            <div>No reviews exist yet</div>}
                    </div>
                </Row>
            </Container>
        </div>

    );
}

/*
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
    </div>

);
}
*/

export default Home;