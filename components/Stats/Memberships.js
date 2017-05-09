import React from 'react'
import {gql, graphql} from 'react-apollo'
import {compose} from 'redux'
import {range} from 'd3-array'

import withT from '../../lib/withT'

import Loader from '../Loader'

import BarChart from './BarChart'
import PostalCodeMap from './Map'

import {
  Interaction, A, Label, colors
} from '@project-r/styleguide'

const {H1, H2, H3, P} = Interaction

const agesZurich = require('./agesZurich.json')
const agesCh = require('./agesCh.json')

const Memberships = ({loading, error, data}) => (
  <Loader loading={loading} error={error} render={() => {
    const {
      membershipStats: {
        countries,
        ages
      },
      crowdfunding: {status}
    } = data

    const paddedAges = range(16, 100).map(age => ({
      age,
      count: (ages.find(d => d.age === age) || {}).count || 0
    }))

    return (
      <div>
        <H1>Wer sind Sie?</H1>
        <P>{status.people} gelöste Abos gehören zur Zeit {countries.reduce((sum, d) => sum + d.count, 0)} Personen</P>
        <br /><br />
        <H2>Wo leben Sie?</H2>
        {countries.map(({name, count, postalCodes}) => (
          <div key={name}>
            <H3>{name || '(noch) Kein Angabe'} {count}</H3>
            {name === 'Schweiz' && (
              <div>
                Top 50 PLZ (Total: {postalCodes.length}):
                <BarChart
                  title={d => `${d.postalCode}: ${d.count}`}
                  color={d => {
                    if (d.postalCode.match(/^80/)) {
                      return 'red'
                    }
                    if (d.postalCode.match(/^30/)) {
                      return 'gold'
                    }
                    if (d.postalCode.match(/^5/)) {
                      return 'green'
                    }
                    if (d.postalCode.match(/^40/)) {
                      return 'black'
                    }
                  }}
                  data={postalCodes.slice(0, 50)} />
                <P>
                  {postalCodes
                    .filter(d => d.postalCode)
                    .filter(d => d.postalCode.match(/^80/))
                    .reduce((sum, d) => sum + d.count, 0)}
                  {' '}Stadt Zürich
                </P>
                <P>
                  {postalCodes
                    .filter(d => d.postalCode)
                    .filter(d => d.postalCode.match(/^30/))
                    .reduce((sum, d) => sum + d.count, 0)}
                  {' '}Stadt Bern
                </P>
                <P>
                  {postalCodes
                    .filter(d => d.postalCode)
                    .filter(d => d.postalCode.match(/^40/))
                    .reduce((sum, d) => sum + d.count, 0)}
                  {' '}Basel Stadt
                </P>
                <PostalCodeMap data={postalCodes} />
              </div>
            )}
          </div>
        ))}
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
          color={() => colors.primary}
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
