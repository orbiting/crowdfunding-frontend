import React from 'react'
import {css, merge} from 'glamor'

import {countFormat} from '../../lib/utils/formats'

import {
  Label
} from '@project-r/styleguide'

import colors from './colors'

const styles = {
  bar: css({
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

export default ({data, t, compact}) => {
  const barHeight = compact ? 20 : undefined

  return (
    <div>
      {data.map((data) => (
        <div key={data.key}>
          <div>
            <Label>
              {!data.key || data.key === 'null'
                ? t('vote/result/noValue')
                : data.key
              }
              {' – '}
              {t.pluralize('vote/result/votes', {
                count: data.count,
                formattedCount: countFormat(data.count)
              })}
            </Label>
          </div>
          <div {...styles.bar}>
            {data.options.map(option => {
              const percent = `${Math.round(option.count / data.count * 1000) / 10}%`
              return (
                <div key={option.name} {...styles.barSegment} style={{
                  width: `${option.count / data.count * 100}%`,
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
      ))}
    </div>
  )
}
