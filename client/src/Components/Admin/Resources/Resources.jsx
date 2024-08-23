import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import './Resources.css';

const Resources = () => {

    return (
        <div className="resource-container">

            <div className='resource-content'>

                <div className='resource-navigation-container'>

                    <div className='resource-navigation-content'>

                        <Link to="resourcetable"><a className='resource-button'>My Resources</a></Link>
                        <Link to="resourcedonate"><a className='resource-button'>Donations</a></Link>

                    </div>

                </div>

                <div className='resource-module-contents'>

                    <Outlet />
                    
                </div>

            </div>

        </div>
    );

};

export default Resources;