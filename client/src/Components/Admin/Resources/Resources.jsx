import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import './Resources.css';

const Resources = () => {

    return (
        <div className="resource-container">

            <div className='resource-content'>

                <div className='resource-navigation-container'>

                    <div className='resource-navigation-content'>

                        <Link to="resourcetable"><label className='resource-button' title="View My Resources Table">My Resources</label></Link>
                        <Link to="resourcedonate"><label className='resource-button' title="View Donations Table">Donations</label></Link>
                        <Link to="resourcearchive"><label className='resource-button' title="View Revoked Donations Table">Revoked Donations</label></Link>

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