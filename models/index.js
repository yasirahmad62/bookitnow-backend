const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');


const activitySchema = new mongoose.Schema({
    id: { type: String, unique: true, default: uuidv4 },
    event_type: { type: String, default: 'movie' },
    title: String,
    rating: Number,
    votes: String,
    duration: String,
    releaseDate: String,
    genres: [String],
    languages: [String],
    formats: [String],
    imgSrc: String,
    bgImage: String,
    description: String,
    cast: Array,
    crew: Array,
    showtimes: Object,
    pricing: Object,
    tickets: Array,
    userReviews: Array
});

const ActivityModel = mongoose.model('ActivityModel', activitySchema);

module.exports = ActivityModel;
