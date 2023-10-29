import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavbarComponent from "../routing/NavbarComponent";
import Button from "react-bootstrap/esm/Button";

function Profile({ username }) {
    const { pathname } = useLocation();
    let navigate = useNavigate();
    const [profileName, setProfileName] = useState(pathname.split("/user/")[1]);
    const [viewingOwnProfile, setViewingOwnProfile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false)
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
            setLoading(false)
            checkFollowStatus()
            // Code for handling the response
        }).catch(error => console.error(error));
    }, [pathname, navigate, profileName, username, viewingOwnProfile, checkFollowStatus]);
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
                    <h1>Welcome to your profile, {username}!</h1>
                ) : (
                    <div>
                        <h1>Welcome to {profileName}'s Profile!</h1>
                        <Button onClick={handleFollowUser}>{isFollowing ? "Unfollow User" : "Follow User"}</Button>
                    </div>
                )
            )}

        </div>
    );
}

export default Profile;