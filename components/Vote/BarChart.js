import React from 'react'
import {css} from 'glamor'

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
  barNumberSmall: css({
    fontSize: 12
  })
}

export default ({data}) => {
  return (
    <div>
      {data.map((data) => (
        <div key={data.key}>
          <div>
            <Label>{data.key} – {countFormat(data.count)} Stimmen</Label>
          </div>
          <div {...styles.bar}>
            {data.options.map(option =>
              <div {...styles.barSegment} style={{
                width: `${option.count / data.count * 100}%`,
                backgroundColor: colors[option.name]
              }}>
                <div {...styles.barNumbers}>
                  <span {...styles.barNumberSmall}>
                    {countFormat(option.count)}
                  </span><br />
                  {Math.round(option.count / data.count * 1000) / 10}%
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
