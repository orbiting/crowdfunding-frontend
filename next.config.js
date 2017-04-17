module.exports = {
  webpack: (config, { dev }) => {
    const entryFactory = config.entry
    config.entry = () => (
      entryFactory()
        .then((entry) => {
          entry['main.js'] = [
            './lib/polyfill.js'
          ].concat(entry['main.js'])
          return entry
        })
    )
    return config
  },
  onDemandEntries: {
    // wait 5 minutes before disposing entries
    maxInactiveAge: 1000 * 60 * 5
  }
}
