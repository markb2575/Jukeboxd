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
        <h3>Filter by:</h3>
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
      </div>
      <h1>Search Results for: {query}</h1>
      {noResults ? (
        <p>No results found.</p>
      ) : (
        <div className="search-results">
          {searchResults.map((result, index) => (
            <div className="result" key={index}>
              {result.username && (
                <div className="user-result">
                  <Link to={`/user/${result.username}`}>
                    {<p>Username: {result.username}</p>}
                  </Link>

                </div>
              )}
              {result.song_name && (
                <div className="song-result">
                  <img src={result.image_URL} alt="Album Cover" className="album-cover" />
                  <div className="result-text">
                    <Link to={`/track/${result.track_id}`}>
                      {<p>Song: {result.song_name}</p>}
                    </Link>
                    <Link to={`/artist/${result.artist_id}`}>
                      {<p>Artist: {result.artist_name}</p>}
                    </Link>
                    <Link to={`/album/${result.album_id}`}>
                      {<p>Album: {result.album_name}</p>}
                    </Link>

                    <p>Date: {new Date(result.song_date).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              {result.album_name && !result.song_name && (
                <div className="album-result">
                  <img src={result.image_URL} alt="Album Cover" className="album-cover" />
                  <div className="result-text">
                    <Link to={`/album/${result.album_id}`}>
                      {<p>Album: {result.album_name}</p>}
                    </Link>
                    <Link to={`/artist/${result.artist_id}`}>
                      {<p>Artist: {result.artist_name}</p>}
                    </Link>
                    <p>Date: {new Date(result.release_date).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              {result.artist_name && !result.song_name && !result.album_name && (
                <div className="artist-result">
                  <Link to={`/artist/${result.artist_id}`}>
                    {<p>Artist: {result.artist_name}</p>}
                  </Link>
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