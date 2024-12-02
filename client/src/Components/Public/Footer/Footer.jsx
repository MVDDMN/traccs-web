import React from 'react';
import './Footer.css';
import logo1 from '../../Assets/logo1.png';
import logo2 from '../../Assets/logo2.png';
import logo3 from '../../Assets/logo3.png';

const Footer = () => {
  return (
    <div className="public-footer">

      <div className="public-footer-cont">

        <div className='public-footer-logos'>
            <img src={logo1} alt="Logo1"/>
            <img src={logo2} alt="Logo2"/>
            <img src={logo3} alt="Logo3"/>
        </div>

        <div className='public-footer-copyright'>
            <a>Copyright © 2024. Taytay Rizal MDRRMO All rights reserved.</a>
        </div>
      </div>

    </div>
  );
}

export default Footer;
