//import { useState, useEffect, useCallback, Link } from "react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavbarComponent from "../routing/NavbarComponent";
//import { Tab, ListGroup, Row, Col, Nav, Image, CardFooter } from "react-bootstrap";
import { Row, Col, Nav } from "react-bootstrap";

import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';
import Button from "react-bootstrap/esm/Button";
import Form from 'react-bootstrap/Form';


function Artist({ username, spotify_artist_ID, isAdmin }) {
  const { pathname } = useLocation();
  let navigate = useNavigate();
  const [artistID, setArtistID] = useState(pathname.split("/artist/")[1]);
  const [loading, setLoading] = useState(true);
  const [artistName, setArtistName] = useState("");
  const [albums, setAlbums] = useState(null);
  const [tracks, setTracks] = useState(null);
  const [activeTab, setActiveTab] = useState('#albums');
  const [description, setDescription] = useState(""); // Holds the artist's description
  const [showDescription, setShowDescription] = useState(false) // Boolean to determine if there is a description or not, if not, then it displays default text
  const [descriptionText, setDescriptionText] = useState("") // Holds the text for the description as the user writes it
  const [canEdit, setCanEdit] = useState(false) // Boolean to determine if the user is linked to the artist or is an admin
  const [show, setShow] = useState(false); // Show edit description box

  /**
   * Handles closing the description modal box
   */
  const handleClose = () => {
    setShow(false);
    if (showDescription === false) {
      setDescriptionText("")
    }
  }

  /**
   * Handles showing the description modal box. Gets the artist's description from the database each time a user opens the modal, so
   * if the user wrote a description which they hit save on but was never actually saved, then it gives them the correct description (not what the frontend thinks is their description)
   */
  const handleShow = () => {
    if (showDescription) {
      setArtistID(pathname.split("/artist/")[1])
      fetch(`http://localhost:8080/artist/getDescription/${artistID}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).then(response => {
        if (response.status === 200) {
          response.json().then(res => {
            //console.log('description: ', res.description)
            setDescriptionText(res.description)
          }).catch(e => {
            console.log(e);
          });
        } else {
          console.log("something happened")
        }
      }).catch(error => console.error(error));
    }
    if (showDescription === false) {
      setDescriptionText("")
    }
    setShow(true)
  };

  useEffect(() => {

    setArtistID(pathname.split("/artist/")[1])
    if (artistID.length === 0 || username.length === 0) return

    if (artistID === spotify_artist_ID || isAdmin) { // If the user is an admin or linked to the artist, then they should be able to edit/set a description
      setCanEdit(true)
    } else {
      setCanEdit(false)
    }

    //check if artistID exists in database, if not, navigate to error page
    fetch(`http://localhost:8080/artist/getArtist/${artistID}&${username}`, {
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
        setArtistName(res.artistName)
        setAlbums(res.albums)
        setTracks(res.tracks)
        if (res.description !== null) { // If there is a description for the artist, then we want to show it
          setDescription(res.description)
          setShowDescription(true)
        } else {
          setDescription("")
          setShowDescription(false)
        }

        setLoading(false)
      }).catch(e => {
        console.log(e);
      });

      setLoading(false)
    }).catch(error => console.error(error));
  }, [pathname, navigate, username, artistID, spotify_artist_ID, isAdmin]);

  /**
   * Handles saving the artist description. Gets the spotify_artist_ID, and the description text then sends it all to the backend
   * to save the description depending on if the description is new/changed or not
   * @param {*} e the action of clicking "save" on the description modal
   */
  const handleSaveDescription = (e) => {
    e.preventDefault()
    setShow(false);

    var descriptionToSend = {
      spotify_artist_ID: artistID,
      descriptionText: descriptionText,
    }

    if (descriptionText !== "") { // Prevent calling the backend if the description text is empty... i.e. if the user hit save on a blank description
      fetch('http://localhost:8080/artist/setDescription', {
        method: 'PUT',
        body: JSON.stringify(descriptionToSend),
        headers: {
          'Content-Type': 'application/json',
          'authorization': localStorage.token
        }
      }).then(response => {
        if (response.status === 200) {
          if (showDescription === false) { // If the artist didn't previously have a description, then we want to change the boolean value since now they do
            setShowDescription(true)
          } response.json().then(res => {
            if (res.description !== null) { // If the description is not null, then we want to show it
              setShowDescription(true)
              setDescription(res.description)
            } else {
              setShowDescription(false)
              setDescription("")
            }
          }).catch(e => {
            console.log(e);
          });

        } else {
          console.log("something happened")
        }
      }).catch(error => console.error(error));
    }
    if (showDescription === false) { // If they didn't actually set a description, then set the description text back to empty
      setDescriptionText("")
    }
  }

  /**
   * Handles deleting the artist's description
   * @param {*} e The action of clicking the "delete" button on the description modal
   */
  const handleDeleteDescription = (e) => {
    e.preventDefault()
    setShow(false);

    var descriptionToDelete = {
      spotify_artist_ID: artistID,
    }

    fetch('http://localhost:8080/artist/deleteDescription', {
      method: 'PUT',
      body: JSON.stringify(descriptionToDelete),
      headers: {
        'Content-Type': 'application/json',
        'authorization': localStorage.token
      }
    }).then(response => {
      if (response.status === 200) {
        setShowDescription(false)
        setDescriptionText("")
      } else {
        console.log("something happened")
      }
    }).catch(error => console.error(error));
  }

  return (
    <div>
      <NavbarComponent />
      {loading ? (
        null
      ) : (
        <div className="container mt-3">
          <Row className="justify-content-between">
            <Col md={3}>
              <Card>
                <Card.Header>{artistName}</Card.Header>
                <Card.Body>
                  <Card.Text>
                    {showDescription ?
                      <>{description}</>
                      :
                      <>Artist has no description.</>
                    }
                  </Card.Text>
                </Card.Body>



                <>
                  {canEdit ?
                    <Card.Footer>
                      {/* <Button onClick={handleDescription} variant="outline-primary" title="Description">Description</Button> */}
                      {showDescription ? <Button onClick={handleShow} title="Description">Edit Description</Button> :
                        <Button onClick={handleShow} variant="outline-primary" title="Description">Add Description</Button>}

                      {showDescription ? <Modal show={show} onHide={handleClose}>
                        <Modal.Header closeButton>
                          <Modal.Title>Description</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                          <Form>
                            <Form.Group
                              className="mb-3"
                              controlId="exampleForm.ControlTextarea1"
                            >
                              <Form.Label>Edit your description:</Form.Label>
                              <Form.Control as="textarea" rows={10} maxLength={500} value={descriptionText} onChange={(e) => setDescriptionText(e.target.value)} />
                              <Form.Text muted>Maximum length 500</Form.Text>
                            </Form.Group>
                          </Form>
                        </Modal.Body>
                        <Modal.Footer>
                          <Col className="buttonLeft">
                            <Button className="buttonLeft" variant="primary" onClick={handleDeleteDescription}>
                              Delete
                            </Button>
                          </Col>
                          <Button variant="secondary" onClick={handleClose}>
                            Close
                          </Button>
                          <Button variant="primary" onClick={handleSaveDescription}>
                            Save Changes
                          </Button>
                        </Modal.Footer>
                      </Modal>
                        :
                        <Modal show={show} onHide={handleClose}>
                          <Modal.Header closeButton>
                            <Modal.Title>Description</Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <Form>
                              <Form.Group
                                className="mb-3"
                                controlId="exampleForm.ControlTextarea1"
                              >
                                <Form.Label>Add a description:</Form.Label>
                                <Form.Control as="textarea" rows={10} maxLength={500} value={descriptionText} onChange={(e) => setDescriptionText(e.target.value)} />
                                <Form.Text muted>Maximum length 500</Form.Text>
                              </Form.Group>
                            </Form>
                          </Modal.Body>
                          <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                              Close
                            </Button>
                            <Button variant="primary" onClick={handleSaveDescription}>
                              Save Changes
                            </Button>
                          </Modal.Footer>
                        </Modal>}
                    </Card.Footer>


                    :
                    null}
                </>




              </Card>

            </Col>
            <Col md={8} className="float-right border rounded p-3">
              <Nav
                variant="underline"
                defaultActiveKey="#albums"
                onSelect={(eventKey) => setActiveTab(eventKey)}
                style={{ marginBottom: "5%" }}
              >
                <Nav.Item>
                  <Nav.Link eventKey="#albums">Albums</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="#tracks">Tracks</Nav.Link>
                </Nav.Item>
              </Nav>
              {activeTab === '#albums' && (
                <Row xs={1} md={3} className="g-4">
                  {albums === null || albums.length === 0 ? (
                    <p>This artist has no albums</p>
                  ) : (
                    albums.map((result, index) => (
                      <Col key={index} md={4} onClick={() => navigate(`/album/${result.albumID}`)}>
                        <Card>
                          <Card.Img varient="top" src={result.image_URL} />
                          <Card.Footer>{result.albumName}</Card.Footer>
                        </Card>
                      </Col>
                    ))
                  )}
                </Row>
              )}
              {activeTab === '#tracks' && (
                <Row xs={1} md={3} className="g-4">
                  {tracks === null || tracks.length === 0 ? (
                    <p>This artist has no tracks</p>
                  ) : (
                    tracks.map((result, index) => (
                      <Col key={index} md={4} onClick={() => navigate(`/track/${result.trackID}`)}>
                        <Card>
                          <Card.Img varient="top" src={result.image_URL} />
                          <Card.Footer>{result.trackName}</Card.Footer>
                        </Card>
                      </Col>
                    ))
                  )}
                </Row>
              )}
            </Col>
          </Row>
        </div>
      )}
      <br></br>
    </div>
  );
}

/*
  return (
    <div>
      <NavbarComponent />
      {loading ? (
        null
      ) : (
        <div className="container mt-3">
          <Row className="justify-content-between">
            <Col md={3} className="border rounded p-3">
              <h1>{artistName}</h1>
              <p className="border rounded p-3">Description</p>
            </Col>
            <Col md={8} className="float-right border rounded p-3">
              <Nav
                variant="underline"
                defaultActiveKey="#albums"
                onSelect={(eventKey) => setActiveTab(eventKey)}
                style={{ marginBottom: "5%" }}
              >
                <Nav.Item>
                  <Nav.Link eventKey="#albums">Albums</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="#tracks">Tracks</Nav.Link>
                </Nav.Item>
              </Nav>
              {activeTab === '#albums' && (
                <Row className="w-100 mx-auto">
                  {albums === null || albums.length === 0 ? (
                    <p>This artist has no albums</p>
                  ) : (
                    albums.map((result, index) => (
                      <Col key={index} md={4} onClick={() => navigate(`/album/${result.albumID}`)}>
                        <ListGroup.Item className="border rounded p-3" style={{margin:"5%"}}>
                          <Image
                            src={result.image_URL}
                            alt="Album Cover"
                            rounded
                            style={{
                              width: '200px',
                              height: 'auto',
                            }}
                          />
                          <p style={{
                              width: '200px',
                              height: 'auto',
                          }}>{result.albumName}</p>
                        </ListGroup.Item>
                      </Col>
                    ))
                  )}
                </Row>
              )}
              {activeTab === '#tracks' && (
                <Row className="w-100 mx-auto">
                  {tracks === null || tracks.length === 0 ? (
                    <p>This artist has no tracks</p>
                  ) : (
                    tracks.map((result, index) => (
                      <Col key={index} md={4} onClick={() => navigate(`/track/${result.trackID}`)}>
                        <ListGroup.Item className="border rounded p-3" style={{margin:"5%"}}>
                          <Image
                            src={result.image_URL}
                            alt="Album Cover"
                            rounded
                            style={{
                              width: '200px',
                              height: 'auto',
                            }}
                          />
                          <p style={{
                              width: '200px',
                              height: 'auto',
                          }}>{result.trackName}</p>
                        </ListGroup.Item>
                      </Col>
                    ))
                  )}
                </Row>
              )}
            </Col>
          </Row>
        </div>
      )}

    </div>
  );
}
*/

export default Artist;