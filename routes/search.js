const express = require('express')
const db = require('../db')
const auth = require('./middleware')
const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
      const user = await req.user;
      return res.json({"username": user});
    } catch (err) {
      console.error(err.message);
      res.status(500);
    }
});

router.get('/users/:query', async (req, res) => {
    try {
      const query = req.params.query; // Use req.params.query to access the query parameter
      console.log(query);
      
      // Use a parameterized query to safely search for users
      const users = await db.pool.query(
        `SELECT username FROM Users WHERE username LIKE ?`,
        [`%${query}%`] // Use parameterized query
      );
      
      // Check if there are results
      if (users.length > 0) {
        console.log(users);
        return res.status(200).json(users);
      } else {
        // No users found
        
        res.status(404).json({ error: 'No users found' });
      }
    } catch (error) {
      console.error('Error:', query, error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});
  
router.get('/tracks/:query', async (req, res) => {
    try {
      const query = req.params.query; // Use req.params.query to access the query parameter
      console.log(query);
      
      // Use a parameterized query to safely search for users
     const songs = await db.pool.query(
  `SELECT T.name AS song_name, A.name AS artist_name, AL.name AS album_name, AL.release_date AS song_date, AL.image_URL, T.spotify_track_ID AS track_id, AL.spotify_album_ID AS album_id, A.spotify_artist_ID AS artist_id
   FROM Tracks AS T
   JOIN Albums AS AL ON T.album_ID = AL.album_ID
   JOIN Album_Artists AS AA ON AL.album_ID = AA.album_ID
   JOIN Artists AS A ON AA.artist_ID = A.artist_ID
   WHERE T.name LIKE ?`,
  [`%${query}%`] // Use parameterized query
);
      
      // Check if there are results
      if (songs.length > 0) {
        console.log(songs);
        return res.status(200).json(songs);
      } else {
        // No songs found
        
        res.status(404).json({ error: 'No songs found' });
      }
    } catch (error) {
      console.error('Error:', query, error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});
  
router.get('/artists/:query', async (req, res) => {
    try {
      const query = req.params.query; // Use req.params.query to access the query parameter
      console.log(query);
      
      // Use a parameterized query to safely search for users
      const artists = await db.pool.query(
        `SELECT name AS artist_name, spotify_artist_ID AS artist_id FROM Artists WHERE name LIKE ?`,
        [`%${query}%`] // Use parameterized query
      );
      
      // Check if there are results
      if (artists.length > 0) {
        console.log(artists);
        return res.status(200).json(artists);
      } else {
        // No artists found
        
        res.status(404).json({ error: 'No artists found' });
      }
    } catch (error) {
      console.error('Error:', query, error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});
  
router.get('/albums/:query', async (req, res) => {
    try {
      const query = req.params.query; // Use req.params.query to access the query parameter
      console.log(query);
      
      // Use a parameterized query to safely search for users
       const albums = await db.pool.query(
      `SELECT AL.name AS album_name, A.name AS artist_name, AL.release_date AS release_date, AL.image_URL, AL.spotify_album_ID AS album_id, A.spotify_artist_ID AS artist_id
        FROM Albums AS AL
        JOIN Album_Artists AS AA ON AL.album_ID = AA.album_ID
        JOIN Artists AS A ON AA.artist_ID = A.artist_ID
        WHERE AL.name LIKE ?`,
      [`%${query}%`] // Use parameterized query
      );
      
      // Check if there are results
      if (albums.length > 0) {
        console.log(albums);
        return res.status(200).json(albums);
      } else {
        // No albums found
        
        res.status(404).json({ error: 'No albums found' });
      }
    } catch (error) {
      console.error('Error:', query, error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});
  
router.get('/all/:query', async (req, res) => {
    try {
      const query = req.params.query; // Use req.params.query to access the query parameter
      console.log(query);
      
      // Use a parameterized query to safely search for users
      const albums = await db.pool.query(
      `SELECT AL.name AS album_name, A.name AS artist_name, AL.release_date AS release_date, AL.image_URL, AL.spotify_album_ID AS album_id, A.spotify_artist_ID AS artist_id
        FROM Albums AS AL
        JOIN Album_Artists AS AA ON AL.album_ID = AA.album_ID
        JOIN Artists AS A ON AA.artist_ID = A.artist_ID
        WHERE AL.name LIKE ?`,
      [`%${query}%`] // Use parameterized query
      );
  
      const artists = await db.pool.query(
        `SELECT name AS artist_name, spotify_artist_ID AS id FROM Artists WHERE name LIKE ?`,
        [`%${query}%`] // Use parameterized query
      );
  
      const songs = await db.pool.query(
  `SELECT T.name AS song_name, A.name AS artist_name, AL.name AS album_name, AL.release_date AS song_date, AL.image_URL, T.spotify_track_ID AS track_id, AL.spotify_album_ID AS album_id, A.spotify_artist_ID AS artist_id
   FROM Tracks AS T
   JOIN Albums AS AL ON T.album_ID = AL.album_ID
   JOIN Album_Artists AS AA ON AL.album_ID = AA.album_ID
   JOIN Artists AS A ON AA.artist_ID = A.artist_ID
   WHERE T.name LIKE ?`,
  [`%${query}%`] // Use parameterized query
);
  
      const users = await db.pool.query(
        `SELECT username FROM Users WHERE username LIKE ?`,
        [`%${query}%`] // Use parameterized query
      );
  
      const all = users.concat(songs, artists, albums);
  
      
      // Check if there are results
      if (all.length > 0) {
        console.log(all);
        return res.status(200).json(all);
      } else {
        // No results found
        
        res.status(404).json({ error: 'No results found' });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;