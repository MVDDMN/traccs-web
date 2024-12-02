import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OTPModal.css';
import showicon from "../../../Assets/show.png";

const apiBaseUrl =
    import.meta.env.MODE === "production"
        ? import.meta.env.VITE_PROD_API_BASE_URL
        : import.meta.env.VITE_API_BASE_URL;

const OTPModal = ({ isOpen, onClose, userId, onOtpSuccess, needsPasswordChange }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [userEmail, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');  // Password validation error
    const [passwordMatchError, setPasswordMatchError] = useState(''); // Password match error

    const [isPasswordChanged, setIsPasswordChanged] = useState(false); // Track if password was changed

    // Fetch admin data using userId (admin ID)
    useEffect(() => {
        if (isOpen && userId && !isPasswordChanged) {
            axios
                .get(`${apiBaseUrl}/api/user/${userId}`)
                .then(response => {
                    const { email, contact, status } = response.data;
                    setEmail(email);
                    setPhoneNumber(contact);
                    setMessage(`We are going to send an OTP to ${contact}`);
                })
                .catch(err => {
                    console.error('Error fetching user data:', err);
                    setMessage('Failed to load user data.');
                });
        }
    }, [isOpen, userId, isPasswordChanged]);

    // Handle sending OTP
    const handleSendOtp = async () => {
        if (!phoneNumber || !userEmail) {
            setMessage('Phone number or email is missing.');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axios.post(`${apiBaseUrl}/api/sms-forgot-password`, { phoneNumber, email: userEmail });

            if (response.status === 200) {
                setOtpSent(true);
                setMessage(`We have sent an OTP to ${phoneNumber}. Please check your phone.`);
            } else {
                setMessage('Failed to send OTP.');
            }
        } catch (error) {
            console.error("Error in OTP request:", error);
            setMessage('Error sending OTP.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle OTP verification
    const handleVerifyOtp = async () => {
        if (!otp) {
            setMessage('Please enter the OTP.');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axios.post(`${apiBaseUrl}/api/verify-sms-forgot-password`, { mobile: phoneNumber, code: otp });

            if (response.status === 200) {
                setMessage('OTP verified successfully!');
                if (response.data && response.data.userId) {
                    onOtpSuccess(response.data.userId); // Pass the userId to the success handler
                }
            } else {
                setMessage('Invalid OTP. Please try again.');
            }
        } catch (error) {
            setMessage('Error verifying OTP.');
        } finally {
            setIsSubmitting(false);
        }
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
        return ''; // No error
    };

    // Handle new password input change
    const handleNewPasswordChange = (e) => {
        const password = e.target.value;
        setNewPassword(password);
        const error = validatePassword(password);
        setPasswordError(error); // Set password validation error message
        // Reset match error when new password is changed
        setPasswordMatchError('');
    };

    // Handle confirm password input change
    const handleConfirmPasswordChange = (e) => {
        const confirmPassword = e.target.value;
        setConfirmPassword(confirmPassword);
        // Check if passwords match
        if (newPassword !== confirmPassword) {
            setPasswordMatchError('Passwords do not match.');
        } else {
            setPasswordMatchError(''); // Clear the error when passwords match
        }
    };

    // Handle password change submission
    const handleChangePassword = async () => {
        if (!newPassword || !confirmPassword) {
            setMessage('Please enter and confirm the new password.');
            return;
        }

        if (passwordMatchError) {
            setMessage('Please fix the password mismatch error.');
            return;
        }

        if (passwordError) {
            setMessage('Please fix the password validation errors.');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axios.post(`${apiBaseUrl}/api/change-password-new`, {
                userId,
                newPassword,
            });

            if (response.status === 200) {
                setMessage('Password changed successfully!');
                setIsPasswordChanged(true); // Mark password change as successful
            } else {
                setMessage('Failed to change password.');
            }
        } catch (error) {
            setMessage('Error changing password.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Toggle password visibility
    const toggleNewPasswordVisibility = () => {
        setShowNewPassword(!showNewPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    // Handle closing the modal
    const handleClose = () => {
        if (!isPasswordChanged) {
            onClose();  // Close the OTP modal only if the password change hasn't occurred
        }
    };

    return (
        isOpen && (
            <div className="otp-modal-overlay">
                <div className="otp-modal">
                    {/* Dynamically change the heading and message */}
                    <h2>
                        {needsPasswordChange && !isPasswordChanged
                            ? 'New Account'
                            : otpSent
                                ? 'Enter OTP to Verify'
                                : 'One Time Password'}
                    </h2>
                    <p>
                        {needsPasswordChange && !isPasswordChanged
                            ? 'You have a new account. Please change your password.'
                            : otpSent
                                ? `We have sent an OTP to ${phoneNumber}. Please enter it below.`
                                : message}
                    </p>
                    {/* Display error messages */}
                    {passwordError && <div className="otp-modal-password-error">• {passwordError}</div>}
                    {passwordMatchError && <div className="otp-modal-password-error">• {passwordMatchError}</div>}

                    {needsPasswordChange && !isPasswordChanged ? (
                        <div className='otp-modal-container'>
                            <div className='otp-modal-input-container'>
                                <input
                                    className='otp-modal-pass-input'
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="Enter New Password"
                                    value={newPassword}
                                    onChange={handleNewPasswordChange}
                                    disabled={isSubmitting}
                                />
                                <img
                                    src={showicon}
                                    alt="show-password"
                                    className='otp-modal-show-password'
                                    onClick={toggleNewPasswordVisibility}
                                    style={{ cursor: "pointer" }}
                                />
                            </div>
                            <div className='otp-modal-input-container'>
                                <input
                                    className='otp-modal-pass-input'
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm New Password"
                                    value={confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                    disabled={isSubmitting}
                                />
                                <img
                                    src={showicon}
                                    alt="show-password"
                                    className='otp-modal-show-password'
                                    onClick={toggleConfirmPasswordVisibility}
                                    style={{ cursor: "pointer" }}
                                />
                            </div>

                            <div className='otp-modal-button-container'>
                                <button
                                    className="otp-modal-button"
                                    onClick={handleChangePassword}
                                    disabled={isSubmitting || !newPassword || !confirmPassword || passwordError || passwordMatchError}
                                >
                                    {isSubmitting ? 'Changing Password...' : 'Change Password'}
                                </button>

                                <button className="otp-modal-button" onClick={handleClose}>Close</button>
                            </div>
                        </div>
                    ) : (
                        <div className="otp-modal-container">
                            {otpSent && (
                                <input
                                    className="otp-modal-input"
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter OTP"
                                    disabled={isSubmitting}
                                />
                            )}

                            <div className="otp-modal-button-container">
                                {!otpSent ? (
                                    <button className="otp-modal-button" onClick={handleSendOtp} disabled={isSubmitting}>
                                        {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
                                    </button>
                                ) : (
                                    <button className="otp-modal-button" onClick={handleVerifyOtp} disabled={isSubmitting}>
                                        {isSubmitting ? 'Verifying OTP...' : 'Verify OTP'}
                                    </button>
                                )}

                                <button className="otp-modal-button" onClick={handleClose}>Close</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    );
};

export default OTPModal;