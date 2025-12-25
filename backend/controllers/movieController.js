const axios = require('axios');
const { YTS_API_URL, IMDB_API_URL } = require('../config/config');

const movieController = {
    // Get movies with support for search and filters
    async getMovies(req, res) {
        try {
            // filters: limit, page, quality, minimum_rating, query_term, genre, sort_by, order_by
            const params = { ...req.query };

            // 1. Construct combined query string: [Title] [Year]
            let title = params.query_term || '';
            const year = params.year || '';
            const isYearRange = year === '2000_and_less';

            // We append YEAR to query_term because YTS API ignores 'year' param often
            // But skip this for range queries as we'll filter on the backend
            let combinedQuery = title;
            if (year && year !== 'all' && !isYearRange) {
                combinedQuery += (combinedQuery ? ' ' : '') + year;
            }

            if (combinedQuery) {
                params.query_term = combinedQuery.trim();
            }

            // 2. Remove parameters that might confuse the API
            if (params.year === 'all' || isYearRange) delete params.year;
            // language param is no longer handled or sent from frontend

            // Construct full YTS API URL for logging
            const queryString = new URLSearchParams(params).toString();
            const fullUrl = `${YTS_API_URL}/list_movies.json?${queryString}`;
            console.log(`YTS API Request: ${fullUrl}`);

            let data;

            // If filtering by "2000_and_less", fetch multiple pages to get all movies
            if (isYearRange) {
                const limit = parseInt(params.limit) || 20;
                const requestedPage = parseInt(params.page) || 1;
                
                // Fetch multiple pages to get a comprehensive list
                // YTS API typically allows up to 50 per page, so we'll fetch up to 20 pages (1000 movies)
                const maxPagesToFetch = 20;
                const fetchLimit = 50; // Maximum allowed by YTS API
                
                let allMovies = [];
                let totalMovieCount = 0;
                
                // Fetch multiple pages in parallel
                const fetchPromises = [];
                for (let page = 1; page <= maxPagesToFetch; page++) {
                    const fetchParams = { ...params };
                    fetchParams.limit = fetchLimit;
                    fetchParams.page = page;
                    fetchPromises.push(
                        axios.get(`${YTS_API_URL}/list_movies.json`, { params: fetchParams })
                            .then(response => response.data)
                            .catch(error => {
                                console.error(`Error fetching page ${page}:`, error.message);
                                return null;
                            })
                    );
                }
                
                const responses = await Promise.all(fetchPromises);
                
                // Combine all movies from all pages
                responses.forEach(response => {
                    if (response && response.data && response.data.movies) {
                        allMovies = allMovies.concat(response.data.movies);
                        // Get total count from first response
                        if (totalMovieCount === 0 && response.data.movie_count) {
                            totalMovieCount = response.data.movie_count;
                        }
                    }
                });
                
                // Filter movies by year <= 2000
                const filteredMovies = allMovies.filter(movie => {
                    const movieYear = movie.year || 0;
                    return movieYear <= 2000;
                });
                
                // Remove duplicates based on movie ID
                const uniqueMovies = [];
                const seenIds = new Set();
                filteredMovies.forEach(movie => {
                    if (!seenIds.has(movie.id)) {
                        seenIds.add(movie.id);
                        uniqueMovies.push(movie);
                    }
                });
                
                // Paginate the filtered results
                const startIndex = (requestedPage - 1) * limit;
                const endIndex = startIndex + limit;
                const paginatedMovies = uniqueMovies.slice(startIndex, endIndex);
                
                // Create response structure matching YTS API format
                data = {
                    status: 'ok',
                    status_message: 'Query was successful',
                    data: {
                        movie_count: uniqueMovies.length,
                        limit: limit,
                        page_number: requestedPage,
                        movies: paginatedMovies,
                        page_count: Math.ceil(uniqueMovies.length / limit)
                    }
                };
            } else {
                // Normal fetch for other filters
                const response = await axios.get(`${YTS_API_URL}/list_movies.json`, { params });
                data = response.data;
            }

            if (data && data.data) {
                console.log(`YTS API Response: status="${data.status}", movie_count=${data.data.movie_count || 0}`);
            }

            res.json(data);
        } catch (error) {
            console.error('Error fetching movies from YTS:', error.message);
            res.status(500).json({ error: 'Failed to fetch movies' });
        }
    },

    async getMovieDetails(req, res) {
        try {
            const { id } = req.params;

            // Fetch movie details by ID
            const response = await axios.get(`${YTS_API_URL}/movie_details.json`, {
                params: { movie_id: id, with_images: true, with_cast: true }
            });
            const data = response.data;

            // If movie has imdb_code, fetch director, actors, and plot summary from IMDB API
            if (data && data.data && data.data.movie && data.data.movie.imdb_code) {
                try {
                    const imdbCode = data.data.movie.imdb_code;
                    const imdbResponse = await axios.get(`${IMDB_API_URL}/titles/${imdbCode}`);

                    if (imdbResponse.data) {
                        // Extract director, actors, and plot summary from IMDB API response
                        const imdbData = imdbResponse.data;

                        // Add directors - extract from directors array with images
                        if (imdbData.directors && imdbData.directors.length > 0) {
                            data.data.movie.directors = imdbData.directors.map(d => ({
                                name: d.displayName,
                                image: d.primaryImage?.url || null,
                                id: d.id
                            }));
                            // Also keep the simple string format for backward compatibility
                            data.data.movie.director = imdbData.directors
                                .map(d => d.displayName)
                                .join(', ');
                        }

                        // Add actors - extract from stars array with images
                        if (imdbData.stars && imdbData.stars.length > 0) {
                            data.data.movie.actors = imdbData.stars.map(s => ({
                                name: s.displayName,
                                image: s.primaryImage?.url || null,
                                id: s.id
                            }));
                        }

                        // Add plot summary
                        if (imdbData.plot) {
                            data.data.movie.plot_summary = imdbData.plot;
                        }
                    }
                } catch (imdbError) {
                    // Log but don't fail the request if IMDB API fails
                    console.error(`Error fetching IMDB data for ${data.data.movie.imdb_code}:`, imdbError.message);
                }
            }

            res.json(data);
        } catch (error) {
            console.error(`Error fetching details for movie ${req.params.id}:`, error.message);
            res.status(500).json({ error: 'Failed to fetch movie details' });
        }
    },

    async getSuggestions(req, res) {
        try {
            const { id } = req.params;

            // Fetch movie suggestions for a given movie ID
            const response = await axios.get(`${YTS_API_URL}/movie_suggestions.json`, {
                params: { movie_id: id }
            });
            const data = response.data;

            res.json(data);
        } catch (error) {
            console.error(`Error fetching suggestions for movie ${req.params.id}:`, error.message);
            res.status(500).json({ error: 'Failed to fetch suggestions' });
        }
    },

    async getSubtitles(req, res) {
        try {
            const { imdbId } = req.query;
            const { SUBSOURCE_API_URL, SUBSOURCE_API_KEY } = require('../config/config');

            if (!imdbId) {
                return res.status(400).json({ error: 'IMDB ID is required' });
            }

            // 1. Search for movie ID on Subsource
            const searchResponse = await axios.get(`${SUBSOURCE_API_URL}/movies/search`, {
                params: {
                    imdb: imdbId,
                    searchType: 'imdb'
                },
                headers: {
                    'X-API-Key': SUBSOURCE_API_KEY
                }
            });

            const searchData = searchResponse.data;
            if (!searchData || !searchData.data || searchData.data.length === 0) {
                return res.json({ data: [] });
            }

            const movieId = searchData.data[0].movieId;

            // 2. Fetch subtitles for this movie ID
            // We can fetch multiple languages or let the frontend decide. For now, let's fetch all available or a default set.
            const subsResponse = await axios.get(`${SUBSOURCE_API_URL}/subtitles`, {
                params: {
                    movieId: movieId
                },
                headers: {
                    'X-API-Key': SUBSOURCE_API_KEY
                }
            });

            res.json(subsResponse.data);
        } catch (error) {
            console.error('Error fetching subtitles from Subsource:', error.message);
            res.status(500).json({ error: 'Failed to fetch subtitles' });
        }
    },

    async downloadSubtitle(req, res) {
        try {
            const { id } = req.params;
            const { SUBSOURCE_API_URL, SUBSOURCE_API_KEY } = require('../config/config');

            const response = await axios.get(`${SUBSOURCE_API_URL}/subtitles/${id}/download`, {
                headers: {
                    'X-API-Key': SUBSOURCE_API_KEY
                },
                responseType: 'arraybuffer'
            });

            // Subsource usually returns a zip file
            res.setHeader('Content-Type', response.headers['content-type'] || 'application/zip');
            res.setHeader('Content-Disposition', response.headers['content-disposition'] || `attachment; filename="subtitle-${id}.zip"`);
            res.send(response.data);
        } catch (error) {
            console.error('Error downloading subtitle from Subsource:', error.message);
            res.status(500).json({ error: 'Failed to download subtitle' });
        }
    }
};

module.exports = movieController;
