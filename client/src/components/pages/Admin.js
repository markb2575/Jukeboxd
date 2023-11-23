import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import NavbarComponent from "../routing/NavbarComponent";
import { Container } from "react-bootstrap";
import './Admin.css';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';

function Admin({ username, isAdmin }) {

    let navigate = useNavigate();

    useEffect(() => {
        if (isAdmin === false) {
            navigate("/");
        } else {

        }
    }, [navigate, isAdmin]);


    return (

        <div>
            <NavbarComponent />
            <div className="header">
                <h2>Admin Menu</h2>
            </div>
            <Container>




            </Container>
        </div>

    );
}

export default Admin;