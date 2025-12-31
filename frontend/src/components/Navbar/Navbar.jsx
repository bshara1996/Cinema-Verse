import {
  Link,
  useSearchParams,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { FaSearch, FaTimes, FaChevronDown, FaCheck } from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize filters from URL or defaults
  const [filters, setFilters] = useState({
    query_term: searchParams.get("query_term") || "",
    quality: searchParams.get("quality") || "all",
    genre: searchParams.get("genre") || "all",
    minimum_rating: searchParams.get("minimum_rating") || "0",
    sort_by: searchParams.get("sort_by") || "date_added",
    year: searchParams.get("year") || "all",
  });

  const [searchInput, setSearchInput] = useState(filters.query_term || "");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState(null);

  // Sync filters with URL params when URL changes
  useEffect(() => {
    setFilters({
      query_term: searchParams.get("query_term") || "",
      quality: searchParams.get("quality") || "all",
      genre: searchParams.get("genre") || "all",
      minimum_rating: searchParams.get("minimum_rating") || "0",
      sort_by: searchParams.get("sort_by") || "date_added",
      year: searchParams.get("year") || "all",
    });
  }, [searchParams]);

  useEffect(() => {
    setSearchInput(filters.query_term || "");
  }, [filters.query_term]);

  const handleFilterChange = (name, value) => {
    const params = { ...Object.fromEntries(searchParams) };

    if (value === "all" || value === "" || value === "0") {
      delete params[name];
    } else {
      params[name] = value;
    }

    // Reset to page 1 when filters change
    params.page = "1";

    // Redirection logic: if not on home, go home with these params
    if (location.pathname !== "/") {
      const queryString = new URLSearchParams(params).toString();
      navigate(`/?${queryString}`);
    } else {
      setSearchParams(params);
    }
  };

  const handleSearch = () => {
    const params = { ...Object.fromEntries(searchParams) };
    if (filters.query_term) {
      params.query_term = filters.query_term;
    } else {
      delete params.query_term;
    }
    params.page = "1";

    if (location.pathname !== "/") {
      const queryString = new URLSearchParams(params).toString();
      navigate(`/?${queryString}`);
    } else {
      setSearchParams(params);
    }
  };

  const handleClearFilters = () => {
    setSearchInput("");
    if (location.pathname !== "/") {
      navigate("/");
    } else {
      setSearchParams({});
    }
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    handleFilterChange("query_term", e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleFilterSelect = (filterName, value) => {
    handleFilterChange(filterName, value);
    if (window.innerWidth <= 900) {
      setIsMenuOpen(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  };

  const toggleFilter = (filterName) => {
    if (window.innerWidth <= 900) {
      setExpandedFilter(expandedFilter === filterName ? null : filterName);
    }
  };

  // Function to check if any filters are applied (excluding default values)
  const hasActiveFilters = () => {
    if (searchInput) return true;
    if (
      filters &&
      (filters.quality !== "all" ||
        filters.genre !== "all" ||
        filters.minimum_rating !== "0" ||
        filters.sort_by !== "date_added" ||
        filters.year !== "all")
    ) {
      return true;
    }
    return false;
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link
          to="/"
          className="navbar-logo"
          onClick={() => setIsMenuOpen(false)}
        >
          CINEMA<span className="navbar-logo-accent">VERSE</span>
        </Link>

        <button
          className={`hamburger-btn ${isMenuOpen ? "open" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        <div className={`navbar-content ${isMenuOpen ? "open" : ""}`}>
          <div className="navbar-search">
            <form onSubmit={handleSearchSubmit} className="search-form">
              <FaSearch className="search-icon" />
              <input
                type="text"
                value={searchInput}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                placeholder="Search movies by title, year, or IMDb ID"
                className="search-input"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="clear-search-btn"
                  title="Clear all filters"
                >
                  <FaTimes />
                </button>
              )}
            </form>
          </div>



          <div className="navbar-filters">
            {/* Quality Filter */}
            <div
              className={`filter-dropdown ${
                expandedFilter === "quality" ? "expanded" : ""
              }`}
            >
              <span
                className={`filter-label ${
                  filters.quality !== "all" ? "active" : ""
                }`}
                onClick={() => toggleFilter("quality")}
              >
                Quality:{" "}
                <span className="filter-value">
                  {filters.quality === "all" ? "All" : filters.quality}
                </span>
                <FaChevronDown className="filter-chevron" />
              </span>
              <div className="filter-menu">
                <div
                  className={`filter-option filter-option-all ${
                    filters.quality === "all" ? "active" : ""
                  }`}
                  onClick={() => handleFilterSelect("quality", "all")}
                >
                  All Qualities
                </div>
                <div className="filter-menu-grid">
                  <div
                    className={`filter-option ${
                      filters.quality === "480p" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("quality", "480p")}
                  >
                    480p
                  </div>
                  <div
                    className={`filter-option ${
                      filters.quality === "720p" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("quality", "720p")}
                  >
                    720p
                  </div>
                  <div
                    className={`filter-option ${
                      filters.quality === "1080p" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("quality", "1080p")}
                  >
                    1080p
                  </div>
                  <div
                    className={`filter-option ${
                      filters.quality === "1080p.x265" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("quality", "1080p.x265")}
                  >
                    1080p.x265
                  </div>
                  <div
                    className={`filter-option ${
                      filters.quality === "2160p" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("quality", "2160p")}
                  >
                    2160p - 4K
                  </div>
                  <div
                    className={`filter-option ${
                      filters.quality === "3D" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("quality", "3D")}
                  >
                    3D
                  </div>
                </div>
              </div>
            </div>

            {/* Genre Filter */}
            <div
              className={`filter-dropdown ${
                expandedFilter === "genre" ? "expanded" : ""
              }`}
            >
              <span
                className={`filter-label ${
                  filters.genre !== "all" ? "active" : ""
                }`}
                onClick={() => toggleFilter("genre")}
              >
                Genre:{" "}
                <span className="filter-value">
                  {filters.genre === "all"
                    ? "All"
                    : filters.genre.charAt(0).toUpperCase() +
                      filters.genre.slice(1)}
                </span>
                <FaChevronDown className="filter-chevron" />
              </span>
              <div className="filter-menu">
                <div
                  className={`filter-option filter-option-all ${
                    filters.genre === "all" ? "active" : ""
                  }`}
                  onClick={() => handleFilterSelect("genre", "all")}
                >
                  All Genres
                </div>
                <div className="genre-grid">
                  <div
                    className={`filter-option ${
                      filters.genre === "action" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("genre", "action")}
                  >
                    Action
                  </div>
                  <div
                    className={`filter-option ${
                      filters.genre === "adventure" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("genre", "adventure")}
                  >
                    Adventure
                  </div>
                  <div
                    className={`filter-option ${
                      filters.genre === "animation" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("genre", "animation")}
                  >
                    Animation
                  </div>
                  <div
                    className={`filter-option ${
                      filters.genre === "biography" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("genre", "biography")}
                  >
                    Biography
                  </div>
                  <div
                    className={`filter-option ${
                      filters.genre === "comedy" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("genre", "comedy")}
                  >
                    Comedy
                  </div>
                  <div
                    className={`filter-option ${
                      filters.genre === "crime" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("genre", "crime")}
                  >
                    Crime
                  </div>
                  <div
                    className={`filter-option ${
                      filters.genre === "documentary" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("genre", "documentary")}
                  >
                    Documentary
                  </div>
                  <div
                    className={`filter-option ${
                      filters.genre === "drama" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("genre", "drama")}
                  >
                    Drama
                  </div>
                  <div
                    className={`filter-option ${
                      filters.genre === "family" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("genre", "family")}
                  >
                    Family
                  </div>
                  <div
                    className={`filter-option ${
                      filters.genre === "fantasy" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("genre", "fantasy")}
                  >
                    Fantasy
                  </div>
                  <div
                    className={`filter-option ${
                      filters.genre === "film-noir" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("genre", "film-noir")}
                  >
                    Film-Noir
                  </div>
                  <div
                    className={`filter-option ${
                      filters.genre === "history" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("genre", "history")}
                  >
                    History
                  </div>
                  <div
                    className={`filter-option ${
                      filters.genre === "horror" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("genre", "horror")}
                  >
                    Horror
                  </div>
                  <div
                    className={`filter-option ${
                      filters.genre === "music" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("genre", "music")}
                  >
                    Music
                  </div>
                  <div
                    className={`filter-option ${
                      filters.genre === "musical" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("genre", "musical")}
                  >
                    Musical
                  </div>
                  <div
                    className={`filter-option ${
                      filters.genre === "mystery" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("genre", "mystery")}
                  >
                    Mystery
                  </div>
                  <div
                    className={`filter-option ${
                      filters.genre === "romance" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("genre", "romance")}
                  >
                    Romance
                  </div>
                  <div
                    className={`filter-option ${
                      filters.genre === "sci-fi" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("genre", "sci-fi")}
                  >
                    Sci-Fi
                  </div>
                  <div
                    className={`filter-option ${
                      filters.genre === "sport" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("genre", "sport")}
                  >
                    Sport
                  </div>
                  <div
                    className={`filter-option ${
                      filters.genre === "thriller" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("genre", "thriller")}
                  >
                    Thriller
                  </div>
                  <div
                    className={`filter-option filter-option-wide ${
                      filters.genre === "war" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("genre", "war")}
                  >
                    War
                  </div>
                  <div
                    className={`filter-option filter-option-wide ${
                      filters.genre === "western" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("genre", "western")}
                  >
                    Western
                  </div>
                </div>
              </div>
            </div>

            {/* Rating Filter */}
            <div
              className={`filter-dropdown ${
                expandedFilter === "rating" ? "expanded" : ""
              }`}
            >
              <span
                className={`filter-label ${
                  filters.minimum_rating !== "0" ? "active" : ""
                }`}
                onClick={() => toggleFilter("rating")}
              >
                Rating:{" "}
                <span className="filter-value">
                  {filters.minimum_rating === "0"
                    ? "All"
                    : filters.minimum_rating + "+"}
                </span>
                <FaChevronDown className="filter-chevron" />
              </span>
              <div className="filter-menu">
                <div
                  className={`filter-option filter-option-all ${
                    filters.minimum_rating === "0" ? "active" : ""
                  }`}
                  onClick={() => handleFilterSelect("minimum_rating", "0")}
                >
                  All Ratings
                </div>
                <div className="filter-menu-grid">
                  {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((rating, index) => (
                    <div
                      key={rating}
                      className={`filter-option ${
                        rating === 1 ? "filter-option-wide" : ""
                      } ${
                        filters.minimum_rating === rating.toString()
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        handleFilterSelect("minimum_rating", rating.toString())
                      }
                    >
                      {rating}+
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Year Filter */}
            <div
              className={`filter-dropdown ${
                expandedFilter === "year" ? "expanded" : ""
              }`}
            >
              <span
                className={`filter-label ${
                  filters.year !== "all" ? "active" : ""
                }`}
                onClick={() => toggleFilter("year")}
              >
                Year:{" "}
                <span className="filter-value">
                  {filters.year === "all"
                    ? "All"
                    : filters.year === "2000_and_less"
                    ? "2000 and less"
                    : filters.year}
                </span>
                <FaChevronDown className="filter-chevron" />
              </span>
              <div className="filter-menu">
                <div
                  className={`filter-option filter-option-all ${
                    filters.year === "all" ? "active" : ""
                  }`}
                  onClick={() => handleFilterSelect("year", "all")}
                >
                  All Years
                </div>
                <div className="year-grid">
                  {Array.from(
                    { length: new Date().getFullYear() - 2000 + 1 },
                    (_, i) => new Date().getFullYear() - i
                  ).map((year) => (
                    <div
                      key={year}
                      className={`filter-option ${
                        filters.year === year.toString() ? "active" : ""
                      }`}
                      onClick={() =>
                        handleFilterSelect("year", year.toString())
                      }
                    >
                      {year}
                    </div>
                  ))}
                  <div
                    className={`filter-option filter-option-wide ${
                      filters.year === "2000_and_less" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("year", "2000_and_less")}
                  >
                    2000 and less
                  </div>
                </div>
              </div>
            </div>
            {/* Order By Filter */}
            <div
              className={`filter-dropdown ${
                expandedFilter === "sort" ? "expanded" : ""
              }`}
            >
              <span
                className={`filter-label ${
                  filters.sort_by !== "date_added" ? "active" : ""
                }`}
                onClick={() => toggleFilter("sort")}
              >
                Sort:{" "}
                <span className="filter-value">
                  {filters.sort_by === "date_added"
                    ? "Latest"
                    : filters.sort_by === "year"
                    ? "Year"
                    : filters.sort_by === "rating"
                    ? "Rating"
                    : filters.sort_by === "title"
                    ? "A-Z"
                    : filters.sort_by === "download_count"
                    ? "Download"
                    : filters.sort_by}
                </span>
                <FaChevronDown className="filter-chevron" />
              </span>
              <div className="filter-menu">
                <div
                  className={`filter-option filter-option-all ${
                    filters.sort_by === "date_added" ? "active" : ""
                  }`}
                  onClick={() => handleFilterSelect("sort_by", "date_added")}
                >
                  Latest
                </div>
                <div className="filter-menu-grid">
                  <div
                    className={`filter-option ${
                      filters.sort_by === "year" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("sort_by", "year")}
                  >
                    Year
                  </div>
                  <div
                    className={`filter-option ${
                      filters.sort_by === "rating" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("sort_by", "rating")}
                  >
                    Rating
                  </div>
                  <div
                    className={`filter-option ${
                      filters.sort_by === "title" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("sort_by", "title")}
                  >
                    Alphabetical
                  </div>
                  <div
                    className={`filter-option ${
                      filters.sort_by === "download_count" ? "active" : ""
                    }`}
                    onClick={() =>
                      handleFilterSelect("sort_by", "download_count")
                    }
                  >
                    Download
                  </div>
                </div>
              </div>
            </div>
          </div>
          {hasActiveFilters() && (
            <button
              className="navbar-clear-btn"
              onClick={handleClearFilters}
              title="Reset all filters"
            >
              <FaTimes /> Clear
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
