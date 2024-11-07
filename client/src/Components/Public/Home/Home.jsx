import React, { useState, useEffect } from 'react';
import './Home.css';

const Home = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);

    // Array of image paths and slide content
    const slides = [
        {
            image: '/src/Components/Assets/bg-carousel/image1.jpg',
            title: 'Taytay, Rizal',
            description: 'Garments Capital of the Philippines'
        },
        {
            image: '/src/Components/Assets/bg-carousel/image2.jpg',
            title: 'Discover Taytay!',
            description: 'Discover the charm of Taytay, Rizal, where modernity meets tradition. Explore our services and immerse yourself in the vastness of Taytay Tiangge.'
        },
        {
            image: '/src/Components/Assets/bg-carousel/image3.jpg',
            title: 'Etymology',
            description: 'The word TAYTAY has many origins. It is believed that the name came from words like tayutay, hintay-hintay, and itay-itay which arose when the village or barangay was doing trade with Chinese traders as did other lake towns around Laguna de Bay. Chinese sailing vessels would dock at Manila Bay to conduct trade with the thriving barangays of Maynilad and Tondo and go up the Pasig River to do more barter trade with lakeshore towns looping Laguna de Bay.The word TAYTAY has many origins. It is believed that the name came from words like tayutay, hintay-hintay, and itay-itay which arose when the village or barangay was doing trade with Chinese traders as did other lake towns around Laguna de Bay. Chinese sailing vessels would dock at Manila Bay to conduct trade with the thriving barangays of Maynilad and Tondo and go up the Pasig River to do more barter trade with lakeshore towns looping Laguna de Bay.'
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
        }, 10000);
        return () => clearInterval(interval);
    }, [slides.length]);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.clientX);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const diff = startX - e.clientX;

        if (diff > 50) {
            setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
            setIsDragging(false);
        } else if (diff < -50) {
            setCurrentSlide((prevSlide) => (prevSlide - 1 + slides.length) % slides.length);
            setIsDragging(false);
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    return (
        <div className="home-container">
            <div
                className="carousel"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <div className="carousel-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                    {slides.map((slide, index) => (
                        <div key={index} className="carousel-slide">
                            <div className="carousel-blur" style={{ backgroundImage: `url(${slide.image})` }}></div>
                            <div className="carousel-overlay"></div>
                            <img src={slide.image} alt={`Slide ${index + 1}`} className="carousel-image" />
                            <div className="carousel-text">
                                <h2 className="carousel-title">{slide.title}</h2>
                                <p className="carousel-description">{slide.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="carousel-indicators">
                    {slides.map((_, index) => (
                        <span
                            key={index}
                            className={`indicator ${currentSlide === index ? 'active' : ''}`}
                            onClick={() => setCurrentSlide(index)}
                        ></span>
                    ))}
                </div>
            </div>

            <div className="home-title-bg">
                <div className="home-content">
                    <a className="home-tagline">"Taytay: Bayang Nakangiti at Pinagpala, Ligtas, Handa, at Payapa."</a>
                </div>
            </div>
        </div>
    );
};

export default Home;
