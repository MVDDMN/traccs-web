import React, { useState, useEffect } from 'react';
import './About.css';

const About = () => {
    const [currentSection, setCurrentSection] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);

    const sections = [
        {
            heading: 'Vision',
            text: [
                '"Bayang Nakangiti at Pinagpala, Ligtas, Handa, at Payapa."'
            ]
        },
        {
            heading: 'Mission',
            text: [
                'Iparamdam sa mga mamamayan ang maayos na pagbibigay ng mga batayang serbisyo publiko, nang may ngiti at sigasig;',
                'Pasiglahin ang lokal na ekonomiya at bigyang suporta ang mga lokal na industriya na nagbibigay kabuhayan sa mga mamamayan nang hindi isinasaalang-alang ang kalikasan;',
                'Pangalagaan ang kalikasan at palakasin ang kahandaan ng komunidad sa anumang sakuna.',
                'Alalayan at bigyan kalakasan ang mga bulnerableng sektor sa ating bayan at gawing ligtas ang ating mga lansangan.',
                'Palakasin ang bawat sektor ng lipunan upang sila mismo ang makatuwang ng ating pamahalaan sa paghubog ng mga polisiya at mga programang angkop sa kanilang mga pangangailangan;',
                'Buksan ang kamalayan ng mga mamamayan sa kultura at pagkakakilanlan, tungo sa mas maalab na pagmamahal sa bayan.'
            ]
        },
        {
            heading: 'History',
            text: [
                'The Municipality of Taytay is a first class, densely populated municipality in the province of Rizal, Philippines. It is the "Woodworks and Garments Capital of the Philippines".',
                'The National Competitiveness Council named Taytay as the "1st Most Competitive Municipality" in 2018. It was previously ranked as the 2nd Most Competitive Municipality in 2016 and the 3rd Richest Municipality in 2015.',
                'Taytay can be reached from Metro Manila by C-6 Road and Ortigas Avenue, connecting it to neighboring cities like Pasig, Taguig, and Muntinlupa.'
            ]
        },
        {
            heading: 'Location',
            text: [
                'Taytay is 12 kilometres (7.5 mi) away from Pasig City, the former provincial seat of government of Rizal. It is accessible from various points in Metro Manila through multiple major roads.'
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
                        {sections[currentSection].text.map((paragraph, index) => (
                            <p key={index} className="about-text">{paragraph}</p>
                        ))}
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
