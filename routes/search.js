const express = require('express')
const db = require('../db')
const auth = require('./middleware')
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const user = await req.user;
    return res.json({ "username": user });
  } catch (err) {
    console.error(err.message);
    res.status(500);
  }
});

router.get('/users/:query', async (req, res) => {
  try {
    const query = req.params.query; // Use req.params.query to access the query parameter
    //console.log(query);

    // Use a parameterized query to safely search for users
    const users = await db.pool.query(
      `SELECT username FROM Users WHERE username LIKE ? ORDER BY username`,
      [`%${query}%`]
    );


    //console.log(users);
    return res.status(200).json(users);

  } catch (error) {
    console.error('Error:', query, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/tracks/:query', async (req, res) => {
  try {
    const query = req.params.query; // Use req.params.query to access the query parameter
    //console.log(query);

    // Use a parameterized query to safely search for users
    const songs = await db.pool.query(
      `SELECT
    T.name AS track_name,
    GROUP_CONCAT(A.name SEPARATOR '|') AS artist_names,
    AL.name AS album_name,
    AL.release_date AS song_date,
    AL.image_URL,
    T.spotify_track_ID AS track_id,
    AL.spotify_album_ID AS album_id,
    GROUP_CONCAT(A.spotify_artist_ID SEPARATOR '|') AS artist_ids
FROM Tracks AS T
JOIN Albums AS AL ON T.album_ID = AL.album_ID
LEFT JOIN Track_Artists AS TA ON T.track_ID = TA.track_ID
LEFT JOIN Artists AS A ON TA.artist_ID = A.artist_ID
WHERE T.name LIKE ?
GROUP BY T.spotify_track_ID, AL.album_ID;

`,
      [`%${query}%`]
    );


    //console.log(songs);
    return res.status(200).json(songs);

  } catch (error) {
    console.error('Error:', query, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/artists/:query', async (req, res) => {
  try {
    const query = req.params.query; // Use req.params.query to access the query parameter
    //console.log(query);

    // Use a parameterized query to safely search for users
    const artists = await db.pool.query(
      `SELECT name AS artist_name, spotify_artist_ID AS artist_id FROM Artists WHERE name LIKE ? ORDER BY name`,
      [`%${query}%`]
    );


    //console.log(artists);
    return res.status(200).json(artists);

  } catch (error) {
    console.error('Error:', query, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/albums/:query', async (req, res) => {
  try {
    const query = req.params.query; // Use req.params.query to access the query parameter
    //console.log(query);

    // Use a parameterized query to safely search for users
    const albums = await db.pool.query(
      `SELECT
    AL.name AS album_name,
    GROUP_CONCAT(A.name SEPARATOR '|') AS artist_names,
    AL.release_date AS release_date,
    AL.image_URL,
    AL.spotify_album_ID AS album_id,
    GROUP_CONCAT(A.spotify_artist_ID SEPARATOR '|') AS artist_ids
FROM Albums AS AL
LEFT JOIN Album_Artists AS AA ON AL.album_ID = AA.album_ID
LEFT JOIN Artists AS A ON AA.artist_ID = A.artist_ID
WHERE AL.name LIKE ?
GROUP BY AL.album_ID;
`,
      [`%${query}%`]
    );


    //console.log(albums);
    return res.status(200).json(albums);

  } catch (error) {
    console.error('Error:', query, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/all/:query', async (req, res) => {
  try {
    const query = req.params.query; // Use req.params.query to access the query parameter
    //console.log(query);

    // Use a parameterized query to safely search for users
    const albums = await db.pool.query(
      `SELECT
    AL.name AS album_name,
    GROUP_CONCAT(A.name SEPARATOR '|') AS artist_names,
    AL.release_date AS release_date,
    AL.image_URL,
    AL.spotify_album_ID AS album_id,
    GROUP_CONCAT(A.spotify_artist_ID SEPARATOR '|') AS artist_ids
FROM Albums AS AL
LEFT JOIN Album_Artists AS AA ON AL.album_ID = AA.album_ID
LEFT JOIN Artists AS A ON AA.artist_ID = A.artist_ID
WHERE AL.name LIKE ?
GROUP BY AL.album_ID;`,
      [`%${query}%`]
    );


    const artists = await db.pool.query(
      `SELECT name AS artist_name, spotify_artist_ID AS artist_id FROM Artists WHERE name LIKE ? ORDER BY name`,
      [`%${query}%`]
    );


    const songs = await db.pool.query(
      `SELECT
    T.name AS track_name,
    GROUP_CONCAT(A.name SEPARATOR '|') AS artist_names,
    AL.name AS album_name,
    AL.release_date AS song_date,
    AL.image_URL,
    T.spotify_track_ID AS track_id,
    AL.spotify_album_ID AS album_id,
    GROUP_CONCAT(A.spotify_artist_ID SEPARATOR '|') AS artist_ids
FROM Tracks AS T
JOIN Albums AS AL ON T.album_ID = AL.album_ID
LEFT JOIN Track_Artists AS TA ON T.track_ID = TA.track_ID
LEFT JOIN Artists AS A ON TA.artist_ID = A.artist_ID
WHERE T.name LIKE ?
GROUP BY T.spotify_track_ID, AL.album_ID;
`,
      [`%${query}%`]
    );


    const users = await db.pool.query(
      `SELECT username FROM Users WHERE username LIKE ? ORDER BY username`,
      [`%${query}%`]
    );


    const all = users.concat(songs, artists, albums);


    //console.log(all);
    return res.status(200).json(all);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;