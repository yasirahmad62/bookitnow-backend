const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ERS = new Schema({
    event_type: { type: String, default: 'movie' },  // 'movie', 'event', 'sport'
    title: { type: String, required: true },
    rating: { type: Number, default: 0 },
    votes: { type: String, default: '0' },
    duration: { type: String, default: '' },         // For movies
    releaseDate: { type: String, default: '' },      // For movies and events
    genres: { type: [String], default: [] },         // For movies
    languages: { type: [String], default: [] },      // For movies
    formats: { type: [String], default: [] },        // For movies
    imgSrc: { type: String, default: '' },
    bgImage: { type: String, default: '' },
    description: { type: String, default: '' },
    cast: { type: [String], default: [] },           // For movies
    crew: { type: [String], default: [] },           // For movies
    showtimes: { type: Object, default: {} },        // Showtimes details
    pricing: { type: Object, default: {} },          // Pricing details
    tickets: { type: [Object], default: [] },        // Ticket information
    userReviews: { type: [Object], default: [] },    // User reviews
    subcategory: { type: String, default: '' },      // e.g., CONCERTS, ACTION, FOOTBALL
    location: { type: String, default: '' },         // Event location or sports venue
    date: { type: String, default: '' },             // Date of the event or sports match
    time: { type: String, default: '' },             // Time of the event or sports match
    organizer: { type: String, default: '' }         // Event or sports organizer
});

const ers = mongoose.model('ERS', ERS);

module.exports = ers;
