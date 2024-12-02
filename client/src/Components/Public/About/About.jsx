import React, { useState, useEffect } from 'react';
import './About.css';

import image1 from '../../Assets/about-us/aboutus-image.png';
import image2 from '../../Assets/about-us/aboutus-image-2.png';
import image3 from '../../Assets/bg-carousel/image2.jpg';

const About = () => {
    const [currentSection, setCurrentSection] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);

    const sections = [
        {
            "heading": "Mission",
            "image": image1,
            "text": [
                "Ensure the efficient delivery of basic public services to citizens with a smile and enthusiasm.",
                "Stimulate the local economy and support local industries that provide livelihood to the people, without compromising the environment.",
                "Protect the environment and strengthen the community's readiness for any disaster.",
                "Support and empower vulnerable sectors of society and make our streets safer.",
                "Strengthen each sector of society so that they can partner with the government in shaping policies and programs that address their needs.",
                "Raise public awareness on culture and identity, leading to a deeper love for the community and nation."
            ]
        },
        {
            heading: 'History',
            "image": image2,
            text: [
                'The Municipality of Taytay is a first class, densely populated municipality in the province of Rizal, Philippines. The National Competitiveness Council has named Taytay as the "1st Most Competitive Municipality (1st & 2nd Class)", for year 2018, after Cainta. Conurbated with Metro Manila, it is bounded by Cainta on the north, Pasig City and Taguig City on the west, Antipolo City in the East and Angono on the South. It is the "Woodworks and Garments Capital of the Philippines". While economically, demographically and politically qualified, plans to convert it into a city was set aside, pending social and administrative reforms in the municipality.',
                'The National Competitiveness Council has named Taytay as the 2nd Most Competitive Municipality (1st & 2nd Class) in 2016 from being 10th place in 2014 and being 3rd place in 2015.',
                'Taytay is one the municipalities in the Philippines that has high financial capability with Php 622 million making it the 3rd Richest Municipality in the Philippines in 2015. The municipality population as of 2015 is 319,104 and is the 3rd Most Populous Municipality in the Philippines.',
                'Taytay can be reached from Metro Manila by C-6 Road passing from Parañaque, Muntinlupa and Taguig on the south, Ortigas Avenue from Pasig City on the east, and M.L. Quezon Avenue from Angono on the west.'
            ]
        },
        {
            heading: 'Etymology',
            "image": image3,
            text: [
                'The word TAYTAY has many origins. It is believed that the name came from words like tayutay, hintay-hintay, and itay-itay which arose when the village or barangay was doing trade with Chinese traders as did other lake towns around Laguna de Bay. Chinese sailing vessels would dock at Manila Bay to conduct trade with the thriving barangays of Maynilad and Tondo and go up the Pasig River to do more barter trade with lakeshore towns looping Laguna de Bay.'
            ]
        },
        {
            heading: 'Origin',
            text: [
                'The Municipality of Taytay, known as the "Woodworks and Garments Capital of the Philippines," has a rich history dating back to pre-Hispanic times as part of the Kingdom of Namayan, a confederation of barangays that thrived in the 12th century. During the Spanish era, Taytay became an encomienda under the jurisdiction of the Province of Tondo and later the Franciscans in La Laguna. Over time, Taytay, along with neighboring towns, was incorporated into various political subdivisions, including the Distrito Politico-Militar de Morong in 1853, and later transitioned under the Province of Manila in 1860 following a reorganization by Spanish authorities.',
                'The creation of the Province of Rizal on June 11, 1901, marked a significant chapter in Taytay\'s history. Formed under Act No. 137 by the Philippine Commission, Rizal included 26 municipalities, merging towns from the Province of Manila and the Distrito Politico-Militar de Morong. With Pasig as its initial provincial seat, Rizal underwent changes during the 20th century, including the transfer of several towns to Metro Manila in 1975 by Presidential Decree No. 824. Today, Taytay remains a vital part of Rizal Province, contributing to its economic and cultural landscape'
            ]
        }
    ];

    const handlePrev = () => {
        setCurrentSection(currentSection === 0 ? sections.length - 1 : currentSection - 1);
    };

    const handleNext = () => {
        setCurrentSection((currentSection + 1) % sections.length);
    };

    // Handle dragging
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.clientX);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const diff = startX - e.clientX;
        if (diff > 50) {
            handleNext();
            setIsDragging(false);
        } else if (diff < -50) {
            handlePrev();
            setIsDragging(false);
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    return (
        <div className="about-container" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
            <div className="about-title-bg">

                <div className="about-content">

                    <a className="about-title">ABOUT OUR MUNICIPALITY</a>

                    {/* Display the current section with sliding effect */}
                    <div className="about-section">

                        <b className="about-heading">{sections[currentSection].heading}</b>

                        <div className='about-section-container'>

                            <div className='about-text-container'>
                                {sections[currentSection].text.map((paragraph, index) => (
                                    <p key={index} className="about-text">{paragraph}</p>
                                ))}
                            </div>

                        </div>

                    </div>

                    {/* Left and Right Arrow Buttons */}
                    <button className="arrow-button left-arrow" onClick={handlePrev}>
                        ‹
                    </button>
                    <button className="arrow-button right-arrow" onClick={handleNext}>
                        ›
                    </button>

                    {/* Slide Indicators */}
                    <div className="slide-indicators">
                        {sections.map((_, index) => (
                            <span
                                key={index}
                                className={`indicator ${currentSection === index ? 'active' : ''}`}
                                onClick={() => setCurrentSection(index)}
                            ></span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
