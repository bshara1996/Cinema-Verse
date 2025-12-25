import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaFilm } from 'react-icons/fa';
import './MovieCard.css';

const MovieCard = ({ movie }) => {
    const [imgError, setImgError] = useState(false);

    const getLanguageName = (code) => {
        try {
            if (!code) return 'UNKNOWN';
            const regionNames = new Intl.DisplayNames(['en'], { type: 'language' });
            return regionNames.of(code);
        } catch (error) {
            return code ? code.toUpperCase() : '';
        }
    };

    return (
        <div className="movie-card">
            <Link to={`/movie/${movie.id}`}>
                <div className="movie-poster">
                    {!movie.medium_cover_image || imgError ? (
                        <div className="no-image-placeholder">
                            <FaFilm className="no-image-icon" />
                            <span>No Image Available</span>
                        </div>
                    ) : (
                        <img
                            src={movie.medium_cover_image}
                            alt={movie.title}
                            loading="lazy"
                            onError={() => setImgError(true)}
                        />
                    )}
                    <div className="movie-overlay">
                        <div className="overlay-content">
                            <FaStar className="star-icon" />
                            <span className="rating-text">{movie.rating}</span>
                            <div className="genres">
                                {movie.genres && movie.genres.slice(0, 2).map((g) => (
                                    <span key={g}>{g}</span>
                                ))}
                            </div>

                            <span className="language-badge">{getLanguageName(movie.language)}</span>
                        </div>
                    </div>
                </div>
                <div className="movie-info">
                    <h3 className="movie-title">{movie.title}</h3>
                    <span className="movie-year">{movie.year}</span>
                </div>
            </Link >
        </div >
    );
};

export default MovieCard;
