import { Routes, Route, useNavigate, useLocation} from "react-router"
import { Home, Login, SignUp, Profile, Error } from "../pages"
import { useEffect, useState } from "react";


export default function Navigation() {
    let navigate = useNavigate();
    let location = useLocation()
    const [username, setUsername] = useState("");
    useEffect(() => {
        if (localStorage.token) {
            fetch('http://localhost:8080/user/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.token
                }
            }).then(response => {
                if (response.status !== 500) {
                    response.json().then(res => {
                        setUsername(res.username);
                    }).catch(e => {
                        console.log(e);
                    });
                } else {
                    // user has token but it is invalid
                    localStorage.removeItem("token");
                    if (location.pathname != "/login" && location.pathname != "/signup") {
                        navigate("/login");
                    }
                }
            });
        } else {
            if (location.pathname != "/login" && location.pathname != "/signup") {
                navigate("/login");
            }
        }
    }, [navigate]);
    return (
        <Routes>
            <Route path="/" element={<Home username={username}/>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/user/:username" element={<Profile username={username}/>} />
            <Route path="/404" element={<Error username={username}/>} />
        </Routes>
    )
}
