import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import usericon from "../Assets/email.png";
import passicon from "../Assets/password.png";
import showicon from "../Assets/show.png";
import logo1 from "../Assets/logo1.png";
import logo2 from "../Assets/logo2.png";
import "./Login.css";
import { validateUsername, validatePassword } from "./loginauth";

// Determine the base URL based on the environment
const apiBaseUrl =
    import.meta.env.MODE === "production"
        ? import.meta.env.VITE_PROD_API_BASE_URL
        : import.meta.env.VITE_API_BASE_URL;

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [hovered, setHovered] = useState(false);

    const navigate = useNavigate();

    const logLoginAttempt = async (status, description) => {
        const logEntry = {
            username,
            type: "Login Module",
            date: new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
            time: new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }),
            description,
        };

        try {
            await axios.post(`${apiBaseUrl}/api/logs`, logEntry);
        } catch (error) {
            console.error("Error logging the login attempt:", error);
        }
    };

    const handleLogin = async () => {
        setIsLoading(true); // Start loading

        if (!validateUsername(username) || !validatePassword(password)) {
            alert("• Invalid username or password.");
            await logLoginAttempt(
                "Failure",
                "Invalid username or password format."
            );
            setIsLoading(false); // Stop loading
            return;
        }

        try {
            const response = await axios.post(
                `${apiBaseUrl}/api/login`,
                { username, password },
                { withCredentials: true }
            );
            if (response.data.message === "Success") {
                await logLoginAttempt(
                    "Success",
                    "User logged in successfully."
                );
                navigate("/admin");
                sessionStorage.setItem("userId", response.data.userId);
            } else {
                alert("• Invalid username or password.");
                await logLoginAttempt(
                    "Failure",
                    "Invalid username or password."
                );
            }
        } catch (error) {
            alert("• Invalid username or password.");
            await logLoginAttempt("Failure", "Error during login request.");
        } finally {
            // Clear input fields and stop loading after the login attempt
            setUsername("");
            setPassword("");
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-left-container">
                    <div className="wave-top">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="720"
                            height="293"
                            viewBox="0 0 720 293"
                            fill="none"
                        >
                            <path
                                d="M-9 -38H719.651V49.6611C719.651 49.6611 506.116 64.9508 350.266 198.481C194.415 332.011 92.9774 298.02 -9 253.524V-38Z"
                                fill="#0E267C"
                            />
                        </svg>
                    </div>
                    <div className="login-title-box">
                        <Link to="/" className="login-title-text">
                            TRACCS
                        </Link>
                        <a className="login-title-acronym">
                            Taytay Response, Assistance and Community
                            Coordination System
                        </a>
                    </div>
                    <div className="wave-bottom">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="721"
                            height="332"
                            viewBox="0 0 721 332"
                            fill="none"
                        >
                            <path
                                d="M-8 332H720.651V244.074C720.651 244.074 507.116 228.738 351.266 94.8046C195.415 -39.1291 93.9774 -5.03528 -8 39.5953V332Z"
                                fill="#0A1B57"
                            />
                        </svg>
                    </div>
                </div>

                <div className="login-right-container">
                    <div className="login-content-box">
                        <div className="login-logo-box">
                            <img
                                src={logo1}
                                className="login-icons"
                                alt="Logo1"
                            />
                            <img
                                src={logo2}
                                className="login-icons"
                                alt="Logo2"
                            />
                        </div>

                        <div className="login-message-box">
                            <a>Sign in as an Administrator...</a>

                            <div className="login-textfield-box">
                                <img src={usericon} alt="User Icon" />
                                <input
                                    type="text"
                                    placeholder="Enter username"
                                    className="login-textfield-input"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="login-textfield-box">
                                <img src={passicon} alt="Password Icon" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter password"
                                    className="login-textfield-input"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    disabled={isLoading}
                                />
                                <img
                                    src={showicon}
                                    alt="show-password"
                                    className="show-password"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    style={{ cursor: "pointer" }}
                                />
                            </div>

                            <div className="login-button-box">
                                <button
                                    onClick={handleLogin}
                                    className={`login-button ${isLoading ? "loading" : ""
                                        }`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Loading..." : "Continue"}
                                </button>
                            </div>

                            <div className="login-back">
                                <Link
                                    to="/"
                                    className="login-back-button"
                                    onMouseEnter={() => setHovered(true)}
                                    onMouseLeave={() => setHovered(false)}
                                >
                                    {hovered ? "To Homepage..." : "Go Back"}
                                </Link>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
