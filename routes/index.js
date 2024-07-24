const express = require('express');
const ActivityModel = require('../models');
const ERS = require('../models/ers');
const getRecommendedAndNearbyEvents = require('../utils');
const stripe = require('stripe')('sk_test_51Pfv0NA2iC3BEjckGvSQYmoKD20dILThGUrFTowRFbnCTCpP3ehyzu5dVlXp0kRMrr2EfjTmD6FQTYy3UKFvrv4h00xvCgFspv');

const router = express.Router();


const getRecommendations = async (userInput) => {
    const { entertainmentType, subcategory, timeFrame } = userInput;


    // Create filter object based on user input
    let filter = { event_type: entertainmentType.toLowerCase() };

    // Add subcategory filter if provided
    if (subcategory) {
        filter.subcategory = subcategory.toUpperCase();
    }

    // Filter by date range if timeFrame is provided
    if (timeFrame) {
        let currentDate = new Date();
        let endDate = new Date();

        if (timeFrame === "This week") {
            endDate.setDate(currentDate.getDate() + 7);
        } else if (timeFrame === "This month") {
            endDate.setMonth(currentDate.getMonth() + 1);
        } else if (timeFrame === "Within 3 months") {
            endDate.setMonth(currentDate.getMonth() + 3);
        } // else: "No specific time" - no date filter

        filter.date = { $gte: currentDate.toISOString(), $lte: endDate.toISOString() };
    }

    
    console.log(filter)
    const recommendations = await ERS.find(filter);
    return recommendations;
};

// GET /api/:event_type
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

        const activities = await ActivityModel.find(filters);
        console.log(activities.length);
        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/payment_intents
router.post('/api/payment_intents', async (req, res) => {
    const { amount, payment_method } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            payment_method,
            confirm: true,
        });

        res.send({ client_secret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// POST /create-checkout-session
router.post('/create-checkout-session', async (req, res) => {
    const { selectedSeats, ticketPrice, convenienceFee } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Movie Tickets',
                            description: `${selectedSeats.join(', ')} ( ${selectedSeats.length} Tickets )`,
                        },
                        unit_amount: ticketPrice,
                    },
                    quantity: selectedSeats.length,
                },
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Convenience Fee',
                        },
                        unit_amount: convenienceFee,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'http://localhost:3000/success',
            cancel_url: 'http://localhost:3000/cancel',
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error(error); // Log the error to see more details
        res.status(500).json({ error: error.message });
    }
});

// GET /api/:event_type/:id
router.get('/:event_type/:id', async (req, res) => {
    const event_type = req.params.event_type;
    try {
        const activity = await ActivityModel.findOne({ _id: req.params.id, event_type: event_type });
        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        const filters = { "event_type": activity.event_type };
        const activities_list = await ActivityModel.find(filters);
        const more_events = getRecommendedAndNearbyEvents(activities_list);

        const combinedData = Object.assign({}, activity.toObject(), more_events);
        res.json(combinedData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// POST /movies/:id/bookseat/:seating_plan_id/:seat_number
router.post('/movies/:id/bookseat/:seating_plan_id/:seat_number', async (req, res) => {
    try {
        const seating_plan_id = req.params.seating_plan_id;
        const seat_number = req.params.seat_number;

        const movie = await ActivityModel.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        let seatBooked = false;

        for (const city in movie.showtimes) {
            for (const theater of movie.showtimes[city]) {
                for (const availability of theater.availability) {
                    if (availability.seating_plan.seating_plan_id === seating_plan_id) {
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
        res.status(500).json({ message: error.message });
    }
});

// New Route: POST /api/recommendations
router.post('/recommendations', async (req, res) => {
    try {
        const recommendations = await getRecommendations(req.body);
        console.log('Returning recommendations:', recommendations);
        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;
