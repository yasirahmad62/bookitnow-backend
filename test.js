const mongoose = require('mongoose');
const fs = require('fs');
const ActivityModel = require('./models/index'); // Adjust the path if necessary
const ersModel = require("./models/ers")
const MONGO_URL = "mongodb+srv://yasir:vUW7sPjEkn4eaqkN@cluster0.vz5oknh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let reviewIndex = 0;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async function() {
  console.log('Connected to MongoDB');

  // Read the JSON file
  const data = JSON.parse(fs.readFileSync('dummy_data/ersdummy.json', 'utf-8'));
  const userReviews = JSON.parse(fs.readFileSync('dummy_data/userReviews.json', 'utf-8'));
  // Update availableSeats to 100 for each showtime
  data.forEach(movie => {

    Object.keys(movie.showtimes).forEach(city => {
        movie.id = movie.id;
        movie.event_type = "movies";
      movie.showtimes[city].forEach(showtime => {
        showtime.availability.forEach(slot => {
          slot.availableSeats = 100;
        });
      });
    //   movie.userReviews = userReviews;
    });

    // movie.userReviews = userReviews.slice(reviewIndex, reviewIndex + 4);
    // reviewIndex += 4;

    // If we've used all reviews, reset to the beginning
    // if (reviewIndex >= userReviews.length) {
    //     reviewIndex = 0;
    // }
  });


  // Insert the updated movie data into the MongoDB collection
  try {
    await ersModel.insertMany(data);
    console.log('ERSSSS data inserted successfully');
  } catch (error) {
    console.error('Error inserting movie data:', error);
  } finally {
    mongoose.connection.close();
  }
});
