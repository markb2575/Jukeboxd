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

function AlbumActions({ username, rated, radios, ratingValue, reviewed, setReviewText, albumID, reviewText, setReviewed, setReviews, setReviewsExist, setRated, listened, setListened, setRatingValue, watchlist, setWatchlist }) {

  const [show, setShow] = useState(false); // Show review box

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
   * Handles saving a review. Gets the user's username, the albums spotify_album_ID, and review text from the reviewText variable, then
   * sends it all to the backend to save their review depending on if it is new, or altered
   * @param {*} e the action of clicking "save" on the review modal
   */
  const handleSaveReview = (e) => {
    e.preventDefault()
    setShow(false); // Close the review modal

    var reviewToSend = { // Get all the necessary information to pass to the backend into one set
      username: username,
      spotifyAlbumID: albumID,
      reviewText: reviewText,
    }

    if (reviewText !== "") { // Prevent calling the backend if the review text is empty... i.e. if the user hit save on a blank review
      fetch('http://localhost:8080/album/setReview', {
        method: 'POST',
        body: JSON.stringify(reviewToSend),
        headers: { 'Content-Type': 'application/json' }
      }).then(response => {
        if (response.status === 200) {
          if (reviewed === false) { // If they hadn't reviewed it yet, then set the reviewed boolean to true
            setReviewed(true)
          }
          response.json().then(res => {
            if (res.reviews.length !== 0) { // If there are now reviews on the album (which will always be the case if they successfully reviewed it), then display them
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
    if (reviewed === false) { // If they didn't actually review the album, then set the review text back to empty
      setReviewText("")
    }
  }

  /**
   * Handles setting the user's rating for the album
   * @param {*} e the action of clicking one of the radio buttons
   */
  const handleRate = (e) => {
    var newRating = {
      username: username,
      spotifyAlbumID: albumID,
      rating: e.target.value
    }

    if (e.target.value.toString() !== '0') { // Gets the rating that the user set based on the radio button that they clicked
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

  /**
   * Handles deleting the user's review
   * @param {*} e The action of clicking the "delete" button on the review modal
   */
  const handleDeleteReview = (e) => {
    e.preventDefault()
    setShow(false); // Closes the review modal

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
        setReviewText("")

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
   * Handles showing the review modal box. Gets the user's review from the database each time they open the modal, so
   * if they wrote a review which they hit save on but was never actually saved, then it gives them the correct review (not what the frontend thinks is their review)
   */
  const handleShow = () => {
    if (reviewed) {
      fetch(`http://localhost:8080/album/getReview/username=${username}&spotifyAlbumID=${albumID}`, {
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
    if (reviewed === false) { // If the user has not reviewed the album, then the review text is blank
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
            setRatingValue('0')
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
  )
}

export default AlbumActions;