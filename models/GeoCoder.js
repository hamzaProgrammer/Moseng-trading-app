const NodeGeocoder = require('node-geocoder');

const options = {
    provider: process.env.GEO_CODER_PROVIDE,
    apiKey: process.env.GEO_CODER_API,
    formatter: null
};

const geocoder = NodeGeocoder(options);


module.exports = {
    geocoder
};