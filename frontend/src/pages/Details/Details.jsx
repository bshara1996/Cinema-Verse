import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import api from "../../services/api";
import MovieCard from "../../components/MovieCard/MovieCard";
import NotFound from "../NotFound/NotFound";
import {
  FaStar,
  FaDownload,
  FaGlobe,
  FaFilm,
  FaPlay,
  FaVideo,
  FaClosedCaptioning,
  FaUsers,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";
import Loader from "../../components/Loader/Loader";
import "./Details.css";

const Details = () => {
  const { id } = useParams();
  const location = useLocation();
  const stateMovie = location.state?.movie;
  const stateImdbCode = stateMovie?.imdb_code;
  const [movie, setMovie] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [subtitles, setSubtitles] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [videoMode, setVideoMode] = useState("movie"); // "trailer" or "movie"

  const getLanguageName = (code) => {
    try {
      if (!code) return "";
      const regionNames = new Intl.DisplayNames(["en"], { type: "language" });
      return regionNames.of(code);
    } catch (error) {
      return code ? code.toUpperCase() : "";
    }
  };

  const preloadImage = (url) => {
    return new Promise((resolve) => {
      if (!url) {
        resolve();
        return;
      }
      const img = new Image();
      img.src = url;
      img.onload = () => resolve();
      img.onerror = () => resolve(); // Resolve even on error to not block the page forever
    });
  };

  // Scroll to top immediately on mount/refresh
  useEffect(() => {
    // Disable browser's automatic scroll restoration first
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }

    // Use multiple methods to ensure scroll to absolute top
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      if (window.scrollY !== 0) {
        window.scroll(0, 0);
      }
    };

    // Execute immediately
    scrollToTop();

    // Also try after a short delay to catch any late renders
    const timeoutId = setTimeout(scrollToTop, 0);
    const rafId = requestAnimationFrame(() => {
      scrollToTop();
    });

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch Request 1 (Critical): Movie Base Data + Suggestions (Parallel)
        // If we have stateImdbCode, we also fetch IMDb details in parallel
        const promises = [
          api.getMovieDetails(id, {
            include_imdb: false,
            imdb_code: stateImdbCode,
          }),
          api.getSuggestions(id),
        ];

        let imdbPromiseIndex = -1;
        if (stateImdbCode) {
          imdbPromiseIndex =
            promises.push(api.getImdbDetails(stateImdbCode)) - 1;
        }

        const results = await Promise.all(promises);
        const detailsData = results[0];
        const suggestionsData = results[1];
        const imdbRes =
          imdbPromiseIndex !== -1 ? results[imdbPromiseIndex] : null;

        let currentMovieData = null;

        if (
          detailsData &&
          detailsData.data &&
          detailsData.data.movie &&
          detailsData.data.movie.id &&
          detailsData.data.movie.id !== 0 &&
          detailsData.data.movie.title
        ) {
          currentMovieData = detailsData.data.movie;

          // Merge IMDb data if we got it in parallel
          if (imdbRes && imdbRes.data) {
            currentMovieData = { ...currentMovieData, ...imdbRes.data };
          }

          setMovie(currentMovieData);

          // Update the browser tab title
          document.title = `${currentMovieData.title} (${currentMovieData.year}) - CinemaVerse`;
        } else {
          setError("Movie not found");
          setLoading(false);
          return;
        }

        if (
          suggestionsData &&
          suggestionsData.data &&
          suggestionsData.data.movies
        ) {
          setSuggestions(suggestionsData.data.movies);
        }

        // 2. Preload critical images
        const backdropUrl =
          currentMovieData.background_image_original ||
          currentMovieData.background_image;
        const posterUrl =
          currentMovieData.large_cover_image ||
          currentMovieData.medium_cover_image;

        await Promise.all([preloadImage(backdropUrl), preloadImage(posterUrl)]);

        // STOP LOADING HERE - Show the page!
        setLoading(false);

        // 3. Fetch Request 2 (Background): Extended Details (IMDB) + Subtitles
        if (currentMovieData.imdb_code) {
          api
            .getSubtitles(currentMovieData.imdb_code)
            .then((subsData) => {
              if (subsData && subsData.data) {
                setSubtitles(subsData.data);
              }
            })
            .catch((subErr) =>
              console.error("Failed to load subtitles:", subErr)
            );

          // Only fetch IMDb details if we didn't get them in the initial parallel request
          if (imdbPromiseIndex === -1) {
            api
              .getImdbDetails(currentMovieData.imdb_code)
              .then((imdbRes) => {
                if (imdbRes && imdbRes.data) {
                  setMovie((prev) => ({
                    ...prev,
                    ...imdbRes.data,
                  }));
                }
              })
              .catch((err) =>
                console.error("Failed to load extended details:", err)
              );
          }
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load movie details");
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup function to reset document title when component unmounts
    return () => {
      document.title = "CinemaVerse - Movie Streaming";
    };
  }, [id]);

  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  // Return an IMDb URL for a person object or name string.
  // Prefers explicit IMDb IDs/URLs on the object, falls back to an IMDb search by name.
  const getPersonImdbUrl = (person) => {
    if (!person) return null;
    // allow passing a plain name string
    const p = typeof person === "string" ? { name: person } : person;
    if (p.imdb_url) return p.imdb_url;
    if (p.imdb_id) return `https://www.imdb.com/name/${p.imdb_id}/`;
    if (p.url && p.url.includes("imdb.com")) return p.url;
    if (p.name)
      return `https://www.imdb.com/find?q=${encodeURIComponent(p.name)}`;
    return null;
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return "0m";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const formatVoteCount = (count) => {
    if (!count) return "";
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(count);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      // Get navbar height (adjust if your navbar height differs)
      const navbar =
        document.querySelector("nav") || document.querySelector("header");
      const navbarHeight = navbar ? navbar.getBoundingClientRect().height : 80;

      const elementTop = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementTop - navbarHeight - 20, // 20px extra padding
        behavior: "smooth",
      });
    }
  };

  const scrollToTrailer = () => {
    setVideoMode("trailer");
    scrollToSection("video-section");
  };

  const scrollToMovie = () => {
    setVideoMode("movie");
    scrollToSection("video-section");
  };

  const languages = [...new Set(subtitles.map((sub) => sub.language))].sort();

  useEffect(() => {
    if (languages.length > 0 && !selectedLanguage) {
      setSelectedLanguage(languages[0]);
    }
  }, [languages, selectedLanguage]);

  const filteredSubtitles = subtitles.filter(
    (sub) => sub.language === selectedLanguage
  );

  // Set initial video mode when movie loads
  useEffect(() => {
    if (movie) {
      if (movie.imdb_code) {
        setVideoMode("movie");
      } else if (movie.yt_trailer_code) {
        setVideoMode("trailer");
      }
    }
  }, [movie]);

  if (loading) {
    return <Loader message="Loading Movie Details..." />;
  }

  if (error || !movie) {
    return (
      <NotFound
        title="Oops!"
        text={
          error === "Movie not found"
            ? "We couldn't find that movie"
            : error || "Something went wrong"
        }
        subtext="The movie you're looking for doesn't exist or may have been removed."
        linkText="Return Home"
      />
    );
  }

  // Filter out invalid/empty movies from suggestions
  const validSuggestions =
    suggestions && Array.isArray(suggestions)
      ? suggestions.filter((movie) => movie && movie.id && movie.title)
      : [];

  return (
    <div className="details-page">
      {/* Hero Section with Backdrop */}
      <div className="hero-section">
        <div
          className="hero-backdrop"
          style={{
            backgroundImage: `url(${
              movie.background_image_original || movie.background_image
            })`,
          }}
        >
          <div className="hero-overlay"></div>
        </div>

        <div className="container hero-content">
          <div className="hero-poster-wrapper">
            <div className="poster-frame">
              {(!movie.large_cover_image && !movie.medium_cover_image) ||
              imgError ? (
                <div className="hero-poster-placeholder">
                  <FaFilm className="placeholder-icon" />
                  <span>No Poster</span>
                </div>
              ) : (
                <img
                  src={movie.large_cover_image || movie.medium_cover_image}
                  alt={movie.title}
                  className="hero-poster"
                  onError={() => setImgError(true)}
                />
              )}
            </div>
          </div>

          <div className="hero-info">
            <h1 className="hero-title">{movie.title}</h1>

            <div className="hero-meta">
              <div className="hero-info-bar">
                <div className="info-main">
                  <div className="info-item">
                    <FaCalendarAlt />
                    <span>{movie.year || "—"}</span>
                  </div>
                  <div className="info-item">
                    <FaClock />
                    <span>{formatRuntime(movie.runtime)}</span>
                  </div>
                  <div className="info-item">
                    <FaGlobe />
                    <span>{getLanguageName(movie.language) || "N/A"}</span>
                  </div>
                </div>
                {movie.imdb_code && (
                  <a
                    href={`https://www.imdb.com/title/${movie.imdb_code}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rating-chip info-rating-chip"
                  >
                    <FaStar className="rating-chip-star" />
                    <div className="rating-chip-text">
                      <span className="rating-value">
                        {typeof movie.rating === "number"
                          ? movie.rating.toFixed(1)
                          : movie.rating}
                      </span>
                      {movie.vote_count && (
                        <span className="vote-count">
                          {formatVoteCount(movie.vote_count)} Votes
                        </span>
                      )}
                    </div>
                    <span className="imdb-pill">IMDb</span>
                  </a>
                )}
              </div>
            </div>

            <div className="hero-actions">
              {(movie.imdb_code || movie.yt_trailer_code) && (
                <button className="btn btn-ghost" onClick={scrollToMovie}>
                  <FaPlay /> Watch Now
                </button>
              )}
              {movie.yt_trailer_code && (
                <button className="btn btn-ghost" onClick={scrollToTrailer}>
                  <FaVideo /> Trailer
                </button>
              )}
              <button
                className="btn btn-ghost"
                onClick={() => scrollToSection("torrent-section")}
              >
                <FaDownload /> Download
              </button>

              <button
                className="btn btn-ghost"
                onClick={() => scrollToSection("subtitle-section")}
              >
                <FaClosedCaptioning /> Subtitles
              </button>

              <button
                className="btn btn-ghost"
                onClick={() => scrollToSection("cast-section")}
              >
                <FaUsers /> Cast & Crew
              </button>
            </div>

            <div className="hero-excerpt">
              <div className="excerpt-header">
                <h3 className="hero-excerpt-title">Plot Summary</h3>
                <div className="genre-badges">
                  {movie.genres &&
                    movie.genres.map((g) => (
                      <Link
                        key={g}
                        to={`/?genre=${encodeURIComponent(g.toLowerCase())}`}
                        className="genre-pill"
                      >
                        {g}
                      </Link>
                    ))}
                </div>
              </div>
              <p>
                {movie.plot_summary ||
                  (movie.imdb_code
                    ? "No plot summary available for this movie."
                    : "No description available.")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container main-content">
        <div className="content-layout">
          {/* Main Content Column */}
          <div className="main-column">
            {(movie.imdb_code || movie.yt_trailer_code) && (
              <section
                id="video-section"
                className="detail-section video-section"
              >
                <div className="section-header">
                  <h3 className="section-title">Media</h3>
                  {movie.yt_trailer_code && movie.imdb_code && (
                    <div className="video-mode-toggle">
                      <button
                        className={`video-toggle-btn ${
                          videoMode === "movie" ? "active" : ""
                        }`}
                        onClick={() => setVideoMode("movie")}
                      >
                        <FaPlay /> Movie
                      </button>
                      <button
                        className={`video-toggle-btn ${
                          videoMode === "trailer" ? "active" : ""
                        }`}
                        onClick={() => setVideoMode("trailer")}
                      >
                        <FaVideo /> Trailer
                      </button>
                    </div>
                  )}
                </div>
                <div className="video-player-wrapper">
                  {videoMode === "trailer" && movie.yt_trailer_code ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${movie.yt_trailer_code}?rel=0&showinfo=0&autoplay=0`}
                      title={`${movie.title} Trailer`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : videoMode === "movie" && movie.imdb_code ? (
                    <iframe
                      src={`https://vidsrcme.ru/embed/movie/${movie.imdb_code}`}
                      title={`${movie.title} Stream`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : null}
                </div>
              </section>
            )}

            <section id="cast-section" className="detail-section cast-section">
              <div className="section-header">
                <h3 id="cast-title" className="section-title">
                  Cast & Crew
                </h3>
              </div>
              <div className="cast-scroll-container">
                {(movie.directors && movie.directors.length > 0) ||
                movie.director ||
                (movie.actors && movie.actors.length > 0) ? (
                  <div className="cast-grid">
                    {(movie.directors || movie.director) &&
                      (movie.directors
                        ? movie.directors.map((director, index) => {
                            const personUrl = getPersonImdbUrl(director);
                            const Wrapper = personUrl ? "a" : "div";
                            const wrapperProps = personUrl
                              ? {
                                  href: personUrl,
                                  target: "_blank",
                                  rel: "noopener noreferrer",
                                  className: "cast-card",
                                  key: director.id || index,
                                }
                              : {
                                  className: "cast-card",
                                  key: director.id || index,
                                };

                            return (
                              <Wrapper {...wrapperProps}>
                                <div className="cast-img-wrapper">
                                  {director.image ? (
                                    <img
                                      src={director.image}
                                      alt={director.name}
                                      loading="lazy"
                                    />
                                  ) : (
                                    <FaStar />
                                  )}
                                </div>
                                <span className="cast-name">
                                  {director.name}
                                </span>
                                <span className="cast-role">Director</span>
                              </Wrapper>
                            );
                          })
                        : (() => {
                            const personUrl = getPersonImdbUrl(movie.director);
                            const Wrapper = personUrl ? "a" : "div";
                            const wrapperProps = personUrl
                              ? {
                                  href: personUrl,
                                  target: "_blank",
                                  rel: "noopener noreferrer",
                                  className: "cast-card",
                                }
                              : { className: "cast-card" };

                            return (
                              <Wrapper {...wrapperProps}>
                                <div className="cast-img-wrapper">
                                  <FaStar />
                                </div>
                                <span className="cast-name">
                                  {movie.director}
                                </span>
                                <span className="cast-role">Director</span>
                              </Wrapper>
                            );
                          })())}

                    {movie.actors &&
                      movie.actors.length > 0 &&
                      movie.actors.slice(0, 10).map((actor, index) => {
                        const actorData =
                          typeof actor === "string" ? { name: actor } : actor;
                        const personUrl = getPersonImdbUrl(actorData);
                        const Wrapper = personUrl ? "a" : "div";
                        const wrapperProps = personUrl
                          ? {
                              href: personUrl,
                              target: "_blank",
                              rel: "noopener noreferrer",
                              className: "cast-card",
                              key: actorData.id || index,
                            }
                          : {
                              className: "cast-card",
                              key: actorData.id || index,
                            };

                        return (
                          <Wrapper {...wrapperProps}>
                            <div className="cast-img-wrapper">
                              {actorData.image ? (
                                <img
                                  src={actorData.image}
                                  alt={actorData.name}
                                  loading="lazy"
                                />
                              ) : (
                                <FaStar />
                              )}
                            </div>
                            <span className="cast-name">{actorData.name}</span>
                            <span className="cast-role">Actor</span>
                          </Wrapper>
                        );
                      })}
                  </div>
                ) : (
                  <div className="no-cast-info">
                    {movie.imdb_code && !movie.actors && !movie.directors ? (
                      <p className="loading-cast">
                        Loading cast and crew information...
                      </p>
                    ) : (
                      <p className="no-data-msg">
                        No cast and crew information available for this movie.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="sidebar-column">
            <section
              id="torrent-section"
              className="detail-section torrent-section-card"
            >
              <div className="section-header">
                <h3 id="download-title" className="section-title">
                  Download Now
                </h3>
              </div>
              <div className="download-options">
                {movie.torrents && movie.torrents.length > 0 ? (
                  movie.torrents.map((torrent, idx) => (
                    <a
                      key={idx}
                      href={torrent.url}
                      className="download-tile"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="tile-info">
                        <span className="tile-quality">
                          {torrent.quality}
                          {torrent.video_codec === "x265" ? ".x265" : ""}
                        </span>
                        <span className="tile-meta">
                          {torrent.type.toUpperCase()} • {torrent.size}
                        </span>
                      </div>
                      <FaDownload className="tile-icon" />
                    </a>
                  ))
                ) : (
                  <div className="no-data-card no-downloads">
                    <p className="no-data-msg">
                      No downloads available for this movie.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section
              id="subtitle-section"
              className="detail-section subtitle-section"
            >
              <div className="section-header">
                <h3 id="subtitles-title" className="section-title">
                  Subtitles
                </h3>
              </div>

              {subtitles && subtitles.length > 0 ? (
                <>
                  <div className="sub-language-selector">
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        className={`lang-chip ${
                          selectedLanguage === lang ? "active" : ""
                        }`}
                        onClick={() => setSelectedLanguage(lang)}
                      >
                        {capitalizeFirstLetter(lang)}
                      </button>
                    ))}
                  </div>
                  <div className="subtitle-list">
                    {filteredSubtitles.map((sub) => (
                      <a
                        key={sub.subtitleId}
                        href={api.getSubtitleDownloadUrl(sub.subtitleId)}
                        className="subtitle-item"
                        title="Download Subtitle"
                      >
                        <div className="subtitle-info">
                          <span className="sub-lang">
                            {capitalizeFirstLetter(sub.language)}
                          </span>
                          <span className="sub-release">{sub.releaseInfo}</span>
                        </div>
                        <div className="sub-download-icon">
                          <FaDownload size={14} />
                        </div>
                      </a>
                    ))}
                  </div>
                </>
              ) : (
                <div className="no-data-card no-subs">
                  <p className="no-data-msg">
                    No subtitles found for this movie.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>

        <div className="suggestions-section">
          <h3 className="section-title">You Might Also Like</h3>
          <div className="suggestions-grid">
            {validSuggestions.length > 0 ? (
              validSuggestions.map((s) => <MovieCard key={s.id} movie={s} />)
            ) : (
              <div className="no-data-card no-suggestions">
                <p className="no-data-msg">
                  No similar movies found. Check back later for recommendations!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;
