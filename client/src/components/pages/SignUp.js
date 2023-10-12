import { Link } from "react-router-dom"
function SignUp() {

  const handleCreateAccount = (e) => {
    e.preventDefault()
    //create a request to create account with the following object
    var credentials = {
      username: e.target[0].value,
      password: e.target[1].value
    }
    fetch('http://localhost:8080/user/signup', {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: {'Content-Type': 'application/json'}
    }).then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));
    

  }
  return (
    <div>
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