import React from 'react'
import {gql, graphql} from 'react-apollo'
import {compose} from 'redux'
import {range} from 'd3-array'
import {nest} from 'd3-collection'
import {css} from 'glamor'

import withT from '../../lib/withT'

import Loader from '../Loader'

import BarChart from './BarChart'
import PostalCodeMap from './Map'

import {
  Interaction, A, Label, colors
} from '@project-r/styleguide'

import {swissTime} from '../../lib/utils/formats'

const dateFormat = swissTime.format('%A %-d.%-m.')

const {H1, H2, H3, P} = Interaction

const styles = {
  dateContainer: css({
    marginTop: 40
  }),
  dateBox: css({
    float: 'left',
    width: '25%',
    textAlign: 'center'
  }),
  dateCount: css({
    paddingBottom: 20,
    fontSize: 20
  }),
  dateLabel: css({
    display: 'block',
    paddingBottom: 0
  })
}

const normalizeDateData = values => {
  const hourIndex = values.reduce(
    (index, {datetime, count}) => {
      index[datetime.getHours()] = count
      return index
    },
    {}
  )
  return range(0, 24).map(i => ({
    hour: i,
    count: hourIndex[i] || 0
  }))
}

const agesZurich = require('./agesZurich.json')
const agesCh = require('./agesCh.json')

const Memberships = ({loading, error, data}) => (
  <Loader loading={loading} error={error} render={() => {
    const {
      membershipStats: {
        countries,
        ages,
        createdAts
      },
      crowdfunding: {status}
    } = data

    const paddedAges = range(16, 100).map(age => ({
      age,
      count: (ages.find(d => d.age === age) || {}).count || 0
    }))

    const groupedCreatedAts = nest()
      .key(({datetime}) => [
        datetime.getMonth(),
        datetime.getDate()
      ].join('-'))
      .entries(
        createdAts
          .map(({datetime, count}) => ({
            datetime: new Date(datetime),
            count
          }))
      )

    return (
      <div>
        <H1>Wer sind Sie?</H1>
        <P>{status.people} gelöste Abos gehören zur Zeit {countries.reduce((sum, d) => sum + d.count, 0)} Personen</P>
        <br /><br />
        <H2>Wo leben Sie?</H2>
        {countries.map(({name, count, postalCodes}) => (
          <div key={name}>
            <H3>{name || '(noch) Kein Angabe'} {count}</H3>
            {(name === 'Schweiz' || name === 'Deutschland' || name === 'Österreich') && (
              <div>
                <PostalCodeMap data={postalCodes} />
              </div>
            )}
          </div>
        ))}
        <PostalCodeMap
          data={countries
            .filter(({name}) => name === 'Schweiz' || name === 'Deutschland' || name === 'Österreich')
            .reduce(
              (all, country) => all.concat(country.postalCodes),
              []
            )} />
        <br /><br />
        <H2>Wie alt sind Sie?</H2>
        <P>
          {ages.find(d => d.age === null).count} (noch) kein Angabe<br />
          {ages.reduce(
            (sum, d) => sum + (
              d.age !== null && d.age < 16 ? d.count : 0
            ),
            0
          )} sind jünger als 16. Dies sind vorallem Firmen-Abos.
          <br /><br />
          {ages.reduce(
            (sum, d) => sum + (
              d.age > 99 ? d.count : 0
            ),
            0
          )} sind 100 oder älter, dies sind Eingabefehler und Falschangaben.
          <br /><br />Zum Beispiel 1848, u.A. das Grundungsjahr des Schweizerischen Bundesstaat, 8. Dezember 1873 — der <A href='https://de.wikipedia.org/wiki/Anton_Afritsch_(Journalist)'>Geburtstag des Journalist Anton Afritsch</A> und 19. Dezember 1878 <A href='https://de.wikipedia.org/wiki/Bayard_Taylor'>Geburtstag des Reiseschriftsteller Bayard Taylor</A>.
          <br /><br />
          Einzig ein unverifizierter, 102 jähriger Rolf könnte unser ältester Leser sein. Wir vermuten aber eher das es eine verifizierte 92 jahrige Person ist.
        </P>
        <H3 style={{marginBottom: 20}}>
          Republik von 16 bis 92 jährige Mitglieder
        </H3>
        <BarChart
          title={d => `${d.age} Jahre: ${d.count}`}
          data={paddedAges}
          referenceLines={[
            {label: 'Schweiz', color: 'red', data: agesCh},
            {label: 'Zürich', color: '#000', data: agesZurich}
          ]} />
        <div style={{paddingTop: 10, textAlign: 'right'}}>
          <A href='https://data.stadt-zuerich.ch/dataset/bev_bestand_jahr_quartier_alter_herkunft_geschlecht'>
            <Label>Zürcher Bevölkerung 2016: Statistik Stadt Zürich, Präsidialdepartement</Label>
          </A>
          <br />
          <A href='https://www.bfs.admin.ch/bfs/de/home/statistiken/bevoelkerung.assetdetail.80423.html'>
            <Label>Schweizer Bevölkerung 2015: BFS STATPOP</Label>
          </A>
        </div>

        <H2 style={{marginTop: 40}}>Wann kaufen Sie?</H2>
        <div {...styles.dateContainer}>
          {groupedCreatedAts.map(({key, values}) => (
            <div {...styles.dateBox}>
              <BarChart
                height={120}
                color={() => colors.secondary}
                data={normalizeDateData(values)} />
              <Label {...styles.dateLabel}>
                {dateFormat(values[0].datetime)}
              </Label>
              <div {...styles.dateCount}>
                {values.reduce(
                  (sum, d) => sum + d.count,
                  0
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }} />
)

const membershipStats = gql`
query {
  crowdfunding(name: "REPUBLIK") {
    status {
      people
    }
  }
  membershipStats {
    createdAts(interval: hour) {
      datetime
      count
    }
    countries {
      name
      count
      postalCodes {
        postalCode
        lat
        lon
        count
      }
    }
    ages {
      age
      count
    }
  }
}
`

export default compose(
  withT,
  graphql(membershipStats)
)(Memberships)
