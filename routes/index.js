const express = require('express');
const ActivityModel = require('../models');
const getRecommendedAndNearbyEvents = require('../utils');

const router = express.Router();

// will be used for GET /api/movies
router.get('/:event_type', async (req, res) => {
    const event_type = req.params.event_type;
    try {
        const filters = {};
        filters.event_type = event_type;
        if (req.query.title) filters.title = { $regex: new RegExp(req.query.title, 'i') };
        if (req.query.genres) filters.genres = { $in: req.query.genres.split(',') };
        if (req.query.languages) filters.languages = { $in: req.query.languages.split(',') };
        if (req.query.formats) filters.formats = { $in: req.query.formats.split(',') };
        if (req.query.city) filters['showtimes.' + req.query.city] = { $exists: true };        
        
        if (event_type === 'events' || event_type === 'sports') {
            if (req.query.category) filters.genres = { $in: req.query.category.split(',') };
        }        
        filters.event_type = event_type;

        const movies = await ActivityModel.find(filters);
        console.log(movies.length);
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// will be used for GET /api/event_type/:id
router.get('/:event_type/:id', async (req, res) => {
    const event_type = req.params.event_type;
    try {
        var movie = await ActivityModel.findOne({ _id: req.params.id, event_type: event_type});
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        filters = {"event_type": movie.event_type}
        var movies_list = await ActivityModel.find(filters);
        more_events = getRecommendedAndNearbyEvents(movies_list);

        const combinedData = Object.assign({}, movie.toObject(), more_events);
        res.json(combinedData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// will be used for POST /api/movies/:id/bookseat/
router.post('/movies/:id/bookseat/:seating_plan_id/:seat_number', async (req, res) => {
    try {
        // const { seating_plan_id } = req.body;
        const seating_plan_id = req.params.seating_plan_id;
        const seat_number = req.params.seat_number;

        console.log(req.body)
        const movie = await ActivityModel.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        let seatBooked = false;

        for (const city in movie.showtimes) {
            for (const theater of movie.showtimes[city]) {
               
                for (const availability of theater.availability) {
                    console.log(seating_plan_id)
                    if (availability.seating_plan.seating_plan_id === seating_plan_id) {
                        console.log("=========")
                        if (availability.seating_plan.booked_seats.includes(seat_number)) {
                            return res.status(400).json({ message: 'Seat already booked' });
                        } else {
                            availability.seating_plan.booked_seats.push(parseInt(seat_number));
                            seatBooked = true;
                            break;
                        }
                    }
                }
                if (seatBooked) break;
            }
            if (seatBooked) break;
        }

        if (!seatBooked) {
            return res.status(404).json({ message: 'Seating plan not found' });
        }

        await movie.save();
        res.status(200).json({ message: 'Seat booked successfully', data: movie });

    } catch (error) {
        res.status(500).json({ message: error.message});
    }
});


module.exports = router;
