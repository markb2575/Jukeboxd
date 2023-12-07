import { Link } from "react-router-dom";
import NavbarComponent from "../routing/NavbarComponent";

function Error() {
  return (
    <div>
      <NavbarComponent />
        <div className="container text-center mt-5">
          <h1 className="display-1">404</h1>
          <h2>This page isn't available</h2>
          <p className="lead">
            The page you are looking for might have been removed or doesn't exist.
          </p>
          <Link to="/" className="btn btn-primary">
            Go Back to Homepage
          </Link>
        </div>
    </div>
  );
}

export default Error;