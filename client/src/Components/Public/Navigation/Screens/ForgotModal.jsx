import React, { useState } from 'react';
import axios from 'axios';
import './ForgotModal.css';

import showicon from "../../../Assets/show.png";

const apiBaseUrl =
    import.meta.env.MODE === "production"
        ? import.meta.env.VITE_PROD_API_BASE_URL
        : import.meta.env.VITE_API_BASE_URL;

const ForgotModal = ({ isOpen, onClose }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordError, setPasswordError] = useState(''); // For password validation error messages

    // Handle phone number input
    const handlePhoneNumberChange = (e) => {
        let value = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
        if (value.length > 13) value = value.slice(0, 13); // Limit to 13 digits
        setPhoneNumber('+63' + value.slice(2)); // Ensure it always starts with +63
    };

    // Validate new password
    const validatePassword = (password) => {
        const minLength = 8;
        const hasNumber = /\d/;
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

        if (password.length < minLength) {
            return 'Password must be at least 8 characters long.';
        }
        if (!hasNumber.test(password)) {
            return 'Password must contain at least one number.';
        }
        if (!hasSpecialChar.test(password)) {
            return 'Password must contain at least one special character.';
        }
        return ''; // No errors
    };

    // Handle new password input change
    const handleNewPasswordChange = (e) => {
        const password = e.target.value;
        setNewPassword(password);
        const error = validatePassword(password);
        setPasswordError(error); // Set password validation error
    };

    // Verify phone number and email
    const verifyPhoneNumberAndEmail = async () => {
        setIsSubmitting(true);
        setMessage('');

        try {
            const response = await axios.post(`${apiBaseUrl}/api/verify-phone-and-email`, { phoneNumber, email });
            if (response.status === 200 && response.data.exists) {
                return true;
            } else {
                setMessage('Phone number or email does not exist in the database.');
                return false;
            }
        } catch (error) {
            console.error(error);
            setMessage('Error verifying phone number and email.');
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    // Send OTP
    const handleSendOtp = async () => {
        if (!phoneNumber || !email || phoneNumber.length < 13 || !email) {
            setMessage('Phone number or email is missing or invalid.');
            return;
        }

        const userExists = await verifyPhoneNumberAndEmail();
        if (!userExists) return;

        setIsSubmitting(true);
        setMessage('');
        try {
            const otpResponse = await axios.post(`${apiBaseUrl}/api/sms-forgot-password`, { phoneNumber, email });
            if (otpResponse.status === 200) {
                setOtpSent(true);
                setMessage('OTP sent successfully. Please check your phone.');
            } else {
                setMessage('Failed to send OTP.');
            }
        } catch (error) {
            setMessage('Error sending OTP. Please try again later.');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Verify OTP
    const handleVerifyOtp = async () => {
        if (!otp) {
            setMessage('Please enter the OTP.');
            return;
        }

        setIsSubmitting(true);
        setMessage('');
        try {
            const verifyResponse = await axios.post(`${apiBaseUrl}/api/verify-sms-forgot-password`, { mobile: phoneNumber, code: otp });
            if (verifyResponse.status === 200) {
                setOtpVerified(true);
                setMessage('OTP verified successfully!');
            } else {
                setMessage('Invalid OTP. Please try again.');
            }
        } catch (error) {
            setMessage('Error verifying OTP.');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Change password
    const handleChangePassword = async () => {
        if (passwordError) {
            setMessage('Please fix the password validation errors.');
            return;
        }

        if (!newPassword) {
            setMessage('Please enter a new password.');
            return;
        }

        setIsSubmitting(true);
        setMessage('');
        try {
            const changePasswordResponse = await axios.post(`${apiBaseUrl}/api/change-password`, { contact: phoneNumber, newPassword });
            if (changePasswordResponse.status === 200) {
                setMessage('Password changed successfully!');
                resetForm();
            } else {
                setMessage('Failed to change password. Please try again.');
            }
        } catch (error) {
            setMessage('Error changing password.');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset form after password change
    const resetForm = () => {
        setOtpVerified(false);
        setPhoneNumber('');
        setEmail('');
        setOtp('');
        setNewPassword('');
        setOtpSent(false);
    };

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Close modal handler
    const handleClose = () => {
        onClose();
    };

    return (
        isOpen && (
            <div className="forgot-modal-overlay">
                <div className="forgot-modal">
                    <h2>Forgot your password?</h2>
                    <p>We're going to send an OTP to</p>
                    {message && <p className="forgot-modal-message">{message}</p>}
                    {passwordError && <div className="forgot-modal-password-error">• {passwordError}</div>} {/* Display password error */}

                    {/* Phone Number input for Forgot Password */}
                    {!otpSent && !otpVerified && (
                        <input
                            className="forgot-modal-input"
                            type="tel"
                            value={phoneNumber}
                            onChange={handlePhoneNumberChange}
                            placeholder="Enter phone number (+63)"
                            maxLength="13"
                            disabled={isSubmitting || otpSent}
                        />
                    )}

                    {/* Email input for Forgot Password */}
                    {!otpSent && !otpVerified && (
                        <input
                            className="forgot-modal-input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email"
                            disabled={isSubmitting || otpSent}
                        />
                    )}

                    {/* OTP input after OTP is sent */}
                    {otpSent && !otpVerified && (
                        <input
                            className="forgot-modal-input"
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter OTP"
                            disabled={isSubmitting || otpVerified}
                        />
                    )}

                    {/* New Password input after OTP verification */}
                    {otpVerified && (
                        <div className='forgot-modal-pass-box'>
                            <input
                                className="forgot-modal-pass-input"
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={handleNewPasswordChange}
                                placeholder="Enter new password"
                                disabled={isSubmitting}
                            />
                            <img
                                src={showicon}
                                alt="show-password"
                                className='forgot-modal-show-password'
                                onClick={togglePasswordVisibility}
                                style={{ cursor: "pointer" }}
                            />
                        </div>
                    )}

                    <div className="forgot-modal-button-container">
                        {/* Send OTP Button */}
                        {!otpSent && (
                            <button
                                className="forgot-modal-button"
                                onClick={handleSendOtp}
                                disabled={isSubmitting || !phoneNumber || !email}
                            >
                                {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        )}

                        {/* Verify OTP Button */}
                        {otpSent && !otpVerified && (
                            <button
                                className="forgot-modal-button"
                                onClick={handleVerifyOtp}
                                disabled={isSubmitting || !otp}
                            >
                                {isSubmitting ? 'Verifying OTP...' : 'Verify OTP'}
                            </button>
                        )}

                        {/* Change Password Button */}
                        {otpVerified && (
                            <button
                                className="forgot-modal-button"
                                onClick={handleChangePassword}
                                disabled={isSubmitting || !newPassword || passwordError}
                            >
                                {isSubmitting ? 'Changing Password...' : 'Change Password'}
                            </button>
                        )}

                        <button className="forgot-modal-button" onClick={handleClose}>Close</button>
                    </div>
                    
                </div>
            </div>
        )
    );
};

export default ForgotModal;