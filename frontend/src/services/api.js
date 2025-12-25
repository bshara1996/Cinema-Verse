import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = {
    async getMovies(params) {
        try {
            const response = await axios.get(`${API_BASE_URL}/movies`, { params });
            return response.data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async getMovieDetails(id) {
        try {
            const response = await axios.get(`${API_BASE_URL}/movies/${id}`);
            return response.data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async getSuggestions(id) {
        try {
            const response = await axios.get(`${API_BASE_URL}/suggestions/${id}`);
            return response.data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async getFilters() {
        try {
            const response = await axios.get(`${API_BASE_URL}/filters`);
            return response.data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async getSubtitles(imdbId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/subtitles`, { params: { imdbId } });
            return response.data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    getSubtitleDownloadUrl(subtitleId) {
        return `${API_BASE_URL}/subtitles/${subtitleId}/download`;
    }
};

export default api;
