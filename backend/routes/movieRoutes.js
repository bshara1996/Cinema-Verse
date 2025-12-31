const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

router.get('/movies', movieController.getMovies);
router.get('/search', movieController.getMovies); // Search is essentially getMovies with query_term
router.get('/movies/:id', movieController.getMovieDetails);
router.get('/imdb/:imdbCode', movieController.getImdbDetails);
router.get('/suggestions/:id', movieController.getSuggestions);
router.get('/subtitles', movieController.getSubtitles);
router.get('/subtitles/:id/download', movieController.downloadSubtitle);

module.exports = router;
