import { Link } from "react-router-dom"
function SignUp() {

  const handleCreateAccount = (e) => {
    e.preventDefault()
    //create a request to create account with the following object
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