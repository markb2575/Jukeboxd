import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import NavbarComponent from "../routing/NavbarComponent";
import Button from "react-bootstrap/esm/Button";

function Album({ username }) {
  const { pathname } = useLocation();
  let navigate = useNavigate();
  const [albumID, setAlbumID] = useState(pathname.split("/album/")[1]);
  const [loading, setLoading] = useState(true);
  const [albumName, setAlbumName] = useState("")
  const [imageURL, setImageURL] = useState("")
  const [artistName, setArtistName] = useState("")
  const [releaseDate, setReleaseDate] = useState("")
  const [artistID, setArtistID] = useState(null)

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
    console.log(albumID, username)
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
        res = res[0]
        console.log(res)
        setArtistID(res.artistID)
        setArtistName(res.artistName)
        setImageURL(res.image_URL)
        setAlbumName(res.albumName)
        setReleaseDate(res.release_date.split("T")[0])
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
          <h1>Now viewing {albumName} by <Link to={`/artist/${artistID}`}>{artistName}</Link></h1>
          <h5>Released in {releaseDate}</h5>
        </div>

      )}

    </div>
  );
}

export default Album;