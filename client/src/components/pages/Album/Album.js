import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import NavbarComponent from "../../routing/NavbarComponent";
import { ListGroup } from "react-bootstrap"
import Container from "react-bootstrap/esm/Container";
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import '../Track.css'
import AlbumActions from "./AlbumActions";
import Reviews from "./Reviews";

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
  const [reviewText, setReviewText] = useState("")
  const [reviews, setReviews] = useState(null)
  const [reviewsExist, setReviewsExist] = useState(false)
  const [reviewed, setReviewed] = useState(false);
  const [listened, setListened] = useState(false);
  const [watchlist, setWatchlist] = useState(false);
  const [rated, setRated] = useState(false);

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
                  <AlbumActions {...{username, rated, radios, radioValue, reviewed, setReviewText, albumID, reviewText, setReviewed, setReviews, setReviewsExist, setRated, listened, setListened, setRadioValue, watchlist, setWatchlist}}/>
                </Col>
              </Row>
              <Row>
                <Reviews {...{reviewsExist, reviews}}/>
              </Row>
            </Container>
          </div>
        </div>
      )}

    </div>
  );
}

export default Album;