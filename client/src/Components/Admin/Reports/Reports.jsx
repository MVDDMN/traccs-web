import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import './Reports.css';

const Reports = () => {

    return (
        <div className="reports-container">

            <div className='reports-content'>

                <div className='reports-navigation-container'>
                    <div className='reports-navigation-content'>

                        <Link to="live"><label className='reports-button' title="View live reports that are sent to the system on the table">Live Reports</label></Link>
                        <Link to="archive"><label className='reports-button' title="View historical reports that are saved on the system as table">History</label></Link>
                        <Link to="historymap"><label className='reports-button' title="View historical reports saved on the map with their respective locations and details">History Map</label></Link>


                    </div>
                </div>

                <div className='reports-module-contents'>
                    <Outlet />
                </div>

            </div>

        </div>
    );

};

export default Reports;