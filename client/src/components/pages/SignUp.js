import { Link } from "react-router-dom"
import { useState } from "react"
function SignUp() {
  const [error, setError] = useState("")
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
      headers: {'Content-Type': 'application/json'}
    }).then(response => {
      console.log(response)
    })
    .catch(error => console.error(error));
    

  }
  return (
    <div>
      {error && <p>{error}</p>}
      <form onSubmit={handleCreateAccount}>
        <div>
          <label>Username</label>
          <input />
        </div>
        <div>
          <label>Password</label>
          <input />
        </div>
        <div>
          <button type="submit">Create Account</button>
        </div>
      </form>
      <Link to="/login">Already have an account?</Link>
    </div>
  );
}

export default SignUp;