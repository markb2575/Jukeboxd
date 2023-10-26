import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavbarComponent from "../routing/NavbarComponent";
import Button from "react-bootstrap/esm/Button";

function Profile({ username }) {
    const { pathname } = useLocation();
    let navigate = useNavigate();
    const [profileName, setProfileName] = useState(pathname.split("/user/")[1]);
    const [viewingOwnProfile, setViewingOwnProfile] = useState(false);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        // console.log("in useeffect")
        // setProfileName(pathname.split("/user/")[1])
        if (profileName.length === 0 || username.length === 0) return
        console.log(pathname, profileName, username)
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
            }
            setLoading(false)
            // Code for handling the response
        })
    }, [pathname, navigate, profileName, username, viewingOwnProfile]);
    const handleFollowUser = (e) => {
        e.preventDefault()
        //create a request to login with the following object
        var usernames = {
            followerUsername: username,
            followeeUsername: profileName
        }

        fetch('http://localhost:8080/user/followUser', {
            method: 'POST',
            body: JSON.stringify(usernames),
            headers: { 'Content-Type': 'application/json' }
        }).then(response => {
            if (response.status === 200) {

            } else {

            }
        })
            .catch(error => console.error(error));

    }
    return (
        <div>
            <NavbarComponent />
            {loading ? (
                null
            ) : (
                viewingOwnProfile ? (
                    <h1>Welcome to your Profile!</h1>
                ) : (
                    <div>
                        <h1>Welcome to {profileName}'s Profile!</h1>
                        <Button onClick={handleFollowUser}>Follow User</Button>
                    </div>
                )
            )}

        </div>
    );
}

export default Profile;