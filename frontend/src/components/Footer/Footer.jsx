import './Footer.css';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-brand">
                <Link to="/" className="footer-logo">
                    CINEMA<span className="footer-logo-accent">VERSE</span>
                </Link>
                <p className="footer-tagline">Your window to the world of cinema.</p>
            </div>

            <div className="social-icons">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
            </div>


            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} CinemaVerse. All rights reserved.</p>
                <p className="disclaimer">This site does not store any files on its server. All contents are provided by non-affiliated third parties.</p>
                <p className="api-credit">
                    APIs provided by&nbsp;
                    <a href="https://yts.lt/api" target="_blank" rel="noopener noreferrer">YTS</a>
                    ,{" "}
                    <a href="https://imdbapi.dev/" target="_blank" rel="noopener noreferrer">IMDbAPI.dev</a>
                    {" "}and{" "}
                    <a href="https://vidsrcme.ru/" target="_blank" rel="noopener noreferrer">VidSrc</a>
                </p>
            </div>
        </footer>
    );
};

export default Footer;
