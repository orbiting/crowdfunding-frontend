import React, {Component} from 'react'
import {gql, graphql} from 'react-apollo'
import {compose} from 'redux'
import {range, descending, mean, median, max} from 'd3-array'
import {nest} from 'd3-collection'
import {css} from 'glamor'
import md from 'markdown-in-js'

import withT from '../../lib/withT'
import mdComponents from '../../lib/utils/mdComponents'

import Loader from '../Loader'
import {ListWithQuery as TestimonialList} from '../Testimonial/List'

import BarChart from './BarChart'
import PostalCodeMap from './Map'
import List, {Item, Highlight} from '../List'

import {
  Interaction, A, Label, colors,
  H1, H2, P, NarrowContainer,
  fontFamilies
} from '@project-r/styleguide'

import {swissTime, countFormat} from '../../lib/utils/formats'

const dateFormat = swissTime.format('%A %-d.%-m.')

const {H3} = Interaction

const styles = {
  dateContainer: css({
    marginTop: 40
  }),
  dateBox: css({
    float: 'left',
    width: '25%',
    textAlign: 'center'
  }),
  dateBoxBig: css({
    width: '50%'
  }),
  dateCount: css({
    paddingBottom: 20,
    fontSize: 20
  }),
  dateLabel: css({
    display: 'block',
    paddingBottom: 0
  }),
  keyMetricContainer: css({
    margin: '20px 0'
  }),
  keyMetric: css({
    float: 'left',
    width: '50%',
    height: 110,
    paddingTop: 10,
    textAlign: 'center'
  }),
  keyMetricNumber: css({
    fontFamily: fontFamilies.sansSerifMedium,
    fontSize: 44
  }),
  keyMetricLabel: css({
    fontFamily: fontFamilies.sansSerifRegular,
    fontSize: 22
  }),
  keyMetricDetail: css({
    fontFamily: fontFamilies.sansSerifRegular,
    fontSize: 12
  }),
  mapStory: css({
    position: 'relative'
  }),
  mapFixed: css({
    position: 'fixed',
    top: 100,
    left: 0,
    right: 0
  }),
  mapTop: css({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0
  }),
  mapBottom: css({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  }),
  scrollBlock: css({
    position: 'relative',
    marginLeft: -5,
    marginRight: -5,
    padding: '20px 5px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)'
  })
}

const Spacer = () => (
  <div style={{height: '50vh'}} />
)

const ScrollBlock = ({children}) => (
  <div {...styles.scrollBlock}>
    {children}
  </div>
)

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

const naturalWordJoin = words => {
  if (words.length <= 1) {
    return words[0]
  }
  return [
    words.slice(0, -2).join(', '),
    words.slice(-2).join(' und ')
  ].filter(Boolean).join(', ')
}
const countryNames = values => {
  const names = values.map(d => (
    d.name === 'USA'
      ? 'der USA'
      : d.name
  ))
  return naturalWordJoin(names)
}

const agesZurich = require('./data/agesZurich.json')
const agesCh = require('./data/agesCh.json')
// const staticStats = require('./data/staticStats.json')

const paymentMethodNames = {
  STRIPE: 'Visa/Mastercard',
  PAYMENTSLIP: 'Einzahlungsschein',
  PAYPAL: 'PayPal',
  POSTFINANCECARD: 'PostFinance Card'
}

const paymentMethodDetails = {
  paperInvoice: 'Rechnung per Post'
}

class Story extends Component {
  constructor (...args) {
    super(...args)

    this.state = {}
  }
  render () {
    const {
      countryIndex,
      paddedAges,
      ageStats,
      groupedCreatedAts,
      maxCreatedAt,
      status,
      paymentMethods,
      allPostalCodes,
      geoStats,
      testimonialStats,
      foreignCountries
    } = this.props

    const {mapExtend} = this.state

    return (
      <div>
        <div {...styles.mapStory}>
          <div {...styles.mapTop}>
            <PostalCodeMap
              extentData={mapExtend || countryIndex.Schweiz.postalCodes}
              data={allPostalCodes} />
          </div>
          <NarrowContainer>
            <Spacer />
            <ScrollBlock>
              <H1>Wer sind Sie?</H1>
              <P>Ladies and Gentlemen,</P>

              <P>
                wir haben zum Start der Republik einiges darüber geschrieben, wer wir sind. Nun ist ein Drittel der Kampagne vorbei. Und wir können endlich über ein wirklich interessantes Thema reden: Wer Sie sind.
              </P>
            </ScrollBlock>

            { /* <P>{status.people} gelöste Abos gehören zur Zeit {countries.reduce((sum, d) => sum + d.count, 0)} Personen</P> */ }

            <ScrollBlock>
              <H2>Wo wohnen Sie?</H2>

              <P>
                Hier also die Verteilung der Republik-Mitglieder in der Schweiz. Jeder Punkt auf der Karte repräsentiert eine Postleitzahl. Je fetter der Punkt, desto mehr von Ihnen leben dort. (Die Summe entspricht nicht ganz {countFormat(status.people)} — da nur knapp {Math.ceil(geoStats.hasValuePercent)} Prozent ihre Postadresse angaben.)
              </P>
            </ScrollBlock>

            <ScrollBlock>
              <P>Ein paar Fakten dazu.</P>

              <P>Zürich ist zwar eine Hochburg für die Republik. Aber bei weitem nicht das alleinige Verbreitungsgebiet. {countFormat(geoStats.zurich)} von Ihnen wohnen dort — {Math.ceil(geoStats.zurich / geoStats.hasValue * 100)} Prozent.</P>
              <P>In Zürich ist der Kreis 4 am dichtesten mit Republik-Abonnements gepflastert. Statistisch gesehen müssen wir auf unserem Arbeitsweg zum Hotel Rothaus jeden hundertsten mit «Guten Morgen, Verleger!» oder «Guten Morgen, Verlegerin!» begrüssen.</P>
            </ScrollBlock>

            <ScrollBlock>
              <P>Auf Zürich folgen die Konkurrenzstädte Bern ({geoStats.bern} Abonnentinnen), Basel ({geoStats.basel}), Winterthur ({geoStats.winterthur}) und Luzern ({geoStats.luzern}).</P>
            </ScrollBlock>

            <ScrollBlock>
              <P>Was uns besonders freut, ist die relative Stärke der Republik am Geburtsort der Helvetischen Republik, in Aarau, mit {geoStats.aarau} Abonnenten, verstärkt durch Baden ({geoStats.baden}) und die Agglomeration von Baden ({geoStats.badenAgglo}).</P>
            </ScrollBlock>

            <ScrollBlock>
              <P>Das restliche Drittel von Ihnen verstreut sich über die ganze Schweiz.</P>
            </ScrollBlock>

            <ScrollBlock>
              <H3>Top 10 Postleitzahlen</H3>
              <List>
                {allPostalCodes.slice(0, 10).map(({postalCode, name, count}) => (
                  <Item key={postalCode}>
                    {postalCode} {name} — <Highlight>{count}</Highlight>
                  </Item>
                ))}
              </List>
            </ScrollBlock>

            <ScrollBlock>
              <P>
                Im Ausland führt {countryNames(foreignCountries.top.values)} mit {countFormat(+foreignCountries.top.key)} Republik-Mitgliedern, vor
                {' '}
                {
                  foreignCountries.list.map(group => [
                    countryNames(group.values),
                    ' mit ',
                    countFormat(+group.key)
                  ].join('')).join(', ')
                }
                {' '}Abonnements.
              </P>

              <P>Ein einziges Mitglied der Republik finden wir in {countryNames(foreignCountries.single.values)}. Ein Gruss Ihnen allen in Ihre Exklusivität und Einsamkeit!</P>
              <Label>Geometrische Grundlage: <A href='http://www.geonames.org/postal-codes/' target='_blank'>geonames.org</A></Label>
            </ScrollBlock>
          </NarrowContainer>
        </div>
        <NarrowContainer>
          <H2 style={{marginTop: 40}}>Wie alt sind Sie?</H2>

          <H3>
            16 bis 92 jährige Republik-Mitglieder
          </H3>
          <Interaction.P style={{marginBottom: 20, color: colors.secondary}}>
            Altersverteilung der <span style={{color: colors.primary}}>Republik-Mitglieder</span> im Vergleich zur Bervölkerung von <span style={{color: '#000'}}>Zürich</span> und der <span style={{color: '#9F2500'}}>Schweiz</span>.
          </Interaction.P>
          <BarChart
            title={d => `${d.age} Jahre: ${d.count} Republik-Mitgliede(r)`}
            data={paddedAges}
            color={() => '#00B400'}
            paddingLeft={40}
            xLabel='Alter'
            xTick={(d, i) => {
              if (i === 0 || d.age % 10 === 0) {
                return d.age
              }
              return ''
            }}
            referenceLines={[
              {color: 'red', data: agesCh},
              {color: '#000', data: agesZurich}
            ]} />
          <div style={{paddingTop: 10, textAlign: 'right'}}>
            <A href='https://data.stadt-zuerich.ch/dataset/bev_bestand_jahr_quartier_alter_herkunft_geschlecht'>
              <Label>Zürcher Bevölkerung 2016: Statistik Stadt Zürich</Label>
            </A>
            <br />
            <A href='https://www.bfs.admin.ch/bfs/de/home/statistiken/bevoelkerung.assetdetail.80423.html'>
              <Label>Schweizer Bevölkerung 2015: BFS STATPOP</Label>
            </A>
          </div>

          <P>
            Bei dieser Frage machten {countFormat(ageStats.noValue)} Personen (noch) keine Angabe. Von den restlichen {countFormat(ageStats.hasValue)} sind:
          </P>

          { /* <P>
            Mittelwert:{' '}<br />
            Republik: {ageStats.median}<br />
            Zürich: {staticStats.zurich.median}<br />
            Schweiz: {staticStats.ch.median}
          </P>
          <P>
            Durchschnittsalter:{' '}<br />
            Republik: {ageStats.mean}<br />
            Zürich: {staticStats.zurich.mean}<br />
            Schweiz: {staticStats.ch.mean}
          </P> */ }

          <P>
            {ageStats.below16}
            {' '}Abonnenten jünger als 16 Jahre. Bei den der Mehrheit handelt es sich allerdings nicht um frühreife Kinder, sondern um Firmenabonnements. Diese gaben ihr Gründungsjahr an.
          </P>

          <P>
            {ageStats.above100}
            {' '}Abonnentinnen älter als 100 Jahre. Wir vermuten allerdings bei den meisten Eingabefehler. Oder einen symbolischen Wink. Etwa beim Geburtsjahr 1848 - dem Gründungsjahr des Schweizerischen Bundesstaates. Oder beim 8. Dezember 1873, dem Geburtstag des <A href='https://de.wikipedia.org/wiki/Anton_Afritsch_(Journalist)'>Journalisten Anton Afritsch</A> – oder beim 19. Dezember 1878, an dem der <A href='https://de.wikipedia.org/wiki/Bayard_Taylor'>Reiseschriftsteller Bayard Taylor</A> geboren wurde.
          </P>

          <H2 style={{marginTop: 40}}>Wie schnell waren Sie?</H2>

          <P>
            Laut Theorie verlaufen Crowdfundings gern dramatisch: Am Anfang gibt es einen Höhepunkt, am Ende gibt es einen Höhepunkt, dazwischen dümpelt es vor sich hin. Die Republik machte dabei bisher keine Ausnahme.
          </P>
          <div {...styles.dateContainer}>
            {groupedCreatedAts.map(({key, values}, i) => (
              <div key={key} {...styles.dateBox} className={i < 2 ? styles.dateBoxBig : ''}>
                <BarChart
                  max={maxCreatedAt}
                  xLabel={i === 0 ? 'Zeit' : ''}
                  xTick={i < 2 && ((d) => {
                    if ((i !== 0 || d.hour) && d.hour % 6 === 0) {
                      return `${d.hour}h`
                    }
                    return ''
                  })}
                  title={d => `${d.hour}h: ${d.count}`}
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
          <br style={{clear: 'left'}} />

          <H2>
            Wie zahlten Sie?
          </H2>
          <P>
            Diese Statistik veröffentlichen wir, weil das sonst kaum eine andere Firma macht — Zahlungsdaten gelten als Geschäftsgeheimnis. Wir folgen dieser Praxis nicht — und hoffen, dass irgendwer irgendetwas aus unserer Statistik lernt.
          </P>

          <Interaction.H3>
            Zahlungsmittel der Unterstützter
          </Interaction.H3>
          <Interaction.P>
            Mit diesen Zahlungsmittel haben Sie bezahlt.
          </Interaction.P>

          <div {...styles.keyMetricContainer}>
            {paymentMethods
              .map(({method, count, details}) => {
                return (
                  <div key={method} {...styles.keyMetric}>
                    <div {...styles.keyMetricLabel}>
                      {paymentMethodNames[method]}
                    </div>
                    <div {...styles.keyMetricNumber}>
                      {count}
                    </div>
                    {details
                      .filter(({detail}) => paymentMethodDetails[detail])
                      .map(({detail, count}) => (
                        <div key={detail} {...styles.keyMetricDetail}>
                          {count} {paymentMethodDetails[detail]}
                        </div>
                      ))
                    }
                  </div>
                )
              })}
            <br style={{clear: 'left'}} />
          </div>

          <P>
            Was uns übrigens verblüffte: PayPal schlug als Zahlungsmethode die PostFinance.
          </P>

          <H2>Wieviel von Ihnen sind auf der Community-Seite dabei?</H2>
          <P>
            Enorm viel. {Math.round(testimonialStats.count / status.people * 100)} Prozent von Ihnen — {testimonialStats.count} Leute — schalteten ein Foto und einen Slogan auf Ihrer persönlichen Seite hoch.
            Danke dafür! Für die {testimonialStats.count} Fotos, die Unterstützung, die Begründungen und die Ratschläge! Stellvertretend für alle wollen wir nur eine Stimme zitieren – das vermutlich geographisch (und mental) am weitesten entfernte Mitglied, direkt aus seinem Wohnort auf dem Todesstern:
          </P>

          <TestimonialList
            limit={0}
            onSelect={() => {}}
            firstId='bbaf5f0d-3be0-4886-bd24-544f64d518ab' />

          {md(mdComponents)`
Das war alles, was wir über Sie wissen. Ausser, natürlich, noch zwei Dinge:

1. Dass Sie (Unzutreffendes streichen) entweder reich an Mut, an Vertrauen oder an Verrücktheit sind. Weil Sie Verlegerin und zukünftiger Leser eines Magazins geworden sind, von dem noch nichts existiert als ein ehrgeiziger Plan.
2. Dass wir Ihnen für Ihren Mut, Ihr Vertrauen, Ihre Verrücktheit (Unzutreffendes streichen) verpflichtet sind — jedem und jeder einzelnen von Ihnen. Wir werden hart daran arbeiten, ein Internet-Magazin zu bauen, das Sie (nicht bei jedem Artikel, aber in der Bilanz) stolz macht, das Risiko eingegangen zu sein.

Mit Dank für Ihre Kühnheit und unsere Verantwortung,

Ihre Crew von der Republik und von Project R
          `}
        </NarrowContainer>
      </div>
    )
  }
}

const DataWrapper = ({loading, error, data}) => (
  <Loader loading={loading} error={error} render={() => {
    const {
      membershipStats: {
        countries,
        ages,
        createdAts
      },
      paymentStats,
      testimonialStats,
      crowdfunding: {status}
    } = data

    const paymentMethods = []
      .concat(paymentStats.paymentMethods)
      .sort((a, b) => descending(a.count, b.count))

    const paddedAges = range(16, 101).map(age => ({
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
    const maxCreatedAt = max(createdAts, d => d.count)

    const countryIndex = countries.reduce(
      (index, country) => {
        index[country.name] = country
        return index
      },
      {}
    )

    const groupedForeignCountries = nest()
      .key(d => d.count)
      .entries(
        countries
          .filter(d => d.name && d.name !== 'Schweiz')
      )
    const foreignCountries = {
      top: groupedForeignCountries[0],
      list: groupedForeignCountries
        .slice(1, groupedForeignCountries.length - 1),
      single: groupedForeignCountries[groupedForeignCountries.length - 1]
    }

    const allPostalCodes = countries.reduce(
      (all, country) => {
        if (!country.name) {
          return all
        }
        return all.concat(country.postalCodes)
      },
      []
    ).sort((a, b) => descending(a.count, b.count))

    const sumCount = (sum, d) => sum + d.count
    const geoStats = {
      hasValue: countries.filter(d => d.name)
        .reduce(sumCount, 0),
      hasValuePercent: countries.filter(d => d.name)
        .reduce(sumCount, 0) / status.people * 100,
      zurich: countryIndex.Schweiz.postalCodes
        .filter(d => (
          d.postalCode &&
          d.postalCode.startsWith('80')
        ))
        .reduce(sumCount, 0),
      bern: countryIndex.Schweiz.postalCodes
        .filter(d => (
          d.postalCode &&
          +d.postalCode >= 3000 &&
          +d.postalCode <= 3030
        ))
        .reduce(sumCount, 0),
      basel: countryIndex.Schweiz.postalCodes
        .filter(d => (
          d.postalCode &&
          +d.postalCode >= 4000 &&
          +d.postalCode <= 4059
        ))
        .reduce(sumCount, 0),
      luzern: countryIndex.Schweiz.postalCodes
        .filter(d => (
          d.postalCode &&
          (
            +d.postalCode === 6000 ||
            +d.postalCode === 6009 ||
            +d.postalCode === 6014 ||
            +d.postalCode === 6015 ||
            (
              +d.postalCode >= 6002 &&
              +d.postalCode <= 6007
            )
          )
        ))
        .reduce(sumCount, 0),
      winterthur: countryIndex.Schweiz.postalCodes
        .filter(d => (
          d.postalCode &&
          (
            +d.postalCode === 8310 ||
            +d.postalCode === 8352 ||
            +d.postalCode === 8482 ||
            (
              +d.postalCode >= 8400 &&
              +d.postalCode <= 8411
            )
          )
        ))
        .reduce(sumCount, 0),
      aarau: countryIndex.Schweiz.postalCodes
        .filter(d => (
          d.postalCode &&
          +d.postalCode === 5000
        ))
        .reduce(sumCount, 0),
      baden: countryIndex.Schweiz.postalCodes
        .filter(d => (
          d.postalCode &&
          (
            +d.postalCode === 5400 ||
            +d.postalCode === 5405 ||
            +d.postalCode === 5406
          )
        ))
        .reduce(sumCount, 0),
      badenAgglo: countryIndex.Schweiz.postalCodes
        .filter(d => (
          d.postalCode &&
          (
            +d.postalCode === 5430 ||
            +d.postalCode === 5408
          )
        ))
        .reduce(sumCount, 0)
    }

    const paddedAgesIndividuals = ages.reduce(
      (all, {count, age}) => all.concat(
        range(count).map(() => age)
      ),
      []
    )

    const ageStats = {
      median: median(
        paddedAgesIndividuals
      ),
      mean: mean(
        paddedAgesIndividuals
      ),
      below16: ages.reduce(
        (sum, d) => sum + (
          d.age !== null && d.age < 16 ? d.count : 0
        ),
        0
      ),
      above100: ages.reduce(
        (sum, d) => sum + (
          d.age > 100 ? d.count : 0
        ),
        0
      ),
      noValue: ages
        .find(d => d.age === null)
        .count,
      hasValue: ages
        .filter(d => d.age !== null)
        .reduce(
          (sum, d) => sum + d.count,
          0
        )
    }

    return (
      <Story
        countries={countries}
        countryIndex={countryIndex}
        foreignCountries={foreignCountries}
        allPostalCodes={allPostalCodes}
        geoStats={geoStats}
        paddedAges={paddedAges}
        status={status}
        paymentMethods={paymentMethods}
        groupedCreatedAts={groupedCreatedAts}
        maxCreatedAt={maxCreatedAt}
        ageStats={ageStats}
        testimonialStats={testimonialStats} />
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
        name
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
  paymentStats {
    paymentMethods {
      method
      count
      details {
        detail
        count
      }
    }
  }
  testimonialStats {
    count
  }
}
`

export default compose(
  withT,
  graphql(membershipStats)
)(DataWrapper)
