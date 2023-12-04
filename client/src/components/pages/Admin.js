import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import NavbarComponent from "../routing/NavbarComponent";
import { Container } from "react-bootstrap";
import './Admin.css';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

function Admin({ username, isAdmin }) {

    let navigate = useNavigate();

    const [users, setUsers] = useState(null) // array to hold the users information
    const [artists, setArtists] = useState(null) // array to hold the artists information
    const [reviews, setReviews] = useState(null) // array to hold the reviews information

    const [showUsers, setShowUsers] = useState(false); // boolean to determine if we want to show users (if there are none, then this should be false)
    const [showArtists, setShowArtists] = useState(false); // boolean to determine if we want to show artists (if there are none, then this should be false)
    const [showReviews, setShowReviews] = useState(false); // boolean to determine if we want to show reviews (if there are none, then this should be false)

    const [usersSlice, setUsersSlice] = useState(null) // breaks down the users array to only display a set size (determined by pageSize)... vastly improves load times if there are a lot of users
    const [artistsSlice, setArtistsSlice] = useState(null) // breaks down the artists array to only display a set size (determined by pageSize)... vastly improves load times if there are a lot of artists
    const [reviewsSlice, setReviewsSlice] = useState(null) // breaks down the reviews array to only display a set size (determined by pageSize)... vastly improves load times if there are a lot of reviews

    const [pageNumUsers, setPageNumUsers] = useState(1); // Page number that the admin is currently viewing corresponding to the slice of the users array
    const [pageNumArtists, setPageNumArtists] = useState(1); // Page number that the admin is currently viewing corresponding to the slice of the artists array
    const [pageNumReviews, setPageNumReviews] = useState(1); // Page number that the admin is currently viewing corresponding to the slice of the reviews array

    const [minUserID, setMinUserID] = useState(2) // The smallest user_ID in the database (used to ensure the admin doesn't try to change the artist_ID of a user with a user_ID below this)
    const [maxUserID, setMaxUserID] = useState(2) // The largest user_ID in the database (used to ensure the admin doesn't try to change the artist_ID of a user with a user_ID above this)
    const [minArtistID, setMinArtistID] = useState(1) // The smallest artist_ID in the database (used to ensure the admin doesn't try to change the artist_ID to that of an artist_ID below this)
    const [maxArtistID, setMaxArtistID] = useState(1) // The largest artist_ID in the database (used to ensure the admin doesn't try to change the artist_ID to that of an artist_ID above this)

    const [userIDToChange, setUserIDToChange] = useState(""); // The user_ID that the admin inputs which they wish to change the artist_ID for
    const [artistIDToChange, setArtistIDToChange] = useState(""); // The artist_ID that the admin inputs which they wish to change link a user to

    const [loading, setLoading] = useState(true); // Boolean to determine if all the data has been received from the backend (prevents displaying the page before the data is received)
    const pageSize = 500; // How many items (users, artists, and reviews) we want to show per page (corresponds to the size of a slice). Too large of a number can significantly increase loading time

    /**
     * Function that gets all the data from the backend to display on the admin page
     */
    useEffect(() => {
        if (isAdmin === false) { // ensure the user is an admin, if not redirect them to the homepage
            navigate("/");
        } else {
            fetch('http://localhost:8080/admin/getData', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.token
                }
            }).then(response => {
                if (response.status === 200) {
                    response.json().then(res => {
                        // If there are users, remove the first user (which is always the Admin) from the array
                        if (res.users.length !== 0) {
                            res.users.splice(0, 1)
                            var users_no_admin = res.users
                        }
                        // If there are still users after removing the admin (user_ID 1) from the array, then we want to show them
                        if (users_no_admin.length !== 0) {
                            setUsers(users_no_admin)
                            setUsersSlice(users_no_admin)
                            setMinUserID(users_no_admin[0].user_ID.toString())
                            setMaxUserID(users_no_admin[users_no_admin.length - 1].user_ID.toString())
                            setShowUsers(true)
                        }
                        // If there are artists, then we want to show them
                        if (res.artists.length !== 0) {
                            setArtists(res.artists)
                            setArtistsSlice(res.artists)
                            setMinArtistID(res.artists[0].artist_ID.toString())
                            setMaxArtistID(res.artists[res.artists.length - 1].artist_ID.toString())
                            setShowArtists(true)
                        }
                        // If there are reviews, then we want to show them
                        if (res.reviews.length !== 0) {
                            setReviews(res.reviews)
                            setReviewsSlice(res.reviews)
                            setShowReviews(true)
                        }
                        setLoading(false)
                    }).catch(e => {
                        console.log(e);
                    });
                } else {
                    console.log("something happened")
                }
            });

        }
    }, [isAdmin, navigate, minUserID, maxUserID, minArtistID, maxArtistID]);

    /**
     * Takes the datetime stored in the mariaDB database (which is in UTC), and converts it to the user's local timezone, then alters how it is displayed
     * so it only shows the pertinent information
     * @param {*} mariaDBDatetime The datetime from the mariaDB database, which is in UTC time
     * @returns The pertinent datetime information from the mariaDB database but in the user's local timezone
     */
    function convertMariaDBDatetimeToLocalTime(mariaDBDatetime) {
        // Create a Date object from the MariaDB datetime string
        const datetimeObject = new Date(mariaDBDatetime);

        // Format the datetime in your local timezone
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short',
        };

        return datetimeObject.toLocaleString(undefined, options);
    }

    /**
     * Function to handle changing the page for the users table (i.e. show the next 500 users)
     */
    const handleNextUsers = () => {
        if (pageNumUsers < Math.ceil(users.length / pageSize)) {
            const n = pageNumUsers + 1;
            setPageNumUsers(n);
        }
    };

    /**
     * Function to handle changing the page for the users table (i.e. show the previous 500 users)
     */
    const handlePrevUsers = () => {
        if (pageNumUsers > 1) {
            const n = pageNumUsers - 1;
            setPageNumUsers(n);
        }
    };

    /**
     * Function to handle changing the page for the artists table (i.e. show the next 500 artists)
     */
    const handleNextArtists = () => {
        if (pageNumArtists < Math.ceil(artists.length / pageSize)) {
            const n = pageNumArtists + 1;
            setPageNumArtists(n);
        }
    };

    /**
     * Function to handle changing the page for the artists table (i.e. show the previous 500 artists)
     */
    const handlePrevArtists = () => {
        if (pageNumArtists > 1) {
            const n = pageNumArtists - 1;
            setPageNumArtists(n);
        }
    };

    /**
     * Function to handle changing the page for the reviews table (i.e. show the next 500 reviews)
     */
    const handleNextReviews = () => {
        if (pageNumReviews < Math.ceil(reviews.length / pageSize)) {
            const n = pageNumReviews + 1;
            setPageNumReviews(n);
        }
    };

    /**
     * Function to handle changing the page for the reviews table (i.e. show the previous 500 reviews)
     */
    const handlePrevReviews = () => {
        if (pageNumReviews > 1) {
            const n = pageNumReviews - 1;
            setPageNumReviews(n);
        }
    }

    /**
     * Handles changing the value stored in the userIDToChange variable based on what the admin inputs
     * @param {*} e action of updating the user_ID form
     */
    const handleUserIDChange = (e) => {
        const value = e.target.value;
        //console.log("minUserID: ", minUserID, "maxUserID: ", maxUserID)

        // Check if the input is a valid integer within the specified range
        if (/^-?\d+$/.test(value)) {
            const intValue = parseInt(value, 10);

            if (intValue >= minUserID && intValue <= maxUserID) {
                setUserIDToChange(intValue.toString());
            }
        }
        console.log("userIDToChange: ", userIDToChange)
    };

    /**
     * Handles changing the value stored in the artistIDToChange variable based on what the admin inputs
     * @param {*} e action of updating the artist_ID form
     */
    const handleArtistIDChange = (e) => {
        const value = e.target.value;
        //console.log("minArtistID: ", minArtistID, "maxArtistID: ", maxArtistID)

        // Check if the input is a valid integer within the specified range
        if (/^-?\d+$/.test(value)) {
            const intValue = parseInt(value, 10);

            if (intValue >= minArtistID && intValue <= maxArtistID) {
                setArtistIDToChange(intValue.toString());
            }
        }
        console.log("artistIDToChange: ", artistIDToChange)
    };

    /**
     * Handles clicking the clear button on the user_ID/artist_ID form. Resets the forms back to being blank
     */
    const handleClear = () => {
        setUserIDToChange(""); // Clear the userIDToChange state
        setArtistIDToChange(""); // Clear the artistIDToChange state
    };

    /**
     * Function that handles deleting a user. This is called when the admin clicks the delete button for one of the users
     * @param {*} user_ID The user_ID of the user the admin wishes to delete
     */
    function handleDeleteUser(user_ID) {
        var userToDelete = {
            user_ID: user_ID,
        }

        fetch('http://localhost:8080/admin/deleteUser', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'authorization': localStorage.token
            },
            body: JSON.stringify(userToDelete),
        }).then(response => {
            if (response.status === 200) {
                response.json().then(res => {
                    // If there are users, remove the first user (which is always the Admin) from the array
                    if (res.users.length !== 0) {
                        res.users.splice(0, 1)
                        var users_no_admin = res.users
                    }
                    // If there are still users after removing the admin (user_ID 1) from the array, then we want to show them
                    if (users_no_admin.length !== 0) {
                        setUsers(users_no_admin)
                        setUsersSlice(users_no_admin)
                        setMinUserID(users_no_admin[0].user_ID.toString())
                        setMaxUserID(users_no_admin[users_no_admin.length - 1].user_ID.toString())
                        setShowUsers(true)
                    } else {
                        setUsers("")
                        setUsersSlice("")
                        setShowUsers(false)
                    }
                    // If there are reviews, then we want to show them
                    if (res.reviews.length !== 0) {
                        setReviews(res.reviews)
                        setReviewsSlice(res.reviews)
                        setShowReviews(true)
                    } else {
                        setReviews("")
                        setReviewsSlice("")
                        setShowReviews(false)
                    }
                }).catch(e => {
                    console.log(e);
                });
            } else {
                console.log("something happened")
            }
        }).catch(error => console.error(error));
        console.log(`Deleted user with user_ID: ${user_ID}`);
    }

    /**
     * Handles linking or unlinking a user with an artist, or changing the artist that a user is linked to
     * @param {*} user_ID The user_ID of the user the admin wishes to link or unlink to an artist
     * @param {*} artist_ID The artist_ID that the admin wishes to link/unlink from a user
     */
    function handleChangeArtistID(user_ID, artist_ID) {
        if (user_ID !== "") {
            var changeToMake = {
                user_ID: user_ID,
                artist_ID: artist_ID
            }

            fetch('http://localhost:8080/admin/changeArtistIDLink', {
                method: 'PUT',
                body: JSON.stringify(changeToMake),
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.token
                }
            }).then(response => {
                if (response.status === 200) {
                    response.json().then(res => {
                        if (res.users.length !== 0) { // Gets a user's array with the new changes. As long as there are users, we want to show them
                            setUsers(res.users)
                            res.users.splice(0, 1) // Remove the admin from the users array that we show
                            var users_no_admin = res.users
                            setUsersSlice(users_no_admin) // Sets the usersSlice array to be the users array without the admin in it, this array is then further sliced as it gets displayed
                        }
                    }).catch(e => {
                        console.log(e);
                    });
                } else {
                    console.log("something happened")
                }
            }).catch(error => console.error(error));
            setUserIDToChange("")
            setArtistIDToChange("")
            console.log(`Change artist_ID for user with user_ID: ${user_ID} to ${artist_ID}`);
        } else {
            // If no user_ID is input, do nothing
            console.log(`No user_ID input... did nothing`);
        }
    }

    /**
     * Handles deleting a review from a track or an album
     * @param {*} user_ID The user_ID of the user for whom we wish to delete their review
     * @param {*} item_ID The track_ID or album_ID for which the review was written
     * @param {*} item_type What the review is for... either an album or a track
     */
    function handleDeleteReview(user_ID, item_ID, item_type) {

        var reviewToDelete = {
            user_ID: user_ID,
            item_ID: item_ID,
            item_type: item_type
        }

        fetch('http://localhost:8080/admin/deleteReview', {
            method: 'DELETE',
            body: JSON.stringify(reviewToDelete),
            headers: {
                'Content-Type': 'application/json',
                'authorization': localStorage.token
            }
        }).then(response => {
            if (response.status === 200) {
                response.json().then(res => {
                    // If there are still reviews after we deleted one, then we want to show them
                    if (res.reviews.length !== 0) {
                        setReviews(res.reviews)
                        setReviewsSlice(res.reviews)
                        setShowReviews(true)
                    } else {
                        setReviews("")
                        setReviewsSlice("")
                        setShowReviews(false)
                    }
                }).catch(e => {
                    console.log(e);
                });
            } else {
                console.log("something happened")
            }
        }).catch(error => console.error(error));
        console.log(`Delete review with user_ID: ${user_ID}, item_ID: ${item_ID}, item_type: ${item_type}`);
    }


    return (

        <div>
            <NavbarComponent />
            {loading ? (
                null
            ) : (
                <>
                    <div className="header">
                        <h2>Admin Menu</h2>
                    </div>
                    <Container>

                        <br></br>
                        {showUsers && showArtists ?
                            <Form>
                                <Row>
                                    <Col xs="3">
                                        <Form.Control
                                            className="mb-2"
                                            id="user_ID_To_Change"
                                            placeholder="user_ID"
                                            type="number"
                                            min={minUserID}
                                            max={maxUserID}
                                            //onChange={(e) => setUserIDToChange(e.target.value)}
                                            onChange={handleUserIDChange}
                                            value={userIDToChange}
                                        />
                                        <Form.Text muted>min: {minUserID} max: {maxUserID}</Form.Text>
                                    </Col>
                                    <Col xs="3">
                                        <Form.Control
                                            className="mb-2"
                                            id="artist_ID_To_Change"
                                            placeholder="artist_ID"
                                            type="number"
                                            min={minArtistID}
                                            max={maxArtistID}
                                            //onChange={(e) => setArtistIDToChange(e.target.value)}
                                            onChange={handleArtistIDChange}
                                            value={artistIDToChange}
                                        />
                                        <Form.Text muted>min: {minArtistID} max: {maxArtistID}<p>Leave blank to unlink</p></Form.Text>
                                    </Col>
                                    <Col xs="auto">
                                        <Button className="mb-2" onClick={() => handleChangeArtistID(userIDToChange, artistIDToChange)}>Submit</Button>
                                    </Col>
                                    {(artistIDToChange || userIDToChange) && (
                                        <Col xs="auto">
                                            <Button className="mb-2" variant="secondary" onClick={handleClear}>
                                                Clear
                                            </Button>
                                        </Col>
                                    )}
                                </Row>
                                <br></br>
                                <br></br>
                            </Form>
                            : null
                        }

                        <Tabs
                            defaultActiveKey="users"
                            transition={false}
                            id="admin-tabs"
                            className="mb-3"
                            justify
                        >
                            <Tab eventKey="users" title="Users">
                                {showUsers ?
                                    <><h5>
                                        Page {pageNumUsers} of {Math.ceil(users.length / pageSize)} &nbsp;
                                        <button onClick={handlePrevUsers}>Prev</button>
                                        <button onClick={handleNextUsers}>Next</button>
                                    </h5>
                                        <Table striped bordered hover size="sm">
                                            <thead>
                                                <tr>
                                                    <th>user_ID</th>
                                                    <th>username</th>
                                                    <th>artist_ID</th>
                                                    <th>Delete</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {usersSlice.slice((pageSize * (pageNumUsers - 1)), (pageSize * (pageNumUsers))).map((user, index) => (
                                                    <tr key={index}>
                                                        <td>{user.user_ID}</td>
                                                        <td><Link to={`/user/${user.username}`}>{user.username}</Link></td>
                                                        {/*<td>{user.artist_ID}</td>*/}
                                                        {user.artist_ID !== null && (<td>{user.artist_ID}: <Link to={`/artist/${artists[user.artist_ID - 1].spotify_artist_ID}`}>{artists[user.artist_ID - 1].name}</Link> </td>)}
                                                        {user.artist_ID == null && (<td>{user.artist_ID}</td>)}
                                                        < td >
                                                            <button onClick={() => handleDeleteUser(user.user_ID)}>Delete</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </>
                                    : <>No users</>
                                }
                            </Tab>

                            <Tab eventKey="artists" title="Artists">
                                {showArtists ?
                                    <><h5>
                                        Page {pageNumArtists} of {Math.ceil(artists.length / pageSize)} &nbsp;
                                        <button onClick={handlePrevArtists}>Prev</button>
                                        <button onClick={handleNextArtists}>Next</button>
                                    </h5>
                                        <Table striped bordered hover size="sm">
                                            <thead>
                                                <tr>
                                                    <th>artist_ID</th>
                                                    <th>name</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {artistsSlice.slice((pageSize * (pageNumArtists - 1)), (pageSize * (pageNumArtists))).map((artist, index) => (
                                                    <tr key={index}>
                                                        <td>{artist.artist_ID}</td>
                                                        <td><Link to={`/artist/${artist.spotify_artist_ID}`}>{artist.name}</Link></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </>
                                    : <>No artists</>
                                }
                            </Tab>

                            <Tab eventKey="reviews" title="Reviews">
                                {showReviews ?
                                    <><h5>
                                        Page {pageNumReviews} of {Math.ceil(reviews.length / pageSize)} &nbsp;
                                        <button onClick={handlePrevReviews}>Prev</button>
                                        <button onClick={handleNextReviews}>Next</button>
                                    </h5>
                                        <div className="table-container">
                                            <Table striped bordered hover size="sm" responsive="lg">
                                                <thead>
                                                    <tr>
                                                        <th>user_ID</th>
                                                        <th>item_ID</th>
                                                        <th>username</th>
                                                        <th>name</th>
                                                        <th>review</th>
                                                        <th>datetime</th>
                                                        <th>item_type</th>
                                                        <th>Delete</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {reviewsSlice.slice((pageSize * (pageNumReviews - 1)), (pageSize * (pageNumReviews))).map((review, index) => (
                                                        <tr key={index}>
                                                            <td>{review.user_ID}</td>
                                                            <td>{review.item_ID}</td>
                                                            <td><Link to={`/user/${review.username}`}>{review.username}</Link></td>
                                                            <td><Link to={`/${review.item_type}/${review.spotify_item_ID}`}>{review.name}</Link></td>
                                                            <td className="long-review2">{review.review}</td>
                                                            <td>{convertMariaDBDatetimeToLocalTime(review.datetime)}</td>
                                                            <td>{review.item_type}</td>
                                                            <td>
                                                                <button onClick={() => handleDeleteReview(review.user_ID, review.item_ID, review.item_type)}>Delete</button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </>
                                    : <>No reviews</>
                                }
                            </Tab>

                        </Tabs>
                    </Container>
                </>)
            }
        </div >

    );
}

export default Admin;