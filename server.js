require('dotenv').config()
const express = require('express')
//const db = require('./db')
const app = express()
const port = 8080
const bodyParser = require("body-parser");
const cors = require("cors");

const user = require('./routes/user');
const search = require('./routes/search');
 
app.use(cors()); // TODO Might need to be changed
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/user', user);
app.use('/search', search);

app.listen(port, () => console.log(`Listening on port ${port}`));