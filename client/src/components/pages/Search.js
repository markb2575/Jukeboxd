import { useNavigate, useLocation, Link } from "react-router-dom";
import NavbarComponent from "../routing/NavbarComponent";
import React, { useState, useEffect } from 'react';
import './Search.css'


function Search() {

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const location = useLocation();
  const [filter, setFilter] = useState('all'); // 'all' is the default filter
  const [pageNum, setPageNum] = useState(1);
  const pageSize = 100; //Can be changed




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

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    fetchSearchResults(query, newFilter);
  };

  const handleNext = () => {
    if (pageNum < Math.ceil(searchResults.length / pageSize)) {
      setPageNum(pageNum+1);
      fetchSearchResults(query, filter);
    }
  }

  const handlePrev = () => {
    if (pageNum > 1) {
      setPageNum(pageNum-1);
      fetchSearchResults(query, filter);
    }
  }

  const fetchSearchResults = (searchQuery, filter) => {
    fetch(`http://localhost:8080/search/${filter}/${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          console.log(searchQuery);
          setNoResults(true);

          throw new Error('Failed to fetch search results');
        }
      })
      .then((data) => {
        setNoResults(false);
        setSearchResults(data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };


  return (
    <div>
      <NavbarComponent />
      <div>
        <h4>Filter by:&#20;
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
            Page {pageNum} of {Math.ceil(searchResults.length / pageSize)} &#20;
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
          {searchResults.map((result, index) => (
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
              {result.song_name && (
                <div className="song-result">
                  <img src={result.image_URL} alt="Album Cover" className="album-cover" />
                  <div className="result-text">
                    <p>Song: {result.song_name}</p>
                    <p>Artists: {result.artist_names}</p>
                    <p>Album: {result.album_name}</p>
                  </div>
                </div>
              )}
              {result.album_name && !result.song_name && (
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
                        {result.artist_names.split(',').map((artist, i) => (
                          <Link key={i} to={`/artist/${result.artist_ids.split(',')[i]}`}>
                            {artist}
                            {i < result.artist_names.split(',').length - 1 && ', '}
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

export default Search;