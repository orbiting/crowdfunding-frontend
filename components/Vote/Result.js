import React from 'react'
import {sum} from 'd3-array'
import {css} from 'glamor'

import {
  Interaction, Label
} from '@project-r/styleguide'

import {countFormat} from '../../lib/utils/formats'

import BarChart from './BarChart'
import colors from './colors'

const {H2, P} = Interaction

const styles = {
  legend: css({
    marginTop: 20,
    marginBottom: 20
  }),
  legendBadges: css({
    lineHeight: '20px',
    '& > *': {
      marginBottom: 5,
      marginRight: 5
    }
  }),
  badge: css({
    display: 'inline-block',
    verticalAlign: 'bottom',
    padding: '1px 6px',
    borderRadius: 4,
    color: '#fff'
  })
}

export default ({name, data, t}) => {
  const winner = data.options.find(o => o.winner)
  const totalVotes = sum(data.options, o => o.count)

  const bars = [
    {
      key: 'Total',
      count: totalVotes,
      options: data.options
    }
  ]

  return (
    <div>
      <H2>Resultat</H2>

      <P>
        Gewonnen hat
        {' '}
        <span {...styles.badge} style={{
          backgroundColor: colors[winner.name]
        }}>
          {t(`vote/${name}/options/${winner.name}/title`)}
        </span>
        {' '}
        mit {countFormat(winner.count)} Stimmen – rund {Math.round(winner.count / totalVotes * 1000) / 10} Prozent der Stimmen.
      </P>

      <br />
      <BarChart data={bars} />

      <div {...styles.legend}>
        <Label>Legende</Label>
        <div {...styles.legendBadges}>
          {data.options.map(option => (
            <span {...styles.badge} style={{
              backgroundColor: colors[option.name]
            }}>
              {t(`vote/${name}/options/${option.name}/title`)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
