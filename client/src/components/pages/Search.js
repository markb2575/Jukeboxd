import { useNavigate, useLocation, Link } from "react-router-dom";
import NavbarComponent from "../routing/NavbarComponent";
import React, { useState, useEffect, useRef } from 'react';
import './Search.css'
import { Row, Col, Container } from "react-bootstrap";
import Card from 'react-bootstrap/Card';

function Search() {

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const location = useLocation();
  const [filter, setFilter] = useState('all'); // 'all' is the default filter
  const [pageNum, setPageNum] = useState(1);
  const pageSize = 50; //Can be changed
  const scrollRef = useRef();

  let navigate = useNavigate();



  useEffect(() => {
    setFilter(JSON.parse(window.localStorage.getItem('filter')));
    setPageNum(JSON.parse(window.localStorage.getItem('page')));
    window.scrollTo(0, JSON.parse(window.localStorage.getItem("scroll")));
  });


  //listener for scroll, save scroll position for persistence
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const myParam = searchParams.get('q');

    if (myParam) {
      setQuery(myParam);
      // No need to directly call fetchSearchResults here
    }
  }, [location.search]);

  // Move the fetchSearchResults function call to a separate useEffect
  useEffect(() => {
    if (query) {
      fetchSearchResults(query, filter);
    }
  }, [query]);

  const handleScroll = () => {
    window.localStorage.setItem("scroll", JSON.stringify(window.scrollY))
  };


  //save filter for persistence, reset back to page 1 on filter change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    window.localStorage.setItem('page', JSON.stringify(1));
    window.localStorage.setItem('filter', JSON.stringify(newFilter));

    fetchSearchResults(query, newFilter);
  };

  const handleNext = () => {
    if (pageNum < Math.ceil(searchResults.length / pageSize)) {
      const n = pageNum + 1;
      window.localStorage.setItem('page', JSON.stringify(n));

      setPageNum(n);
      fetchSearchResults(query, filter);
    }
  };

  const handlePrev = () => {
    if (pageNum > 1) {
      const n = pageNum - 1;
      window.localStorage.setItem('page', JSON.stringify(n));

      setPageNum(n);
      fetchSearchResults(query, filter);
    }
  };

  const fetchSearchResults = (searchQuery, filter) => {
    fetch(`http://localhost:8080/search/${filter}/${searchQuery}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {

          throw new Error('Failed to fetch search results');
        }
      })
      .then((data) => {
        if (data.length > 0) {
          setNoResults(false);
          setSearchResults(data);
          if (pageNum > Math.ceil(data.length / pageSize)) {
            setPageNum(Math.ceil(data.length / pageSize));
          }
        } else {
          setNoResults(true);

        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };


  return (
    <div>
      <NavbarComponent />
      <Container>
        <br></br>
        <h4>Filter by:&nbsp;&nbsp;
          <button
            onClick={() => handleFilterChange('all')}
            className={filter === 'all' ? 'active' : ''}
          >
            All
          </button>
          <button
            onClick={() => handleFilterChange('tracks')}
            className={filter === 'tracks' ? 'active' : ''}
          >
            Tracks
          </button>
          <button
            onClick={() => handleFilterChange('albums')}
            className={filter === 'albums' ? 'active' : ''}
          >
            Albums
          </button>
          <button
            onClick={() => handleFilterChange('artists')}
            className={filter === 'artists' ? 'active' : ''}
          >
            Artists
          </button>
          <button
            onClick={() => handleFilterChange('users')}
            className={filter === 'users' ? 'active' : ''}
          >
            Users
          </button>
        </h4>
        {noResults ? (
          <h5>No results found.</h5>
        ) : (
          <h5>
            Page {pageNum} of {Math.ceil(searchResults.length / pageSize)} &nbsp;
            <button
              onClick={handlePrev}
            >
              Prev
            </button>
            <button
              onClick={handleNext}
            >
              Next
            </button>
          </h5>
        )}

      </Container>

      {noResults ? (
        <p></p>
      ) : (
        <Container>
          <Row xs={1} md={2} className="g-4">



            {searchResults.slice((pageSize * (pageNum - 1)), (pageSize * (pageNum))).map((result, index) => (
              <Col key={index} md={3}>
                <br></br>
                {result.username && (
                  <Card>
                    <Card.Header>User</Card.Header>
                    <Card.Footer>
                      <Card.Text>
                        Username: <Link to={`/user/${result.username}`}>
                          {result.username}
                        </Link>
                      </Card.Text>
                    </Card.Footer>
                  </Card>
                )}
                {result.track_name && (
                  <Card>
                    <Card.Header>Track</Card.Header>
                    <Card.Img varient="top" src={result.image_URL} alt="Album Cover" />
                    <Card.Footer>
                      <Card.Text>
                        Track: <Link to={`/track/${result.track_id}`}>
                          {result.track_name}
                        </Link>
                        <br></br>
                        Artist(s): {result.artist_names.split('|').map((artist, i) => (
                          <Link key={i} to={`/artist/${result.artist_ids.split('|')[i]}`}>
                            {artist}
                            {i < result.artist_names.split('|').length - 1 && ', '}
                          </Link>
                        ))}
                        <br></br>
                        Album: <Link to={`/album/${result.album_id}`}>
                          {result.album_name}
                        </Link>
                      </Card.Text>
                    </Card.Footer>
                  </Card>
                )}
                {result.album_name && !result.track_name && (
                  <Card>
                    <Card.Header>Album</Card.Header>
                    <Card.Img varient="top" src={result.image_URL} alt="Album Cover" />
                    <Card.Footer>
                      <Card.Text>
                        Album: <Link to={`/album/${result.album_id}`}>
                          {result.album_name}
                        </Link>
                        <br></br>
                        Artist(s): {result.artist_names.split('|').map((artist, i) => (
                          <Link key={i} to={`/artist/${result.artist_ids.split('|')[i]}`}>
                            {artist}
                            {i < result.artist_names.split('|').length - 1 && ', '}
                          </Link>
                        ))}
                      </Card.Text>
                    </Card.Footer>
                  </Card>
                )}

                {result.artist_name && (
                  <Card>
                    <Card.Header>Artist</Card.Header>
                    <Card.Footer>
                      <Card.Text>
                        Name: <Link to={`/artist/${result.artist_id}`}>
                          {result.artist_name}
                        </Link>
                      </Card.Text>
                    </Card.Footer>
                  </Card>
                )}
              </Col>
            ))}




          </Row>
          <br></br>
        </Container>
      )}
    </div>
  );

}

/*
return (
    <div>
        <NavbarComponent />
        <div>
          <h4>Filter by:&nbsp;&nbsp;
            <button
              onClick={() => handleFilterChange('all')}
              className={filter === 'all' ? 'active' : ''}
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange('tracks')}
              className={filter === 'tracks' ? 'active' : ''}
            >
              Tracks
            </button>
            <button
              onClick={() => handleFilterChange('albums')}
              className={filter === 'albums' ? 'active' : ''}
            >
              Albums
            </button>
            <button
              onClick={() => handleFilterChange('artists')}
              className={filter === 'artists' ? 'active' : ''}
            >
              Artists
            </button>
            <button
              onClick={() => handleFilterChange('users')}
              className={filter === 'users' ? 'active' : ''}
            >
              Users
            </button>
          </h4>
          {noResults ? (
            <h5>No results found.</h5>
          ) : (
            <h5>
              Page {pageNum} of {Math.ceil(searchResults.length / pageSize)} &nbsp;
              <button
                onClick={handlePrev}
              >
                Prev
              </button>
              <button
                onClick={handleNext}
              >
                Next
              </button>
            </h5>
          )}

        </div>

        {noResults ? (
          <p></p>
        ) : (

          <div className="search-results">
            {searchResults.slice((pageSize * (pageNum - 1)), (pageSize * (pageNum))).map((result, index) => (
              <div className="result" key={index}>
                {result.username && (
                  <div className="user-result">
                    <p>User:
                      <Link to={`/user/${result.username}`}>
                        {result.username}
                      </Link>
                    </p>

                  </div>
                )}
                {result.track_name && (
                  <div className="song-result">
                    <img src={result.image_URL} alt="Album Cover" className="album-cover" />
                    <div className="result-text">
                      <p>Track: <Link to={`/track/${result.track_id}`}>
                        {result.track_name}
                      </Link>
                      </p>
                      <p>Artist(s):
                        {result.artist_names.split('|').map((artist, i) => (
                          <Link key={i} to={`/artist/${result.artist_ids.split('|')[i]}`}>
                            {artist}
                            {i < result.artist_names.split('|').length - 1 && ', '}
                          </Link>
                        ))}
                      </p>
                      <p>Album:
                        <Link to={`/album/${result.album_id}`}>
                          {result.album_name}
                        </Link>
                      </p>
                    </div>
                  </div>
                )}
                {result.album_name && !result.track_name && (
                  <div className="album-result">
                    <img src={result.image_URL} alt="Album Cover" className="album-cover" />
                    <div className="result-text">
                      <p>Album:
                        <Link to={`/album/${result.album_id}`}>
                          {result.album_name}
                        </Link>
                      </p>
                      <div className="artist-names">
                        <p>Artist(s):
                          {result.artist_names.split('|').map((artist, i) => (
                            <Link key={i} to={`/artist/${result.artist_ids.split('|')[i]}`}>
                              {artist}
                              {i < result.artist_names.split('|').length - 1 && ', '}
                            </Link>
                          ))}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {result.artist_name && (
                  <div className="artist-result">
                    <p>Artist:
                      <Link to={`/artist/${result.artist_id}`}>
                        {result.artist_name}
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      );
}
      */

export default Search;