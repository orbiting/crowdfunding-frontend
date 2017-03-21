const ENV = typeof process !== 'undefined' ? process.env : {}

exports.PORT = ENV.PORT || 3000
exports.API_BASE_URL = ENV.API_BASE_URL || 'https://api.project-r.space'
exports.API_AUTHORIZATION_HEADER = ENV.API_AUTHORIZATION_HEADER
