require('dotenv').config()

const ENV = process.env

const SAUCE = (
  !!ENV.SAUCE_USERNAME &&
  !!ENV.SAUCE_ACCESS_KEY &&
  !ENV.LOCAL
)

exports.config = {
  services: SAUCE ? ['sauce'] : undefined,
  user: SAUCE && process.env.SAUCE_USERNAME,
  key: SAUCE && process.env.SAUCE_ACCESS_KEY,
  sauceConnect: SAUCE && true,

  specs: [
    './test/e2e/**/*.js'
  ],
  exclude: [
    // 'path/to/excluded/files'
  ],

  maxInstances: 10,

  // Sauce Labs platform configurator
  // https://docs.saucelabs.com/reference/platforms-configurator
  capabilities: SAUCE ? [{
    maxInstances: 5,
    browserName: 'firefox'
  }, {
    browserName: 'internet explorer',
    platform: 'Windows 7',
    version: '11.0'
  }] : [{
    browserName: 'firefox'
  }],
  sync: true,
  logLevel: 'silent',
  coloredLogs: true,

  bail: 0,

  screenshotPath: './test/errorShots/',

  // Urls starting with "/" will be prepended.
  baseUrl: 'http://localhost:3003',
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,

  framework: 'jasmine',

  // Test reporter for stdout.
  // The only one supported by default is 'dot'
  // see also: http://webdriver.io/guide/testrunner/reporters.html
  reporters: ['dot', 'spec'],

  // Options to be passed to Jasmine.
  jasmineNodeOpts: {
    // Jasmine default timeout
    defaultTimeoutInterval: 120000,
    // The Jasmine framework allows interception of each assertion in order to log the state of the application
    // or website depending on the result. For example, it is pretty handy to take a screenshot every time
    // an assertion fails.
    expectationResultHandler: (passed, assertion) => {
      // do something
    }
  }
}
