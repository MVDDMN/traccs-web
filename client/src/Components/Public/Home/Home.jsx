import React, { useState, useEffect } from 'react';
import './Home.css';
import image1 from '../../Assets/bg-carousel/image1.jpg';
import image2 from '../../Assets/bg-carousel/image2.jpg';
import image3 from '../../Assets/bg-carousel/image3.jpg';

const Home = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

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
            title: 'Vision',
            description: 'Taytay: Bayang Nakangiti at Pinagpala, Ligtas, Handa, at Payapa.'
        }
    ];

    const handlePrevSlide = () => {
        setCurrentSlide((prevSlide) => (prevSlide - 1 + slides.length) % slides.length);
    };

    const handleNextSlide = () => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    };

    // Load Facebook SDK dynamically
    useEffect(() => {
        // Dynamically load the Facebook SDK script
        const script = document.createElement('script');
        script.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v16.0';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        // When the script is loaded, initialize the Facebook SDK
        script.onload = () => {
            window.FB.XFBML.parse(); // Ensure that Facebook plugins are initialized
        };

        // Cleanup the script after the component unmounts
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <div className="home-container">
            <div className="carousel">
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

                <div className="carousel-arrow left" onClick={handlePrevSlide}>
                    &lt;
                </div>
                <div className="carousel-arrow right" onClick={handleNextSlide}>
                    &gt;
                </div>
            </div>

            <div className="home-title-bg">
                <div className="home-content">
                    <a className="home-tagline">"Taytay: Bayang Nakangiti at Pinagpala, Ligtas, Handa, at Payapa."</a>
                </div>
            </div>
        </div >
    );
};

export default Home;