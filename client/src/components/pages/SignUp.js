import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"

function SignUp() {
  let navigate = useNavigate();
  const [error, setError] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const handleCreateAccount = (e) => {
    e.preventDefault()
    //create a request to create account with the following object
    var credentials = {
      username: e.target[0].value,
      password: e.target[1].value
    }
    //check to make sure credentials are allowed
    if (credentials.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    fetch('http://localhost:8080/user/signup', {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: { 'Content-Type': 'application/json' }
    }).then(response => {
      if (response.status === 200) {
        console.log(response)
        navigate("/login")
      } else {
        setError("Username already taken, try something different")
        setPassword("")
        setUsername("")
      }
    })
      .catch(error => console.error(error));


  }
  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="col-md-6 col-lg-4">
        <h2>Create an Account</h2>
        <form onSubmit={handleCreateAccount} className="mt-4">
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
            <button type="submit" className="btn btn-primary btn-block">Create Account</button>
          </div>
        </form>
        <p className="">
          <Link to="/login">Already have an account?</Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;