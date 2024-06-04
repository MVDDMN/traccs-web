import React from 'react';
import Navigation from './Navigation/Navigation';
import Footer from './Footer/Footer';
import '../Assets/global-styles.css';
import './Public.css';

function Public({ routes }) {
  return (
    <div className="public-app-cont">
      <Navigation />
      <div className="public-module-cont">
        {routes}
      </div>
      <Footer />
    </div>
  );
}

export default Public;
