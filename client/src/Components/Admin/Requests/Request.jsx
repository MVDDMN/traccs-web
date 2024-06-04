import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import './Request.css';

const Request = () => {

    return (
        <div className="request-container">

            <div className='request-content'>

                <div className='request-navigation-container'>

                    <div className='request-navigation-content'>

                        <Link to="barangay"><a className='request-button'>Barangay</a></Link>
                        <Link to="community"><a className='request-button'>Community</a></Link>
                        <Link to="personal"><a className='request-button'>Personal</a></Link>
                        <Link to="requestarchives"><a className='request-button'>Archive</a></Link>

                    </div>

                </div>

                <div className='request-module-contents'>

                    <Outlet />
                    
                </div>

            </div>

        </div>
    );

};

export default Request;