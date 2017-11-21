import React from 'react'
import withData from '../lib/withData'
import Frame from '../components/Frame'

import {
  H1, H2, P, A
} from '@project-r/styleguide'

import {css} from 'glamor'
import {sum, ascending, descending} from 'd3-array'

import {nest} from 'd3-collection'
import {arc} from 'd3-shape'
import {hierarchy, partition} from 'd3-hierarchy'
import {formatLocale} from 'd3-format'

const nbspNumbers = formatLocale({
  decimal: ',',
  thousands: '\u00a0',
  grouping: [3],
  currency: ['CHF\u00a0', '']
})

const countFormat = nbspNumbers.format(',.0f')
const percentFormat = nbspNumbers.format(' 05.1%')
const graphPercentFormat = nbspNumbers.format('.1%')

const visStyles = {
  container: css({
    position: 'relative',
    height: 0,
    width: '100%',
    paddingBottom: '100%'
  }),
  svg: css({
    position: 'absolute',
    height: '100%',
    width: '100%',
    left: 0,
    top: 0
  })
}

const styles = {
  num: css({
    textAlign: 'right !important',
    fontFeatureSettings: '"tnum" 1, "kern" 1'
  }),
  groupTr: css({
    '& td, & th': {
      paddingTop: '10px !important',
      borderBottom: '1px solid #000',
      verticalAlign: 'bottom'
    },
    '&:first-child td, &:first-child th': {
      paddingTop: '0 !important'
    }
  })
}
const tableStyle = css({
  borderSpacing: '20px 0',
  minWidth: '100%',
  '@media (max-width: 600px)': {
    fontSize: 14
  },
  '@media (min-width: 321px) and (max-width: 600px)': {
    borderSpacing: '10px 0'
  },
  '& th': {
    // fontStyle: 'italic'
  },
  '& th, & td': {
    textAlign: 'left',
    verticalAlign: 'top',
    paddingTop: 3,
    paddingBottom: 3
  },
  '& tr:last-child th, & tr:last-child td': {
    borderBottom: 'none'
  }
})
const PADDING = 20

const Table = ({children}) => (
  <div style={{overflowX: 'auto', overflowY: 'hidden', marginLeft: -PADDING, marginRight: -PADDING}}>
    <table {...tableStyle}>
      {children}
    </table>
  </div>
)

const data = [
  { Kategorie: 'Project R Gen',
    'Aktionärin': 'Project R',
    Typ: 'A',
    'Nominal CHF': '0.10',
    Anzahl: '490000' },
  { Kategorie: 'Gründerteam',
    'Aktionärin': 'Susanne Sugimoto',
    Typ: 'A',
    'Nominal CHF': '0.10',
    Anzahl: '70000' },
  { Kategorie: 'Gründerteam',
    'Aktionärin': 'Laurent Burst',
    Typ: 'A',
    'Nominal CHF': '0.10',
    Anzahl: '70000' },
  { Kategorie: 'Gründerteam',
    'Aktionärin': 'Nadja Schnetzler',
    Typ: 'A',
    'Nominal CHF': '0.10',
    Anzahl: '70000' },
  { Kategorie: 'Gründerteam',
    'Aktionärin': 'Christof Moser',
    Typ: 'A',
    'Nominal CHF': '0.10',
    Anzahl: '70000' },
  { Kategorie: 'Gründerteam',
    'Aktionärin': 'Constantin Seibt',
    Typ: 'A',
    'Nominal CHF': '0.10',
    Anzahl: '70000' },
  { Kategorie: 'Gründerteam',
    'Aktionärin': 'Clara Vuillemin',
    Typ: 'A',
    'Nominal CHF': '0.10',
    Anzahl: '40000' },
  { Kategorie: 'Gründerteam',
    'Aktionärin': 'Patrick Recher',
    Typ: 'A',
    'Nominal CHF': '0.10',
    Anzahl: '40000' },
  { Kategorie: 'Gründerteam',
    'Aktionärin': 'Thomas Preusse',
    Typ: 'A',
    'Nominal CHF': '0.10',
    Anzahl: '10000' },
  { Kategorie: 'Gründerteam',
    'Aktionärin': 'Richard Höchner',
    Typ: 'A',
    'Nominal CHF': '0.10',
    Anzahl: '10000' },
  { Kategorie: 'Gründerteam',
    'Aktionärin': 'Sylvie Reinhard',
    Typ: 'A',
    'Nominal CHF': '0.10',
    Anzahl: '10000' },
  { Kategorie: 'Gründerteam',
    'Aktionärin': 'François Zosso',
    Typ: 'A',
    'Nominal CHF': '0.10',
    Anzahl: '10000' },
  { Kategorie: 'Gründerteam',
    'Aktionärin': 'David Schärer',
    Typ: 'A',
    'Nominal CHF': '0.10',
    Anzahl: '10000' },
  { Kategorie: 'Gründerteam',
    'Aktionärin': 'Tobias Peier',
    Typ: 'A',
    'Nominal CHF': '0.10',
    Anzahl: '10000' },
  { Kategorie: 'Eigenaktien Republik',
    'Aktionärin': 'Republik AG',
    Typ: 'A',
    'Nominal CHF': '0.10',
    Anzahl: '20000' },
  { Kategorie: 'Geldgeber',
    'Aktionärin': 'Gebrüder Meili',
    Typ: 'B',
    'Nominal CHF': '0.40',
    Anzahl: '26111' },
  { Kategorie: 'Geldgeber',
    'Aktionärin': 'Mettiss AG',
    Typ: 'B',
    'Nominal CHF': '0.40',
    Anzahl: '4445' },
  { Kategorie: 'Geldgeber',
    'Aktionärin': 'Steff Fischer',
    Typ: 'B',
    'Nominal CHF': '0.40',
    Anzahl: '2778' }
]

const r = 250
const layout = partition()
  .size([2 * Math.PI, r * r])

const startAngle = d => d.x0
const endAngle = d => d.x1

const arcGenerator = arc()
  .startAngle(startAngle)
  .endAngle(endAngle)
  .innerRadius(d => Math.sqrt(d.y0))
  .outerRadius(d => Math.sqrt(d.y1))

const groupped = hierarchy({
  children: nest()
    .key(d => d.Kategorie)
    .entries(data)
    .map(d => {
      if (d.values.length > 1) {
        return {
          ...d.values[0],
          Anzahl: undefined,
          children: d.values
        }
      }
      return d.values[0]
    })
}).sum(d => d.Anzahl)

const visSort = {
  Geldgeber: 2,
  Gründerteam: 1,
  'Eigenaktien Republik': 3,
  'Project R Gen': 4
}

const grouppedVis = groupped
  .copy()
  .sort((a, b) => ascending(visSort[a.data.Kategorie], visSort[b.data.Kategorie]) || descending(a.value, b.value))

const legend = []
  .concat(groupped.children)
  .sort((a, b) => descending(a.value, b.value))

const total = sum(data, d => +d.Anzahl)
const totalChf = sum(data, d => +d.Anzahl * d['Nominal CHF'])

const colors = {
  Geldgeber: 'rgb(157, 38, 14)',
  Gründerteam: 'rgb(54, 71, 63)',
  'Eigenaktien Republik': '#979797',
  'Project R Gen': 'rgb(65, 171, 29)'
}

const computeTextRotation = (d) => {
  const rad = startAngle(d) + (endAngle(d) - startAngle(d)) / 2
  const ang = rad * (180 / Math.PI) - 90

  return ang > 85 ? ang + 180 : ang
}

export default withData(({url}) => {
  const meta = {
    title: 'Aktionariat',
    description: ''
  }

  const arcs = layout(grouppedVis).descendants().filter(d => d.data.Kategorie)

  return (
    <Frame url={url} meta={meta} indented>
      <H1>
        Aktionariat
      </H1>
      <H2>
        Aktionariat Republik&nbsp;AG nach Anzahl Stimmen
      </H2>

      <div style={{maxWidth: r * 2, margin: '20px 0'}}>
        <div {...visStyles.container}>
          <svg viewBox={`-${r * 1} -${r * 1} ${r * 2} ${r * 2}`} width='100%' {...visStyles.svg}>
            {arcs.map((d, i) =>
              <path key={i}
                d={arcGenerator(d)}
                fill={colors[d.data.Kategorie]}
                stroke='#fff' />
            )}
            {arcs.filter(d => d.depth === 1 || (d.value / total) > 0.01).map((d, i) => {
              const centroid = arcGenerator.centroid(d)
              const rotate = computeTextRotation(d)

              const transform = `translate(${centroid}) rotate(${rotate})`
              return [
                <text key={`text${i}`}
                  dy='.35em'
                  fill='#fff'
                  textAnchor='middle'
                  fontSize={12}
                  transform={transform}>
                  {graphPercentFormat(d.value / total)}
                </text>
              ]
            })}
            <g transform={`translate(-65, -45)`}>
              {legend.map((group, i) => (
                <g transform={`translate(0, ${i * 20})`}>
                  <rect width={15} height={15} fill={colors[group.data.Kategorie]} />
                  <text x={20} dy='.8em' fill={colors[group.data.Kategorie]} style={{fontWeight: 'bold'}}>
                    {group.data.Kategorie}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>
      </div>

      <H2>Alle Aktionärinnen</H2>
      <Table>
        <thead>
          <tr>
            <th>Aktionärin</th>
            <th {...styles.num}>Anzahl</th>
            <th {...styles.num}>Stimmen</th>
            <th {...styles.num}>Kaptial</th>
          </tr>
        </thead>
        <tbody>
          {groupped.children.map((group, i) => {
            const elements = [
              <tr key={i} {...styles.groupTr}>
                <td style={{lineHeight: '1.3em'}}>
                  <strong style={{color: colors[group.data.Kategorie]}}>
                    {group.data.Kategorie.replace(/ /g, '\u00a0')}
                  </strong>
                  <br />
                  <span style={{fontSize: 12}}>
                    Typ&nbsp;{group.data.Typ}, CHF&nbsp;{group.data['Nominal CHF']}
                  </span>
                </td>
                <th {...styles.num}>{countFormat(group.value)}</th>
                <th {...styles.num}>{percentFormat(group.value / total)}</th>
                <th {...styles.num}>{percentFormat(group.value * group.data['Nominal CHF'] / totalChf)}</th>
              </tr>
            ]

            if (group.children) {
              group.children.forEach((entity, i) => {
                elements.push(
                  <tr key={`entity${i}`}>
                    <td>{entity.data.Aktionärin}</td>
                    <td {...styles.num}>{countFormat(entity.value)}</td>
                    <td {...styles.num}>{percentFormat(entity.value / total)}</td>
                    <td {...styles.num}>{percentFormat(entity.value * entity.data['Nominal CHF'] / totalChf)}</td>
                  </tr>
                )
              })
            }

            return elements
          })}
          <tr {...styles.groupTr}>
            <th>Total</th>
            <th {...styles.num}>{countFormat(total)}</th>
            <th {...styles.num}>100.0%</th>
            <th {...styles.num}>100.0%</th>
          </tr>
        </tbody>
      </Table>

      <P>
        Für Auskünfte kontaktieren Sie Susanne Sugimoto, Geschäftsführung und Kommunikation:
        {' '}
        <A href='mailto:susanne.sugimoto@republik.ch'>susanne.sugimoto@republik.ch</A>
      </P>
    </Frame>
  )
})
