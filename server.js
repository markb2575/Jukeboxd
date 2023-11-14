require('dotenv').config()
const express = require('express')
//const db = require('./db')
const app = express()
const port = 8080
const bodyParser = require("body-parser");
const cors = require("cors");

const user = require('./routes/user');
const search = require('./routes/search');
const album = require('./routes/album');
const track = require('./routes/track')
const artist = require('./routes/artist')
 
app.use(cors()); // TODO Might need to be changed
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use('/user', user);
app.use('/album', album);
app.use('/track', track);
app.use('/artist', artist);
app.use('/search', search);

app.listen(port, () => console.log(`Listening on port ${port}`));