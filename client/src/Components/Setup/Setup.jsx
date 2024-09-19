import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Setup.css'; // Assuming you have a CSS file for styles

// Use environment variables for API base URL
const apiBaseUrl = import.meta.env.MODE === "production"
    ? import.meta.env.VITE_PROD_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL;

const Setup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [contact, setContact] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Use navigate to redirect after account creation
    const navigate = useNavigate();

    // Password validation
    const isValidPassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
        return passwordRegex.test(password);
    };

    // Basic email validation
    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    // Contact number validation for Philippines (should be in +63 format and never start with 0 after +63)
    const isValidContact = (contact) => {
        const contactRegex = /^9\d{9}$/; // Validates 10-digit number after +63 (i.e., starts with 9)
        return contactRegex.test(contact);
    };

    // Handle OTP sending
    const sendOtp = async () => {
        if (!isValidEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        if (!isValidContact(contact)) {
            setError('Please enter a valid contact number starting with +639 and followed by 9 digits.');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.post(`${apiBaseUrl}/api/send-otp`, { email });
            if (response.data.success) {
                setOtpSent(true);
                setSuccess('OTP sent to your email.');
            } else {
                setError('Failed to send OTP. Please try again.');
            }
        } catch (error) {
            setError('Failed to send OTP. Please check your internet connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isValidEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        if (!isValidPassword(password)) {
            setError('Password must be 8-20 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
            return;
        }

        if (!isValidContact(contact)) {
            setError('Please enter a valid contact number starting with +639 and followed by 9 digits.');
            return;
        }

        if (!otp) {
            setError('Please enter the OTP sent to your email.');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.post(`${apiBaseUrl}/api/create-admin`, { email, password, contact, otp });
            if (response.data.success) {
                setSuccess('Root admin account created successfully.');
                setError('');

                // Redirect to login after 2 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 2000); // Adjust the timeout duration if needed
            } else {
                setError(response.data.message || 'Failed to create account. Please try again.');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Error creating account. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="setup-container">
            <form className="setup-form" onSubmit={handleSubmit}>
                <div className="setup-form-group">
                    <h1 className="setup-title">Setup a Root Admin Account</h1>
                    <label htmlFor="email" className="setup-label">Email:</label>
                    <input
                        type="email"
                        id="email"
                        className="setup-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={otpSent || isLoading}
                    />
                    <small className="setup-small-text">Please use an email that can receive OTPs.</small>
                </div>

                <div className="setup-form-group">
                    <label htmlFor="contact" className="setup-label">Contact Number (+63):</label>
                    <div className="setup-contact">
                        <span className="setup-prefix">+63</span>
                        <input
                            type="tel"
                            id="contact"
                            className="setup-input"
                            value={contact}
                            onChange={(e) => setContact(e.target.value.replace(/^0+/, ''))} // Remove leading zeros
                            required
                            maxLength={10} // Only allow 10 digits after +63
                            disabled={otpSent || isLoading}
                            placeholder="9xxxxxxxxx"
                        />
                    </div>
                    <small className="setup-small-text">Must be a valid Philippine number starting with +639.</small>
                </div>

                <div className="setup-form-group">
                    <label htmlFor="password" className="setup-label">Password:</label>
                    <input
                        type="password"
                        id="password"
                        className="setup-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={otpSent || isLoading}
                    />
                    <small className="setup-small-text">Password must be 8-20 characters, include uppercase, lowercase, number, and special character.</small>
                </div>

                {otpSent && (
                    <div className="setup-form-group">
                        <label htmlFor="otp" className="setup-label">OTP:</label>
                        <input
                            type="text"
                            id="otp"
                            className="setup-input"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                )}

                {!otpSent ? (
                    <button type="button" onClick={sendOtp} disabled={isLoading} className="setup-button">
                        {isLoading ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                ) : (
                    <button type="submit" disabled={isLoading} className="setup-button">
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                )}

                {error && <p className="setup-error">{error}</p>}
                {success && <p className="setup-success">{success}</p>}
            </form>
        </div>
    );
};

export default Setup;
