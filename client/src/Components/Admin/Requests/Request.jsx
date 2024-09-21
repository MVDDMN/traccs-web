import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import './Request.css';

const Request = () => {

    return (
        <div className="request-container">

            <div className='request-content'>

                <div className='request-navigation-container'>

                    <div className='request-navigation-content'>

                        <Link to="barangay" className='request-button'>Barangay</Link>
                        <Link to="personal" className='request-button'>My Requests</Link>
                        <Link to="requestarchives" className='request-button'>History</Link>

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