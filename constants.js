const ENV = typeof window !== 'undefined' ? window.__NEXT_DATA__.env : process.env

// ENV variables exported here are sent to the client via pages/_document.js

exports.API_BASE_URL = ENV.API_BASE_URL || 'https://api.satellit.online'
exports.API_AUTHORIZATION_HEADER = ENV.API_AUTHORIZATION_HEADER

exports.PUBLIC_BASE_URL = ENV.PUBLIC_BASE_URL

exports.STRIPE_PUBLISHABLE_KEY = ENV.STRIPE_PUBLISHABLE_KEY

exports.PF_PSPID = ENV.PF_PSPID
exports.PF_INPUT_SECRET = ENV.PF_INPUT_SECRET
exports.PF_FORM_ACTION = ENV.PF_FORM_ACTION

exports.PAYPAL_FORM_ACTION = ENV.PAYPAL_FORM_ACTION
exports.PAYPAL_BUSINESS = ENV.PAYPAL_BUSINESS

exports.PIWIK_URL_BASE = ENV.PIWIK_URL_BASE || 'https://piwik.project-r.construction'
exports.PIWIK_SITE_ID = ENV.PIWIK_SITE_ID || '2'
