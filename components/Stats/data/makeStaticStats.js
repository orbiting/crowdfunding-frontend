const fs = require('fs')
const {join} = require('path')
const {csvParse} = require('d3-dsv')
const {mean, median, range} = require('d3-array')

const agesZurich = csvParse(fs.readFileSync(
  join(__dirname, '/agesZurich.csv'),
  'utf8'
))
const agesCh = csvParse(
  fs.readFileSync(join(__dirname, './agesCh.csv'),
  'utf8'
))

const agesZurichIndividuals = agesZurich.reduce(
  (all, {count, age}) => all.concat(
    range(+count).map(() => +age)
  ),
  []
)
// we count «105 und mehr» as 105 by using parseInt
const agesChIndividuals = agesCh.reduce(
  (all, {count, age}) => all.concat(
    range(+count).map(() => parseInt(age))
  ),
  []
)

fs.writeFileSync(join(__dirname, '/staticStats.json'), JSON.stringify({
  zurich: {
    median: median(agesZurichIndividuals),
    mean: mean(agesZurichIndividuals)
  },
  ch: {
    median: median(agesChIndividuals),
    mean: mean(agesChIndividuals)
  }
}), 'utf8')
