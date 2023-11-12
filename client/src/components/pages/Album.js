import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import NavbarComponent from "../routing/NavbarComponent";
import { ListGroup } from "react-bootstrap"
import Button from "react-bootstrap/esm/Button";
import Container from "react-bootstrap/esm/Container";
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import ToggleButton from 'react-bootstrap/ToggleButton';
import { IoAddCircleOutline, IoAddCircle, IoEarOutline, IoEar, IoStarHalf, IoStarOutline, IoStar } from "react-icons/io5";
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Card from 'react-bootstrap/Card'
import './Track.css'


function Album({ username }) {
  const { pathname } = useLocation();
  let navigate = useNavigate();
  const [albumID, setAlbumID] = useState(pathname.split("/album/")[1]);
  const [loading, setLoading] = useState(true);
  const [albums, setAlbums] = useState(null)
  const [albumName, setAlbumName] = useState("")
  const [imageURL, setImageURL] = useState("")
  const [artistName, setArtistName] = useState("")
  const [releaseDate, setReleaseDate] = useState("")
  const [artistID, setArtistID] = useState(null)
  const [songs, setSongs] = useState(null)
  const [radioValue, setRadioValue] = useState('0'); // Rating

  const [show, setShow] = useState(false); // Show review box
  const [reviewText, setReviewText] = useState("")
  const [reviews, setReviews] = useState(null)
  const [reviewsExist, setReviewsExist] = useState(false)

  const [reviewed, setReviewed] = useState(false);
  const [listened, setListened] = useState(false);
  const [watchlist, setWatchlist] = useState(false);
  const [rated, setRated] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => {
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
    setAlbumID(pathname.split("/album/")[1])
    if (albumID.length === 0 || username.length === 0) return
    //console.log('albumID: ', albumID, username)

    //check if albumID exists in database, if not, navigate to error page
    fetch(`http://localhost:8080/album/getAlbum/${albumID}&${username}`, {
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
        const album = res.album[0]
        setSongs(res.songs)
        setAlbums(res.album)
        setArtistID(album.artistID)
        setArtistName(album.artistName)
        setImageURL(album.image_URL)
        setAlbumName(album.albumName)
        setReleaseDate(album.release_date.split("T")[0])

        if (res.review.length === 1) {
          setReviewText(res.review[0].review)
          setReviewed(true)
        }
        if (res.listened.length === 1) {
          setRadioValue(res.listened[0].rating.toString())
          if (res.listened[0].rating.toString() !== '0') {
            setRated(true)
          } else {
            setRated(false)
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
  }, [pathname, navigate, username, albumID]);

  const handleSaveReview = (e) => {
    e.preventDefault()
    setShow(false);

    var reviewToSend = {
      username: username,
      spotifyAlbumID: albumID,
      reviewText: reviewText,
    }

    fetch('http://localhost:8080/album/setReview', {
      method: 'POST',
      body: JSON.stringify(reviewToSend),
      headers: { 'Content-Type': 'application/json' }
    }).then(response => {
      if (response.status === 200) {
        if (reviewed === false) {
          setReviewed(true)
        }

        setAlbumID(pathname.split("/album/")[1])
        if (albumID.length === 0 || username.length === 0) return
        //check if albumID exists in database, if not, navigate to error page
        fetch(`http://localhost:8080/album/getAlbum/${albumID}&${username}`, {
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
            setReviews(res.reviews)
            setReviewsExist(true)
          }).catch(e => {
            console.log(e);
          });
        }).catch(error => console.error(error));
      } else {
        console.log("something happened")
      }
    })
  }

  const handleRate = (e) => {
    var newRating = {
      username: username,
      spotifyAlbumID: albumID,
      rating: e.target.value
    }

    if (e.target.value.toString() !== '0') {
      setRated(true)
    } else {
      setRated(false)
    }

    fetch('http://localhost:8080/album/setRating', {
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
      {loading ? (
        null
      ) : (

        <div>
          <div className="header">
            <h3 className="subHeader">Album:</h3> <h1 className="subHeader">{albumName}</h1>
          </div>
          <div className="header2">
            <h4 className="subHeader">by</h4> <h2 className="subHeader">{albums.map((result, index) => (<div key={index} style={{ display: "inline" }}><Link to={`/artist/${result.artistID}`}>{result.artistName}</Link>{index === albums.length - 1 ? null : " and "}</div>))}</h2>
            <h4 className="subHeader">Released in</h4> <h3>{releaseDate.split("-")[1]}-{releaseDate.split("-")[2]}-{releaseDate.split("-")[0]}</h3>
          </div>
          <div>
            <Container>
              <Row>
                <Col>
                  <img src={imageURL} alt="Album Cover" style={{
                    "width": "400px",
                    "height": "auto"
                  }} />
                </Col>
                <Col>
                  <div className="centeredVerticalCol">
                    <h5>Songs:</h5>
                    <div>
                      <ListGroup>
                        {songs.map((result, index) => (
                          <Link key={index} to={`/track/${result.spotify_track_ID}`}><ListGroup.Item>{result.trackName}</ListGroup.Item></Link>
                        ))}
                      </ListGroup>
                    </div>
                  </div>
                </Col>
                <Col>
                  <div className="centeredVerticalCol">
                    <ListGroup>
                      <ListGroup.Item>
                        <div className="horizontalSpaceBetween">
                          {listened ? <><h4 className="subHeader2">Listened:</h4><Button title="Listened"><IoEarOutline size={30} /></Button></>
                            : <><h4 className="subHeader2">Listen:</h4><Button variant="outline-primary" title="Listen"><IoEarOutline size={30} /></Button></>
                          }
                          {watchlist ? <><h4 className="subHeader2">Saved:</h4><Button title="Watchlisted"><IoAddCircleOutline size={30} /></Button></>
                            : <><h4 className="subHeader2">Save:</h4><Button variant="outline-primary" title="Watchlist"><IoAddCircleOutline size={30} /></Button></>
                          }
                        </div>
                      </ListGroup.Item>

                      <ListGroup.Item>
                        <div className="centeredHorizontal">
                          {rated ? <h4 className="subHeader">Rated:</h4>
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
                          </Modal>
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
        </div>
      )}

    </div>
  );
}

export default Album;