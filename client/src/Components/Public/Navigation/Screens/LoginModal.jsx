import React, { useState, useEffect, useRef } from 'react';
import './LoginModal.css';
import axios from 'axios';  // Add axios for API requests
import { useNavigate } from 'react-router-dom';

import usericon from "../../../Assets/account.png"; // Optionally change to phone icon
import passicon from "../../../Assets/password.png";
import showicon from "../../../Assets/show.png";
import phoneicon from "../../../Assets/phone2.png"
import logo1 from "../../../Assets/logo1.png";
import logo2 from "../../../Assets/logo2.png";

import OTPModal from './OTPModal.jsx';
import ForgotModal from './ForgotModal.jsx';
import TermsModal from './TermsModal';

// Determine the base URL based on the environment
const apiBaseUrl =
    import.meta.env.MODE === "production"
        ? import.meta.env.VITE_PROD_API_BASE_URL
        : import.meta.env.VITE_API_BASE_URL;

const LoginModal = ({ isOpen, onClose }) => {
    const [phoneNumber, setPhoneNumber] = useState('');  // Changed to phone number
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [fadeError, setFadeError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [userId, setUserId] = useState(null);
    const [barangay, setBarangay] = useState('');
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
    const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
    const [isChecked, setIsChecked] = useState(false)
    const [canCheckTerms, setCanCheckTerms] = useState(false);

    const modalRef = useRef(null);
    const navigate = useNavigate();

    // Function to log login attempts
    const logLoginAttempt = async (status, description) => {
        const logEntry = {
            phoneNumber,  // Now logging phone number instead of username
            type: "Login Module",
            date: new Date().toLocaleDateString("en-US"),
            time: new Date().toLocaleTimeString("en-US"),
            status,
            description,
        };

        try {
            await axios.post(`${apiBaseUrl}/api/logs`, logEntry); // Ensure backend is configured to handle this
        } catch (err) {
            console.error("Error logging login attempt:", err);
        }
    };

    const handlePhoneNumberChange = (e) => {
        let value = e.target.value;

        // Ensure that the input always starts with "+63"
        if (value.startsWith("+63")) {
            // Allow only numbers after "+63"
            value = "+63" + value.slice(3).replace(/\D/g, "");
        } else {
            // If the user removes "+63", reset the input to "+63"
            value = "+63" + value.slice(3).replace(/\D/g, "");
        }

        // Limit the total length to 12 characters (i.e., +63 + 10 digits)
        if (value.length > 13) {
            value = value.slice(0, 13);
        }

        setPhoneNumber(value);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setFadeError(false);
        setError("");  // Clear previous errors

        // Input validation
        if (!phoneNumber || !password || !barangay) {
            setError("Phone number, password, and barangay are required.");
            setTimeout(() => setFadeError(true), 3000);
            logLoginAttempt("Failed", "Missing phone number, password, or barangay");
            return;
        }

        if (!isChecked) {
            setError("You must read and agree to the Terms and Conditions.");
            setTimeout(() => setFadeError(true), 3000);
            return;
        }

        setIsLoading(true); // Start loading state

        try {
            // Make login request
            const response = await axios.post(`${apiBaseUrl}/api/login-new`, { phoneNumber, password, barangay });

            if (response.data.message === "Success") {
                // Login was successful, clear error messages and show OTP modal
                setIsLoading(false);
                setError("");  // Clear any previous error message
                setUserId(response.data.userId); // Set user ID for OTP

                // Check if the status is "new"
                const needsPasswordChange = response.data.status === "new";
                setIsOtpModalOpen(true); // Open OTP modal with password change check
                setNeedsPasswordChange(needsPasswordChange);  // Pass status flag to OTP modal

            } else {
                setIsLoading(false);
                setError(response.data);  // Display error message from backend
                setTimeout(() => setFadeError(true), 3000);
            }
        } catch (error) {
            setIsLoading(false);
            if (error.response && error.response.status === 401) {
                // Handle invalid login (invalid phoneNumber/password or barangay)
                setError(error.response.data); // Show error message from the backend
                setTimeout(() => setFadeError(true), 3000);
                logLoginAttempt("Failed", error.response.data);
            } else {
                // Handle other errors
                setError("An unexpected error occurred. Please try again.");
                setTimeout(() => setFadeError(true), 3000);
            }
        }
    };

    const handleBarangayChange = (e) => {
        setBarangay(e.target.value); // Update the barangay state when the user selects a value
    };


    const openForgotPasswordModal = () => {
        setIsForgotModalOpen(true);  // Open Forgot Modal
    };

    const closeForgotModal = () => {
        setIsForgotModalOpen(false);  // Close Forgot Modal
    };

    const openTermsModal = () => {
        setIsTermsModalOpen(true);
        setCanCheckTerms(true);
    };

    const closeTermsModal = () => {
        setIsTermsModalOpen(false);  // Close the Terms Modal
    };

    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);  // Toggle checkbox state
    };

    const closeOtpModal = () => {
        setBarangay('');
        setPhoneNumber('');
        setPassword('');
        setError('');
        setShowPassword(false);
        setFadeError(false);
        setIsOtpModalOpen(false);
        setIsChecked(false);
        setCanCheckTerms(false);
        onClose();
    };

    const handleOtpSuccess = (userId) => {
        if (userId) {
            sessionStorage.setItem("userId", userId); // Save userId to sessionStorage
            // Navigate to the admin page
            navigate("/admin");
        } else {
            console.error('No userId to save.');
        }
    };

    const handleClose = () => {
        setBarangay('');
        setPhoneNumber('');
        setPassword('');
        setError('');
        setShowPassword(false);
        setFadeError(false);
        setIsOtpModalOpen(false);
        setIsChecked(false);
        setCanCheckTerms(false);
        onClose();
    };

    // Fade error animation
    useEffect(() => {
        if (fadeError) {
            const timeout = setTimeout(() => {
                setError('');
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [fadeError]);

    if (!isOpen) return null;

    return (
        <div className="login-modal-overlay">
            <button className="login-modal-close-btn" onClick={handleClose}>X</button>
            <div className='login-modal-box'>
                <div className='login-modal-left-box'>
                    <div className="login-modal-title-box">
                        <a className="login-modal-title-text">TRACCS</a>
                        <a className="login-modal-title-acronym">Taytay Response, Assistance and Community Coordination System</a>
                    </div>
                </div>

                <div ref={modalRef} className="login-modal">
                    <div className='login-modal-logos-container'>
                        <img src={logo1} className="login-modal-icons" alt="Logo1" />
                        <img src={logo2} className="login-modal-icons" alt="Logo2" />
                    </div>

                    <form onSubmit={handleLogin}>

                        <div className='login-modal-container'>
                            <div className='login-modal-sign-box'>
                                <a className='login-modal-sign'>Sign in as Administrator...</a>
                            </div>
                            <div className='login-modal-input-container'>
                                <img src={usericon} alt="User Icon" />
                                <select
                                    id="barangay"
                                    className="login-modal-dropdown"
                                    value={barangay}
                                    onChange={handleBarangayChange}
                                    required
                                >
                                    <option value="">Select Account</option>
                                    <option value="MDRRMO">MDRRMO</option>
                                    <option value="Dolores">Dolores</option>
                                    <option value="Muzon">Muzon</option>
                                    <option value="San Isidro">San Isidro</option>
                                    <option value="San Juan">San Juan</option>
                                    <option value="Santa Ana">Santa Ana</option>
                                </select>
                            </div>

                            <div className='login-modal-input-container'>
                                <img src={phoneicon} alt="Phone Icon" />
                                <input
                                    className='login-modal-input-box'
                                    type="text"
                                    placeholder="Phone Number"
                                    value={phoneNumber}
                                    onChange={handlePhoneNumberChange}
                                />
                            </div>

                            <div className='login-modal-input-container'>
                                <img src={passicon} alt="Password Icon" />
                                <input
                                    className='login-modal-input-box'
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <img
                                    src={showicon}
                                    alt="show-password"
                                    className="login-modal-show-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ cursor: "pointer" }}
                                />
                            </div>

                            <button
                                className={`login-modal-button ${isLoading ? 'loading' : ''}`}
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="spinner"></div>
                                ) : (
                                    'Login'
                                )}
                            </button>

                            <div className='login-modal-options-container'>
                                <div className='login-modal-terms-box'>
                                    <input
                                        type='checkbox'
                                        checked={isChecked}
                                        onChange={handleCheckboxChange}
                                        disabled={!canCheckTerms}
                                    />
                                    <button
                                        className='login-modal-terms-btn'
                                        type="button"
                                        onClick={openTermsModal}
                                    >
                                        Terms and Conditions
                                    </button>
                                </div>

                                <button
                                    className="login-modal-forgot-btn"
                                    type="button"
                                    onClick={openForgotPasswordModal}
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        </div>
                    </form>

                    {error && <div className={`login-modal-error ${fadeError ? 'fade-out' : ''}`}>{error}</div>}
                </div>
            </div>

            {isOtpModalOpen && (
                <OTPModal
                    isOpen={isOtpModalOpen}
                    onClose={closeOtpModal}
                    userId={userId}
                    phoneNumber={phoneNumber}
                    needsPasswordChange={needsPasswordChange}
                    onOtpSuccess={handleOtpSuccess}
                />
            )}

            {isForgotModalOpen && (
                <ForgotModal
                    isOpen={isForgotModalOpen}
                    onClose={closeForgotModal}
                />
            )}

            <TermsModal
                isOpen={isTermsModalOpen}
                onClose={closeTermsModal}
            />

        </div>
    );
};

export default LoginModal;