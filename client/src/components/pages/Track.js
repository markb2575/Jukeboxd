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
import { IoAddCircleOutline, IoAddCircle, IoEarOutline, IoEar, IoStarHalf, IoStarOutline, IoStar } from "react-icons/io5";
import './Track.css'

function Track({ username }) {
    const { pathname } = useLocation();
    let navigate = useNavigate();
    const [trackID, setTrackID] = useState(pathname.split("/track/")[1]);
    const [loading, setLoading] = useState(true);
    const [track, setTrack] = useState(null)
    const [artists, setArtists] = useState(null)
    const [album, setAlbum] = useState(null)
    // const [releaseDate, setReleaseDate] = useState("")
    // const [artistID, setArtistID] = useState(null)

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
        setTrackID(pathname.split("/track/")[1])
        if (trackID.length === 0 || username.length === 0) return
        console.log(trackID, username)
        //check if trackID exists in database, if not, navigate to error page
        fetch(`http://localhost:8080/track/getTrack/${trackID}`, {
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
                //   res = res[0]
                // console.log(res.album[0].albumID,res.album[0].name)
                var hours = Math.floor(res.track[0].duration / 60000)
                var minutes = Math.floor(res.track[0].duration % 60000 / 1000)
                res.track[0].duration = `${hours}:${minutes < 10 ? '0' + minutes : minutes}`
                setTrack(res.track[0])
                setAlbum(res.album[0])
                setArtists(res.artist)
                //   setArtistID(res.artistID)
                //   setArtistName(res.artistName)
                //   setImageURL(res.image_URL)
                //   setAlbumName(res.name)
                //   setReleaseDate(res.release_date.split("T")[0])
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
    }, [pathname, navigate, username, trackID]);
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
    /*
    return (
        <div>
            <NavbarComponent />
            {loading ? (
                null
            ) : (
                <Container>
                <div>
                    <h1>Now viewing {track.trackName} by {artists.map((result, index) => (<div key={index} style={{ display: "inline" }}><Link to={`/artist/${result.artistID}`}>{result.name}</Link>{index === artists.length - 1 ? null : " and "}</div>))}</h1>
                    <img src={album.image_URL} alt="Album Cover" onClick={() => navigate(`/album/${album.albumID}`)} style={{
                        "width": "400px",
                        "height": "auto"
                    }} />
                    <h5>Album: <Link to={`/album/${album.albumID}`}>{album.name}</Link></h5>
                    <div>
                        <h5>Track Duration: {track.duration}</h5>
                        {track.explicit?<h5>Explicit</h5>:null}
                        <h5>Track Number: {track.track_number}</h5>
                        <h5>Disc Number: {track.disc_number}</h5>
                    </div>
                </div>
                </Container>
            )}

        </div>
    );
    */

    return (
        <div>
            <NavbarComponent />
            {loading ? (
                null
            ) : (

                <div>
                    <div className="header">
                        <h3 className="subHeader">Track:</h3> <h1 className="subHeader">{track.trackName}</h1> <h3 className="subHeader">by</h3> <h2>{artists.map((result, index) => (<div key={index} style={{ display: "inline" }}><Link to={`/artist/${result.artistID}`}>{result.name}</Link>{index === artists.length - 1 ? null : " and "}</div>))}</h2>
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
                                                    <Button>Listened</Button>
                                                    <Button>Watchlist</Button>
                                                </div>
                                            </ListGroup.Item>

                                            <ListGroup.Item>
                                                <div className="centeredHorizontal">
                                                    <ButtonGroup>
                                                        <Button>1</Button>
                                                        <Button>2</Button>
                                                        <Button>3</Button>
                                                        <Button>4</Button>
                                                        <Button>5</Button>
                                                    </ButtonGroup>
                                                </div>
                                            </ListGroup.Item>

                                            <ListGroup.Item>
                                                <div className="centeredHorizontal">
                                                    <Button>
                                                        Review
                                                    </Button>
                                                </div>
                                            </ListGroup.Item>
                                        </ListGroup>
                                    </div>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                    <IoAddCircle size={30}/>
                    <IoAddCircleOutline size={30}/>
                    <IoEarOutline size={30}/>
                    <IoEar size={30}/>
                    <IoStarHalf size={30}/>
                    <IoStarOutline size={30}/>
                    <IoStar size={30}/>
                </div>
            )}

        </div>
    );
}

export default Track;