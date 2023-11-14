import { useState, useEffect, useCallback, Link } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavbarComponent from "../routing/NavbarComponent";
import { Tab, ListGroup, Row, Col, Nav } from "react-bootstrap";


function Artist({ username }) {
  const { pathname } = useLocation();
  let navigate = useNavigate();
  const [artistID, setArtistID] = useState(pathname.split("/artist/")[1]);
  const [loading, setLoading] = useState(true);
  const [artistName, setArtistName] = useState("");
  const [albums, setAlbums] = useState(null);
  const [tracks, setTracks] = useState(null);
  const [activeTab, setActiveTab] = useState('#albums');
  // const [albumName, setAlbumName] = useState("")
  // const [imageURL, setImageURL] = useState("")
  // const [artistName, setArtistName] = useState("")
  // const [releaseDate, setReleaseDate] = useState("")

  // const checkStatus = useCallback(() => {
  //     fetch(`http://localhost:8080/user/follower=${username}&followee=${profileName}`, {
  //         method: 'GET',
  //         headers: {
  //             'Content-Type': 'application/json',
  //             'authorization': localStorage.token
  //         }
  //     }).then((response) => {
  //         response.json().then(res => {
  //             setIsFollowing(res.isFollowing)
  //         }).catch(e => {
  //             console.log(e);
  //         });
  //         // Code for handling the response
  //     }).catch(error => console.error(error));
  // }, [profileName, username])

  useEffect(() => {
    // console.log("in useeffect")
    setArtistID(pathname.split("/artist/")[1])
    if (artistID.length === 0 || username.length === 0) return
    console.log(artistID, username)
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
        // res = res[0]
        console.log(res)
        setArtistName(res.artistName)
        setAlbums(res.albums)
        setTracks(res.tracks)
        // setArtistID(res.artistID)
        // setArtistName(res.artistName)
        // setImageURL(res.image_URL)
        // setAlbumName(res.name)
        // setReleaseDate(res.release_date.split("T")[0])
        setLoading(false)
      }).catch(e => {
        console.log(e);
      });

      setLoading(false)
      // checkStatus()
      // Code for handling the response
    }).catch(error => console.error(error));
  }, [pathname, navigate, username, artistID]);
  // const handleFollowUser = (e) => {
  //     e.preventDefault()
  //     //create a request to login with the following object
  //     var usernames = {
  //         followerUsername: username,
  //         followeeUsername: profileName
  //     }
  //     if (isFollowing) {
  //         fetch('http://localhost:8080/user/unfollowUser', {
  //             method: 'POST',
  //             body: JSON.stringify(usernames),
  //             headers: { 'Content-Type': 'application/json' }
  //         }).then(response => {
  //             if (response.status === 200) {
  //                 checkFollowStatus()
  //             } else {

  //             }
  //         }).catch(error => console.error(error));
  //     } else {
  //         fetch('http://localhost:8080/user/followUser', {
  //             method: 'POST',
  //             body: JSON.stringify(usernames),
  //             headers: { 'Content-Type': 'application/json' }
  //         }).then(response => {
  //             if (response.status === 200) {
  //                 checkFollowStatus()
  //             } else {

  //             }
  //         }).catch(error => console.error(error));
  //     }

  // }
  return (
    <div>
      <NavbarComponent />
      {loading ? (
        null
      ) : (
        <div className="container mt-3">
          <Row className="justify-content-between">
            <Col md={4} className="border rounded p-3">
              <h1>{artistName}</h1>
              <p className="border rounded p-3">Description</p>
            </Col>
            <Col md={4} className="float-right border rounded p-3">
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
                <ListGroup className="w-100 mx-auto">
                  {albums === null || albums.length === 0 ? "This artist has no albums" :
                    (albums.map((result, index) => (
                      <ListGroup.Item key={index} onClick={() => navigate(`/album/${result.albumID}`)}>
                        <img
                          src={result.image_URL}
                          alt="Album Cover"
                          style={{
                            width: '100px',
                            height: 'auto',
                          }}
                        />
                        <p>{result.albumName}</p>
                      </ListGroup.Item>
                    )))}
                </ListGroup>
              )}
              {activeTab === '#tracks' && (
                <ListGroup className="w-100 mx-auto">
                  {tracks === null || tracks.length === 0 ? "This artist has no tracks" :
                    (tracks.map((result, index) => (
                      <ListGroup.Item key={index} onClick={() => navigate(`/track/${result.trackID}`)}>
                        <img
                          src={result.image_URL}
                          alt="Album Cover"
                          style={{
                            width: '100px',
                            height: 'auto',
                          }}
                        />
                        <p>{result.trackName}</p>
                      </ListGroup.Item>
                    )))}
                </ListGroup>
              )}
            </Col>
          </Row>
        </div>

      )}

    </div>
  );
}

export default Artist;