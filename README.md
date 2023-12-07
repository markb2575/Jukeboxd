# Instructions for running Jukeboxd locally:

## Pre-configuration:
**Make sure the npm command is usable globally on the system. If it isn't then install node.js**
**Make sure you have mariaDB installed on the system using port 3306**

## Setting up the database:
* Navigate to the `Jukeboxd > DatabaseSQL` directory, then using mariaDB run the `Jukeboxd.sql`, `artists.sql`, `albums.sql`, and `tracks.sql` files in that order. This will take a few minutes, as it is adding a large dataset of artists, albums, and tracks.

## Running the Back-End:
* Navigate to the `Jukeboxd > db.js` file, and comment out the `user: "root"` and `database: "Test"` lines. Uncomment the `user: "jukeboxdAdmin"` and `database: "Jukeboxd"` lines.
* Create a file in the `Jukeboxd` directory named `.env`. Add a line `JWT_SECRET='{secret_key}'` where `{secret_key}` is a jsonwebtoken secret key. Example: if your key was `1234`, then the line you add to `.env` should be `JWT_SECRET='1234'`.
* Open a terminal inside the root of `Jukeboxd` directory
* Use `npm install` to install node_modules needed to run the project.
* Use `npm start` to run the project.

## Running the Front-End:
* Open a terminal inside the root of the `Jukeboxd > client` directory
* Use `npm install` to install node_modules needed to run the project.
* Use `npm start` to run the project.