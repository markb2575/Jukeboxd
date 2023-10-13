import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";


function Login() {
  let navigate = useNavigate();
  const [error, setError] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
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
      headers: {'Content-Type': 'application/json'}
    }).then(response => {
      if (response.status === 200) {
        console.log(response)
        navigate("/")
      } else {
        setError("Your username or password was incorrect")
        setPassword("")
        setUsername("")
      }
    })
    .catch(error => console.error(error));

  }
  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="col-md-6 col-lg-4">
      <h2>Login</h2>
        <form onSubmit={handleLogin} className="mt-4">
          {error && <p style={{lineHeight:.8}} className="alert alert-danger alert-dismissible fade show" role="alert">{error}</p>}
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input type="text" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)}/>
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)}/>
          </div>
          <div className="mb-3">
            <button type="submit" className="btn btn-primary btn-block">Login</button>
          </div>
        </form>
        <p className="">
          <Link to="/signup">Need an account?</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
