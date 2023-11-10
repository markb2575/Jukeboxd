import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import NavbarComponent from "../routing/NavbarComponent";
import { ListGroup } from "react-bootstrap"
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
          <img src={imageURL}  alt="Album Cover" style={{
            "width": "400px",
            "height": "auto"
          }} />
          <h1>Now viewing {albumName} by {albums.map((result, index) => (<div key={index} style={{display: "inline"}}><Link to={`/artist/${result.artistID}`}>{result.artistName}</Link>{index === albums.length-1 ? null : " and "}</div>))}</h1>
          <h5>Released in {releaseDate}</h5>
          <ListGroup>
            {songs.map((result, index) => (
                <Link key={index} to={`/track/${result.spotify_track_ID}`}><ListGroup.Item>{result.trackName}</ListGroup.Item></Link>
            ))}
          </ListGroup>
        </div>

      )}

    </div>
  );
}

export default Album;