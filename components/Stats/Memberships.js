import React from 'react'
import {gql, graphql} from 'react-apollo'
import {compose} from 'redux'
import {range, descending, mean, median} from 'd3-array'
import {nest} from 'd3-collection'
import {css} from 'glamor'
import md from 'markdown-in-js'

import withT from '../../lib/withT'
import mdComponents from '../../lib/utils/mdComponents'

import Loader from '../Loader'
import {ListWithQuery as TestimonialList} from '../Testimonial/List'

import BarChart from './BarChart'
import PostalCodeMap from './Map'

import {
  Interaction, A, Label, colors,
  H1, H2, P
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
  keyMetric: css({
    float: 'left',
    width: '25%'
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

const agesZurich = require('./data/agesZurich.json')
const agesCh = require('./data/agesCh.json')
const staticStats = require('./data/staticStats.json')

const paymentMethodNames = {
  STRIPE: 'Visa/Mastercard',
  PAYMENTSLIP: 'Einzahlungsschein',
  PAYPAL: 'PayPal',
  POSTFINANCECARD: 'PostFinance Card'
}

const Memberships = ({loading, error, data}) => (
  <Loader loading={loading} error={error} render={() => {
    const {
      membershipStats: {
        countries,
        ages,
        createdAts
      },
      paymentStats,
      crowdfunding: {status}
    } = data

    const paymentMethods = []
      .concat(paymentStats.paymentMethods)
      .sort((a, b) => descending(a.count, b.count))

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

    const countryIndex = countries.reduce(
      (index, country) => {
        index[country.name] = country
        return index
      },
      {}
    )

    const dachData = []
      .concat(countryIndex.Deutschland.postalCodes)
      .concat(countryIndex['Österreich'].postalCodes)
      .concat(countryIndex.Schweiz.postalCodes)

    const paddedAgesIndividuals = ages.reduce(
      (all, {count, age}) => all.concat(
        range(count).map(() => age)
      ),
      []
    )

    return (
      <div>
        <H1>Wer sind Sie?</H1>
        <P>Ladies and Gentlemen,</P>

        <P>
          wir haben zum Start der Republik einiges darüber geschrieben, wer wir sind. Nun ist ein Drittel der Kampagne Geschichte. Und wir können endlich über ein noch interessanteres Thema reden: Wer Sie sind.
        </P>

        <P>
          Hier also das vorläufige Zwischenergebnis, erhoben beim Stand von {countFormat(status.people)} Mitgliedern. Sie erhalten nun die Antworten zu den Fragen, wo Sie wohnen, wie alt Sie sind, wie schnell Sie an Bord kamen und wie seriös Ihre Zahlungsmoral war.
        </P>

        { /* <P>{status.people} gelöste Abos gehören zur Zeit {countries.reduce((sum, d) => sum + d.count, 0)} Personen</P> */ }

        <H2>Wo wohnen Sie?</H2>

        <PostalCodeMap
          allowFilter
          data={
            countryIndex.Schweiz.postalCodes
          } />

        <P>
          Jeder Punkt auf der Karte repräsentiert eine Postleitzahl. Je fetter der Punkt, desto mehr von Ihnen leben dort. (Die Summe entspricht nicht ganz {countFormat(status.people)} — da nur knapp {Math.ceil(countries.filter(d => d.name).reduce((sum, d) => sum + d.count, 0) / status.people * 100)} Prozent ihre Postadresse angaben.)
        </P>

        <P>Ein paar Fakten dazu.</P>

        <P>Zürich ist zwar eine Hochburg für die Republik. Aber bei weitem nicht das alleinige Verbreitungsgebiet. 3216 von Ihnen wohnen dort — also fast exakt ein Drittel.</P>
        <PostalCodeMap
          data={
            countryIndex.Schweiz
              .postalCodes.filter(c => (
                c.postalCode &&
                c.postalCode.startsWith('80')
              ))
          } />
        <P>In Zürich ist der Kreis 4 am dichtesten mit Republik-Abonnements gepflastert. Statistisch gesehen müssen wir auf unserem Arbeitsweg zum Hotel Rothaus jeden hundertsten mit „Guten Morgen, Verleger!“ oder „Guten Morgen, Verlegerin!“ begrüssen.</P>
        <P>Auf Zürich folgen die Konkurrenzstädte Bern (965 Abonnentinnen), Basel (438), Winterthur (206) und — leicht abgeschlagen — Luzern (85).</P>
        <PostalCodeMap
          data={
            countryIndex.Schweiz.postalCodes
          } />
        <P>Was uns besonders freut, ist die relative Stärke der Republik am Geburtsort der Helvetischen Republik, in Aarau, mit 87 Abonnenten, verstärkt durch Baden (69) und die Agglomeration von Baden (44).</P>
        <PostalCodeMap
          data={
            countryIndex.Schweiz
              .postalCodes.filter(c => (
                c.postalCode &&
                c.postalCode.startsWith('5')
              ))
          } />
        <P>Das restliche Drittel von Ihnen verstreut sich über die ganze Schweiz.</P>

        <PostalCodeMap
          data={dachData} />

        <P>Im Ausland führt Deutschland mit 102 Republik-Mitgliedern, vor Lichtenstein mit 17, Österreich mit 12, der USA mit 11, Belgien und Italien mit 4, Spanien und Norwegen mit 3, Austalien, Dänemark, Griechenland, Hong Kong, Japan, Holland, Thailand, Grossbritannien und China mit 2 Abonnements.</P>

        <ul>
          {countries.map(({name, count, postalCodes}) => (
            <li key={name}>
              {name || '(noch) Kein Angabe'} {count}
            </li>
          ))}
        </ul>

        <P>Einen einziges Mitglied der Republik finden wir in Georgien, Uruguay, Ägypten, Kanada, Kolumbien, Korea, Mexiko, Puerto Rico, Singapur, Taiwan, Myanmar und Malawi. Ein Gruss Ihnen allen in Ihre Exklusivität und Einsamkeit!</P>

        <br /><br />
        <H2>Wie alt sind Sie?</H2>
        <P>
          Bei dieser Frage machten {countFormat(ages.find(d => d.age === null).count)} Personen (noch) keine Angabe. Von den restlichen {countFormat(ages.filter(d => d.age !== null).reduce((sum, d) => sum + d.count, 0))} sind:
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

        <P>
          Mittelwert:{' '}<br />
          Republik: {median(
            paddedAgesIndividuals
          )}<br />
          Zürich: {staticStats.zurich.median}<br />
          Schweiz: {staticStats.ch.median}
        </P>
        <P>
          Durchschnittsalter:{' '}<br />
          Republik: {mean(
            paddedAgesIndividuals
          )}<br />
          Zürich: {staticStats.zurich.mean}<br />
          Schweiz: {staticStats.ch.mean}
        </P>

        <P>
          {ages.reduce(
            (sum, d) => sum + (
              d.age !== null && d.age < 16 ? d.count : 0
            ),
            0
          )}
          {' '}Abonnenten jünger als 16 Jahre. Bei den der Mehrheit handelt es sich allerdings nicht um frühreife Kinder, sondern um Firmenabonnements. Diese gaben ihr Gründungsjahr an.
        </P>

        <P>
          {ages.reduce(
            (sum, d) => sum + (
              d.age > 99 ? d.count : 0
            ),
            0
          )}
          {' '}Abonnentinnen älter als 99 Jahre. Wir vermuten allerdings bei den meisten Eingabefehler. Oder einen symbolischen Wink. Etwa beim Geburtsjahr 1848 — dem Gründungsjahr des Schweizerischen Bundesstaates. Oder beim 8. Dezember 1873, dem Geburtstag des <A href='https://de.wikipedia.org/wiki/Anton_Afritsch_(Journalist)'>Journalisten Anton Afritsch</A> – oder beim 19. Dezember 1878, an dem der <A href='https://de.wikipedia.org/wiki/Bayard_Taylor'>Reiseschriftsteller Bayard Taylor</A> geboren wurde.
        </P>

        <P>Am stärksten gefragt ist die Republik in der Altersgruppe um 33 Jahre. Das Durchschnittsalter unserer Leser und Leserinnen beträgt 44. Exakt bei diesem Alter folgt in der Statistik übrigens — für ein Internet-Medium nicht unerwartet — ein deutlicher Knick.
        </P>

        <P>Im Ganzen ist die Leserschaft der Republik einen Hauch reifer als die Bevölkerung von Zürich — aber einiges jünger als die Gesamtbevölkerung der Schweiz.
        </P>

        <H2 style={{marginTop: 40}}>Wie schnell waren Sie?</H2>

        <P>
          Laut Theorie verlaufen Crowdfundings gern dramatisch: Am Anfang gibt es einen Höhepunkt, am Ende gibt es einen Höhepunkt, dazwischen dümpelt es vor sich hin. Die Republik machte dabei bisher keine Ausnahme. Hier die Abonnementskurve vom 26. April bis 1. Mai:
        </P>
        <div {...styles.dateContainer}>
          {groupedCreatedAts.map(({key, values}, i) => (
            <div {...styles.dateBox} className={i < 2 ? styles.dateBoxBig : ''}>
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
        <br style={{clear: 'left'}} />

        <P>
          Hier noch ein paar bemerkenswerte Momente:
          Das offizielle Ziel von 3000 Mitgliedern und 750000 Franken erreichte die Republik: Nach 7 Stunden 49 Minuten.
          Der Schweizer Rekord für Crowdfundings fiel nach: xxxxxxxx
          Den Weltrekord für Medien-Crowdfundings erreichten wir um: xxxxxxxx
          Mitglied Nummer 10’000 registrierte sich etwa um:
        </P>

        <H2>
          Wie zuverlässig zahlten Sie?
        </H2>

        <P>
          Der irische Dichter, Trinker (und IRA-Anhänger) Brendan Behan sagte einmal: „Möge die gebende Hand nie zittern!“
          Behan wäre stolz auf Sie gewesen. Von 2,8 Millionen Franken sind bis jetzt, noch mitten im Crowdfunding, nur 200’000 Franken ausstehend. Das ist, laut Experten, ein verblüffend kleiner Betrag.
          Danke für Ihre Schnelligkeit – wir werden versuchen, uns daran ab Januar 2018 beim Einhalten von Redaktionsschlüssen zu erinnern!
        </P>

        <H2>
          Wie zahlten Sie?
        </H2>
        <P>
          Diese Statistik veröffentlichen wir, weil das sonst kaum eine andere Firma macht — Zahlungsdaten gelten als Geschäftsgeheimnis. Wir folgen dieser Praxis nicht — und hoffen, dass irgendwer irgendetwas aus unserer Statistik lernt.
        </P>

        {paymentMethods
          .map(({method, count, details}) => {
            return (
              <div key={method} {...styles.keyMetric}>
                {paymentMethodNames[method]}<br />
                {count}<br />
                {details.map(({detail, count}) => (
                  <span>
                    {detail} {count}
                    <br />
                  </span>
                ))}
              </div>
            )
          })}
        <br style={{clear: 'left'}} />

        <P>
          Was uns übrigens verblüffte: Paypal schlug als Zahlungsmethose die Postfinance. (Vielleicht ein Hinweis, dass Postfinance ihre verblüffend unschöne und kundenunfreundliche Zahlungs-Website überarbeiten sollte.)
        </P>

        <H2>Wieviel von Ihnen sind auf der Community-Seite dabei?</H2>
        <P>
          Enorm viel. Fast ein Drittel von Ihnen — über 3000 Leute — schalteten ein Foto und einen Slogan auf Ihrer persönlichen Seite hoch.
          Danke dafür! Für die über 3000 Fotos, die Unterstützung, die Begründungen und die Ratschläge! Stellvertretend für alle wollen wir nur eine Stimme zitieren – das vermutlich geographisch (und mental) am weitesten entfernte Mitglied, direkt aus seinem Wohnort auf dem Todesstern:
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

((( Namen )))

PS: Falls Ihnen noch jemand einfällt, der Ihre Vorliebe für Mut, Vertrauen oder Verrücktheit teilt (Unzutreffendes — Sie wissen schon!), weisen Sie die Person auf folgende Website hin: [www.republik.ch](https://www.republik.ch/)

Denn eine Republik wird nie von wenigen gegründet, sondern von vielen.
  `}
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
}
`

export default compose(
  withT,
  graphql(membershipStats)
)(Memberships)
