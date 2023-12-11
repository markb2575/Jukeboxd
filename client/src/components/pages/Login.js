import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import './Login.css'


function Login() {
    let navigate = useNavigate();
    const [error, setError] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    useEffect(() => {
        if (localStorage.token) {
            navigate("/")
        }
    }, [navigate])

    const handleLogin = (e) => {
        e.preventDefault()
        //create a request to login with the following object
        var credentials = {
            username: e.target[0].value,
            password: e.target[1].value
        }

        fetch('http://localhost:8080/user/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
            headers: { 'Content-Type': 'application/json' }
        }).then(response => {
            if (response.status === 200) {
                response.json().then(res => {
                    localStorage.setItem('token', res.token);
                    navigate("/")
                })
            } else {
                setError("Your username or password was incorrect")
                setPassword("")
                setUsername("")
            }
        })
            .catch(error => console.error(error));

    }
    return (
        <div className="login-page">
      <Container fluid>
        <Row>
          <Col md={6} className="left-section">
            <h1>Welcome to Jukeboxd</h1>
            {/* Add your floating geometric shapes here */}
          </Col>
          <Col md={6} className="right-section">
            <div className="login-box">
              <h2>Login</h2>
              <form onSubmit={handleLogin} className="mt-4">
                    {error && <p style={{ lineHeight: .8 }} className="alert alert-danger alert-dismissible fade show" role="alert">{error}</p>}
                    <div className="mb-3">
                        <label className="form-label">Username</label>
                        <input type="text" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <div className="mb-3">
                        <button type="submit" className="btn btn-primary btn-block">Login</button>
                    </div>
                </form>
                <p className="">
                    <Link to="/signup">Need an account?</Link>
                </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
    
    );
}

export default Login;
