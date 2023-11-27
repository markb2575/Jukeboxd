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

router.get('/getAlbum/:albumID&:username', async (req, res) => {
    let params = req.params;
    try {
        //console.log("params", params)
        const album = await db.pool.query(`SELECT Albums.name AS albumName, image_URL, release_date, Artists.name AS artistName, Artists.spotify_artist_ID as artistID FROM Albums JOIN Album_Artists ON Albums.album_ID = Album_Artists.album_ID JOIN Artists ON Album_Artists.artist_ID = Artists.artist_ID WHERE Albums.spotify_album_ID = '${params.albumID}';`);
        //TODO: select songs by albumID
        const songs = await db.pool.query(`SELECT Tracks.name AS trackName, Tracks.spotify_track_ID FROM Tracks, Albums WHERE Tracks.album_ID = Albums.album_ID AND Albums.spotify_album_ID = '${params.albumID}';`);

        const album_ID = await db.pool.query(`SELECT Albums.album_ID FROM Albums WHERE Albums.spotify_album_ID = '${params.albumID}';`) // Not returned to keep album_ID private
        const user_ID = await db.pool.query(`SELECT user_ID FROM Users WHERE username = '${params.username}';`) // Not returned to keep user_ID private
        if (user_ID.length == 0) return res.status(404).send()

        const reviews = await db.pool.query(`SELECT review, datetime, (SELECT username FROM Users WHERE user_ID = ReviewedAlbum.user_ID) AS username FROM ReviewedAlbum WHERE album_ID = '${album_ID[0].album_ID}' ORDER BY datetime DESC;`)
        const review = await db.pool.query(`SELECT review, datetime FROM ReviewedAlbum WHERE user_ID = '${user_ID[0].user_ID}' AND album_ID = '${album_ID[0].album_ID}';`)
        const listened = await db.pool.query(`SELECT rating, datetime FROM ListenedAlbum WHERE user_ID = '${user_ID[0].user_ID}' AND album_ID = '${album_ID[0].album_ID}';`)
        const watchlist = await db.pool.query(`SELECT datetime FROM WatchAlbum WHERE user_ID = '${user_ID[0].user_ID}' AND album_ID = '${album_ID[0].album_ID}';`)

        //console.log(songs)
        if (album.length == 0) return res.status(404).send()
        return res.status(200).json({ "album": album, "songs": songs, "reviews": reviews, "review": review, "listened": listened, "watchlist": watchlist })
    } catch (err) {
        throw err;
    }
});

router.post('/setReview', async (req, res) => {
    let params = req.body;

    try {
        // console.log("params setReview", params)

        params.reviewText = params.reviewText.replace("\\", "\\\\")
        params.reviewText = params.reviewText.replace(";", "\\;")
        params.reviewText = params.reviewText.replace("'", "\\'")
        params.reviewText = params.reviewText.replace("`", "\\`")

        // console.log('Review text updated: ', params.reviewText)

        const album_ID = await db.pool.query(`SELECT Albums.album_ID FROM Albums WHERE Albums.spotify_album_ID = '${params.spotifyAlbumID}';`) // Not returned to keep album_ID private
        const user_ID = await db.pool.query(`SELECT user_ID FROM Users WHERE username = '${params.username}';`) // Not returned to keep user_ID private

        const currReview = await db.pool.query(`SELECT review, datetime FROM ReviewedAlbum WHERE user_ID = '${user_ID[0].user_ID}' AND album_ID = '${album_ID[0].album_ID}';`)

        try {
            if (currReview.length === 1) {
                if (currReview[0].review === params.reviewText) { // check if the review is the same, if it is do nothing, if not then update it
                    console.log("review is the same")
                    const reviews = await db.pool.query(`SELECT review, datetime, (SELECT username FROM Users WHERE user_ID = ReviewedAlbum.user_ID) AS username FROM ReviewedAlbum WHERE album_ID = '${album_ID[0].album_ID}' ORDER BY datetime DESC;`)
                    return res.status(200).json({ "reviews": reviews })
                } else {
                    await db.pool.query(`UPDATE ReviewedAlbum SET review = '${params.reviewText}' WHERE user_ID = '${user_ID[0].user_ID}' AND album_ID = '${album_ID[0].album_ID}';`)
                    console.log("review updated")
                    const reviews = await db.pool.query(`SELECT review, datetime, (SELECT username FROM Users WHERE user_ID = ReviewedAlbum.user_ID) AS username FROM ReviewedAlbum WHERE album_ID = '${album_ID[0].album_ID}' ORDER BY datetime DESC;`)
                    return res.status(200).json({ "reviews": reviews })
                }
            }

            await db.pool.query(`INSERT INTO ReviewedAlbum (user_ID, album_ID, review) VALUES ('${user_ID[0].user_ID}', '${album_ID[0].album_ID}', '${params.reviewText}');`)

            const reviews = await db.pool.query(`SELECT review, datetime, (SELECT username FROM Users WHERE user_ID = ReviewedAlbum.user_ID) AS username FROM ReviewedAlbum WHERE album_ID = '${album_ID[0].album_ID}' ORDER BY datetime DESC;`)
            return res.status(200).json({ "reviews": reviews })

        } catch (err) {
            console.log(err)
            throw err
        }

    } catch (err) {
        console.log(err)
        throw err;
    }

});

router.delete('/deleteReview', async (req, res) => {
  let params = req.body;

  try {
      const album_ID = await db.pool.query(`SELECT Albums.album_ID FROM Albums WHERE Albums.spotify_album_ID = '${params.spotifyAlbumID}';`) // Not returned to keep album_ID private
      const user_ID = await db.pool.query(`SELECT user_ID FROM Users WHERE username = '${params.username}';`) // Not returned to keep user_ID private

      await db.pool.query(
        'DELETE FROM ReviewedAlbum WHERE user_ID = ? AND album_ID = ?',
        [user_ID[0].user_ID, album_ID[0].album_ID]
      );
      console.log("review deleted")

      const reviews = await db.pool.query(`SELECT review, datetime, (SELECT username FROM Users WHERE user_ID = ReviewedAlbum.user_ID) AS username FROM ReviewedAlbum WHERE album_ID = '${album_ID[0].album_ID}' ORDER BY datetime DESC;`)
      return res.status(200).json({ "reviews": reviews })

  } catch (err) {
      console.log(err)
      throw err;
  }

});

router.get('/getReview/username=:username&spotifyAlbumID=:albumID', async (req, res) => {
  const username = req.params.username;
  const spotifyAlbumID = req.params.albumID;

  try {
      const album_ID = await db.pool.query(`SELECT Albums.album_ID FROM Albums WHERE Albums.spotify_album_ID = '${spotifyAlbumID}';`) // Not returned to keep album_ID private
      const user_ID = await db.pool.query(`SELECT user_ID FROM Users WHERE username = '${username}';`) // Not returned to keep user_ID private

      const review = await db.pool.query(`SELECT review, datetime FROM ReviewedAlbum WHERE user_ID = '${user_ID[0].user_ID}' AND album_ID = '${album_ID[0].album_ID}';`)

      return res.status(200).json({ "review": review })

  } catch (err) {
      console.log(err)
      throw err;
  }

});

router.post('/setRating', async (req, res) => {
    let params = req.body;

    try {

        const album_ID = await db.pool.query(`SELECT Albums.album_ID FROM Albums WHERE Albums.spotify_album_ID = '${params.spotifyAlbumID}';`) // Not returned to keep album_ID private
        const user_ID = await db.pool.query(`SELECT user_ID FROM Users WHERE username = '${params.username}';`) // Not returned to keep user_ID private

        const currRating = await db.pool.query(`SELECT rating, datetime FROM ListenedAlbum WHERE user_ID = '${user_ID[0].user_ID}' AND album_ID = '${album_ID[0].album_ID}';`)

        try {
            if (currRating.length === 1) {
                if (currRating[0].rating === params.rating) { // check if the rating is the same, if it is do nothing, if not then update it
                    console.log("rating is the same")
                    return res.status(200).send()
                } else {
                    await db.pool.query(`UPDATE ListenedAlbum SET rating = '${params.rating}' WHERE user_ID = '${user_ID[0].user_ID}' AND album_ID = '${album_ID[0].album_ID}';`)
                    console.log("rating updated")
                    return res.status(200).send()
                }
            }

            await db.pool.query(`INSERT INTO ListenedAlbum (user_ID, album_ID, rating) VALUES ('${user_ID[0].user_ID}', '${album_ID[0].album_ID}', '${params.rating}');`)

            return res.status(200).send()

        } catch (err) {
            console.log(err)
            throw err
        }

    } catch (err) {
        console.log(err)
        throw err;
    }

});

router.post('/add-listened-album/:username/:s_album_id', auth, async (req, res) => {
  try {
    const { username, s_album_id } = req.params;


    const album_ID = await db.pool.query(`SELECT Albums.album_ID FROM Albums WHERE Albums.spotify_album_ID = '${s_album_id}';`)
    const user_ID = await db.pool.query(`SELECT user_ID FROM Users WHERE username = '${username}';`)

    // Add the album to the listened Albums
    await db.pool.query(
      'INSERT INTO ListenedAlbum (user_ID, album_ID, rating) VALUES (?, ?, 0)',
      [user_ID[0].user_ID, album_ID[0].album_ID]
    );

    res.status(200).json({ message: 'Album added to listened Albums' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/add-watch-album/:username/:s_album_id', auth, async (req, res) => {
  try {
    const { username, s_album_id } = req.params;


    const album_ID = await db.pool.query(`SELECT Albums.album_ID FROM Albums WHERE Albums.spotify_album_ID = '${s_album_id}';`)
    const user_ID = await db.pool.query(`SELECT user_ID FROM Users WHERE username = '${username}';`) // Not returned to keep user_ID private

    // Add the album to the watch list
    await db.pool.query(
      'INSERT INTO WatchAlbum (user_ID, album_ID) VALUES (?, ?)',
      [user_ID[0].user_ID, album_ID[0].album_ID]
    );

    res.status(200).json({ message: 'Album added to watch list' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/delete-listened-album/:username/:s_album_id', auth, async (req, res) => {
  try {
    const { username, s_album_id } = req.params;


    const album_ID = await db.pool.query(`SELECT Albums.album_ID FROM Albums WHERE Albums.spotify_album_ID = '${s_album_id}';`)
    const user_ID = await db.pool.query(`SELECT user_ID FROM Users WHERE username = '${username}';`) // Not returned to keep user_ID private

    // Delete the album from the listened Albums
    await db.pool.query(
      'DELETE FROM ListenedAlbum WHERE user_ID = ? AND album_ID = ?',
      [user_ID[0].user_ID, album_ID[0].album_ID]
    );

    res.status(200).json({ message: 'Album deleted from listened Albums' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/delete-watch-album/:username/:s_album_id', auth, async (req, res) => {
  try {
    const { username, s_album_id } = req.params;


    const album_ID = await db.pool.query(`SELECT Albums.album_ID FROM Albums WHERE Albums.spotify_album_ID = '${s_album_id}';`)
    const user_ID = await db.pool.query(`SELECT user_ID FROM Users WHERE username = '${username}';`) // Not returned to keep user_ID private

    // Remove the album from the watch list
    await db.pool.query(
      'DELETE FROM WatchAlbum WHERE user_ID = ? AND album_ID = ?',
      [user_ID[0].user_ID, album_ID[0].album_ID]
    );


    res.status(200).json({ message: 'album deleted from watchlist' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;