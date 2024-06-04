import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import './Reports.css';

const Reports = () => {

    return (
        <div className="reports-container">

            <div className='reports-content'>

                <div className='reports-navigation-container'>
                    <div className='reports-navigation-content'>

                        <Link to="archive"><a className='reports-button'>Archive</a></Link>
                        <Link to="historymap"><a className='reports-button'>History Map</a></Link>

                    </div>
                </div>

                <div className='reports-module-contents'>
                    <Outlet/>
                </div>

            </div>

        </div>
    );

};

export default Reports;