import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

function FollowingModal({ show, onHide, following, onUsernameClick }) {
    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Following</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {following && following.length ? (
                    <ul style={{ listStyleType: 'none' }}>
                        {following.map((followee, index) => (
                            <li key={index} onClick={() => onUsernameClick(followee.username)}>
                                <span className="username">{followee.username}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Not following anyone yet.</p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default FollowingModal;
