import React from 'react'
import {css, merge} from 'glamor'
import {ascending} from 'd3-array'

import {countFormat} from '../../lib/utils/formats'

import {
  Label
} from '@project-r/styleguide'

import colors from './colors'

const styles = {
  label: css({
    marginBottom: 1
  }),
  bar: css({
    marginBottom: 12
  }),
  barSegment: css({
    backgroundColor: 'gray',
    float: 'left',
    height: 50,
    position: 'relative'
  }),
  barNumbers: css({
    '* > &': {
      position: 'absolute',
      top: 0,
      left: 0
    },
    '*:last-child > &': {
      position: 'absolute',
      top: 0,
      left: 'auto',
      right: 0,
      textAlign: 'right'
    },
    color: '#fff',
    padding: 5
  }),
  barNumbersCompact: css({
    padding: '3px 5px',
    lineHeight: '12px'
  }),
  barNumberSmall: css({
    fontSize: 12
  })
}

export default ({data, order, t, compact}) => {
  const barHeight = compact ? 20 : undefined

  return (
    <div>
      {data.map(row => {
        const orderedOptions = [].concat(row.options)
        if (order) {
          orderedOptions.sort((a, b) => (
            ascending(
              order.indexOf(a.name),
              order.indexOf(b.name)
            )
          ))
        }
        return (
          <div key={row.key}>
            <div {...styles.label}>
              <Label>
                {
                  t(`vote/result/labels/${row.key}`, undefined, row.key)
                }
                {' – '}
                {t.pluralize('vote/result/votes', {
                  count: row.count,
                  formattedCount: countFormat(row.count)
                })}
              </Label>
            </div>
            <div {...styles.bar}>
              {orderedOptions.map(option => {
                const percent = `${Math.round(option.count / row.count * 1000) / 10}%`
                return (
                  <div key={option.name} {...styles.barSegment} style={{
                    width: `${option.count / row.count * 100}%`,
                    backgroundColor: colors[option.name],
                    height: barHeight
                  }}>
                    <div {...merge(styles.barNumbers, compact && styles.barNumbersCompact)}>
                      <span {...styles.barNumberSmall}>
                        {compact
                          ? percent
                          : countFormat(option.count)
                        }
                      </span><br />
                      {!compact && percent}
                    </div>
                  </div>
                )
              })}
            </div>
            <br style={{clear: 'left'}} />
          </div>
        )
      })}
    </div>
  )
}
