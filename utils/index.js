function getRecommendedAndNearbyEvents(movies) {
    function getRandomItems(arr, count) {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    }
  
    function formatMovie(movie) {
      return {
        title: movie.title,
        image: movie.bgImage,
        genre: movie.genres[0],
        ratingType: movie.ratingType,
        rating: movie.rating,
        votes: movie.votes
      };
    }
  
    const recommendedEvents = getRandomItems(movies, Math.min(3, movies.length)).map(formatMovie);
  
    const remainingMovies = movies.filter(movie => !recommendedEvents.some(rec => rec.title === movie.title));
    const nearbyEvents = getRandomItems(remainingMovies, Math.min(3, remainingMovies.length)).map(formatMovie);
  
    return {
      recommended_events: recommendedEvents,
      nearby_events: nearbyEvents
    };
  }
  
  module.exports = getRecommendedAndNearbyEvents;