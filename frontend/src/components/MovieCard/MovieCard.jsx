import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaStar, FaFilm } from "react-icons/fa";
import "./MovieCard.css";

const qualityPriority = ["4K", "1080p.x265", "1080p", "720p", "480p"];

const getHighestQuality = (torrents) => {
  if (!Array.isArray(torrents) || torrents.length === 0) return null;
  const rank = (q) => {
    const idx = qualityPriority.indexOf(q);
    return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
  };
  const found = torrents
    .map((t) => t?.quality)
    .filter(Boolean)
    .sort((a, b) => rank(a) - rank(b));
  return found.length ? found[0] : null;
};

const MovieCard = ({ movie }) => {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Handle hover timer for trailer
  useEffect(() => {
    let timer;
    if (isHovered && movie.yt_trailer_code) {
      timer = setTimeout(() => {
        setIsPlaying(true);
      }, 1500); // 1.5s delay loading
    } else {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isHovered, movie.yt_trailer_code]);

  const languageLabel = useMemo(() => {
    try {
      if (!movie.language) return "UNKNOWN";
      const regionNames = new Intl.DisplayNames(["en"], { type: "language" });
      return regionNames.of(movie.language);
    } catch (error) {
      return movie.language ? movie.language.toUpperCase() : "";
    }
  }, [movie.language]);

  const qualityLabel = useMemo(() => {
    const raw = getHighestQuality(movie.torrents) || movie.quality || null;
    if (raw === "2160p") return "4K";
    return raw;
  }, [movie.torrents, movie.quality]);

  const ratingValue = useMemo(() => {
    const numeric =
      typeof movie.rating === "number"
        ? movie.rating
        : Number.isFinite(Number(movie.rating))
        ? Number(movie.rating)
        : null;
    return numeric && numeric > 0 ? numeric.toFixed(1) : "N/A";
  }, [movie.rating]);

  return (
    <div 
      className="movie-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPlaying(false);
      }}
    >
      <Link to={`/movie/${movie.id}`} state={{ movie }}>
        <div className="movie-poster">
          {isPlaying && movie.yt_trailer_code ? (
            <div className="trailer-preview">
              <iframe
                src={`https://www.youtube.com/embed/${movie.yt_trailer_code}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0&loop=1&playlist=${movie.yt_trailer_code}`}
                title={`${movie.title} Trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  zIndex: 20 // Ensure controls are clickable
                }}
              />
            </div>
          ) : (
             <>
                <div className="poster-badges">
                  <div className="left-badges">
                    <div className="quality-rating">
                      {qualityLabel && (
                        <span className="quality-pill" data-quality={qualityLabel}>
                          {qualityLabel}
                        </span>
                      )}
                      <div className="rating-pill">
                        <FaStar className="rating-pill-star" />
                        <span className="rating-pill-score">{ratingValue}</span>
                      </div>
                    </div>
                  </div>
                  <div className="right-badges">
                    {languageLabel && (
                      <span className="language-pill">{languageLabel}</span>
                    )}
                  </div>
                </div>
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
             </>
          )}
          
          {/* Loading Bar */}
          {isHovered && !isPlaying && movie.yt_trailer_code && (
            <div className="loading-bar-container">
              <div className="loading-bar"></div>
            </div>
          )}
        </div>
        <div className="movie-info">
          <h3 className="movie-title">{movie.title}</h3>
          <div className="meta-row">
            <span className="movie-year">{movie.year}</span>
            <div className="meta-genres">
              {movie.genres &&
                movie.genres.slice(0, 2).map((g) => <span key={g}>{g}</span>)}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default MovieCard;
