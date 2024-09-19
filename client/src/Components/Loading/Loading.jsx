import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Loading.css"; // Assuming you have a CSS file for styling

// Determine the base URL based on the environment
const apiBaseUrl =
    import.meta.env.MODE === "production"
        ? import.meta.env.VITE_PROD_API_BASE_URL
        : import.meta.env.VITE_API_BASE_URL;

const Loading = () => {
    const [error, setError] = useState(""); // Error state
    const [showError, setShowError] = useState(false); // Track error visibility
    const navigate = useNavigate();

    useEffect(() => {
        const checkRootAdmin = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/api/check-admin-root`);

                if (response.data.exists) {
                    navigate("/login");
                } else {
                    navigate("/setup");
                }
            } catch (error) {
                setError("Error 503 Service Currently Unavaiable");
                setShowError(true);
            }
        };

        checkRootAdmin();
    }, [navigate]);

    // Automatically hide the error message and go back to "Loading..." after 5 seconds
    useEffect(() => {
        if (showError) {
            const timer = setTimeout(() => {
                setShowError(false); // Hide error after 5 seconds
            }, 5000);
            return () => clearTimeout(timer); // Clean up timer
        }
    }, [showError]);

    return (
        <div className="loading-container">
            <div className="loading-message">
                {/* Display error message if there's an error, otherwise display loading message */}
                {showError ? <p>{error}</p> : <p>Loading, please wait...</p>}
            </div>
        </div>
    );
};

export default Loading;
