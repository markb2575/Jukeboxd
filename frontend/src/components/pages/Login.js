import { Link } from "react-router-dom"
function Login() {
  const handleLogin = (e) => {
    e.preventDefault()
    e.preventDefault()
    //create a request to login with the following object
    var credentials = {
      username: e.target[0].value,
      email: e.target[1].value
    }
    console.log(credentials)
    // fetch('httpfs://example.com/api/v1/users', {
    //   method: 'POST',
    //   body: JSON.stringify(credentials)
    // });
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
