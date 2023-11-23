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



function Admin({ username, isAdmin }) {

    let navigate = useNavigate();
    const { pathname } = useLocation();

    const [users, setUsers] = useState(null)
    const [artists, setArtists] = useState(null)
    const [reviews, setReviews] = useState(null)
    const [loading, setLoading] = useState(true);

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



                        setUsers(res.users)
                        setArtists(res.artists)
                        //console.log(artists)
                        if (res.reviews.length !== 0) {
                            setReviews(res.reviews)
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
    }, []);

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
                                <Table striped bordered hover size="sm">
                                    <thead>
                                        <tr>
                                            <th>user_ID</th>
                                            <th>username</th>
                                            <th>artist_ID</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user, index) => (
                                            <tr>
                                                <td>{user.user_ID}</td>
                                                <td><Link to={`/user/${user.username}`}>{user.username}</Link></td>
                                                <td>{user.artist_ID}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Tab>

                            <Tab eventKey="artists" title="Artists">
                                <Table striped bordered hover size="sm">
                                    <thead>
                                        <tr>
                                            <th>artist_ID</th>
                                            <th>name</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {artists.map((artist, index) => (
                                            <tr>
                                                <td>{artist.artist_ID}</td>
                                                <td><Link to={`/artist/${artist.spotify_artist_ID}`}>{artist.name}</Link></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Tab>

                            <Tab eventKey="reviews" title="Reviews">

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
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reviews.map((review, index) => (
                                            <tr>
                                                <td>{review.user_ID}</td>
                                                <td>{review.item_ID}</td>
                                                <td><Link to={`/user/${review.username}`}>{review.username}</Link></td>
                                                <td><Link to={`/${review.item_type}/${review.spotify_item_ID}`}>{review.name}</Link></td>
                                                <td>{review.review}</td>
                                                <td>{convertMariaDBDatetimeToLocalTime(review.datetime)}</td>
                                                <td>{review.item_type}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Tab>

                        </Tabs>

                        {/*
                        <Row>
                            <Table striped bordered hover size="sm">
                                <thead>Users</thead>
                                <thead>
                                    <tr>
                                        <th>user_ID</th>
                                        <th>username</th>
                                        <th>artist_ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user, index) => (
                                        <tr>
                                            <td>{user.user_ID}</td>
                                            <td><Link to={`/user/${user.username}`}>{user.username}</Link></td>
                                            <td>{user.artist_ID}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Row>

                        <br></br>


                        <Row>
                            <Table striped bordered hover size="sm">
                                <thead>Artists</thead>
                                <thead>
                                    <tr>
                                        <th>artist_ID</th>
                                        <th>name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {artists.map((artist, index) => (
                                        <tr>
                                            <td>{artist.artist_ID}</td>
                                            <td><Link to={`/artist/${artist.spotify_artist_ID}`}>{artist.name}</Link></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Row>

                        <br></br>

                        <Row>
                            <Table striped bordered hover size="sm">
                                <thead>Reviews</thead>
                                <thead>
                                    <tr>
                                        <th>user_ID</th>
                                        <th>item_ID</th>
                                        <th>username</th>
                                        <th>name</th>
                                        <th>review</th>
                                        <th>datetime</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reviews.map((review, index) => (
                                        <tr>
                                            <td>{review.user_ID}</td>
                                            <td>{review.item_ID}</td>
                                            <td><Link to={`/user/${review.username}`}>{review.username}</Link></td>
                                            <td><Link to={`/${review.item_type}/${review.spotify_item_ID}`}>{review.name}</Link></td>
                                            <td>{review.review}</td>
                                            <td>{convertMariaDBDatetimeToLocalTime(review.datetime)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Row>
                                    */}




                    </Container>
                </>)}
        </div>

    );
}

export default Admin;