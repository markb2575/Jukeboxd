import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Card from 'react-bootstrap/Card'
import { Link } from "react-router-dom";

function Reviews({ reviewsExist, reviews }) {

  /**
   * Takes the datetime stored in the mariaDB database (which is in UTC), and converts it to the user's local timezone, then alters how it is displayed
   * so it only shows the pertinent information
   * @param {*} mariaDBDatetime The datetime from the mariaDB database, which is in UTC time
   * @returns The pertinent datetime information from the mariaDB database but in the user's local timezone
   */
  function convertMariaDBDatetimeToLocalTime(mariaDBDatetime) {
    // Create a Date object from the MariaDB datetime string
    const datetimeObject = new Date(mariaDBDatetime);

    // Format the datetime in your local timezone
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    };

    return datetimeObject.toLocaleString(undefined, options);
  }

  return (
    <div>
      <div className="header">
        <h3>Reviews:</h3>
      </div>
      <div style={{ marginBottom: '20px' }}>
        {reviewsExist ?
          <Row xs={1} md={2} className="g-4">
            {reviews.map((result, idx) => (
              <Col key={idx}>
                <Card>
                  <Card.Header>Reviewed by <Link to={`/user/${result.username}`}>{result.username}</Link> </Card.Header>
                  <Card.Body>
                    <Card.Text style={{ whiteSpace: "pre-line" }}>
                      {result.review}
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer>{convertMariaDBDatetimeToLocalTime(result.datetime)}</Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
          :
          <div>No reviews exist yet</div>}
      </div>
    </div>
  )
}
export default Reviews;