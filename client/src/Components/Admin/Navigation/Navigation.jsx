import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navigation.css';

const Navigation = ({ userType }) => {
  return (
    <div className="navigation-cont">
      <div className='admin-nav-cont'>
        <div className="nav-list">
          <div className='app-title-box'>
            <div className='app-title-cont'>
              <a className='app-title-text'>TRACCS</a>
              <a className='app-sub-text'>Web Systems</a>
            </div>
          </div>

          <div className='navigation-title-box'>
            <a className='navigation-title-text'>Home</a>
          </div>

          <div className='module'>
            <NavLink to="/admin" end className={({ isActive }) => isActive ? "active-link" : ""}>Dashboard</NavLink>
            <NavLink to="/admin/reports" className={({ isActive }) => isActive ? "active-link" : ""}>Reports</NavLink>
            <NavLink to="/admin/request" className={({ isActive }) => isActive ? "active-link" : ""}>Requests</NavLink>
          </div>

          <div className='navigation-title-box'>
            <a className='navigation-title-text'>Management</a>
          </div>

          <div className='module'>
            <NavLink to="/admin/resource" className={({ isActive }) => isActive ? "active-link" : ""}>Resources</NavLink>
            {userType !== 'Barangay' && (
              <>
                <NavLink to="/admin/accounts" className={({ isActive }) => isActive ? "active-link" : ""}>Accounts</NavLink>
                <NavLink to="/admin/analytics" className={({ isActive }) => isActive ? "active-link" : ""}>Analytics</NavLink>
                <NavLink to="/admin/logs" className={({ isActive }) => isActive ? "active-link" : ""}>Logs</NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navigation;
