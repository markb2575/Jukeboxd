import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import NavbarComponent from "../routing/NavbarComponent";
import Button from "react-bootstrap/esm/Button";
import Container from "react-bootstrap/esm/Container";
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import ListGroup from 'react-bootstrap/ListGroup';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import { IoAddCircleOutline, IoAddCircle, IoEarOutline, IoEar } from "react-icons/io5";
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Card from 'react-bootstrap/Card'
import './Track.css'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
//import Table from 'react-bootstrap/Table';

function Track({ username }) {
    const { pathname } = useLocation();
    let navigate = useNavigate();
    const [trackID, setTrackID] = useState(pathname.split("/track/")[1]);
    const [loading, setLoading] = useState(true);
    const [track, setTrack] = useState(null)
    const [artists, setArtists] = useState(null)
    const [album, setAlbum] = useState(null)
    const [ratingValue, setRatingValue] = useState('0'); // User's rating
    const [show, setShow] = useState(false); // Show review box
    const [reviewText, setReviewText] = useState("") // User's review text
    const [reviews, setReviews] = useState(null) // Array that holds the reviews for the track
    const [reviewsExist, setReviewsExist] = useState(false) // Boolean that determines if there are reviews, used to dynamically change the page layout

    const [reviewed, setReviewed] = useState(false); // Boolean to determine if the user has reviewed the track, used to dynamically change the page layout
    const [listened, setListened] = useState(false); // Boolean to determine if the user has listened to the track, used to dynamically change the page layout
    const [watchlist, setWatchlist] = useState(false); // Boolean to determine if the user has added the track to their watchlist, used to dynamically change the page layout
    const [rated, setRated] = useState(false); // Boolean to determine if the user has rated the track, used to dynamically change the page layout

    /**
     * Handles closing the review modal box
     */
    const handleClose = () => {
        setShow(false);
        if (reviewed === false) {
            setReviewText("")
        }
    }

    /**
     * Handles showing the review modal box. Gets the user's review from the database each time they open the modal, so
     * if they wrote a review which they hit save on but was never actually saved, then it gives them the correct review (not what the frontend thinks is their review)
     */
    const handleShow = () => {
        if (reviewed) {
            setTrackID(pathname.split("/track/")[1])
            fetch(`http://localhost:8080/track/getReview/username=${username}&spotifyTrackID=${trackID}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }).then(response => {
                if (response.status === 200) {
                    response.json().then(res => {
                        console.log('review: ', res.review[0].review)
                        setReviewText(res.review[0].review) // Updates the frontend's review text to match what the database has stored as the user's review
                    }).catch(e => {
                        console.log(e);
                    });
                } else {
                    console.log("something happened")
                }
            }).catch(error => console.error(error));
        }
        if (reviewed === false) {
            setReviewText("") // If the user has not reviewed the track, then the review text is blank
        }
        setShow(true)
    };

    // Radio buttons for the various ratings
    const radios = [
        { name: 'None', value: '0' },
        { name: '1', value: '1' },
        { name: '2', value: '2' },
        { name: '3', value: '3' },
        { name: '4', value: '4' },
        { name: '5', value: '5' },
    ];

    useEffect(() => {
        setTrackID(pathname.split("/track/")[1])
        if (trackID.length === 0 || username.length === 0) return

        //check if trackID exists in database, if not, navigate to error page
        fetch(`http://localhost:8080/track/getTrack/${trackID}&${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': localStorage.token
            }
        }).then((response) => {
            if (response.status === 404) {
                navigate("/404");
                return
            }
            response.json().then(res => {
                var hours = Math.floor(res.track[0].duration / 60000)
                var minutes = Math.floor(res.track[0].duration % 60000 / 1000)
                res.track[0].duration = `${hours}:${minutes < 10 ? '0' + minutes : minutes}`
                setTrack(res.track[0])
                setAlbum(res.album[0])
                setArtists(res.artist)
                if (res.review.length === 1) { // If the user has reviewed the track, then set the review text to their review, and set reviewed to true
                    setReviewText(res.review[0].review)
                    setReviewed(true)
                }
                if (res.listened.length === 1) { // If the user has listened to the track, then set listened true, and depending on if they've rated it, set that true and set the correct value
                    setRatingValue(res.listened[0].rating.toString())
                    if (res.listened[0].rating.toString() !== '0') {
                        setRated(true)
                        console.log('this has been rated before')
                    } else {
                        setRated(false)
                        console.log('this HAS NOT been rated before')
                    }
                    setListened(true)
                }
                if (res.watchlist.length === 1) { // If the user added the track to their watchlist, then set the boolean that tracks that to true
                    setWatchlist(true)
                }
                if (res.reviews.length !== 0) { // If there are reviews for the track, then set the boolean that tracks that to true, and set the array that stories the reviews
                    setReviews(res.reviews)
                    setReviewsExist(true)
                }

                setLoading(false)
            }).catch(e => {
                console.log(e);
            });

            // Code for handling the response
        }).catch(error => console.error(error));
    }, [pathname, navigate, username, trackID]);

    /**
     * Handles saving a review. Gets the user's username, the tracks spotify_track_ID, and review text from the reviewText variable, then
     * sends it all to the backend to save their review depending on if it is new, or altered
     * @param {*} e the action of clicking "save" on the review modal
     */
    const handleSaveReview = (e) => {
        e.preventDefault()
        setShow(false); // Close the review modal

        var reviewToSend = { // Get all the necessary information to pass to the backend into one set
            username: username,
            spotifyTrackID: trackID,
            reviewText: reviewText,
        }

        if (reviewText !== "") { // Prevent calling the backend if the review text is empty... i.e. if the user hit save on a blank review
            fetch('http://localhost:8080/track/setReview', {
                method: 'POST',
                body: JSON.stringify(reviewToSend),
                headers: { 'Content-Type': 'application/json' }
            }).then(response => {
                if (response.status === 200) {
                    if (reviewed === false) { // If they hadn't reviewed it yet, then set the reviewed boolean to true
                        setReviewed(true)
                    }
                    response.json().then(res => {
                        if (res.reviews.length !== 0) { // If there are now reviews on the track (which will always be the case if they successfully reviewed it), then display them
                            setReviews(res.reviews)
                            setReviewsExist(true)
                        }
                    }).catch(e => {
                        console.log(e);
                    });
                } else {
                    console.log("something happened")
                }
            }).catch(error => console.error(error));
            if (listened === false) {
                handleListen()
            }
        }
        if (reviewed === false) { // If they didn't actually review the track, then set the review text back to empty
            setReviewText("")
        }
    }

    /**
     * Handles setting the user's rating for the track
     * @param {*} e the action of clicking one of the radio buttons
     */
    const handleRate = (e) => {
        var newRating = {
            username: username,
            spotifyTrackID: trackID,
            rating: e.target.value
        }

        if (e.target.value.toString() !== '0') { // Gets the rating that the user set based on the radio button that they clicked
            setRated(true)
        } else {
            setRated(false)
        }

        fetch('http://localhost:8080/track/setRating', {
            method: 'POST',
            body: JSON.stringify(newRating),
            headers: { 'Content-Type': 'application/json' }
        }).then(response => {
            if (response.status === 200) {
                if (listened === false) {
                    setListened(true)
                }
            } else {
                console.log("something happened")
            }
        })

    }

    /**
     * Handles deleting the user's review
     * @param {*} e The action of clicking the "delete" button on the review modal
     */
    const handleDeleteReview = (e) => {
        e.preventDefault()
        setShow(false); // Closes the review modal

        var reviewToDelete = {
            username: username,
            spotifyTrackID: trackID,
        }

        fetch('http://localhost:8080/track/deleteReview', {
            method: 'DELETE',
            body: JSON.stringify(reviewToDelete),
            headers: { 'Content-Type': 'application/json' }
        }).then(response => {
            if (response.status === 200) {
                setReviewed(false)
                setReviewText(null)

                response.json().then(res => {
                    if (res.reviews.length !== 0) { // Check to see if there are reviews still after the user's is deleted... if not then change the boolean to false
                        setReviews(res.reviews)
                        setReviewsExist(true)
                    } else {
                        setReviews(null)
                        setReviewsExist(false)
                    }
                }).catch(e => {
                    console.log(e);
                });
            } else {
                console.log("something happened")
            }
        }).catch(error => console.error(error));
    }

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

    const handleListen = () => {
        if (listened) {
            //Remove from list
            fetch(`http://localhost:8080/track/delete-listened-track/${username}/${trackID}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.token
                }
            }).then(response => {
                if (response.status === 200) {
                    if (listened === true) {
                        setListened(false)
                        setRated(false)
                        setRatingValue('0')
                    }
                } else {
                    console.log("something happened")
                }
            })
        } else {
            //Add to list
            fetch(`http://localhost:8080/track/add-listened-track/${username}/${trackID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.token
                }
            }).then(response => {
                if (response.status === 200) {
                    if (listened === false) {
                        setListened(true)
                        setRated(false)
                    }
                } else {
                    console.log("something happened")
                }
            })
        }
    }

    const handleWatch = () => {
        if (watchlist) {
            //Remove from list
            fetch(`http://localhost:8080/track/delete-watch-track/${username}/${trackID}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.token
                }
            }).then(response => {
                if (response.status === 200) {
                    if (watchlist === true) {
                        setWatchlist(false)
                    }
                } else {
                    console.log("something happened")
                }
            })
        } else {
            //Add to list
            fetch(`http://localhost:8080/track/add-watch-track/${username}/${trackID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.token
                }
            }).then(response => {
                if (response.status === 200) {
                    if (watchlist === false) {
                        setWatchlist(true)
                    }
                } else {
                    console.log("something happened")
                }
            })
        }
    }

    return (
        <div>
            <NavbarComponent />
            {loading ? (
                null
            ) : (

                <div style={{ marginTop: '10px' }}>
                    <div className="header">
                        <h3 className="subHeader">Track:</h3> <h1 className="subHeader">{track.trackName}</h1>
                    </div>
                    <div className="header2">
                        <h4 className="subHeader">by</h4> <h2>{artists.map((result, index) => (<div key={index} style={{ display: "inline" }}><Link to={`/artist/${result.artistID}`}>{result.name}</Link>{index === artists.length - 1 ? null : " and "}</div>))}</h2>
                    </div>
                    <div>
                        <Container>
                            <Row style={{ marginTop: '20px' }}>
                                <Col>
                                    <img className="album-cover-track" src={album.image_URL} alt="Album Cover" onClick={() => navigate(`/album/${album.albumID}`)} style={{
                                        "width": "400px",
                                        "height": "auto"
                                    }} />
                                </Col>


                                <Col>
                                    <div className="centeredVerticalCol">
                                        <ListGroup>
                                            <ListGroup.Item><h5>Album: <Link to={`/album/${album.albumID}`}>{album.name}</Link></h5></ListGroup.Item>
                                            <ListGroup.Item><h5>Track Duration: {track.duration}</h5></ListGroup.Item>
                                            {track.explicit ?
                                                <ListGroup.Item><h5>Explicit: Yes</h5></ListGroup.Item>
                                                :
                                                <ListGroup.Item><h5>Explicit: No</h5></ListGroup.Item>}
                                            <ListGroup.Item><h5>Track Number: {track.track_number}</h5></ListGroup.Item>
                                            <ListGroup.Item><h5>Disc Number: {track.disc_number}</h5></ListGroup.Item>

                                        </ListGroup>
                                    </div>
                                </Col>


                                {/*
                                <Col>
                                    <div className="centeredVerticalCol">
                                        <Table size="sm">
                                            <tbody>
                                                <tr>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td><h5>Album:</h5></td>
                                                    <td><Link to={`/album/${album.albumID}`}>{album.name}</Link></td>
                                                </tr>

                                                <tr>
                                                    <td><h5>Track Duration:</h5></td>
                                                    <td>{track.duration}</td>
                                                </tr>

                                                {track.explicit ?
                                                    <tr>
                                                        <td><h5>Explicit:</h5></td>
                                                        <td>Yes</td>
                                                    </tr>
                                                    :
                                                    <tr>
                                                        <td><h5>Explicit:</h5></td>
                                                        <td>No</td>
                                                    </tr>}

                                                <tr>
                                                    <td><h5>Track Number:</h5></td>
                                                    <td>{track.track_number}</td>
                                                </tr>

                                                <tr>
                                                    <td><h5>Disc Number:</h5></td>
                                                    <td>{track.disc_number}</td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </div>
                                </Col>
                                */}

                                {/*
                                <Col>
                                    <div className="centeredVerticalCol">
                                        <h5>Album: <Link to={`/album/${album.albumID}`}>{album.name}</Link></h5>
                                        <div>
                                            <h5>Track Duration: {track.duration}</h5>
                                            {track.explicit ? <h5>Explicit</h5> : null}
                                            <h5>Track Number: {track.track_number}</h5>
                                            <h5>Disc Number: {track.disc_number}</h5>
                                        </div>
                                    </div>
                                </Col>
                                */}

                                <Col>
                                    <div className="centeredVerticalCol">
                                        <ListGroup>
                                            <ListGroup.Item>
                                                <div className="horizontalSpaceBetween">

                                                    {listened ? <><h4 className="subHeader2">Listen:</h4>
                                                        <OverlayTrigger
                                                            placement="top"
                                                            delay={{ show: 250, hide: 400 }}
                                                            overlay={<Tooltip id="button-tooltip">Mark as not listened</Tooltip>}
                                                        >
                                                            <Button onClick={handleListen}><IoEar size={30} /></Button>
                                                        </OverlayTrigger>
                                                    </>
                                                        : <><h4 className="subHeader2">Listen:</h4>
                                                            <OverlayTrigger
                                                                placement="top"
                                                                delay={{ show: 250, hide: 400 }}
                                                                overlay={<Tooltip id="button-tooltip">Mark as listened</Tooltip>}
                                                            >
                                                                <Button variant="outline-primary" onClick={handleListen}><IoEarOutline size={30} /></Button>
                                                            </OverlayTrigger>
                                                        </>
                                                    }
                                                    {watchlist ? <><h4 className="subHeader2">Save:</h4>
                                                        <OverlayTrigger
                                                            placement="top"
                                                            delay={{ show: 250, hide: 400 }}
                                                            overlay={<Tooltip id="button-tooltip">Remove from your watch list</Tooltip>}
                                                        >
                                                            <Button onClick={handleWatch}><IoAddCircle size={30} /></Button>
                                                        </OverlayTrigger>
                                                    </>
                                                        : <><h4 className="subHeader2">Save:</h4>
                                                            <OverlayTrigger
                                                                placement="top"
                                                                delay={{ show: 250, hide: 400 }}
                                                                overlay={<Tooltip id="button-tooltip">Add to your watch list</Tooltip>}
                                                            >
                                                                <Button variant="outline-primary" onClick={handleWatch}><IoAddCircleOutline size={30} /></Button>
                                                            </OverlayTrigger>
                                                        </>
                                                    }
                                                </div>
                                            </ListGroup.Item>

                                            <ListGroup.Item>
                                                <div className="centeredHorizontal">
                                                    {rated ? <h4 className="subHeader">Rate:</h4>
                                                        : <h4 className="subHeader">Rate:</h4>
                                                    }
                                                    <ButtonGroup onChange={handleRate}>
                                                        {radios.map((radio, idx) => (
                                                            <ToggleButton
                                                                key={idx}
                                                                id={`radio-${idx}`}
                                                                type="radio"
                                                                variant={'outline-primary'}
                                                                name="radio"
                                                                value={radio.value}
                                                                checked={ratingValue === radio.value}
                                                                onChange={(e) => setRatingValue(e.currentTarget.value)}
                                                            >
                                                                {radio.name}

                                                            </ToggleButton>
                                                        ))}
                                                    </ButtonGroup>
                                                </div>
                                            </ListGroup.Item>

                                            <ListGroup.Item>
                                                <div className="centeredHorizontal">
                                                    {reviewed ? <Button onClick={handleShow} title="Review">Edit Review</Button> :
                                                        <Button onClick={handleShow} variant="outline-primary" title="Review">Review</Button>}

                                                    {reviewed ? <Modal show={show} onHide={handleClose}>
                                                        <Modal.Header closeButton>
                                                            <Modal.Title>Review</Modal.Title>
                                                        </Modal.Header>
                                                        <Modal.Body>
                                                            <Form>
                                                                <Form.Group
                                                                    className="mb-3"
                                                                    controlId="exampleForm.ControlTextarea1"
                                                                >
                                                                    <Form.Label>Edit your review:</Form.Label>
                                                                    <Form.Control as="textarea" rows={10} maxLength={500} value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
                                                                    <Form.Text muted>Maximum length 500</Form.Text>
                                                                </Form.Group>
                                                            </Form>
                                                        </Modal.Body>
                                                        <Modal.Footer>
                                                            <Col className="buttonLeft">
                                                                <Button className="buttonLeft" variant="primary" onClick={handleDeleteReview}>
                                                                    Delete
                                                                </Button>
                                                            </Col>
                                                            <Button variant="secondary" onClick={handleClose}>
                                                                Close
                                                            </Button>
                                                            <Button variant="primary" onClick={handleSaveReview}>
                                                                Save Changes
                                                            </Button>
                                                        </Modal.Footer>
                                                    </Modal>
                                                        :
                                                        <Modal show={show} onHide={handleClose}>
                                                            <Modal.Header closeButton>
                                                                <Modal.Title>Review</Modal.Title>
                                                            </Modal.Header>
                                                            <Modal.Body>
                                                                <Form>
                                                                    <Form.Group
                                                                        className="mb-3"
                                                                        controlId="exampleForm.ControlTextarea1"
                                                                    >
                                                                        <Form.Label>Add a review:</Form.Label>
                                                                        <Form.Control as="textarea" rows={10} maxLength={500} value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
                                                                        <Form.Text muted>Maximum length 500</Form.Text>
                                                                    </Form.Group>
                                                                </Form>
                                                            </Modal.Body>
                                                            <Modal.Footer>
                                                                <Button variant="secondary" onClick={handleClose}>
                                                                    Close
                                                                </Button>
                                                                <Button variant="primary" onClick={handleSaveReview}>
                                                                    Save Changes
                                                                </Button>
                                                            </Modal.Footer>
                                                        </Modal>}
                                                </div>
                                            </ListGroup.Item>
                                        </ListGroup>
                                    </div>
                                </Col>
                            </Row>
                            <Row style={{ marginTop: '20px', marginBottom: '20px' }}>
                                <div className="header">
                                    <h3>Reviews:</h3>
                                </div>
                                <div>
                                    {reviewsExist ?

                                        <Row xs={1} md={2} className="g-4">

                                            {reviews.map((result, idx) => (
                                                <Col key={idx}>
                                                    <Card>
                                                        <Card.Header>Reviewed by <Link to={`/user/${result.username}`}>{result.username}</Link> </Card.Header>
                                                        <Card.Body>
                                                            <Card.Text style={{ whiteSpace: "pre-line" }}>
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
                </div>
            )
            }

        </div >
    );
}

export default Track;