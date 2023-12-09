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

/**
 * Returns the artist name, thier albums, their tracks, and thier description
 */
router.get('/getArtist/:artistID&:username', async (req, res) => {
  let params = req.params;
  try {
    // Select artist name, albums, and tracks
    const artist = await db.pool.query(`SELECT Artists.name AS artistName, Artists.description AS artistDescription FROM Artists WHERE Artists.spotify_artist_ID = '${params.artistID}';`);
    const albums = await db.pool.query(`SELECT Albums.name AS albumName, Albums.spotify_album_ID AS albumID, Albums.image_URL FROM Albums, Album_Artists, Artists WHERE Albums.album_ID = Album_Artists.album_ID AND Album_Artists.artist_ID = Artists.artist_ID AND Artists.spotify_artist_ID = '${params.artistID}';`);
    const tracks = await db.pool.query(`SELECT Tracks.name AS trackName, Tracks.spotify_track_ID AS trackID, Albums.image_URL FROM Tracks LEFT JOIN Albums ON Tracks.album_ID = Albums.album_ID LEFT JOIN Track_Artists ON Track_Artists.track_ID = Tracks.track_ID LEFT JOIN Artists ON Artists.artist_ID = Track_Artists.artist_ID WHERE Artists.spotify_artist_ID = '${params.artistID}';`);
    // If no artist was found return 404 error
    if (artist.length == 0) return res.status(404).send()
    return res.status(200).json({ "artistName": artist[0].artistName, "albums": albums, "tracks": tracks, "description": artist[0].artistDescription })
  } catch (err) {
    throw err;
  }
});

/**
 * Deletes the artist description for the artist with the given spotify_artist_ID
 */
router.put('/deleteDescription', auth, async (req, res) => {
  const username = await req.user; // get username from auth middleware
  let params = req.body;

  try {
    // Get the user_ID, artist_ID, and role of user with the username matching that of the person making the request
    const user = await db.pool.query(`SELECT user_ID, artist_ID, role FROM Users WHERE binary username = ?;`, [username])
    // Get the artist_ID of the artist with the spotify_artist_ID given
    const artist_ID = await db.pool.query(`SELECT artist_ID FROM Artists WHERE spotify_artist_ID = ?;`, [params.spotify_artist_ID])

    // Check if the user and the artist exist in the database, if either of them don't then return status 500
    if (user.length === 0 || artist_ID.length === 0) {
      return res.status(500)
    }

    // Ensure the user is linked to the artist, or that the user is an Admin
    if (user[0].artist_ID === artist_ID[0].artist_ID || user[0].role === 0) {
      await db.pool.query(`UPDATE Artists SET description = NULL WHERE artist_ID = '${artist_ID[0].artist_ID}';`); // Delete the description if the user is authorized to do so
      //console.log("description deleted")

      // Get the new description to send to the frontend (will be NULL)
      const descriptionToSend = await db.pool.query(`SELECT description FROM Artists WHERE artist_ID = '${artist_ID[0].artist_ID}';`)
      return res.status(200).json({ "description": descriptionToSend[0].description })
    } else { // If the user is not linked to the artist and not an admin, then return status 401
      return res.status(401)
    }

  } catch (err) {
    console.log(err)
    throw err;
  }

});

/**
 * Get the description of the artist with the given spotify_artist_ID
 */
router.get('/getDescription/:artistID', async (req, res) => {
  const artistSpotifyID = req.params.artistID;

  try {
    // Get the description of the artist with the given spotify_artist_ID then return it along with status 200
    const descriptionToSend = await db.pool.query(`SELECT description FROM Artists WHERE spotify_artist_ID = ?;`, [artistSpotifyID])
    return res.status(200).json({ "description": descriptionToSend[0].description })

  } catch (err) {
    console.log(err)
    throw err;
  }

});

/**
 * Set the description for the artist with the given spotify_artist_ID. Checks if the current description is the same as the new description, if it is then
 * this does nothing, otherwise it updates the description to the new one
 */
router.put('/setDescription', auth, async (req, res) => {
  const username = await req.user; // get username from auth middleware
  let params = req.body;

  try {
    // Get the user_ID, artist_ID, and role of user with the username matching that of the person making the request
    const user = await db.pool.query(`SELECT user_ID, artist_ID, role FROM Users WHERE binary username = ?;`, [username])
    // Get the artist_ID of the artist with the spotify_artist_ID given
    const artist_ID = await db.pool.query(`SELECT artist_ID FROM Artists WHERE spotify_artist_ID = ?;`, [params.spotify_artist_ID])

    // Check if the user and the artist exist in the database, if either of them don't then return status 500
    if (user.length === 0 || artist_ID.length === 0) {
      return res.status(500)
    }

    // Ensure the user is linked to the artist, or that the user is an Admin
    if (user[0].artist_ID === artist_ID[0].artist_ID || user[0].role === 0) {

      // Remove potential issues from the description text -- beacuse the queries are paramaterized this isn't strictly necessary anymore
      /*
      params.descriptionText = params.descriptionText.replace("\\", "\\\\")
      params.descriptionText = params.descriptionText.replace(";", "\\;")
      params.descriptionText = params.descriptionText.replace("'", "\\'")
      params.descriptionText = params.descriptionText.replace("`", "\\`")
      */

      // Get the current description for the artist with the given spotify_artist_ID
      const currDescription = await db.pool.query(`SELECT description FROM Artists WHERE artist_ID = '${artist_ID[0].artist_ID}';`)
      //console.log(currDescription)

      try {
        if (currDescription.length === 1) { // Check if the current description is an empty array or not (in theory this should never be an empty array since it should be null if they exist in the database, and if they don't then it should've returned status 500 by now, but doesn't hurt to check)
          if (currDescription[0].description === params.descriptionText) { // check if the description is the same
            //console.log("description is the same") // Description is the same, so do nothing
          } else { // If the description is not the same (this includes if it is null (i.e. no description)) then update it
            await db.pool.query(`UPDATE Artists SET description = ? WHERE artist_ID = ?;`, [params.descriptionText, artist_ID[0].artist_ID])
            //console.log("description updated")
          }
          // Get the new description from the database, then send that back to the frontend with status 200
          const descriptionToSend = await db.pool.query(`SELECT description FROM Artists WHERE artist_ID = '${artist_ID[0].artist_ID}';`)
          return res.status(200).json({ "description": descriptionToSend[0].description })
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    } else { // If the user is not linked to the artist and not an admin, then return status 401
      return res.status(401)
    }

  } catch (err) {
    console.log(err)
    throw err;
  }

});




module.exports = router;