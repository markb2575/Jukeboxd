# Instructions for running Jukeboxd:

## Pre-configuration:
**Make sure the npm command is usable globally on the system. If it isn't then install node.js**
**Make sure you have mariaDB installed on the system using port 3306**

## Setting up the database:
* Navigate to the `Jukeboxd > DatabaseSQL` directory, then using mariaDB run the `Jukeboxd.sql`, `artists.sql`, `albums.sql`, and `tracks.sql` files in that order. This will take a few minutes, as it is adding a large dataset of artists, albums, and tracks.

## Running the Back-End:
* Open a terminal inside the root of `Jukeboxd` directory
* Use `npm install` to install node_modules needed to run the project.
* Use `npm start` to run the project.

## Running the Front-End:
* If you're using the VM, open the `Jukeboxd > client > package.json` file, and add the line `"proxy": "http://127.0.0.1:8080",` under `"private": true,` at the top. Additionally, change the `start` script in the `scripts` to be `"start": "PORT=4000 react-scripts start",`. Finally, remove all instances of `http://localhost:8080` from the `client` directory. This can be done on vscode by using the search feature (CTRL + SHIFT + F), searching for `http://localhost:8080`, and leaving the replace field blank, then clicking replace all (CTRL + ALT + ENTER). NOTE: there is one instance of `http://localhost:8080` outside of the `client` directory, in the `Testing` directory. It occurs at the way bottom on line 1875 of `Jukeboxd testing.postman_collection.json`. Make sure you change that back to `"value": "http://localhost:8080",`. If you are not using the VM, then you can ignore the steps outline in this bullet point
* Open a terminal inside the root of the `Jukeboxd > client` directory
* Use `npm install` to install node_modules needed to run the project.
* Use `npm start` to run the project.