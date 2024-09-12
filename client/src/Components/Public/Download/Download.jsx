import React from 'react';
import download from '../../Assets/download.png';
import './Download.css';

//Apk isn't being picked up by this we need to fix it

const Download = () => {
    // Use a relative path since the APK is now in the public folder
    const fileURL = '/traccs-mobile.apk';

    const handleDownload = () => {
        const a = document.createElement('a');
        a.href = fileURL;
        a.download = 'traccs-mobile.apk';  // Set the default file name
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="download-container">
            <div className='download-content'>
                <div className='download-box'>
                    <div className='download-section'>
                        <div className='download-info-box'>
                            <p className="download-info">
                                Stay one step ahead in emergencies with <span className="highlight">TRACCS!</span> Download the app today and
                                ensure you and your community in Taytay, Rizal, are always prepared, connected, and ready to respond when it matters most.
                            </p>

                            <button className='download-btn' onClick={handleDownload}>
                                DOWNLOAD TRACCS NOW!
                            </button>
                        </div>
                    </div>

                    <div className='download-section'>
                        <img src={download} className="download-img" alt="Download Icon" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Download;
