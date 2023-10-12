import { Link } from "react-router-dom";


function Login() {
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
    }).then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));

  }
  return (
    <div>
      <form onSubmit={handleLogin}>
        <div>
          <label>Username</label>
          <input/>
        </div>
        <div>
          <label>Password</label>
          <input/>
        </div>
        <div>
          <button type="submit">Login</button>
        </div> 
      </form>
      <Link to="/signup">Need an account?</Link>
    </div>
  );
}

export default Login;
