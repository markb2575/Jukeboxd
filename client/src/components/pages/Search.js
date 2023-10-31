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
                    <p>Date: {new Date(result.song_date).toLocaleDateString()}</p>
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
                    <p>Date: {new Date(result.release_date).toLocaleDateString()}</p>
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