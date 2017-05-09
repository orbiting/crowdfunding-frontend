import React from 'react'
import {css} from 'glamor'
import {max} from 'd3-array'

import {
  colors
} from '@project-r/styleguide'

const styles = {
  datum: css({
    float: 'left',
    paddingLeft: 1,
    paddingRight: 1,
    height: '100%',
    position: 'relative'
  }),
  bar: css({
    backgroundColor: colors.primary,
    position: 'absolute',
    left: 1,
    right: 1,
    bottom: 0
  }),
  line: css({
    position: 'absolute',
    left: 1,
    right: 1,
    bottom: 0,
    borderTop: '1px solid'
  }),
  lineLabel: css({
    fontSize: 12,
    paddingTop: 5
  })
}

export default ({data, title, color, height = 200, referenceLines = []}) => {
  const maxCount = max(data, d => d.count)
  const datumWidth = `${100 / data.length}%`
  const refMax = referenceLines.map(line => (
    max(line.data, d => d.count)
  ))
  return (
    <div style={{height}}>
      {data.map((d, i) => (
        <div {...styles.datum}
          key={i}
          style={{
            width: datumWidth
          }}>
          <div {...styles.bar}
            title={title ? title(d) : undefined}
            style={{
              height: `${d.count / maxCount * 100}%`,
              backgroundColor: color ? color(d) : undefined
            }} />
          {referenceLines.map((line, lineI) => (
            <div {...styles.line}
              key={`ref${lineI}`}
              style={{
                borderTopColor: line.color,
                height: `${line.data[i].count / refMax[lineI] * 100}%`
              }}>
              {i === 0 && (
                <div {...styles.lineLabel} style={{color: line.color}}>
                  {line.label}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
