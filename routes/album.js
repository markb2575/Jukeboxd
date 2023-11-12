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
        const album = await db.pool.query(`SELECT albums.name AS albumName, image_URL, release_date, artists.name AS artistName, artists.spotify_artist_ID as artistID FROM albums JOIN album_artists ON albums.album_ID = album_artists.album_ID JOIN artists ON album_artists.artist_ID = artists.artist_ID WHERE albums.spotify_album_ID = '${params.albumID}';`);
        //TODO: select songs by albumID
        const songs = await db.pool.query(`SELECT tracks.name AS trackName, tracks.spotify_track_ID from tracks, albums WHERE tracks.album_ID = albums.album_ID AND albums.spotify_album_ID = '${params.albumID}';`);

        const album_ID = await db.pool.query(`SELECT albums.album_ID FROM albums WHERE albums.spotify_album_ID = '${params.albumID}';`) // Not returned to keep album_ID private
        const user_ID = await db.pool.query(`SELECT user_ID FROM Users WHERE username = '${params.username}';`) // Not returned to keep user_ID private

        const reviews = await db.pool.query(`SELECT review, datetime, (SELECT username FROM Users WHERE user_ID = ReviewedAlbum.user_ID) AS username FROM ReviewedAlbum WHERE album_ID = '${album_ID[0].album_ID}';`)
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

        const album_ID = await db.pool.query(`SELECT albums.album_ID FROM albums WHERE albums.spotify_album_ID = '${params.spotifyAlbumID}';`) // Not returned to keep album_ID private
        const user_ID = await db.pool.query(`SELECT user_ID FROM Users WHERE username = '${params.username}';`) // Not returned to keep user_ID private

        const currReview = await db.pool.query(`SELECT review, datetime FROM ReviewedAlbum WHERE user_ID = '${user_ID[0].user_ID}' AND album_ID = '${album_ID[0].album_ID}';`)

        try {
            if (currReview.length === 1) {
                if (currReview[0].review === params.reviewText) { // check if the review is the same, if it is do nothing, if not then update it
                    console.log("review is the same")
                    return res.status(200).send()
                } else {
                    await db.pool.query(`UPDATE ReviewedAlbum SET review = '${params.reviewText}' WHERE user_ID = '${user_ID[0].user_ID}' AND album_ID = '${album_ID[0].album_ID}';`)
                    console.log("review updated")
                    return res.status(200).send()
                }
            }

            await db.pool.query(`INSERT INTO ReviewedAlbum (user_ID, album_ID, review) VALUES ('${user_ID[0].user_ID}', '${album_ID[0].album_ID}', '${params.reviewText}');`)

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

router.post('/setRating', async (req, res) => {
    let params = req.body;

    try {

        const album_ID = await db.pool.query(`SELECT albums.album_ID FROM albums WHERE albums.spotify_album_ID = '${params.spotifyAlbumID}';`) // Not returned to keep album_ID private
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


    const album_ID = await db.pool.query(`SELECT albums.album_ID FROM albums WHERE albums.spotify_album_ID = '${s_album_id}';`)
    const user_ID = await db.pool.query(`SELECT user_ID FROM Users WHERE username = '${username}';`)

    // Add the album to the listened albums
    await db.pool.query(
      'INSERT INTO ListenedAlbum (user_ID, album_ID, rating) VALUES (?, ?, 0)',
      [user_ID[0].user_ID, album_ID[0].album_ID]
    );

    res.status(200).json({ message: 'Album added to listened albums' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/add-watch-album/:username/:s_album_id', auth, async (req, res) => {
  try {
    const { username, s_album_id } = req.params;


    const album_ID = await db.pool.query(`SELECT albums.album_ID FROM albums WHERE albums.spotify_album_ID = '${s_album_id}';`)
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


    const album_ID = await db.pool.query(`SELECT albums.album_ID FROM albums WHERE albums.spotify_album_ID = '${s_album_id}';`)
    const user_ID = await db.pool.query(`SELECT user_ID FROM Users WHERE username = '${username}';`) // Not returned to keep user_ID private

    // Delete the album from the listened albums
    await db.pool.query(
      'DELETE FROM ListenedAlbum WHERE user_ID = ? AND album_ID = ?',
      [user_ID[0].user_ID, album_ID[0].album_ID]
    );

    res.status(200).json({ message: 'Album deleted from listened albums' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/delete-watch-album/:username/:s_album_id', auth, async (req, res) => {
  try {
    const { username, s_album_id } = req.params;


    const album_ID = await db.pool.query(`SELECT albums.album_ID FROM albums WHERE albums.spotify_album_ID = '${s_album_id}';`)
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