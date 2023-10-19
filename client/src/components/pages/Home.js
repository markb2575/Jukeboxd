import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
    let navigate = useNavigate();
    const [getUsername, setUsername] = useState("");

    useEffect(() => {
        if (localStorage.token) {
            fetch('http://localhost:8080/user', {
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

    const handleLogout = () => {
        // Clear the token from localStorage
        localStorage.removeItem("token");

        // Navigate to the login page after logging out
        navigate("/login");
    };

    return (
        <div>
            <h1>Home Page</h1>
            {(localStorage.token) ? (
                <div>
                    <p>Welcome {getUsername}</p>
                    <button onClick={handleLogout} className="btn btn-primary">
                        Logout
                    </button>
                </div>
            ) : (
                <Link to="/login" className="btn btn-primary">
                    Login
                </Link>
            )}
        </div>
    );
}

export default Home;
