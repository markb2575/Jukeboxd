import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios"
import NavbarComponent from "../routing/NavbarComponent";

function Profile() {
  let navigate = useNavigate();
  const [profileName, setProfileName] = useState("");
  const { pathname } = useLocation();

  useEffect(() => {
    setProfileName(pathname.split("/user/")[1])
    if (profileName.length === 0) return
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
      // Code for handling the response
    })
  }, [pathname, navigate, profileName]);

  return (
    <div>
      <NavbarComponent />
      <h1>Welcome to {profileName}'s Profile!</h1>
    </div>
  );
}

export default Profile;