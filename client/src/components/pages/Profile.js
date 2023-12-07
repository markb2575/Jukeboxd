import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation} from "react-router-dom";
import NavbarComponent from "../routing/NavbarComponent";
import Button from "react-bootstrap/esm/Button";
import FollowersModal from './Popups/FollowersModal';
import FollowingModal from './Popups/FollowingModal';
import Nav from 'react-bootstrap/Nav';
import Card from 'react-bootstrap/Card';
import { IoStar, IoStarOutline } from "react-icons/io5";
import "./Profile.css"

function Profile({ username }) {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const [profileName, setProfileName] = useState(pathname.split("/user/")[1]);
    const [viewingOwnProfile, setViewingOwnProfile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false)
    const [profileInfo, setProfileInfo] = useState({
        followers: [],
        following: [],
        lTracks: [],
        lAlbums: [],
        wTracks: [],
        wAlbums: []
    });
    const [followersModalShow, setFollowersModalShow] = useState(false);
    const [followingModalShow, setFollowingModalShow] = useState(false);
    const [activeTab, setActiveTab] = useState("#listened");

    /**
     * This function makes a call to the API to get all the info to display on a user's profile page, including followers, following, marked tracks and albums.
     * If it succeeds, it then sets this info into the profileInfo state.
     */
    const getProfileInfo = useCallback(() => {
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
    }, [navigate, profileName])
    // checks if the user is following the profile's user
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
        setProfileName(pathname.split("/user/")[1])
        if (profileName.length === 0 || username.length === 0) return
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

    /**
     * This ensures that the displayed profile info will be accurate upon updates such as after following or unfollowing someone.
     */
    useEffect(() => {

        getProfileInfo()

    }, [pathname, navigate, profileName, username, viewingOwnProfile, checkFollowStatus, getProfileInfo]);

    /**
     * This loads the active tab from local storage for persistience
     */
    useEffect(() => {
        setActiveTab(JSON.parse(window.localStorage.getItem('tab')))

    }, []);

    /**
     * This function ensures that when a username is clicked from the followers or following list that the modal will close and then navigate to their profile page.
     * @param {*} clickedUsername The username that was clicked on 
     */
    const handleUsernameClick = (clickedUsername) => {
        setFollowersModalShow(false)
        setFollowingModalShow(false)
        setProfileName(clickedUsername)
        navigate(`/user/${clickedUsername}`)
    };

    /**
     * This saves the current tab in local storage for persistence whenever the tab is changed
     * @param {*} tab The new tab that has been selected
     */
    const handleTabChange = (tab) => {
        setActiveTab(tab)
        window.localStorage.setItem('tab', JSON.stringify(tab))
    }

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

    /**
     * Function that converts an integer rating into empty and non-empty star icons
     * @param {*} rating The user's rating for the given track or album
     * @returns The user's rating but in the form of stars, or "not rated" if they don't have a rating
     */
    function convertToStars(rating) {
        if (rating === 0) {
            return <>not rated</>;;
        }
        if (rating === 1) {
            return <><IoStar /><IoStarOutline /><IoStarOutline /><IoStarOutline /><IoStarOutline /></>;
        }
        if (rating === 2) {
            return <><IoStar /><IoStar /><IoStarOutline /><IoStarOutline /><IoStarOutline /></>;
        }
        if (rating === 3) {
            return <><IoStar /><IoStar /><IoStar /><IoStarOutline /><IoStarOutline /></>;
        }
        if (rating === 4) {
            return <><IoStar /><IoStar /><IoStar /><IoStar /><IoStarOutline /></>;
        }
        if (rating === 5) {
            return <><IoStar /><IoStar /><IoStar /><IoStar /><IoStar /></>;
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
                <div className="v-center">
                    <Nav variant="tabs" defaultActiveKey={JSON.parse(window.localStorage.getItem('tab'))} onSelect={handleTabChange}>
                        <Nav.Item>
                            <Nav.Link href="#listened">Listened To</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="#watchlist">Save For Later</Nav.Link>
                        </Nav.Item>
                    </Nav>
                    <h4 style={{ textAlign: "left" }}>Tracks</h4>
                    <div className="scrolling-container">
                        <div className="card-container">
                            {profileInfo[activeTab === "#listened" ? "lTracks" : "wTracks"].length > 0 ? (
                                profileInfo[activeTab === "#listened" ? "lTracks" : "wTracks"].map((item, i) => (
                                    <Card key={i} className="scrolling-card" onClick={() => navigate(`/track/${item.spotify_track_ID}`)}>
                                        <Card.Img src={item.image_URL} alt={item.name} />
                                        <Card.Title>{item.track_name}</Card.Title>
                                        <div>{activeTab === "#listened" ?
                                            <div>
                                                <small>Rating: {convertToStars(item.rating)}</small>
                                            </div>

                                            :
                                            (<></>)
                                        }
                                        </div>

                                    </Card>
                                ))
                            ) : (
                                <p>No results found.</p>
                            )}
                        </div>
                    </div>
                    <div style={{ padding: "5px" }}>
                    </div>
                    <h4 style={{ textAlign: "left" }}>Albums</h4>
                    <div className="scrolling-container" style={{ marginBottom: '10px' }}>
                        <div className="card-container">
                            {profileInfo[activeTab === "#listened" ? "lAlbums" : "wAlbums"].length > 0 ? (
                                profileInfo[activeTab === "#listened" ? "lAlbums" : "wAlbums"].map((item, i) => (
                                    <Card key={i} className="scrolling-card" onClick={() => navigate(`/album/${item.spotify_album_ID}`)}>
                                        <Card.Img src={item.image_URL} alt={item.name} />
                                        <Card.Title>{item.album_name}</Card.Title>
                                        <div>{activeTab === "#listened" ?
                                            <div>
                                                <small>Rating: {convertToStars(item.rating)}</small>
                                            </div>

                                            :
                                            (<></>)
                                        }
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <p>No results found.</p>
                            )}
                        </div>
                    </div>
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