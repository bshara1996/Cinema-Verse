import React from 'react';
import './Loader.css';

const Loader = ({ message = "Loading..." }) => {
    return (
        <div className="loader-container">
            <div className="spinner"></div>
            {message && <span className="loader-message">{message}</span>}
        </div>
    );
};

export default Loader;
