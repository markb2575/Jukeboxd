import { useNavigate, useLocation, Link } from "react-router-dom";
import NavbarComponent from "../routing/NavbarComponent";
import React, { useState, useEffect, useCallback} from 'react';
import './Search.css'
import { Row, Col, Container } from "react-bootstrap";
import Card from 'react-bootstrap/Card';

function Search() {

  let location = useLocation();
  let navigate = useNavigate();

  const [query, setQuery] = useState(''); //Holds the query string that is being searched
  const [searchResults, setSearchResults] = useState([]); //Holds the returned list of search results to display
  const [noResults, setNoResults] = useState(false);  //Boolean that is true when there are no results found from the search
  const [filter, setFilter] = useState('all'); //Holds the string representing the current;y selected filter
  const [pageNum, setPageNum] = useState(1);  //Holds the current page number that is being viewed
  const [loading, setLoading] = useState(true); //Boolean that is true if the server is still fetching search results

  const pageSize = 50; //Holds the number of results to display per page



    /**
     * Function that calls the API to search the database given a query and filter
     * @param {*} searchQuery The string to search the databse for
     * @param {*} filter The type of item to search for
     */
    const fetchSearchResults = useCallback((searchQuery, filter) => {
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
            setLoading(false);
          } else {
            setNoResults(true);
  
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }, [pageNum]);

  /** 
  * This function is used to set the filter, page number, and scroll position when returning to the search results.
  * The purpose is to make the user experience more seamless as it returns you to the exact same place that you were looking at.
  */
  useEffect(() => {
    console.log(window.localStorage.getItem('filter'),window.localStorage.getItem('page'),JSON.parse(window.localStorage.getItem("scroll")));
    setFilter(JSON.parse(window.localStorage.getItem('filter')));
    setPageNum(JSON.parse(window.localStorage.getItem('page')));
    if (!loading) {
      window.scrollTo(0, JSON.parse(window.localStorage.getItem("scroll")));
    }
    
  }, [loading]);


  /**
  * Listener for scroll, save scroll position for persistence
  */
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  /**
  * This function updates the search parameter whenever the url parameter is changed.
  * This ensures that the page updates correctly when performing a new search
  */
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const myParam = searchParams.get('q');

    if (myParam) {
      setQuery(myParam);
    }
  }, [location.search]);

  /**
  * This function calls the function that fetches the search results whenever the query is updated.
  * This ensures that the displayed results always match the search query.
  */
  useEffect(() => {
    if (query) {
      fetchSearchResults(query, filter);
    }
  }, [query, fetchSearchResults, filter]);

  /**
  * This is called when the screen is scrolled, it saves the current scroll position into local storage so it can be recalled later.
  */
  const handleScroll = () => {
    window.localStorage.setItem("scroll", JSON.stringify(window.scrollY))
  };


  /**
  * This is called when a filter button is pressed.
  * It changes the filter state, saves info to local storage, resets the page number, and fetches new search results.
  @param {*} newFilter The new filter to assign to the state

  */
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    window.localStorage.setItem('page', JSON.stringify(1));
    window.localStorage.setItem('filter', JSON.stringify(newFilter));
    fetchSearchResults(query, newFilter);
  };

  /**
  * This is called when the next page button is pressed.
  * It ensures there is another page to load, and then sets the page state
  */
  const handleNext = () => {
    if (pageNum < Math.ceil(searchResults.length / pageSize)) {
      const n = pageNum + 1;
      window.localStorage.setItem('page', JSON.stringify(n));

      setPageNum(n);
    }
  };

  /**
  * This is called when the previous page button is pressed.
  * It ensures there is a previous page to load, and then sets the page state
  */
  const handlePrev = () => {
    if (pageNum > 1) {
      const n = pageNum - 1;
      window.localStorage.setItem('page', JSON.stringify(n));

      setPageNum(n);
    }
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
                    <Card.Img className="album-cover" onClick={() => navigate(`/track/${result.track_id}`)} varient="top" src={result.image_URL} alt="Album Cover" />
                    <Card.Footer>
                      <Card.Text>
                        Title: <Link to={`/track/${result.track_id}`}>
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
                    <Card.Img className="album-cover" onClick={() => navigate(`/album/${result.album_id}`)} varient="top" src={result.image_URL} alt="Album Cover" />
                    <Card.Footer>
                      <Card.Text>
                        Title: <Link to={`/album/${result.album_id}`}>
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

export default Search;