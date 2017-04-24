import React, {Component} from 'react'
import {css} from 'glamor'
import {timeMinute} from 'd3-time'
import {timeFormatLocale} from 'd3-time-format'

import {
  fontFamilies,
  mediaQueries
} from '@project-r/styleguide'

const styles = {
  container: css({
    display: 'flex',
    justifyContent: 'space-between',
    flexFlow: 'row wrap',
    marginBottom: 25,
    marginTop: 25,
    [mediaQueries.mUp]: {
      marginBottom: 30
    }
  }),
  holder: css({
    display: 'block',
    margin: 0,
    width: '100%',
    [mediaQueries.mUp]: {
      width: '33%'
    }
  }),
  bigText: css({
    fontFamily: fontFamilies.sansSerifRegular,
    fontSize: 30,
    [mediaQueries.mUp]: {
      fontSize: 44
    }
  }),
  number: css({
    fontFamily: fontFamilies.sansSerifMedium,
    lineHeight: 1,
    fontSize: 85,
    [mediaQueries.mUp]: {
      fontSize: 180
    },
    padding: 0,
    margin: 0
  }),
  caption: css({
    fontSize: 20
  })
}

const timeFormat = timeFormatLocale({
  'dateTime': '%A, der %e. %B %Y, %X',
  'date': '%d.%m.%Y',
  'time': '%H:%M:%S',
  'periods': ['AM', 'PM'],
  'days': ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
  'shortDays': ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  'months': ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  'shortMonths': ['Jan', 'Feb', 'Mrz', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
}).format

const toTimeFormat = timeFormat('%d. %B %Y')

class Countdown extends Component {
  tick () {
    const now = new Date()
    const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds() + 1

    clearTimeout(this.timeout)
    this.timeout = setTimeout(
      () => {
        this.setState({
          now
        })
        this.tick()
      },
      msToNextMinute
    )
  }
  componentDidMount () {
    this.tick()
  }
  componentWillUnmount () {
    clearTimeout(this.timeout)
  }
  render () {
    const {to} = this.props

    const now = new Date()

    if (now > to) {
      return (<div {...styles.bigText} style={{margin: '60px 0', textAlign: 'center'}}>
        Es ist Zeit.
      </div>)
    }

    const totalMinutes = timeMinute.count(now, to)
    const minutes = totalMinutes % 60
    const hours = Math.floor(totalMinutes / 60) % 24
    const days = Math.floor(totalMinutes / 60 / 24)

    return (
      <div style={{textAlign: 'center'}}>
        <div {...styles.container}>
          <figure {...styles.holder}>
            <div {...styles.number}>{days}</div>
            <figcaption {...styles.caption}>
              {days === 1 ? 'Tag' : 'Tage'}
            </figcaption>
          </figure>
          <figure {...styles.holder}>
            <div {...styles.number}>{hours}</div>
            <figcaption {...styles.caption}>
              {days === 1 ? 'Stunde' : 'Stunden'}
            </figcaption>
          </figure>
          <figure {...styles.holder}>
            <div {...styles.number}>{minutes}</div>
            <figcaption {...styles.caption}>
              {minutes === 1 ? 'Minute' : 'Minuten'}
            </figcaption>
          </figure>
        </div>
        <div {...styles.bigText} style={{maxWidth: 500, margin: '0 auto'}}>bis zum Start des Crowdfundings am {toTimeFormat(to)}</div>
      </div>
    )
  }
}

export default Countdown
