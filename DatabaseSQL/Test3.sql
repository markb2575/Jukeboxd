DROP DATABASE IF EXISTS Test;
CREATE DATABASE IF NOT EXISTS Test;
USE Test;

-- # CREATE USER 'test'@'localhost' IDENTIFIED BY 'password';
-- # GRANT ALL PRIVILEGES ON Test.* TO 'test'@'localhost';


CREATE TABLE Users (
  user_ID INT AUTO_INCREMENT PRIMARY KEY,
  username varchar(25) NOT NULL UNIQUE,
  password varchar(255) NOT NULL,
  role INT
);

CREATE TABLE Followers (
  follower INT NOT NULL,
  followee INT NOT NULL,
  PRIMARY KEY (follower, followee),
  FOREIGN KEY (followee) REFERENCES Users(user_ID),
  FOREIGN KEY (follower) REFERENCES Users(user_ID)
);

CREATE TABLE Artists (
  artist_ID INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  spotify_artist_ID varchar(100) NOT NULL,
  user_ID INT,
  description VARCHAR(500),
  FOREIGN KEY (user_ID) REFERENCES Users(user_ID)
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
  # year INT NOT NULL,
  # release_date DATE NOT NULL,
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
  datetime DATETIME,
  PRIMARY KEY (user_ID, album_ID),
  FOREIGN KEY (user_ID) REFERENCES Users(user_ID),
  FOREIGN KEY (album_ID) REFERENCES Albums(album_ID)
);

CREATE TABLE ListenedTrack (
  user_ID INT NOT NULL,
  track_ID INT NOT NULL,
  rating INT,
  datetime DATETIME,
  PRIMARY KEY (user_ID, track_ID),
  FOREIGN KEY (user_ID) REFERENCES Users(user_ID),
  FOREIGN KEY (track_ID) REFERENCES Tracks(track_ID)
);

CREATE TABLE ReviewedAlbum (
  user_ID INT NOT NULL,
  album_ID INT NOT NULL,
  review VARCHAR(500),
  datetime DATETIME,
  PRIMARY KEY (user_ID, album_ID),
  FOREIGN KEY (user_ID) REFERENCES Users(user_ID),
  FOREIGN KEY (album_ID) REFERENCES Albums(album_ID)
);

CREATE TABLE ReviewedTrack (
  user_ID INT NOT NULL,
  track_ID INT NOT NULL,
  review VARCHAR(500),
  datetime DATETIME,
  PRIMARY KEY (user_ID, track_ID),
  FOREIGN KEY (user_ID) REFERENCES Users(user_ID),
  FOREIGN KEY (track_ID) REFERENCES Tracks(track_ID)
);

CREATE TABLE WatchAlbum (
  user_ID INT NOT NULL,
  album_ID INT NOT NULL,
  datetime DATETIME,
  PRIMARY KEY (user_ID, album_ID),
  FOREIGN KEY (user_ID) REFERENCES Users(user_ID),
  FOREIGN KEY (album_ID) REFERENCES Albums(album_ID)
);

CREATE TABLE WatchTrack (
  user_ID INT NOT NULL,
  track_ID INT NOT NULL,
  datetime DATETIME,
  PRIMARY KEY (user_ID, track_ID),
  FOREIGN KEY (user_ID) REFERENCES Users(user_ID),
  FOREIGN KEY (track_ID) REFERENCES Tracks(track_ID)
);

-- INSERT INTO Artists (name, spotify_artist_ID) VALUES ('Frank Sinatra', '1Mxqyy3pSjf8kZZL4QVxS0');
-- INSERT INTO Albums (name, spotify_album_ID, release_date, artist_ID, image_URL) VALUES ('Strangers In The Night (Expanded Edition)', '1Mxqyy3pSjf8kZZL4QVxS0', '1966-05-01', 1, 'https://i.scdn.co/image/ab67616d0000b27350bb7ca1fe7e98df87ce41d9');
-- INSERT INTO Tracks (name, spotify_track_ID, album_ID, track_number, disc_number, duration, explicit) VALUES ('Strangers In The Night', '74VR3AkGPhbYXnxcOYa16x', 1, 1, 1, 157866, FALSE);

-- INSERT INTO Albums (name, spotify_album_ID, release_date, artist_ID, image_URL) VALUES ('My Kind Of Broadway', '4pA0MHfxB10F9Q8HhoItIh', '1965-11-01', 1, 'https://i.scdn.co/image/ab67616d0000b27320280fde86d8cf0fea539b8e');
-- INSERT INTO Tracks (name, spotify_track_ID, album_ID, track_number, disc_number, duration, explicit) VALUES ('Luck Be A Lady', '3AgY5gLURlcdYBVGv1RVm7', 2, 3, 1, 314133, FALSE);