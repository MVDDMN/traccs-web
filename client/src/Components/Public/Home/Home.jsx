import React, { useState, useEffect } from 'react';
import './Home.css';
import image1 from '../../Assets/bg-carousel/image1.jpg';
import image2 from '../../Assets/bg-carousel/image2.jpg';
import image3 from '../../Assets/bg-carousel/image3.jpg';


const Home = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);

    // Array of image paths and slide content
    const slides = [
        {
            image: image1,
            title: 'Taytay, Rizal',
            description: 'Garments Capital of the Philippines'
        },
        {
            image: image2,
            title: 'Discover Taytay!',
            description: 'Discover the charm of Taytay, Rizal, where modernity meets tradition. Explore our services and immerse yourself in the vastness of Taytay Tiangge.'
        },
        {
            image: image3,
            title: 'Etymology',
            description: 'The word TAYTAY has many origins...'
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
