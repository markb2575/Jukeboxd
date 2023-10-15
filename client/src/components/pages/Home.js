import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
function Home() {
    let navigate = useNavigate();
    const [getUsername, setUsername] = useState("")
    
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
                // console.log(response)
                response.json().then(res => {
                    console.log(res)
                    setUsername(res.username)
                }).catch(e => {
                    console.log(e)
                })
            } else {
                console.log("invalid token")
            }
        })
        } else {
            navigate("/login")
        }
    }, [navigate]);


    return (
        <div>
            <h1>Home Page</h1>
            {(localStorage.token) ? 
            "welcome " + getUsername : 
            <Link to="/login" className="btn btn-primary">Login</Link>
            }
        </div>
    );
}

export default Home;