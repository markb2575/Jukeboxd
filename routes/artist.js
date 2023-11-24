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

router.get('/getArtist/:artistID&:username', async (req, res) => {
  let params = req.params;
  try {
    const artist = await db.pool.query(`SELECT Artists.name AS artistName, Artists.description AS artistDescription FROM Artists WHERE Artists.spotify_artist_ID = '${params.artistID}';`);
    const albums = await db.pool.query(`SELECT Albums.name AS albumName, Albums.spotify_album_ID AS albumID, Albums.image_URL FROM Albums, Album_Artists, Artists WHERE Albums.album_ID = Album_Artists.album_ID AND Album_Artists.artist_ID = Artists.artist_ID AND Artists.spotify_artist_ID = '${params.artistID}';`);
    const tracks = await db.pool.query(`SELECT Tracks.name AS trackName, Tracks.spotify_track_ID AS trackID, Albums.image_URL FROM Tracks LEFT JOIN Albums ON Tracks.album_ID = Albums.album_ID LEFT JOIN Track_Artists ON Track_Artists.track_ID = Tracks.track_ID LEFT JOIN Artists ON Artists.artist_ID = Track_Artists.artist_ID WHERE Artists.spotify_artist_ID = '${params.artistID}';`);
    //console.log(artist, albums, tracks)

    // const track = await db.pool.query(`SELECT Tracks.name AS trackName, Tracks.disc_number, Tracks.duration, Tracks.explicit, Tracks.track_number FROM Tracks WHERE Tracks.spotify_track_ID = '${params.trackID}';`);
    // const artist = await db.pool.query(`SELECT Artists.name, Artists.spotify_artist_ID AS artistID FROM Artists, Album_Artists, Tracks WHERE Tracks.spotify_track_ID = '${params.trackID}' AND Tracks.album_ID = Album_Artists.album_ID AND Album_Artists.artist_ID = Artists.artist_ID;`);
    // const album = await db.pool.query(`SELECT Albums.name, Albums.spotify_album_ID AS albumID, Albums.image_URL FROM Albums, Tracks WHERE Tracks.spotify_track_ID = '${params.trackID}' AND Tracks.album_ID = Albums.album_ID;;`);

    // const track_ID = await db.pool.query(`SELECT Tracks.track_ID FROM Tracks WHERE Tracks.spotify_track_ID = '${params.trackID}';`) // Not returned to keep track_ID private
    // const user_ID = await db.pool.query(`SELECT user_ID FROM Users WHERE username = '${params.username}';`) // Not returned to keep user_ID private

    // const reviews = await db.pool.query(`SELECT review, datetime, (SELECT username FROM Users WHERE user_ID = ReviewedTrack.user_ID) AS username FROM ReviewedTrack WHERE track_ID = '${track_ID[0].track_ID}';`)
    // const review = await db.pool.query(`SELECT review, datetime FROM ReviewedTrack WHERE user_ID = '${user_ID[0].user_ID}' AND track_ID = '${track_ID[0].track_ID}';`)
    // const listened = await db.pool.query(`SELECT rating, datetime FROM ListenedTrack WHERE user_ID = '${user_ID[0].user_ID}' AND track_ID = '${track_ID[0].track_ID}';`)
    // const watchlist = await db.pool.query(`SELECT datetime FROM WatchTrack WHERE user_ID = '${user_ID[0].user_ID}' AND track_ID = '${track_ID[0].track_ID}';`)


    // console.log(track, artist, album)
    //console.log('User_ID: ', user_ID, 'Review: ', review, 'Listened: ', listened, 'Watchlist: ', watchlist, "Reviews: ", reviews)
    if (artist.length == 0) return res.status(404).send()
    return res.status(200).json({ "artistName": artist[0].artistName, "albums": albums, "tracks": tracks, "description": artist[0].artistDescription })
    // return res.status(200).json({ "track": track, "artist": artist, "album": album, "review": review, "listened": listened, "watchlist": watchlist, "reviews": reviews })
  } catch (err) {
    throw err;
  }
});

router.put('/deleteDescription', async (req, res) => {
  let params = req.body;

  try {
    await db.pool.query('UPDATE Artists SET description = NULL WHERE spotify_artist_ID = ?', [params.spotify_artist_ID]);
    console.log("description deleted")

    const descriptionToSend = await db.pool.query(`SELECT description FROM Artists WHERE spotify_artist_ID = '${params.spotify_artist_ID}';`)
    return res.status(200).json({ "description": descriptionToSend[0].description })

  } catch (err) {
    console.log(err)
    throw err;
  }

});

router.get('/getDescription/:artistID', async (req, res) => {
  const artistSpotifyID = req.params.artistID;

  try {
    const descriptionToSend = await db.pool.query(`SELECT description FROM Artists WHERE spotify_artist_ID = '${artistSpotifyID}';`)
    return res.status(200).json({ "description": descriptionToSend[0].description })

  } catch (err) {
    console.log(err)
    throw err;
  }

});

router.put('/setDescription', async (req, res) => {
  let params = req.body;

  try {
    // console.log("params setDescription", params)

    params.descriptionText = params.descriptionText.replace("\\", "\\\\")
    params.descriptionText = params.descriptionText.replace(";", "\\;")
    params.descriptionText = params.descriptionText.replace("'", "\\'")
    params.descriptionText = params.descriptionText.replace("`", "\\`")

    // console.log('description text updated: ', params.description)

    const currDescription = await db.pool.query(`SELECT description FROM Artists WHERE spotify_artist_ID = '${params.spotify_artist_ID}';`)

    console.log(currDescription)

    try {
      if (currDescription.length === 1) {
        if (currDescription[0].description === params.descriptionText) { // check if the description is the same, if it is do nothing, if not then update it
          console.log("description is the same")
          const descriptionToSend = await db.pool.query(`SELECT description FROM Artists WHERE spotify_artist_ID = '${params.spotify_artist_ID}';`)
          return res.status(200).json({ "description": descriptionToSend[0].description })
        } else {
          await db.pool.query(`UPDATE Artists SET description = '${params.descriptionText}' WHERE spotify_artist_ID = '${params.spotify_artist_ID}';`)
          console.log("description updated")
          const descriptionToSend = await db.pool.query(`SELECT description FROM Artists WHERE spotify_artist_ID = '${params.spotify_artist_ID}';`)
          return res.status(200).json({ "description": descriptionToSend[0].description })
        }
      }
    } catch (err) {
      console.log(err)
      throw err
    }

  } catch (err) {
    console.log(err)
    throw err;
  }

});




module.exports = router;