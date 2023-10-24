import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavbarComponent from "../routing/NavbarComponent";

function Home() {
    let navigate = useNavigate();
    const [getUsername, setUsername] = useState("");

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
                    console.log("invalid token");
                    navigate("/login");
                }
            });
        } else {
            navigate("/login");
        }
    }, [navigate]);

    return (
        <div>
            <NavbarComponent/>
            <h1>Home Page</h1>
        </div>
    );
}

export default Home;
