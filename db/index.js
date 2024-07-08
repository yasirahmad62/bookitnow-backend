const mongoose = require('mongoose');

const MONGO_URL = "mongodb+srv://yasir:vUW7sPjEkn4eaqkN@cluster0.vz5oknh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

const connect = () => {
    mongoose.connect(MONGO_URL, {
        useNewUrlParser: true
    })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err.message));
};

module.exports = { connect };
