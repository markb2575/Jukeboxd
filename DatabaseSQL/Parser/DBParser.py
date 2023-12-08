'''
Python script which parses the data.csv file then creates SQL queries to saturate our database with the artists, albums, and tracks data.

Written by Mark Bassily and Jacob Gorelick.
'''

import csv
import re

'''
This function creates the artists.sql file by parsing the data.csv file for all the relevant information, then writing it to a file title artists.sql
There are artists for the tracks and the albums, and we need to get both. Counter-intuitively, the albums artists are not a subset of the track artists, so when we originally
parsed only the track artists expecting to cover all the album artists, we ran into trouble. Thus we need to create two sets of artists and spotify_artist_IDs (URIs), one for the
albums, and one for the tracks, then combine them without any duplicates to enter into our artists table.

Written by Mark Bassily, modified by Jacob Gorelick.
'''
def Artists():
    Artists = {} # Stores the artists information. Because it is a dict data structure, it automatically prevents duplicates. We use the URIs of the artists as the key since they are unique
    mismatches = [] # stores mismatches if the number of names of artists and the number of artists for a given track don't match... this hasn't been an issues since the code
                    # was modified to replace `\,` with `.&&.` then split where there were commas (since the `\,` commas were meant to not be split... they were part of the artists name),
                    # then revert `.&&.` back to `\,`
    with open('data.csv', mode='r', encoding="utf8") as f:
        reader = csv.reader(f)
        next(f)
        j = 1
        for row in reader:
            j += 1
            artistURIs = row[2].replace("spotify:artist:", "").split(",") # This gets the artist URIs for the track (each row in the .csv is a single track)
                                                                          # The URIs are "The resource identifier of, for example, an artist, album or track. This can be entered in the search
                                                                          # box in a Spotify Desktop Client, to navigate to that resource. To find a Spotify URI, right-click (on Windows) or
                                                                          # Ctrl-Click (on a Mac) on the artist, album or track name" (https://developer.spotify.com/documentation/web-api/concepts/spotify-uris-ids)
                                                                          # They are inherently unique, so we can remove the type identifier (spotify:artist), then use the remainder, which is a
                                                                          # base-62 identifier, as a unique ID for each artist. This alone could be used as a primary key in our database,
                                                                          # but we instead opted to create our own primary keys automatically for increased security, and to use these as
                                                                          # paths in the URL on our website, and to ensure we don't have duplicates when we import them to the Artists dict
            artistNames = row[3].replace("\\,", ".&&.").replace("\\", "\\\\").replace("'", "\\'").split(",") # This gets the artists name for the track, and replaces any potentially harmful characters

            artistURIsAlbums = row[6].replace("spotify:artist:", "").split(",") # This gets the artist URIs for the album that the track is on (which are not necessarily the same artists)
            artistNamesAlbums = row[7].replace("\\,", ".&&.").replace("\\", "\\\\").replace("'", "\\'").split(",") # This gets the artist names for the album the track is on

            for name in artistNames:
                name = name.replace(".&&.", "\\,").strip() # We split artists by commas, but if an artist has a comma in their name we don't want to separate them, since it would create a mismatch. This reverts the
                                                           # commas that were in a track artists name back to commas, since we replaced them with `.&&.` to prevent unwanted splitting

            for name in artistNamesAlbums:
                name = name.replace(".&&.", "\\,").strip() # We split artists by commas, but if an artist has a comma in their name we don't want to separate them, since it would create a mismatch. This reverts the
                                                           # commas that were in an album artists name back to commas, since we replaced them with `.&&.` to prevent unwanted splitting

            if (len(artistNames) != len(artistURIs)): # Identifies mismatches in the track artists (if we have more track artist URIs than track artist names). Since we prevent unwanted splitting by
                                                      # replacing the commas, this no longer finds any mismatches
                print("lengths of track artists dont match for row ", j)
                mismatches.append((j, row[2], row[3], len(artistNames)))

            if (len(artistNamesAlbums) != len(artistURIsAlbums)): # Identifies mismatches in the album artists (if we have more album artist URIs than album artist names). Since we prevent unwanted splitting by
                                                                  # replacing the commas, this no longer finds any mismatches
                print("lengths of album artists dont match for row ", j)
                mismatches.append((j, row[6], row[7], len(artistNamesAlbums)))

            for i in range(len(artistURIs)):
                if (Artists.get(artistURIs[i].strip()) == artistNames[i].strip() and Artists.get(artistURIs[i].strip()) != None): # Checks if the track artist is in the artists dict
                    continue # If they're in the artists dict, do nothing
                    # print(f"artist uri for [{artistURIs[i]}] does not match. [{artistNames[i]}] [{Artists.get(artistURIs[i])}]")
                else:
                    Artists[artistURIs[i].strip()] = artistNames[i].replace(".&&.", "\\,").strip() # If they're not in the artists dict, add them to it

            for i in range(len(artistURIsAlbums)): # Checks if the album artist is in the artists dict
                if (Artists.get(artistURIsAlbums[i].strip()) == artistNamesAlbums[i].strip() and Artists.get(artistURIsAlbums[i].strip()) != None):
                    continue # If they're in the artists dict, do nothing
                    # print(f"artist uri for [{artistURIs[i]}] does not match. [{artistNames[i]}] [{Artists.get(artistURIs[i])}]")
                else:
                    Artists[artistURIsAlbums[i].strip()] = artistNamesAlbums[i].replace(".&&.", "\\,").strip() # If they're not in the artists dict, add them to it

    with open("artists.sql", 'w', encoding="utf8") as fw:
        for artist in Artists:
            fw.write(
                f"INSERT INTO Artists (name, spotify_artist_ID) VALUES ('{Artists[artist]}', '{artist}');\n") # Create an sql query to add the artist to the Artists table

    f.close()
    fw.close()
    print("Completed Artists")
    print(f"{len(Artists)} {len(set(Artists))}") # Print how many artists there are
    for mismatch in mismatches: # Print the mismatches if there are any
        print(mismatch)


'''
This function creates the albums.sql file by parsing the data.csv file for all the relevant information, then writing it to a file title albums.sql.

Written by Mark Bassily, modified by Jacob Gorelick.
'''
def Albums():
    Albums = {} # dict to store the albums
    with open('data.csv', mode='r', encoding="utf8") as f:
        reader = csv.reader(f)
        next(f)
        with open("albums.sql", 'w', encoding="utf8") as fw:
            for row in reader:
                name = row[5].replace("\\", "\\\\").strip() # Adds additional backslash to ensure we ignore things that are meant to be ignored
                name = name.replace("'", "\\'").strip() # Adds a backslash to ' so we ignore them
                spotify_album_ID = row[4].replace("spotify:album:", "").strip() # Removes the type identifier from the album URI

                release_date = row[8] # Gets the release date, ensures it matches yyyy-mm-dd format, if not it adds a default of 01 to the day, and 01 to the month (if necessary).
                                      # Our databaes rejects any dates unless they are yyyy-mm-dd format, so cannot input a release date that doesn't have a day or a month
                if not re.match(r'^\d{4}-\d{2}-\d{2}$', release_date):
                    release_date += "-01"
                if not re.match(r'^\d{4}-\d{2}-\d{2}$', release_date):
                    release_date += "-01"

                image_URL = row[9] # Gets the image_URL for the album

                spotify_artist_ID = row[6].split(",") # Gets the artists for the album
                for i in range(len(spotify_artist_ID)):
                    spotify_artist_ID[i] = spotify_artist_ID[i].replace("spotify:artist:", "").strip() # Removes the type identifier from the album artist URI

                if (Albums.get(spotify_album_ID) == spotify_album_ID and Albums.get(spotify_album_ID) != None): # Checks if the album is in the albums dict
                    continue # If it is in the dict, do nothing
                else:
                    Albums[spotify_album_ID] = spotify_album_ID # If it isn't in the dict, add it to the dict with the base-62 identifier as the key

                if (image_URL == ''): # Not every album has an image. If the album doesn't have an image, we do a separate SQL query
                    # SQL query to insert the album into the Albums table in the database (if it doesn't have an image)
                    fw.write(
                        f"INSERT INTO Albums (name, spotify_album_ID, release_date, image_URL) VALUES ('{name}', '{spotify_album_ID}', '{release_date}', NULL);\n")
                else:
                    # SQL query to insert the album into the Albums table in the database (if it does have an image)
                    fw.write(
                        f"INSERT INTO Albums (name, spotify_album_ID, release_date, image_URL) VALUES ('{name}', '{spotify_album_ID}', '{release_date}', '{image_URL}');\n")
                for id in spotify_artist_ID:
                    # SQL query to insert the album artists into the Album_Artists table in the database
                    fw.write(
                        f"INSERT INTO Album_Artists (album_id, artist_id) SELECT album_id, artist_id FROM Albums, Artists WHERE spotify_album_ID = '{spotify_album_ID}' AND spotify_artist_ID = '{id}';\n")
    fw.close()
    f.close()
    print("Completed Albums")
    print(f"{len(Albums)} {len(set(Albums))}") # Print how many albums there are (size of the albums dict)


'''
This function creates the tracks.sql file by parsing the data.csv file for all the relevant information, then writing it to a file title tracks.sql.

Written by Jacob Gorelick.
'''
def Tracks():
    Tracks = {} # dict to store the tracks
    with open('data.csv', mode='r', encoding="utf8") as f:
        reader = csv.reader(f)
        next(f)
        with open("tracks.sql", 'w', encoding="utf8") as fw:
            for row in reader:
                name = row[1].replace("\\", "\\\\").strip() # Adds additional backslash to ensure we ignore things that are meant to be ignored
                name = name.replace("'", "\\'").strip() # Adds a backslash to ' so we ignore them

                spotify_track_ID = row[0].replace("spotify:track:", "").strip() # Removes the type identifier from the track URI

                spotify_album_ID = row[4].replace("spotify:album:", "").strip() # Removes the type identifier from the album URI

                # image_URL = row[9]

                disc_num = row[10] # Gets the disc number that the track is on
                track_num = row[11] # Gets the track number for the track
                track_duration = row[12] # Gets the duration of the track in ms
                # track_preview = row[13]
                track_explicit = row[14] # Gets the boolean value for explicit for the track

                if track_explicit.__eq__('false'): # Rewrites the explicit value into caps so it can be entered into the database without causing errors
                    track_explicit = 'FALSE'
                else:
                    track_explicit = 'TRUE'

                spotify_artist_ID = row[2].split(",") # Splits the track artists
                for i in range(len(spotify_artist_ID)):
                    spotify_artist_ID[i] = spotify_artist_ID[i].replace("spotify:artist:", "").strip() # Removes the type identifier from the track artist URI

                if (Tracks.get(spotify_track_ID) == spotify_track_ID and Tracks.get(spotify_track_ID) != None): # Checks if the track is in the tracks dict
                    continue # If it is in the dict, do nothing
                else:
                    Tracks[spotify_track_ID] = spotify_track_ID # If it isn't in the dict, add it to the dict with the base-62 identifier as the key

                # SQL query to insert the track into the Tracks table in the database
                fw.write(
                    f"INSERT INTO Tracks (spotify_track_ID, name, album_ID, track_number, disc_number, explicit, duration) VALUES ('{spotify_track_ID}', '{name}', (SELECT album_ID FROM Albums WHERE spotify_album_ID = '{spotify_album_ID}'), '{track_num}', '{disc_num}', {track_explicit}, '{track_duration}');\n")

                for id in spotify_artist_ID:
                    # SQL query to insert the album artists into the Album_Artists table in the database
                    fw.write(
                        f"INSERT INTO Track_Artists (track_ID, artist_ID) SELECT track_id, artist_id FROM Tracks, Artists WHERE spotify_track_ID = '{spotify_track_ID}' AND spotify_artist_ID = '{id}';\n")
    fw.close()
    f.close()
    print("Completed Tracks")
    print(f"{len(Tracks)} {len(set(Tracks))}") # Print how many tracks there are (size of the tracks dict)

'''
Commands to run the functions. Uncomment the function you wish to run, and comment out the other functions. Could most likely run all three at once, but it hasn't been tested
'''
Artists() # Create the artists.sql file with all the artists sql queries
#Albums() # Create the albums.sql file with all the albums sql queries
#Tracks() # Create the tracks.sql file with all the tracks sql queries
