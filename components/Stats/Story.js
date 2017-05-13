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
  Interaction, A, Label,
  H1, H2, P, NarrowContainer,
  Field,
  fontFamilies, colors
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
  }),
  opaqueContainer: css({
    position: 'relative',
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingBottom: 100,
    marginBottom: -100
  })
}

const Spacer = () => (
  <div style={{height: '50vh', pointerEvents: 'none'}} />
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
const countryWithArticle = {
  USA: 'den USA',
  'Königreich Belgien': 'dem Königreich Belgien',
  'Niederlande': 'den Niederlanden',
  'Volksrepublik China': 'der Volksrepublik China'
}
const countryNames = values => {
  const names = values.map(d => (
    countryWithArticle[d.name] || d.name
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
  paperInvoice: 'Rechnungen per Post'
}

class Story extends Component {
  constructor (...args) {
    super(...args)

    this.state = {}
    this.refs = {}
    this.blocks = {}

    this.refKeys = 'start zh ag cities plz dach'
      .split(' ')

    this.refKeys.map(key => {
      this.blocks[key] = {
        key,
        setRef: (ref) => {
          this.blocks[key].ref = ref
        }
      }
    })

    this.onScroll = () => {
      const y = window.pageYOffset
      const cx = y + window.innerHeight / 2
      const calcDistance = block => Math.min(
        Math.abs(block.y0 - cx),
        Math.abs(block.y1 - cx)
      )
      const activeBlock = this.refKeys
        .reduce(
          (active, key) => {
            if (calcDistance(this.blocks[key]) < calcDistance(this.blocks[active])) {
              return key
            }
            return active
          }
        )

      if (this.state.activeBlock !== activeBlock) {
        this.setState({
          activeBlock
        })
      }
    }
    this.measure = () => {
      const y = window.pageYOffset
      this.refKeys.forEach(key => {
        const block = this.blocks[key]
        const {top, height} = block.ref
          .getBoundingClientRect()
        block.y0 = y + top
        block.y1 = block.y0 + height
      })
      this.onScroll()
    }
  }
  componentDidMount () {
    window.addEventListener('scroll', this.onScroll)
    window.addEventListener('resize', this.measure)
    this.measure()
  }
  componentDidUpdate () {
    this.measure()
  }
  componentWillUnmount () {
    window.removeEventListener('scroll', this.onScroll)
    window.removeEventListener('resize', this.measure)
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

    const {filter, activeBlock} = this.state

    let mapLabels = []
    let mapLabelOptions = {}
    let mapExtend = countryIndex.Schweiz.postalCodes
    switch (activeBlock) {
      case 'zh':
        mapLabelOptions.center = true
        mapLabelOptions.postalCode = true
        mapExtend = countryIndex.Schweiz.postalCodes
          .filter(d => (
            d.postalCode &&
            d.postalCode.startsWith('80')
          ))
        mapLabels = mapExtend
        break
      case 'cities':
        mapLabels = ['2502', '3006', '4058', '8400', '6005', '8032', '4600']
        mapLabelOptions.xOffset = 2
        mapExtend = countryIndex.Schweiz.postalCodes
          .filter(d => (
            d.postalCode &&
            (
              d.name === 'Bern' ||
              d.name === 'Basel' ||
              d.name === 'Winterthur' ||
              d.name === 'Luzern'
            )
          ))
        break
      case 'ag':
        mapLabels = ['5000', '5400']
        mapExtend = countryIndex.Schweiz.postalCodes
          .filter(d => (
            d.postalCode &&
            d.postalCode.startsWith('5')
          ))
        break
      case 'dach':
        mapLabels = countryIndex.Deutschland.postalCodes
          .filter(d => ['10435', '80339', '20359', '60594'].indexOf(d.postalCode) !== -1)
        const wien = countryIndex['Österreich'].postalCodes
          .find(d => d.postalCode === '1020')
        mapLabels = mapLabels.concat(
          {
            ...wien,
            name: 'Wien'
          }
        )
        const bruxelles = countryIndex['Königreich Belgien'].postalCodes
          .find(d => d.postalCode === '1000')
        mapLabels = mapLabels.concat(
          {
            ...bruxelles,
            name: 'Brüssel'
          }
        )
        mapLabelOptions.xOffset = 5
        mapExtend = []
          .concat(countryIndex.Deutschland.postalCodes)
          .concat(countryIndex['Österreich'].postalCodes)
          .concat(countryIndex.Schweiz.postalCodes)
        break
    }
    if (mapLabels.length && typeof mapLabels[0] === 'string') {
      mapLabels = allPostalCodes
        .filter(d => mapLabels.indexOf(d.postalCode) !== -1)
    }

    return (
      <div>
        <div {...styles.mapStory}>
          <div {...styles.mapFixed}>
            <PostalCodeMap
              labels={mapLabels}
              labelOptions={mapLabelOptions}
              extentData={mapExtend}
              data={allPostalCodes} />
          </div>
          <NarrowContainer>
            <Spacer />
            <div {...styles.scrollBlock}>
              <H1>Wer sind Sie?</H1>
              <P>Ladies and Gentlemen</P>

              <P>
                Wir haben zum Start der Republik einiges darüber geschrieben, wer wir sind. Nun ist ein Drittel der Kampagne vorbei. Und wir können endlich über ein wirklich interessantes Thema reden: wer Sie sind.
              </P>
            </div>

            { /* <P>{status.people} gelöste Abos gehören zur Zeit {countries.reduce((sum, d) => sum + d.count, 0)} Personen</P> */ }

            <div {...styles.scrollBlock}
              ref={this.blocks.start.setRef}>
              <H2>Wo wohnen Sie?</H2>

              <P>
                Hier also die Verteilung der Republik-Mitglieder in der Schweiz. Jeder Punkt auf der Karte repräsentiert eine Postleitzahl. Je fetter der Punkt, desto mehr von Ihnen leben dort. (Die Summe entspricht nicht ganz {countFormat(status.people)} — da nur knapp {Math.ceil(geoStats.hasValuePercent)} Prozent ihre Postadresse angaben.)
              </P>
            </div>

            <Spacer />

            <div {...styles.scrollBlock}
              ref={this.blocks.zh.setRef}>
              <P>Ein paar Fakten dazu.</P>

              <P>Zürich ist zwar eine Hochburg für die Republik. Aber bei weitem nicht das alleinige Verbreitungsgebiet. {countFormat(geoStats.zurich)} von Ihnen wohnen dort — rund {Math.round(geoStats.zurich / geoStats.hasValue * 100)} Prozent.</P>
            </div>

            <Spacer />

            <div {...styles.scrollBlock}
              ref={this.blocks.cities.setRef}>
              <P>Auf Zürich folgen die Städte Bern ({geoStats.bern} Abonnentinnen), Basel ({geoStats.basel}), Winterthur ({geoStats.winterthur}) und Luzern ({geoStats.luzern}).</P>
            </div>

            <Spacer />

            <div {...styles.scrollBlock}
              ref={this.blocks.ag.setRef}>
              <P>Was uns besonders freut, ist die relative Stärke der Republik am Geburtsort der Helvetischen Republik, in Aarau, mit {geoStats.aarau} Abonnenten, verstärkt durch Baden ({geoStats.baden}) und die Agglomeration von Baden ({geoStats.badenAgglo}).</P>
            </div>

            <Spacer />

            <div {...styles.scrollBlock}
              ref={this.blocks.plz.setRef}>
              <P>
                Weitere {countFormat(
                  countryIndex.Schweiz.count -
                  geoStats.zurich -
                  geoStats.bern -
                  geoStats.basel -
                  geoStats.winterthur -
                  geoStats.luzern -
                  geoStats.baden -
                  geoStats.badenAgglo
                )} von Ihnen verstreut sich über die ganze Schweiz.</P>

              <H3>Ihre Postleitzahlen nachschlagen</H3>
              <Field
                label='Postleitzahl'
                value={filter || ''}
                onChange={(_, value) => {
                  this.setState({
                    filter: value
                  })
                }} />
              <div style={{minHeight: 230, padding: '10px 0'}}>
                {!!filter && <List>
                  {allPostalCodes
                    .filter(({postalCode}) => postalCode && postalCode.startsWith(filter))
                    .sort((a, b) => descending(a.count, b.count))
                    .slice(0, 5)
                    .map(({postalCode, name, count}) => (
                      <Item key={postalCode}>
                        {postalCode} {name}: <Highlight>{count}</Highlight>
                      </Item>
                    ))}
                </List>}
              </div>
            </div>

            <Spacer />

            <div {...styles.scrollBlock}
              ref={this.blocks.dach.setRef}>
              <P>
                Im Ausland führt {countryNames(foreignCountries.top.values)} mit {countFormat(+foreignCountries.top.key)} Republik-Mitgliedern, vor
                {' '}
                {
                  foreignCountries.list.map(group => [
                    countryNames(group.values),
                    ` mit ${group.values.length > 1 ? 'je ' : ''}`,
                    countFormat(+group.key)
                  ].join('')).join(', ')
                }
                {' '}Abonnements.
              </P>

              <P>Ein einziges Mitglied der Republik finden wir jeweils in {countryNames(foreignCountries.single.values)}. Einen Gruss Ihnen allen in Ihre Exklusivität und Einsamkeit!</P>
              <Label>Geometrische Grundlage: <A href='http://www.geonames.org/postal-codes/' target='_blank'>geonames.org</A></Label>
            </div>
          </NarrowContainer>
        </div>
        <div {...styles.opaqueContainer}>
          <NarrowContainer>
            <H2 style={{marginTop: 40}}>Wie alt sind Sie?</H2>

            <H3>
              16- bis 92-jährige Republik-Mitglieder
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
              {' '}Abonnenten jünger als 16 Jahre. Bei der Mehrheit handelt es sich allerdings nicht um frühreife Kinder, sondern um Firmenabonnements. Diese gaben ihr Gründungsjahr an.
            </P>

            <P>
              {ageStats.above100}
              {' '}Abonnentinnen älter als 100 Jahre. Wir vermuten allerdings bei den meisten Eingabefehler. Oder einen symbolischen Wink. Etwa beim Geburtsjahr 1848 - dem Gründungsjahr des schweizerischen Bundesstaates. Oder beim 8. Dezember 1873, dem Geburtstag des <A href='https://de.wikipedia.org/wiki/Anton_Afritsch_(Journalist)'>Journalisten Anton Afritsch</A> — oder beim 19. Dezember 1878, an dem der <A href='https://de.wikipedia.org/wiki/Bayard_Taylor'>Reiseschriftsteller Bayard Taylor</A> gestorben ist.
            </P>

            <H2 style={{marginTop: 80}}>
              Welches Geschlecht haben Sie?
            </H2>

            <P>
              Wir haben uns bei anderen Anbietern immer gefragt, was das soll, wenn das m/w-Kästchen angeklickt werden muss. Und haben überdies den ehrgeizigen Plan, für Ladies wie für Gentlemen zu schreiben. Deshalb haben wir diese Frage nicht gestellt.
            </P>

            <H2 style={{marginTop: 80}}>Wie schnell waren Sie?</H2>

            <P>
              Laut Theorie verlaufen Crowdfundings gern dramatisch: Am Anfang gibt es einen Höhepunkt, am Ende gibt es einen Höhepunkt, dazwischen dümpelt es vor sich hin. Die Republik machte mit ihrem Raketenstart keine Ausnahme.
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

            <H2 style={{marginTop: 80}}>
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

            <H2 style={{marginTop: 80}}>Wieviel von Ihnen sind auf der Community-Seite dabei?</H2>
            <P>
              Enorm viele. Rund {Math.round(testimonialStats.count / status.people * 100)} Prozent von Ihnen — {testimonialStats.count} Leute — luden ein Foto und einen Slogan auf unsere Seite hoch.
              Danke dafür! Für die {testimonialStats.count} Fotos, die Unterstützung, die Begründungen und die Ratschläge! Stellvertretend für alle wollen wir nur eine Stimme zitieren — das vermutlich geografisch (und mental) am weitesten entfernte Mitglied, direkt aus seinem Bunker auf dem Todesstern:
            </P>

            <TestimonialList
              limit={0}
              onSelect={() => {}}
              firstId='bbaf5f0d-3be0-4886-bd24-544f64d518ab' />

            {md(mdComponents)`
Das war alles, was wir über Sie wissen. Ausser, natürlich, noch zwei Dinge:

1. Dass Sie (Unzutreffendes streichen) entweder reich an Mut, an Vertrauen oder an Verrücktheit sind. Weil Sie Verlegerin und zukünftiger Leser eines Magazins geworden sind, von dem noch nichts existiert als ein ehrgeiziger Plan.
2. Dass wir Ihnen für Ihren Mut, Ihr Vertrauen, Ihre Verrücktheit (Unzutreffendes streichen) verpflichtet sind — jedem und jeder Einzelnen von Ihnen. Wir werden hart daran arbeiten, ein Internet-Magazin zu bauen, das Sie (nicht bei jedem Artikel, aber in der Bilanz) stolz macht, das Risiko eingegangen zu sein.

Mit Dank für Ihre Kühnheit und unsere Verantwortung,

Ihre Crew der Republik und von Project R
            `}
          </NarrowContainer>
        </div>
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
