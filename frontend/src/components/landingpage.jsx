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
                alert("Aiee Sasur");
            }
        }, 1000)
    }
    return (
    <div className = "container">
        <div className = "heading">
            <h1>LiveCharge</h1>
        </div>
        <div className = "tag">
            <h3>Know Before You Go</h3>
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