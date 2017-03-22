const ENV = typeof process !== 'undefined' ? process.env : {}

exports.PORT = ENV.PORT || 3000
exports.API_BASE_URL = ENV.API_BASE_URL || 'https://api.satellit.in'
// exports.API_BASE_URL = ENV.API_BASE_URL || 'http://localhost:3001'
exports.API_AUTHORIZATION_HEADER = ENV.API_AUTHORIZATION_HEADER
