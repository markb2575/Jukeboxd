import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavbarComponent from "../routing/NavbarComponent";
import Card from 'react-bootstrap/Card';
import CardGroup from 'react-bootstrap/CardGroup';
import Container from "react-bootstrap/esm/Container";
import './Home.css'
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { IoStar, IoStarOutline } from "react-icons/io5";

function Home({ username }) {
    const [ratingsFromFriends, setRatingsFromFriends] = useState(null) // Array that holds the 5 most recent albums or songs that friends have rated or marked listened
    const [reviewsFromFriends, setReviewsFromFriends] = useState(null) // Array that holds the 6 most recent reviews from friends
    const [reviewsFromFriendsExist, setReviewsFromFriendsExist] = useState(false) // Boolean to determine if there are reviews from friends
    const [reviews, setReviews] = useState(null) // Array that stores the 10 most recent reviews
    const [reviewsExist, setReviewsExist] = useState(false) // Boolean to determine if there are reviews
    const [popular, setPopular] = useState(null) // Array that stores the popular albums/tracks for the past week

    const [displayFriendActivity, setDisplayFriendActivity] = useState(false) // Boolean to determine if there is enough friend activity to show
    const [displayPopular, setDisplayPopular] = useState(false) // Boolean to determine if there are enough popular albums/tracks to show
    const [loading, setLoading] = useState(true); // Boolean to prevent showing the page before the data has been received from the backend
    let navigate = useNavigate();

    /**
     * Function that gets all the information to display on the homepage when a user navigates to the home page.
     * Sets all the booleans to the appropriate values, and populates all the arrays based on the information it receives from the fetch
     */
    useEffect(() => {
        setLoading(true)
        //console.log("token: ", localStorage.token)
        if (localStorage.token) {
            //console.log("attempting to homeGet")
            fetch('http://localhost:8080/user/getHome', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.token
                }
            }).then(response => {
                if (response.status === 200) {
                    response.json().then(res => {
                        //console.log("getting home info")
                        if (res.ratingsFromFriends.length !== 0) {
                            setRatingsFromFriends(res.ratingsFromFriends)
                            if (res.ratingsFromFriends.length > 2) { // If there are at least 3 recent ratings/listened from friends, then display them
                                setDisplayFriendActivity(true)
                            } else {
                                setDisplayFriendActivity(false)
                            }
                        } else {
                            setRatingsFromFriends(null)
                            setDisplayFriendActivity(false)
                        }
                        if (res.reviewsFromFriends.length !== 0) { // If there is at least 1 review from friends, then display it/them
                            setReviewsFromFriends(res.reviewsFromFriends)
                            setReviewsFromFriendsExist(true)
                        } else {
                            setReviewsFromFriends(null)
                            setReviewsFromFriendsExist(false)
                        }
                        if (res.reviews.length !== 0) { // If there is at least 1 recent review, then display it/them
                            setReviews(res.reviews)
                            setReviewsExist(true)
                        } else {
                            setReviews(null)
                            setReviewsExist(false)
                        }
                        if (res.popular.length !== 0) {
                            setPopular(res.popular)
                            if (res.popular.length > 2) { // If there are at least 3 popular songs/albums in the past week, then display them
                                setDisplayPopular(true)
                            } else {
                                setDisplayPopular(false)
                            }
                        } else {
                            setPopular(null)
                            setDisplayPopular(false)
                        }
                        setLoading(false)
                    }).catch(e => {
                        console.log(e);
                    });
                } else {
                    console.log("something happened")
                    setLoading(false)
                }
            }).catch(error => console.error(error));
        } else { // If the user is not in the database, or if someone attempts to go to the homepage without being logged in, then send them to the login screen
            navigate("/login")
        }
    }, [username, navigate]);

    /**
     * Takes the datetime stored in the mariaDB database (which is in UTC), and converts it to the user's local timezone, then alters how it is displayed
     * so it only shows the pertinent information
     * @param {*} mariaDBDatetime The datetime from the mariaDB database, which is in UTC time
     * @returns The pertinent datetime information from the mariaDB database but in the user's local timezone
     */
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

    /**
     * Takes the datetime stored in the mariaDB database (which is in UTC), and converts it to the user's local timezone, then alters how it is displayed
     * so it only shows the shorthand version of the pertinent information
     * @param {*} mariaDBDatetime The datetime from the mariaDB database, which is in UTC time
     * @returns The shorthand datetime from the mariaDB database but in the user's local timezone
     */
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

    /**
     * Function that converts an integer rating into empty and non-empty star icons
     * @param {*} rating The user's rating for the given track or album
     * @returns The user's rating but in the form of stars
     */
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
            {loading ? null
                :
                <>
                    <br></br>
                    <div className="header">
                        <h2>Welcome back, {username}</h2>
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
                        <h5>Most popular albums and tracks this week:</h5>
                            {displayPopular ? <>
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
                        <br></br>
                    </Container>
                </>
            }
        </div>


    );
}

export default Home;