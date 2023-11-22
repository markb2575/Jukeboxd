import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link, Navigate } from "react-router-dom";
import NavbarComponent from "../routing/NavbarComponent";
import Button from "react-bootstrap/esm/Button";
import Container from "react-bootstrap/esm/Container";
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import ListGroup from 'react-bootstrap/ListGroup';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import ToggleButton from 'react-bootstrap/ToggleButton';
import { IoAddCircleOutline, IoAddCircle, IoEarOutline, IoEar, IoStarHalf, IoStarOutline, IoStar } from "react-icons/io5";
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Card from 'react-bootstrap/Card'
import './Track.css'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

const ttListened = (props) => (
    <Tooltip id="button-tooltip" {...props}>
        Mark as listened
    </Tooltip>
);

const ttNotListened = (props) => (
    <Tooltip id="button-tooltip" {...props}>
        Mark as not listened
    </Tooltip>
);

const ttWatch = (props) => (
    <Tooltip id="button-tooltip" {...props}>
        Add to your watch list
    </Tooltip>
);

const ttUnwatch = (props) => (
    <Tooltip id="button-tooltip" {...props}>
        Remove from your watch list
    </Tooltip>
);


function Track({ username }) {
    const { pathname } = useLocation();
    let navigate = useNavigate();
    const [trackID, setTrackID] = useState(pathname.split("/track/")[1]);
    const [loading, setLoading] = useState(true);
    const [track, setTrack] = useState(null)
    const [artists, setArtists] = useState(null)
    const [album, setAlbum] = useState(null)
    const [radioValue, setRadioValue] = useState('0'); // Rating
    const [show, setShow] = useState(false); // Show review box
    const [reviewText, setReviewText] = useState("")
    const [reviews, setReviews] = useState(null)
    const [reviewsExist, setReviewsExist] = useState(false)

    const [reviewed, setReviewed] = useState(false);
    const [listened, setListened] = useState(false);
    const [watchlist, setWatchlist] = useState(false);
    const [rated, setRated] = useState(false);

    const handleClose = () => {
        setShow(false);
        if (reviewed === false) {
            setReviewText("")
        }
    }

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
                        setReviewText(res.review[0].review)
                    }).catch(e => {
                        console.log(e);
                    });
                } else {
                    console.log("something happened")
                }
            }).catch(error => console.error(error));
        }
        if (reviewed === false) {
            setReviewText("")
        }
        setShow(true)
    };

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
                if (res.review.length === 1) {
                    setReviewText(res.review[0].review)
                    setReviewed(true)
                }
                if (res.listened.length === 1) {
                    setRadioValue(res.listened[0].rating.toString())
                    if (res.listened[0].rating.toString() !== '0') {
                        setRated(true)
                        console.log('this has been rated before')
                    } else {
                        setRated(false)
                        console.log('this HAS NOT been rated before')
                    }
                    setListened(true)
                }
                if (res.watchlist.length === 1) {
                    setWatchlist(true)
                }
                if (res.reviews.length !== 0) {
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

    const handleSaveReview = (e) => {
        e.preventDefault()
        setShow(false);

        var reviewToSend = {
            username: username,
            spotifyTrackID: trackID,
            reviewText: reviewText,
        }

        if (reviewText !== "") {
            fetch('http://localhost:8080/track/setReview', {
                method: 'POST',
                body: JSON.stringify(reviewToSend),
                headers: { 'Content-Type': 'application/json' }
            }).then(response => {
                if (response.status === 200) {
                    if (reviewed === false) {
                        setReviewed(true)
                    }
                    response.json().then(res => {
                        if (res.reviews.length !== 0) {
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
        if (reviewed === false) {
            setReviewText("")
        }
    }

    const handleRate = (e) => {
        var newRating = {
            username: username,
            spotifyTrackID: trackID,
            rating: e.target.value
        }

        if (e.target.value.toString() !== '0') {
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

    const handleDeleteReview = (e) => {
        e.preventDefault()
        setShow(false);

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
                    if (res.reviews.length !== 0) {
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
                        setRadioValue('0')
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

                <div>
                    <div className="header">
                        <h3 className="subHeader">Track:</h3> <h1 className="subHeader">{track.trackName}</h1>
                    </div>
                    <div className="header2">
                        <h4 className="subHeader">by</h4> <h2>{artists.map((result, index) => (<div key={index} style={{ display: "inline" }}><Link to={`/artist/${result.artistID}`}>{result.name}</Link>{index === artists.length - 1 ? null : " and "}</div>))}</h2>
                    </div>
                    <div>
                        <Container>
                            <Row>
                                <Col>
                                    <img src={album.image_URL} alt="Album Cover" onClick={() => navigate(`/album/${album.albumID}`)} style={{
                                        "width": "400px",
                                        "height": "auto"
                                    }} />
                                </Col>
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
                                <Col>
                                    <div className="centeredVerticalCol">
                                        <ListGroup>
                                            <ListGroup.Item>
                                                <div className="horizontalSpaceBetween">

                                                    {listened ? <><h4 className="subHeader2">Listen:</h4>
                                                        <OverlayTrigger
                                                            placement="top"
                                                            delay={{ show: 250, hide: 400 }}
                                                            overlay={ttNotListened}
                                                        >
                                                            <Button title="Listened" onClick={handleListen}><IoEar size={30} /></Button>
                                                        </OverlayTrigger>
                                                    </>
                                                        : <><h4 className="subHeader2">Listen:</h4>
                                                            <OverlayTrigger
                                                                placement="top"
                                                                delay={{ show: 250, hide: 400 }}
                                                                overlay={ttListened}
                                                            >
                                                                <Button variant="outline-primary" title="Listen" onClick={handleListen}><IoEarOutline size={30} /></Button>
                                                            </OverlayTrigger>
                                                        </>
                                                    }
                                                    {watchlist ? <><h4 className="subHeader2">Save:</h4>
                                                        <OverlayTrigger
                                                            placement="top"
                                                            delay={{ show: 250, hide: 400 }}
                                                            overlay={ttUnwatch}
                                                        >
                                                            <Button title="Watchlisted" onClick={handleWatch}><IoAddCircle size={30} /></Button>
                                                        </OverlayTrigger>
                                                    </>
                                                        : <><h4 className="subHeader2">Save:</h4>
                                                            <OverlayTrigger
                                                                placement="top"
                                                                delay={{ show: 250, hide: 400 }}
                                                                overlay={ttWatch}
                                                            >
                                                                <Button variant="outline-primary" title="Watchlist" onClick={handleWatch}><IoAddCircleOutline size={30} /></Button>
                                                            </OverlayTrigger>
                                                        </>
                                                    }
                                                    {/* <h4 className="subHeader2">Listen:</h4><Button variant="outline-primary" title="Listen"><IoEarOutline size={30} /></Button>
                                                    <h4 className="subHeader2">Save:</h4><Button variant="outline-primary" title="Watchlist"><IoAddCircleOutline size={30} /></Button> */}
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
                                                                checked={radioValue === radio.value}
                                                                onChange={(e) => setRadioValue(e.currentTarget.value)}
                                                            >
                                                                {radio.name}

                                                            </ToggleButton>
                                                        ))}
                                                    </ButtonGroup>
                                                </div>
                                            </ListGroup.Item>

                                            <ListGroup.Item>
                                                <div className="centeredHorizontal">
                                                    {/* <Button onClick={handleReview} variant="outline-primary" title="Review">Review</Button> */}
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
                            <Row>
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
                </div>
            )}

        </div>
    );
}

export default Track;