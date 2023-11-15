import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

function FollowersModal({ show, onHide, followers, onUsernameClick }) {
    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Followers</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {followers && followers.length ? (
                    <ul style={{ listStyleType: 'none' }}>
                        {followers.map((follower, index) => (
                            <li key={index} onClick={() => onUsernameClick(follower.username)}>
                                <span className="username">{follower.username}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No followers yet.</p>
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

export default FollowersModal;
