
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import MovieCard from '../../components/MovieCard/MovieCard';
import Pagination from '../../components/Pagination/Pagination';
import Loader from '../../components/Loader/Loader';
import './Home.css';

const Home = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const currentPage = parseInt(searchParams.get('page') || '1', 10);

    const filters = {
        query_term: searchParams.get('query_term') || '',
        quality: searchParams.get('quality') || 'all',
        genre: searchParams.get('genre') || 'all',
        minimum_rating: searchParams.get('minimum_rating') || '0',
        sort_by: searchParams.get('sort_by') || 'date_added',
        year: searchParams.get('year') || 'all'
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
            img.onerror = () => resolve();
        });
    };

    const fetchMovies = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            Object.keys(filters).forEach(key => {
                if (filters[key] !== 'all' && filters[key] !== '') {
                    params[key] = filters[key];
                }
            });

            params.page = currentPage;
            params.limit = 20;

            const data = await api.getMovies(params);

            if (data && data.data && data.data.movies) {
                setMovies(data.data.movies);
                const limit = data.data.limit || 20;
                const count = data.data.movie_count || 0;
                setTotalCount(count);
                setTotalPages(Math.ceil(count / limit));

                const postersToPreload = data.data.movies
                    .slice(0, 8)
                    .map(m => m.medium_cover_image || m.large_cover_image)
                    .filter(Boolean);

                await Promise.all(postersToPreload.map(url => preloadImage(url)));
            } else {
                setMovies([]);
                setTotalCount(0);
                setTotalPages(0);
            }
        } catch (err) {
            setError('Failed to fetch movies. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovies();
    }, [currentPage, searchParams]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            const params = { ...Object.fromEntries(searchParams) };
            params.page = newPage.toString();
            setSearchParams(params);
            window.scrollTo(0, 0);
        }
    };

    return (
        <div className="home-page container">
            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <Loader message="Fetching the best movies for you..." />
            ) : (
                <>
                    {movies.length === 0 ? (
                        <div className="no-results">
                            <h3>No movies found</h3>
                            <p>Try adjusting your search filters.</p>
                        </div>
                    ) : (
                        <>
                            <div className="results-count">
                                {totalCount > 0 && (
                                    <span>Found {totalCount?.toLocaleString()} movies</span>
                                )}
                            </div>
                            <div className="movie-grid">
                                {movies.map(movie => (
                                    <MovieCard key={movie.id} movie={movie} />
                                ))}
                            </div>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default Home;
