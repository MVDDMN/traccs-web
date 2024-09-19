import React, { useState, useEffect } from "react";
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
    const [error, setError] = useState("");
    const [errorVisible, setErrorVisible] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(true); // Modal is open on page load
    const [agreed, setAgreed] = useState(false); // State to track agreement

    const navigate = useNavigate();

    useEffect(() => {
        if (error) {
            setErrorVisible(true);
            const timer = setTimeout(() => {
                setErrorVisible(false);
                setError("");
            }, 5000); // Error message duration

            return () => clearTimeout(timer); // Cleanup timeout on unmount or error change
        }
    }, [error]);

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
        setIsLoading(true);
        setError(""); // Clear any previous errors

        if (!validateUsername(username) || !validatePassword(password)) {
            setError("Invalid username or password.");
            await logLoginAttempt(
                "Failure",
                "Invalid username or password format."
            );
            setIsLoading(false);
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
                setError(""); // Clear error on successful login
            } else {
                setError("Invalid username or password.");
                await logLoginAttempt(
                    "Failure",
                    "Invalid username or password."
                );
            }
        } catch (error) {
            if (error.response) {
                setError("Invalid username or password.");
            } else if (error.request) {
                setError("The server is currently down. Please try again later.");
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
            await logLoginAttempt("Failure", "Error during login request.");
        } finally {
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

                            <div className={`login-error-box ${errorVisible ? 'show' : 'hide'}`}>
                                <label>{error}</label>
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

            {isModalOpen && (
                <div className="terms-modal">
                    <div className="terms-modal-content">

                        <div className="terms-text-container">
                            <h2 className="terms-title">Terms and Conditions</h2>

                            <h3>1. Introduction</h3>
                            <p>
                                Welcome to TRACCS. By accessing and using this platform,
                                you agree to comply with and be bound by the following terms and conditions of use.
                                Please read them carefully. If you do not agree to any part of these terms,
                                you should refrain from using this application.
                            </p>

                            <h3>2. User Responsibilities</h3>
                            <p>
                                As a user, you agree to use this platform for lawful purposes only.
                                You are responsible for ensuring that your activities comply with all applicable laws,
                                regulations, and guidelines. Any breach of these laws or terms may result in the
                                suspension or termination of your account.
                            </p>

                            <h3>3. Account Security</h3>
                            <p>
                                You are responsible for maintaining the confidentiality
                                of your login credentials and any activities that occur under your account.
                                TRACCS will not be liable for any loss or damage arising from your failure to safeguard your credentials.
                                Should you suspect unauthorized use of your account, please contact our support team immediately.
                            </p>

                            <h3>4. Data Privacy</h3>
                            <p>
                                We are committed to protecting your privacy.
                                By agreeing to these terms, you acknowledge that you have read and understood our Privacy Policy,
                                which governs the collection, use, and disclosure of your personal information.
                            </p>

                            <h3>5. Limitation of Liability</h3>
                            <p>
                                TRACCS is provided "as is" and "as available." We make no warranties,
                                expressed or implied, regarding the accuracy, reliability, or availability of the platform.
                                In no event shall TRACCS or its affiliates be liable for any indirect, incidental,
                                or consequential damages arising from the use or inability to use the platform.
                            </p>

                            <h3>6. Modifications to Terms</h3>
                            <p>
                                We reserve the right to update or modify these terms at any time without prior notice.
                                Continued use of the platform after any changes indicates your acceptance of the new terms.
                            </p>

                            <h3>7. Governing Law</h3>
                            <p>
                                These terms shall be governed and construed in accordance with the laws of
                                Philippines, without regard to its conflict of law provisions.
                                Any disputes arising out of or in connection with the use of this platform shall be subject
                                to the exclusive jurisdiction of the courts in Taytay, Rizal.
                            </p>

                        </div>

                        <p className="terms-alert-text">
                            By checking the box below, you acknowledge that you have read, understood,
                            and agree to the terms and conditions set forth above.
                        </p>

                        <div className="terms-agree">
                            <input
                                type="checkbox"
                                id="agree"
                                checked={agreed}
                                onChange={() => setAgreed(!agreed)}
                            />

                            <label htmlFor="agree" className="terms-agree-msg">I agree to the terms and conditions</label>
                        </div>

                        <div className="terms-button-container">

                            <Link
                                to="/"
                                className="terms-home"
                            >
                                Go to Home
                            </Link>

                            <button
                                className="terms-button"
                                onClick={() => {
                                    if (agreed) {
                                        setIsModalOpen(false); // Close modal if agreed
                                    } else {
                                        alert('Please agree to the terms and conditions');
                                    }
                                }}
                            >
                                Proceed to Login
                            </button>
                        </div>
                        
                    </div>
                </div>
            )}


        </div>
    );
};

export default Login;
