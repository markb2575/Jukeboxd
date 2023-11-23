import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import NavbarComponent from "../routing/NavbarComponent";
import Card from 'react-bootstrap/Card';
import CardGroup from 'react-bootstrap/CardGroup';
import Container from "react-bootstrap/esm/Container";
import './Home.css'
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { IoStar, IoStarOutline } from "react-icons/io5";

function Home({ username }) {
    let navigate = useNavigate();
    const [getUsername, setUsername] = useState("");
    const [ratingsFromFriends, setRatingsFromFriends] = useState(null)
    //const [ratingsFromFriendsExist, setRatingsFromFriendsExist] = useState(false)
    const [reviewsFromFriends, setReviewsFromFriends] = useState(null)
    const [reviewsFromFriendsExist, setReviewsFromFriendsExist] = useState(false)
    const [reviews, setReviews] = useState(null)
    const [reviewsExist, setReviewsExist] = useState(false)
    const [popular, setPopular] = useState(null)
    //const [popularExists, setPopularExists] = useState(false)

    const [displayFriendActivity, setDisplayFriendActivity] = useState(false)
    const [displayPopular, setDisplayPopular] = useState(false)

    const getHome = useCallback((user) => {

        fetch(`http://localhost:8080/user/getHome/${user}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        }).then(response => {
            if (response.status === 200) {
                response.json().then(res => {
                    if (res.ratingsFromFriends.length !== 0) {
                        setRatingsFromFriends(res.ratingsFromFriends)
                        //setRatingsFromFriendsExist(true)
                        if (res.ratingsFromFriends.length > 2) {
                            setDisplayFriendActivity(true)
                        } else {
                            setDisplayFriendActivity(false)
                        }
                    } else {
                        setRatingsFromFriends(null)
                        //setRatingsFromFriendsExist(false)
                        setDisplayFriendActivity(false)
                    }
                    if (res.reviewsFromFriends.length !== 0) {
                        setReviewsFromFriends(res.reviewsFromFriends)
                        setReviewsFromFriendsExist(true)
                    } else {
                        setReviewsFromFriends(null)
                        setReviewsFromFriendsExist(false)
                    }
                    if (res.reviews.length !== 0) {
                        setReviews(res.reviews)
                        setReviewsExist(true)
                    } else {
                        setReviews(null)
                        setReviewsExist(false)
                    }
                    if (res.popular.length !== 0) {
                        setPopular(res.popular)
                        //setPopularExists(true)
                        if (res.popular.length > 2) {
                            setDisplayPopular(true)
                        } else {
                            setDisplayPopular(false)
                        }
                    } else {
                        setPopular(null)
                        setDisplayPopular(false)
                        //setPopularExists(false)
                    }
                }).catch(e => {
                    console.log(e);
                });
            } else {
                console.log("something happened")
            }
        }).catch(error => console.error(error));
    }, [username])

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
                        getHome(res.username)
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

    function convertMariaDBDatetimeToLocalTimeSmall(mariaDBDatetime) {
        // Create a Date object from the MariaDB datetime string
        const datetimeObject = new Date(mariaDBDatetime);

        // Format the datetime in your local timezone
        const options = {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        };

        return datetimeObject.toLocaleString(undefined, options);
    }

    function convertToStars(rating) {
        if (rating === 0) {
            return <><IoStarOutline /><IoStarOutline /><IoStarOutline /><IoStarOutline /><IoStarOutline /></>;;
        }
        if (rating === 1) {
            return <><IoStar /><IoStarOutline /><IoStarOutline /><IoStarOutline /><IoStarOutline /></>;
        }
        if (rating === 2) {
            return <><IoStar /><IoStar /><IoStarOutline /><IoStarOutline /><IoStarOutline /></>;
        }
        if (rating === 3) {
            return <><IoStar /><IoStar /><IoStar /><IoStarOutline /><IoStarOutline /></>;
        }
        if (rating === 4) {
            return <><IoStar /><IoStar /><IoStar /><IoStar /><IoStarOutline /></>;
        }
        if (rating === 5) {
            return <><IoStar /><IoStar /><IoStar /><IoStar /><IoStar /></>;
        }
    }

    return (
        <div>
            <NavbarComponent />
            <div className="header">
                <h2>Welcome back, {getUsername}</h2>
            </div>
            <Container>
                {displayFriendActivity ? <>
                    <br></br>
                    <br></br>
                    <h5>Recent activity from friends</h5>
                    <CardGroup className="me-2">
                        {ratingsFromFriends.map((result, idx) => (
                            <Card key={idx}>
                                <Link to={`/${result.item_type}/${result.spotify_item_ID}`}><Card.Img varient="top" src={result.image_URL} /></Link>
                                <Card.Footer>
                                    <div>
                                        <small><Link to={`/user/${result.username}`}>{result.username}</Link></small>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <small>{convertToStars(result.rating)}</small>
                                        </div>
                                        <div>
                                            <small>{convertMariaDBDatetimeToLocalTimeSmall(result.datetime)}</small>
                                        </div>
                                    </div>
                                </Card.Footer>
                            </Card>
                        ))}
                    </CardGroup>
                    <br></br>
                    <br></br>
                </>
                    : <></>}

                <Row>
                    {reviewsFromFriendsExist ? <>
                        <h5>Recent reviews from friends:</h5>
                        <Row xs={1} md={2} className="g-4">
                            {reviewsFromFriends.map((result, idx) => (
                                <Col key={idx}>
                                    <Card>
                                        {/*<Link to={`/${result.item_type}/${result.spotify_item_ID}`}><Card.Img varient="top" src={result.image_URL} /></Link>*/}
                                        <Card.Header><Link to={`/${result.item_type}/${result.spotify_item_ID}`}>{result.name}</Link> </Card.Header>
                                        <Card.Body>
                                            <Card.Text>
                                                {result.review}
                                            </Card.Text>
                                        </Card.Body>
                                        <Card.Footer>
                                            <div className="d-flex justify-content-between">
                                                <div>
                                                    <small>Reviewed by <Link to={`/user/${result.username}`}>{result.username}</Link></small>
                                                </div>
                                                <div>
                                                    <small>{convertMariaDBDatetimeToLocalTime(result.datetime)}</small>
                                                </div>
                                            </div>
                                        </Card.Footer>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </>
                        :
                        <></>}

                </Row>
                <br></br>
                <br></br>

                <Row>
                    {displayPopular ? <>
                        <h5>Most popular albums and tracks this week:</h5>
                        <CardGroup className="me-2">
                            {popular.map((result, idx) => (
                                <Card key={idx}>
                                    {/*<Card.Header>{result.item_type}</Card.Header>*/}
                                    <Link to={`/${result.item_type}/${result.spotify_item_ID}`}><Card.Img varient="top" src={result.image_URL} /></Link>
                                    <Card.Body>
                                        <small><Link to={`/${result.item_type}/${result.spotify_item_ID}`}>{result.name}</Link></small>
                                    </Card.Body>
                                </Card>
                            ))}
                        </CardGroup>
                    </>
                        : <div>Not enough ratings or reviews this week</div>}

                </Row>

                <br></br>
                <br></br>

                <Row>
                    {reviewsExist ? <>
                        <h5>Recent reviews:</h5>
                        <Row xs={1} md={2} className="g-4">
                            {reviews.map((result, idx) => (
                                <Col key={idx}>
                                    <Card>
                                        {/*<Link to={`/${result.item_type}/${result.spotify_item_ID}`}><Card.Img varient="top" src={result.image_URL} /></Link>*/}
                                        <Card.Header><Link to={`/${result.item_type}/${result.spotify_item_ID}`}>{result.name}</Link> </Card.Header>
                                        <Card.Body>
                                            <Card.Text>
                                                {result.review}
                                            </Card.Text>
                                        </Card.Body>
                                        <Card.Footer>
                                            <div className="d-flex justify-content-between">
                                                <div>
                                                    <small>Reviewed by <Link to={`/user/${result.username}`}>{result.username}</Link></small>
                                                </div>
                                                <div>
                                                    <small>{convertMariaDBDatetimeToLocalTime(result.datetime)}</small>
                                                </div>
                                            </div>
                                        </Card.Footer>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </>
                        :
                        <div>No reviews exist yet</div>}
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