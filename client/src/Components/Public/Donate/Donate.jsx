import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Donate.css';

const Donate = () => {
    return (
        <div className="donate-container">
            <div className='donate-title-bg'>
                <div className='donate-content'>
                    <div className='donate-content-container'>
                        <div className='donate-content-box'>
                            <a className='donation-title'>Want to make a Donation?
                            </a>
                            <a className='donation-description'>
                                Join TRACCS and make a difference in our community by contributing
                                to our emergency response network. Your support can save lives!
                            </a>
                            <a className='donation-description'>
                                Visit our Facebook social media page or download the TRACCS mobile application if you are
                                a Taytay resident to gain access to its many features.
                            </a>
                            <div className='donate-button-container'>
                                <a href='https://www.facebook.com/TaytayCommandCenterMdrrmo' className='donate-download-btn'>Facebook</a>
                                <Link to="/download" className='donate-download-btn'>Download TRACCS</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Donate;
