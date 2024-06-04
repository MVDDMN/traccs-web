import React from 'react';
import { Link } from 'react-router-dom';
import './Error.css';
import backicon from '../../Assets/back.png';
import errorimg from '../../Assets/error.png';

const Error = () => {

    return (
        <div className="error-container">

            <div className='error-title-bg'>

                <div className='error-content'>

                    <div className='error-message'>

                        <div className='error-msg-text'>
                            <a>404</a>
                            <b>Page not Found!</b>
                            <c>This page doesn't exist or was removed!</c>
                            <c>We suggest you go back to Home!</c>
                        </div>

                        <div className='error-btn-box'>
                            <div className='error-btn-cont'>
                                <img src={backicon} alt="back-icon"/>
                                <Link to="/" className='error-home-btn'>BACK TO HOME</Link>
                            </div>

                            <Link to="/contact" className='error-btn-cont2'>CONTACT US</Link>
                        </div>

                    </div>

                </div>

                <div className='error-image-box'>
                    <div className='error-img-cont'>
                        <img src={errorimg} alt="error-img"/>
                    </div>
                </div>
            </div>
            
        </div>
    );

};

export default Error;