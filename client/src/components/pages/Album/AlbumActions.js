import { useState } from "react";
import { ListGroup } from "react-bootstrap"
import Button from "react-bootstrap/esm/Button";
import Col from 'react-bootstrap/Col';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import { IoAddCircleOutline, IoAddCircle, IoEarOutline, IoEar } from "react-icons/io5";
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import '../Track.css'

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
function AlbumActions({ username, rated, radios, radioValue, reviewed, setReviewText, albumID, reviewText, setReviewed, setReviews, setReviewsExist, setRated, listened, setListened, setRadioValue, watchlist, setWatchlist }) {
  const [show, setShow] = useState(false); // Show review box
  const handleClose = () => {
    setShow(false);
    if (reviewed === false) {
      setReviewText("")
    }
  }
  const handleSaveReview = (e) => {
    e.preventDefault()
    setShow(false);

    var reviewToSend = {
      username: username,
      spotifyAlbumID: albumID,
      reviewText: reviewText,
    }

    if (reviewText !== "") {
      fetch('http://localhost:8080/album/setReview', {
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


  const handleDeleteReview = (e) => {
    e.preventDefault()
    setShow(false);

    var reviewToDelete = {
      username: username,
      spotifyAlbumID: albumID,
    }

    fetch('http://localhost:8080/album/deleteReview', {
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
  const handleShow = () => {
    if (reviewed) {
      fetch(`http://localhost:8080/album/getReview/username=${username}&spotifyAlbumID=${albumID}`, {
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
  const handleListen = () => {
    if (listened) {
      //Remove from list
      fetch(`http://localhost:8080/album/delete-listened-album/${username}/${albumID}`, {
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
      fetch(`http://localhost:8080/album/add-listened-album/${username}/${albumID}`, {
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
      fetch(`http://localhost:8080/album/delete-watch-album/${username}/${albumID}`, {
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
      fetch(`http://localhost:8080/album/add-watch-album/${username}/${albumID}`, {
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
  )
}

export default AlbumActions;