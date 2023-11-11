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
  const [radioValue, setRadioValue] = useState(null);

  const radios = [
    { name: '1', value: '1' },
    { name: '2', value: '2' },
    { name: '3', value: '3' },
    { name: '4', value: '4' },
    { name: '5', value: '5' },
  ];

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
    setAlbumID(pathname.split("/album/")[1])
    if (albumID.length === 0 || username.length === 0) return

    //check if albumID exists in database, if not, navigate to error page
    fetch(`http://localhost:8080/album/getAlbum/${albumID}`, {
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
        const album = res.album[0]
        setSongs(res.songs)
        setAlbums(res.album)
        // Toggle below for hardcoded songs to display
        // setSongs([{"trackName": "song 1", "spotify_track_ID": "1926598"},{"trackName": "song 2", "spotify_track_ID": "6454353"},{"trackName": "song 2", "spotify_track_ID": "5465234"}]) 
        setArtistID(album.artistID)
        setArtistName(album.artistName)
        setImageURL(album.image_URL)
        setAlbumName(album.albumName)
        setReleaseDate(album.release_date.split("T")[0])
        setLoading(false)
      }).catch(e => {
        console.log(e);
      });
      // if (profileName === username) {
      //     setViewingOwnProfile(true)
      //     setLoading(false)
      //     return
      // }
      // setLoading(false)
      // checkStatus()
      // Code for handling the response
    }).catch(error => console.error(error));
  }, [pathname, navigate, username, albumID]);
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

        <div>
          <div className="header">
            <h3 className="subHeader">Album:</h3> <h1 className="subHeader">{albumName}</h1>
          </div>
          <div className="header2">
            <h4 className="subHeader">by</h4> <h2 className="subHeader">{albums.map((result, index) => (<div key={index} style={{ display: "inline" }}><Link to={`/artist/${result.artistID}`}>{result.artistName}</Link>{index === albums.length - 1 ? null : " and "}</div>))}</h2>
            <h4 className="subHeader">Released in</h4> <h3>{releaseDate}</h3>
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
                          <h4 className="subHeader2">Listen:</h4><Button variant="outline-primary" title="Listen"><IoEarOutline size={30} /></Button>
                          <h4 className="subHeader2">Save:</h4><Button variant="outline-primary" title="Watchlist"><IoAddCircleOutline size={30} /></Button>
                        </div>
                      </ListGroup.Item>

                      <ListGroup.Item>
                        <div className="centeredHorizontal">
                          <h4 className="subHeader">Rate:</h4>
                          <ButtonGroup>
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
                          <Button variant="outline-primary" title="Review">Review</Button>
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
                  TODO
                </div>
              </Row>
            </Container>
          </div>


          <div className="header">
            TODO ICONS
            <IoAddCircle size={30} />
            <IoAddCircleOutline size={30} />
            <IoEarOutline size={30} />
            <IoEar size={30} />
            <IoStarHalf size={30} />
            <IoStarOutline size={30} />
            <IoStar size={30} />
          </div>

        </div>
      )}

    </div>
  );
}

export default Album;