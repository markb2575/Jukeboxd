const express = require('express')
const db = require('../db')
const auth = require('./middleware')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

router.post('/login', async (req, res) => {
    let credentials = req.body;
    try {
        const hash = await db.pool.query(`select password from users where username = '${credentials.username}'`);
        // userID could not be found
        if (hash.length == 0) return res.status(401).send()
        if (await bcrypt.compare(credentials.password, hash[0].password)) {
            var token = jwt.sign({username:credentials.username}, process.env.JWT_SECRET, {expiresIn:'7d'})
            return res.json({"token": token});
        }
        // password does not match hash in database
        res.status(401).send()
    } catch (err) {
        throw err;
    }
});

router.post('/signup', async (req, res) => {
    let credentials = req.body;
    try {
        const exists = await db.pool.query(`select * from users where username = '${credentials.username}'`)
        console.log(exists)
        if (exists.length === 1) return res.status(400).send()
        const hashed = await bcrypt.hash(credentials.password, await bcrypt.genSalt())
        await db.pool.query("insert into users(username, password) values (?,?)", [credentials.username, hashed]);
        return res.status(200).send()
    } catch (err) {
        throw err;
    }
});

router.get('/findUser/:username', async (req, res) => {
    let params = req.params;
    try {
        const user = await db.pool.query(`select * from users where username = '${params.username}'`);
        // if username could not be found
        console.log(user)
        if (user.length == 0) return res.status(404).send()
        return res.status(200).send()
    } catch (err) {
        throw err;
    }
});

router.post('/followUser', async (req, res) => {
    let usernames = req.body;
    try {
        const followerID = await db.pool.query(`select user_ID from users where username = '${usernames.followerUsername}'`)
        const followeeID = await db.pool.query(`select user_ID from users where username = '${usernames.followeeUsername}'`)
        if (followeeID.length === 0 || followerID.length === 0) return res.status(400).send()
        // check if follower already follows followee
        const exists = await db.pool.query(`select * from followers where follower = '${followerID[0].user_ID}' and followee = '${followeeID[0].user_ID}'`)
        if (exists.length != 0) return res.status(403).send()
        await db.pool.query("insert into followers(follower, followee) values (?,?)", [followerID[0].user_ID, followeeID[0].user_ID])
        return res.status(200).send()
    } catch (err) {
        throw err;
    }
});
router.post('/unfollowUser', async (req, res) => {
    let usernames = req.body;
    try {
        const followerID = await db.pool.query(`select user_ID from users where username = '${usernames.followerUsername}'`)
        const followeeID = await db.pool.query(`select user_ID from users where username = '${usernames.followeeUsername}'`)
        if (followeeID.length === 0 || followerID.length === 0) return res.status(400).send()
        // // check if follower already follows followee
        const exists = await db.pool.query(`select * from followers where follower = '${followerID[0].user_ID}' and followee = '${followeeID[0].user_ID}'`)
        if (exists.length === 0) return res.status(403).send()
        await db.pool.query(`delete from followers where follower = '${followerID[0].user_ID}' and followee = '${followeeID[0].user_ID}'`)
        return res.status(200).send()
    } catch (err) {
        throw err;
    }
});
router.get('/follower=:followerUsername&followee=:followeeUsername', async (req, res) => {
    console.log("inside check status")
    console.log("params",req.params)
    const followerUsername = req.params.followerUsername;
    const followeeUsername = req.params.followeeUsername;
    try {
        console.log(followerUsername,followeeUsername)
        const followerID = await db.pool.query(`select user_ID from users where username = '${followerUsername}'`)
        const followeeID = await db.pool.query(`select user_ID from users where username = '${followeeUsername}'`)
        if (followeeID.length === 0 || followerID.length === 0) return res.status(400).send()
        // // check if follower already follows followee
        const exists = await db.pool.query(`select * from followers where follower = '${followerID[0].user_ID}' and followee = '${followeeID[0].user_ID}'`)
        if (exists.length === 0) {
            console.log("not following")
            return res.status(200).json({'isFollowing' : false})
        } else if (exists.length === 1) {
            console.log("already following")
            return res.status(200).json({'isFollowing' : true})
        }
        return res.status(400).send()
        // await db.pool.query("insert into followers(follower, followee) values (?,?)", [followerID[0].user_ID, followeeID[0].user_ID])
        // return res.status(200).send()
    } catch (err) {
        throw err;
    }
});

router.get('/search/users/:query', async (req, res) => {
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

router.get('/search/tracks/:query', async (req, res) => {
  try {
    const query = req.params.query; // Use req.params.query to access the query parameter
    console.log(query);
    
    // Use a parameterized query to safely search for users
    const songs = await db.pool.query(
      `SELECT T.name AS song_name, A.name AS artist_name, AL.name AS album_name, AL.release_date AS song_date, AL.image_URL, T.spotify_track_ID AS track_id, AL.spotify_album_ID AS album_id, A.spotify_artist_ID AS artist_id FROM Tracks AS T JOIN Albums AS AL ON T.album_ID = AL.album_ID JOIN Artists AS A ON AL.artist_ID = A.artist_ID WHERE T.name LIKE ?`,
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

router.get('/search/artists/:query', async (req, res) => {
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

router.get('/search/albums/:query', async (req, res) => {
  try {
    const query = req.params.query; // Use req.params.query to access the query parameter
    console.log(query);
    
    // Use a parameterized query to safely search for users
     const albums = await db.pool.query(
      `SELECT AL.name AS album_name, A.name AS artist_name, AL.release_date AS release_date, AL.image_URL, AL.spotify_album_ID AS album_id, A.spotify_artist_id AS artist_id FROM Albums AS AL JOIN Artists AS A ON AL.artist_ID = A.artist_ID WHERE AL.name LIKE ?`,
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

router.get('/search/all/:query', async (req, res) => {
  try {
    const query = req.params.query; // Use req.params.query to access the query parameter
    console.log(query);
    
    // Use a parameterized query to safely search for users
    const albums = await db.pool.query(
      `SELECT AL.name AS album_name, A.name AS artist_name, AL.release_date AS release_date, AL.image_URL, AL.spotify_album_ID AS album_id, A.spotify_artist_id AS artist_id FROM Albums AS AL JOIN Artists AS A ON AL.artist_ID = A.artist_ID WHERE AL.name LIKE ?`,
      [`%${query}%`] // Use parameterized query
    );

    const artists = await db.pool.query(
      `SELECT name AS artist_name, spotify_artist_ID AS id FROM Artists WHERE name LIKE ?`,
      [`%${query}%`] // Use parameterized query
    );

    const songs = await db.pool.query(
      `SELECT T.name AS song_name, A.name AS artist_name, AL.name AS album_name, AL.release_date AS song_date, AL.image_URL, T.spotify_track_ID AS track_id, AL.spotify_album_ID AS album_id, A.spotify_artist_ID AS artist_id FROM Tracks AS T JOIN Albums AS AL ON T.album_ID = AL.album_ID JOIN Artists AS A ON AL.artist_ID = A.artist_ID WHERE T.name LIKE ?`,
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