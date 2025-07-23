import { React, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./landingpage.css"

function LandingPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        if (username == "" || password == "") {
            alert("Incorrect Login Credentials");
            return;
        }

        setTimeout(() => {
            if (username === "admin" && password === "password") {
                // alert("Login successful")
                navigate('/home');
            } else {
                alert("Incorrect Login Credentials");
            }
        }, 1000)
    }
    return (
    <div className = "container">
        <div className = "heading">
            <img src = "./image/whitelog.png" height = "275px" width = "360px" alt = "logo" />
        </div>
        <div className = "tag">
            {/* <h3>Know Before You Go</h3> */}
        </div>
        <div className = "features-section">
            <h2>Why Choose LiveCharge?</h2>
            <div className = "features-grid">
                <div className = "feature-item">
                    <div className = "feature-icon">🗺️</div>
                    <h3>Google Maps Integration</h3>
                    <p>Visualize EV stations with interactive maps</p>
                </div>
                <div className = "feature-item">
                    <div className = "feature-icon">⚡</div>
                    <h3>Real-time Updates</h3>
                    <p>Get instant updates on station availability and status</p>
                </div>
                <div className = "feature-item">
                    <div className = "feature-icon">⭐</div>
                    <h3>User Reviews & Status</h3>
                    <p>Read and share reviews and status updates for EV stations</p>
                </div>
                <div className = "feature-item">
                    <div className = "feature-icon">👍</div>
                    <h3>Community Engagement</h3>
                    <p>Upvote/Downvote system for community-driven insights</p>
                </div>
            </div>
        </div>
        <div className = "tagline">
            <h3>Login to Know Before You Go</h3>
        </div>
        <div className = "details">
            <form onSubmit = {handleSubmit}>
                <label htmlFor="">Username</label> <br />
                <input type = "text" placeholder = "Enter username" value = {username} onChange = {(e) => setUsername(e.target.value)}/> <br/> <br /><br />
                <label htmlFor="">Password</label> <br />
                <input type = "password" placeholder = "Enter password" value = {password} onChange = {(e) => setPassword(e.target.value)} /> <br /><br /><br />
                <button type = "submit">Log In</button>
            </form>
        </div>
    </div>
    );
}

export default LandingPage;