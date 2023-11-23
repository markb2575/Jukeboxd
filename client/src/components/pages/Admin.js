import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import NavbarComponent from "../routing/NavbarComponent";
import { Container } from "react-bootstrap";
import './Admin.css';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';



function Admin({ username, isAdmin }) {

    let navigate = useNavigate();
    //const { pathname } = useLocation();

    const [users, setUsers] = useState(null)
    const [artists, setArtists] = useState(null)
    const [reviews, setReviews] = useState(null)
    const [loading, setLoading] = useState(true);

    const [showUsers, setShowUsers] = useState(false);
    const [showArtists, setShowArtists] = useState(false);
    const [showReviews, setShowReviews] = useState(false);

    useEffect(() => {
        if (isAdmin === false) {
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
                        // If there are still users after removing the admin, then set we want to show them
                        if (users_no_admin.length !== 0) {
                            setUsers(users_no_admin)
                            setShowUsers(true)
                        }
                        // If there are artists, then we want to show them
                        if (res.artists.length !== 0) {
                            setArtists(res.artists)
                            setShowArtists(res.artists)
                        }
                        // If there are reviews, then we want to show them
                        if (res.reviews.length !== 0) {
                            setReviews(res.reviews)
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
    }, [isAdmin, navigate]);

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

    function handleDeleteUser(userID) {
        console.log(`Delete user with ID: ${userID}`);
    }

    function handleChangeArtistID(userID) {
        console.log(`Change artist_ID for user with ID: ${userID}`);
    }

    function handleDeleteReview(userID, item_ID, item_type) {
        console.log(`Delete user with ID: ${userID}, item_ID: ${item_ID}, item_type: ${item_type}`);
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
                        <Tabs
                            defaultActiveKey="users"
                            transition={false}
                            id="admin-tabs"
                            className="mb-3"
                            justify
                        >
                            <Tab eventKey="users" title="Users">
                                {showUsers ?
                                    <Table striped bordered hover size="sm">
                                        <thead>
                                            <tr>
                                                <th>user_ID</th>
                                                <th>username</th>
                                                <th>artist_ID</th>
                                                <th>Delete</th>
                                                <th>Change artist_ID (0 removes artist_ID)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user, index) => (
                                                <tr key={index}>
                                                    <td>{user.user_ID}</td>
                                                    <td><Link to={`/user/${user.username}`}>{user.username}</Link></td>
                                                    <td>{user.artist_ID}</td>
                                                    <td>
                                                        <button onClick={() => handleDeleteUser(user.user_ID)}>Delete</button>
                                                    </td>
                                                    <td>
                                                        <button onClick={() => handleChangeArtistID(user.user_ID)}>Change Artist ID</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                    : <>No users</>
                                }
                            </Tab>

                            <Tab eventKey="artists" title="Artists">
                                {showArtists ?
                                    <Table striped bordered hover size="sm">
                                        <thead>
                                            <tr>
                                                <th>artist_ID</th>
                                                <th>name</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {artists.map((artist, index) => (
                                                <tr key={index}>
                                                    <td>{artist.artist_ID}</td>
                                                    <td><Link to={`/artist/${artist.spotify_artist_ID}`}>{artist.name}</Link></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                    : <>No artists</>
                                }
                            </Tab>

                            <Tab eventKey="reviews" title="Reviews">
                                {showReviews ?
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
                                                {reviews.map((review, index) => (
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
                                    : <>No reviews</>
                                }
                            </Tab>

                        </Tabs>
                    </Container>
                </>)}
        </div>

    );
    /*
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
                        <Tabs
                            defaultActiveKey="users"
                            transition={false}
                            id="admin-tabs"
                            className="mb-3"
                            justify
                        >
                            <Tab eventKey="users" title="Users">
                                {showUsers ?
                                    <Table striped bordered hover size="sm">
                                        <thead>
                                            <tr>
                                                <th>user_ID</th>
                                                <th>username</th>
                                                <th>artist_ID</th>
                                                <th>Delete</th>
                                                <th>Change artist_ID (0 removes artist_ID)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user, index) => (
                                                <tr key={index}>
                                                    <td>{user.user_ID}</td>
                                                    <td><Link to={`/user/${user.username}`}>{user.username}</Link></td>
                                                    <td>{user.artist_ID}</td>
                                                    <td>
                                                        <button onClick={() => handleDeleteUser(user.user_ID)}>Delete</button>
                                                    </td>
                                                    <td>
                                                        <button onClick={() => handleChangeArtistID(user.user_ID)}>Change Artist ID</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                    : <>No users</>
                                }
                            </Tab>

                            <Tab eventKey="artists" title="Artists">
                                {showArtists ?
                                    <Table striped bordered hover size="sm">
                                        <thead>
                                            <tr>
                                                <th>artist_ID</th>
                                                <th>name</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {artists.map((artist, index) => (
                                                <tr key={index}>
                                                    <td>{artist.artist_ID}</td>
                                                    <td><Link to={`/artist/${artist.spotify_artist_ID}`}>{artist.name}</Link></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                    : <>No artists</>
                                }
                            </Tab>

                            <Tab eventKey="reviews" title="Reviews">
                                {showReviews ?
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
                                                {reviews.map((review, index) => (
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
                                    : <>No reviews</>
                                }
                            </Tab>

                        </Tabs>
                    </Container>
                </>)}
        </div>

    );
    */
}

export default Admin;