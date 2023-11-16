import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import NavbarComponent from "../routing/NavbarComponent";
import Button from "react-bootstrap/esm/Button";
import FollowersModal from './Popups/FollowersModal';
import FollowingModal from './Popups/FollowingModal';
import Nav from 'react-bootstrap/Nav';
import Card from 'react-bootstrap/Card';




import "./Profile.css"
import CardText from "react-bootstrap/esm/CardText";

function Profile({ username }) {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const [profileName, setProfileName] = useState(pathname.split("/user/")[1]);
    const [viewingOwnProfile, setViewingOwnProfile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false)
    const [profileInfo, setProfileInfo] = useState({
        followers: [],
        following: []
    });
    const [followersModalShow, setFollowersModalShow] = useState(false);
    const [followingModalShow, setFollowingModalShow] = useState(false);




    const getProfileInfo = () => {
        fetch(`http://localhost:8080/user/profile/${profileName}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': localStorage.token
            }
        }).then((response) => {
            if (response.status === 404) {
                navigate("/404");
            }

            setLoading(false)
            return response.json();


        }).then(data => {
            setProfileInfo(data)// update the profileInfo
            setLoading(false);
        }).catch(error => console.error(error));
    }

    const checkFollowStatus = useCallback(() => {
        fetch(`http://localhost:8080/user/follower=${username}&followee=${profileName}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': localStorage.token
            }
        }).then((response) => {
            response.json().then(res => {
                setIsFollowing(res.isFollowing)
            }).catch(e => {
                console.log(e);
            });
            // Code for handling the response
        }).catch(error => console.error(error));
    }, [profileName, username])

    useEffect(() => {
        // console.log("in useeffect")
        setProfileName(pathname.split("/user/")[1])
        if (profileName.length === 0 || username.length === 0) return
        // console.log(pathname, profileName, username)
        //check if profileName exists in database, if not, navigate to error page
        fetch(`http://localhost:8080/user/findUser/${profileName}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': localStorage.token
            }
        }).then((response) => {
            if (response.status === 404) {
                navigate("/404");
            }
            if (profileName === username) {
                setViewingOwnProfile(true)
                setLoading(false)
                return
            }
            setViewingOwnProfile(false)
            setLoading(false)
            checkFollowStatus()
            // Code for handling the response
        }).catch(error => console.error(error));



    }, [pathname, navigate, profileName, username, viewingOwnProfile, checkFollowStatus]);

    useEffect(() => {

        getProfileInfo()

    }, [pathname, navigate, profileName, username, viewingOwnProfile, checkFollowStatus]);

    const handleUsernameClick = (clickedUsername) => {
        setFollowersModalShow(false)
        setFollowingModalShow(false)
        setProfileName(clickedUsername)
        navigate(`/user/${clickedUsername}`)
    };

    const handleFollowUser = (e) => {
        e.preventDefault()
        //create a request to login with the following object
        var usernames = {
            followerUsername: username,
            followeeUsername: profileName
        }
        if (isFollowing) {
            fetch('http://localhost:8080/user/unfollowUser', {
                method: 'POST',
                body: JSON.stringify(usernames),
                headers: { 'Content-Type': 'application/json' }
            }).then(response => {
                if (response.status === 200) {
                    checkFollowStatus()
                    getProfileInfo()
                } else {

                }
            }).catch(error => console.error(error));
        } else {
            fetch('http://localhost:8080/user/followUser', {
                method: 'POST',
                body: JSON.stringify(usernames),
                headers: { 'Content-Type': 'application/json' }
            }).then(response => {
                if (response.status === 200) {
                    checkFollowStatus()
                    getProfileInfo()
                } else {

                }
            }).catch(error => console.error(error));
        }

    }
    return (
        <div>
            <NavbarComponent />
            {loading ? (
                null
            ) : (
                viewingOwnProfile ? (
                    <h1 > {username} (You)</h1>
                ) : (
                    <div>
                        <h1>{profileName}   <Button style={{ marginLeft: '10px' }} onClick={handleFollowUser}>{isFollowing ? "Unfollow User" : "Follow User"}</Button>
                        </h1>
                    </div>
                )

            )}

            {!loading && (
                <div className="center">
                    <div className="rounded-container">
                        <div className="rounded-content">
                            <p className="followers-link" onClick={() => setFollowersModalShow(true)}>
                                Followers: {profileInfo.followers.length}
                            </p>                            <div className="divider"></div>
                            <p className="following-link" onClick={() => setFollowingModalShow(true)}>
                                Following: {profileInfo.following.length}
                            </p>
                        </div>
                    </div>

                </div>


            )}

            {!loading && (
                <div className="center">
                    <Card>
                        <Card.Header>
                            <Nav variant="tabs" defaultActiveKey="#listened">
                                <Nav.Item>
                                    <Nav.Link href="#listened">Listened To</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link href="#watchlist">Save For Later</Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Card.Header>
                        <Card.Body>
                            <h4 style={{textAlign:"left"}}>Tracks</h4>
                            <div className="card-container">

                            </div>
                            <div style={{padding:"5px"}}>
                            </div>
                            <h4 style={{textAlign:"left"}}>Albums</h4>
                            <div className="card-container">

                            </div>
                        </Card.Body>
                    </Card>
                </div>
            )}

            <FollowersModal
                show={followersModalShow}
                onHide={() => setFollowersModalShow(false)}
                followers={profileInfo.followers}
                onUsernameClick={handleUsernameClick}
            />

            <FollowingModal
                show={followingModalShow}
                onHide={() => setFollowingModalShow(false)}
                following={profileInfo.following}
                onUsernameClick={handleUsernameClick}
            />

        </div >
    );
}

export default Profile;