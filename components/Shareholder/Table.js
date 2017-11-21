import React from 'react'
import {css} from 'glamor'
import {formatLocale} from 'd3-format'

import {groupped, total, totalChf, colors} from './data'

const nbspNumbers = formatLocale({
  decimal: ',',
  thousands: '\u00a0',
  grouping: [3],
  currency: ['CHF\u00a0', '']
})
const countFormat = nbspNumbers.format(',.0f')
const percentFormat = nbspNumbers.format(' 05.1%')

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
  }),
  table: css({
    borderSpacing: '20px 0',
    minWidth: '100%',
    '@media (max-width: 600px)': {
      fontSize: 14
    },
    '@media (min-width: 321px) and (max-width: 600px)': {
      borderSpacing: '10px 0'
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
}

const PADDING = 20

const Table = ({children}) => (
  <div style={{overflowX: 'auto', overflowY: 'hidden', marginLeft: -PADDING, marginRight: -PADDING}}>
    <table {...styles.table}>
      {children}
    </table>
  </div>
)

export default () => (
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
        <th {...styles.num}>100,0%</th>
        <th {...styles.num}>100,0%</th>
      </tr>
    </tbody>
  </Table>
)
