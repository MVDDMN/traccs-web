import React from 'react';
import './Contact.css';
import phoneicon from '../../Assets/phone.png';
import locationicon from '../../Assets/location.png';
import facebookicon from '../../Assets/facebook2.png';
import emailicon from '../../Assets/email2.png';

const Contact = () => {
    return (
        <div className="contact-container">
            <div className='contact-title-bg'>

                <div className='contact-content'>

                    <div className='contact-details'>
                        <div className='contact-title-text'>
                            <a>Contact Us</a>
                        </div>

                        <div className='contact-title-items'>
                            <div className='contact-item'>
                                <img src={locationicon} alt="location-icon" />
                                <a>Don Hilario Avenue, Club Manila East Compound, Taytay, Philippines</a>
                            </div>

                            <div className='contact-item'>
                                <img src={phoneicon} alt="contact-icon" />
                                <a>(+63) 0985 488 3352</a>
                            </div>

                            <div className='contact-item'>
                                <img src={emailicon} alt="email-icon" />
                                <a>smiletaytaycommandcenter@gmail.com</a>
                            </div>

                            <div className='contact-item'>
                                <img src={facebookicon} alt="facebook-icon" />
                                <a>Taytay Command Center - MDRRMO</a>
                            </div>
                        </div>
                    </div>

                    <div className='contact-map'>
                        <iframe title="embedded-google-map"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.8169108238712!2d121.13060759999999!3d14.552460299999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c70154ec8c45%3A0x424bb684e94f1b19!2sTaytay%20Municipal%20Hall!5e0!3m2!1sen!2sph!4v1716733028523!5m2!1sen!2sph"
                            width="100%"
                            height="400px"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade">
                        </iframe>
                    </div>
                </div>

                <div className='contact-other-content'>

                    <div className='conctact-other-container'>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Contact;
