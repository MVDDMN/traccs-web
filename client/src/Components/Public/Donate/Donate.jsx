import React, { useState } from 'react';
import './Donate.css';

const Donate = () => {
    const [showModal, setShowModal] = useState(false);
    const [inputs, setInputs] = useState({
        name: '',
        email: '',
        phoneNumber: ''
    });
    const [errorMessage, setErrorMessage] = useState('');

    const handleDonateClick = () => {
        // Validate input fields before showing modal
        const validationError = validateInputs();
        if (validationError) {
            setErrorMessage(validationError);
        } else {
            setShowModal(true);
            // Clear input fields
            setInputs({
                name: '',
                email: '',
                phoneNumber: ''
            });
            setErrorMessage('');
        }
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInputs(prevInputs => ({
            ...prevInputs,
            [name]: value
        }));
    };

    // Function to validate inputs using regex
    const validateInputs = () => {
        const nameRegex = /^[a-zA-Z\s]*$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d{10}$/;

        if (!nameRegex.test(inputs.name)) {
            return 'Error: Invalid name. Please enter only alphabets and spaces.';
        } else if (!emailRegex.test(inputs.email)) {
            return 'Error: Invalid email address. Please enter a valid email.';
        } else if (!phoneRegex.test(inputs.phoneNumber)) {
            return 'Error: Invalid phone number. Please enter a 10-digit phone number.';
        }

        return '';
    };

    return (
        <div className="donate-container">
            <div className='donate-title-bg'>
                <div className='donate-content'>
                    <div className='donate-content-container'>
                        <div className='donate-content-box'>
                            <a className='donation-title'>Make a Donation!</a>
                            <a className='donation-description'>
                                Join TRACCS and make a difference in our community by contributing
                                to our emergency response network. Your support can save lives!
                            </a>
                            <div className='donation-textfield-box'>
                                <input
                                    className='donation-text'
                                    placeholder='Your Name'
                                    name="name"
                                    value={inputs.name}
                                    onChange={handleInputChange}
                                />
                                <input
                                    className='donation-text'
                                    placeholder='Your Email'
                                    name="email"
                                    value={inputs.email}
                                    onChange={handleInputChange}
                                />
                                <input
                                    className='donation-text'
                                    placeholder='Your Phone Number'
                                    name="phoneNumber"
                                    value={inputs.phoneNumber}
                                    onChange={handleInputChange}
                                />
                                <button className='donate-button-box' onClick={handleDonateClick}>Donate</button>
                            </div>
                            
                            {errorMessage && <p className="donation-error-message">{errorMessage}</p>}

                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <div className='modal-content-box'>
                            <h2 className='modal-title'>Thank You!</h2>
                            <p className='modal-description'>
                                Thank you for your generous donation! Your contribution
                                will make a difference in our community. An admin will contact
                                you shortly to discuss further proceedings. We appreciate your support!
                            </p>
                            <button onClick={closeModal} className='ok-button-box'>OK</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Donate;
