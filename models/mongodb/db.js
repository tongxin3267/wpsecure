var settings = require('../../settings'),
    mongoose = require('mongoose'),
    uri = 'mongodb://' + settings.host + ':' + settings.port + '/' + settings.db;

mongoose.Promise = global.Promise;
mongoose.connect(uri);
mongoose.uri = uri;

mongoose.connection.on('connected', function () {
    console.log('Mongoose connected to ' + uri);
});
mongoose.connection.on('error', function (err) {
    console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose disconnected');
});
process.on('SIGINT', function () {
    mongoose.connection.close(function () {
        console.log('Mongoose disconnected through app termination');
        process.exit(0);
    });
});

module.exports = mongoose;