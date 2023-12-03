DROP DATABASE IF EXISTS Jukeboxd;
CREATE DATABASE IF NOT EXISTS Jukeboxd;

CREATE USER 'jukeboxdAdmin'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON Jukeboxd.* TO 'jukeboxdAdmin'@'localhost';

USE Jukeboxd;

CREATE TABLE Artists (
  artist_ID INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  spotify_artist_ID varchar(100) NOT NULL,
  description VARCHAR(500)
);

CREATE TABLE Users (
  user_ID INT AUTO_INCREMENT PRIMARY KEY,
  username varchar(25) NOT NULL UNIQUE,
  password varchar(255) NOT NULL,
  role INT DEFAULT 1,
  artist_ID INT,
  FOREIGN KEY (artist_ID) REFERENCES Artists(artist_ID)
);

INSERT INTO Users (username, password, role) VALUES ('Admin', '$2a$10$U91e2vdIdQhTQF8nm5HaMucFuvgIe4dgSegH4DLmq/0O.0H.V.ldK', 0);

CREATE TABLE Followers (
  follower INT NOT NULL,
  followee INT NOT NULL,
  PRIMARY KEY (follower, followee),
  FOREIGN KEY (followee) REFERENCES Users(user_ID) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (follower) REFERENCES Users(user_ID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Albums (
  album_ID INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  spotify_album_ID varchar(100) NOT NULL,
  release_date DATE,
  image_URL varchar(100)
);

CREATE TABLE Album_Artists (
  album_ID INT NOT NULL,
  artist_ID INT NOT NULL,
  PRIMARY KEY (album_ID, artist_ID),
  FOREIGN KEY (album_ID) REFERENCES Albums(album_ID),
  FOREIGN KEY (artist_ID) REFERENCES Artists(artist_ID)
);

CREATE TABLE Tracks (
  track_ID INT AUTO_INCREMENT PRIMARY KEY,
  spotify_track_ID varchar(100) NOT NULL,
  name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  album_ID INT,
  track_number INT NOT NULL,
  disc_number INT NOT NULL,
  explicit BOOLEAN NOT NULL,
  duration INT NOT NULL,
  FOREIGN KEY (album_ID) REFERENCES Albums(album_ID)
);

CREATE TABLE Track_Artists (
  track_ID INT NOT NULL,
  artist_ID INT NOT NULL,
  PRIMARY KEY (track_ID, artist_ID),
  FOREIGN KEY (track_ID) REFERENCES Tracks(track_ID),
  FOREIGN KEY (artist_ID) REFERENCES Artists(artist_ID)
);

CREATE TABLE ListenedAlbum (
  user_ID INT NOT NULL,
  album_ID INT NOT NULL,
  rating INT,
  datetime DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_ID, album_ID),
  FOREIGN KEY (user_ID) REFERENCES Users(user_ID) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (album_ID) REFERENCES Albums(album_ID)
);

CREATE TABLE ListenedTrack (
  user_ID INT NOT NULL,
  track_ID INT NOT NULL,
  rating INT,
  datetime DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_ID, track_ID),
  FOREIGN KEY (user_ID) REFERENCES Users(user_ID) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (track_ID) REFERENCES Tracks(track_ID)
);

CREATE TABLE ReviewedAlbum (
  user_ID INT NOT NULL,
  album_ID INT NOT NULL,
  review VARCHAR(500),
  datetime DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_ID, album_ID),
  FOREIGN KEY (user_ID) REFERENCES Users(user_ID) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (album_ID) REFERENCES Albums(album_ID)
);

CREATE TABLE ReviewedTrack (
  user_ID INT NOT NULL,
  track_ID INT NOT NULL,
  review VARCHAR(500),
  datetime DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_ID, track_ID),
  FOREIGN KEY (user_ID) REFERENCES Users(user_ID) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (track_ID) REFERENCES Tracks(track_ID)
);

CREATE TABLE WatchAlbum (
  user_ID INT NOT NULL,
  album_ID INT NOT NULL,
  datetime DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_ID, album_ID),
  FOREIGN KEY (user_ID) REFERENCES Users(user_ID) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (album_ID) REFERENCES Albums(album_ID)
);

CREATE TABLE WatchTrack (
  user_ID INT NOT NULL,
  track_ID INT NOT NULL,
  datetime DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_ID, track_ID),
  FOREIGN KEY (user_ID) REFERENCES Users(user_ID) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (track_ID) REFERENCES Tracks(track_ID)
);