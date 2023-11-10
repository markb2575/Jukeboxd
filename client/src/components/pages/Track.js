import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link, Navigate} from "react-router-dom";
import NavbarComponent from "../routing/NavbarComponent";
import Button from "react-bootstrap/esm/Button";

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
                var hours = Math.floor(res.track[0].duration/60000)
                var minutes = Math.floor(res.track[0].duration%60000/1000)
                res.track[0].duration = `${hours}:${minutes < 10?'0' + minutes:minutes}`
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
    return (
        <div>
            <NavbarComponent />
            {loading ? (
                null
            ) : (
                <div>
                    <h1>Now viewing {track.trackName} by {artists.map((result, index) => (<div key={index} style={{ display: "inline" }}><Link to={`/artist/${result.artistID}`}>{result.name}</Link>{index === artists.length - 1 ? null : " and "}</div>))}</h1>
                    <img src={album.image_URL} alt="Album Cover" onClick={() => navigate(`/album/${album.albumID}`)} style={{
                        "width": "400px",
                        "height": "auto"
                    }} />
                    <h5><Link to={`/album/${album.albumID}`}>{album.name}</Link></h5>
                    <div>
                        <h5>Track Duration: {track.duration}</h5>
                        {track.explicit?<h5>Explicit</h5>:null}
                        <h5>Track Number: {track.track_number}</h5>
                        <h5>Disc Number: {track.disc_number}</h5>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Track;