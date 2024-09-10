import React from 'react';
import { Link } from 'react-router-dom';
import download from '../../Assets/download.png';
import './Download.css';

const Download = () => {

    return (
        <div className="download-container">

            <div className='download-content'>

                <div className='download-box'>

                    <div className='download-section'>

                        <div className='download-info-box'>
                            <a className="download-info">
                                Stay one step ahead in emergencies with <span className="highlight">TRACCS!</span> Download the app today and
                                ensure you and your community in Taytay, Rizal,
                                are always prepared, connected, and ready to respond when it matters most.
                            </a>

                            <a 
                                href="https://nationalueduph-my.sharepoint.com/:u:/g/personal/delacruzkp_students_national-u_edu_ph/EUofShllJmRGoJIp_P6lTu4BTNdJsUbWd5RMzBzj8HXMzw?e=ETzYI9" 
                                className='download-btn' 
                                target="_blank" 
                                rel="noopener noreferrer"
                            >
                                DOWNLOAD TRACCS NOW!
                            </a>

                        </div>

                    </div>

                    <div className='download-section'>
                        <img src={download} className="download-img" />
                    </div>


                </div>

            </div>

        </div>
    );

};

export default Download;