import {formatLocale} from 'd3-format'

export const swissNumbers = formatLocale({
  decimal: '.',
  thousands: "'",
  grouping: [3],
  currency: ['CHF\u00a0', '']
})
export const chfFormat = swissNumbers.format('$,.0f')
