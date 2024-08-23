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
                        <a className="download-info">
                            Stay one step ahead in emergencies with <span className="highlight">TRACCS!</span> Download the app today and
                            ensure you and your community in Taytay, Rizal,
                            are always prepared, connected, and ready to respond when it matters most.
                        </a>

                        <Link to="/error" className='download-btn'>DOWNLOAD TRACCS NOW!</Link>
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