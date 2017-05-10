import React from 'react'
import {css} from 'glamor'
import {max, sum as sumOfArray} from 'd3-array'

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
    pointerEvents: 'none',
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
  const sum = sumOfArray(data, d => d.count)
  const maxRatio = max(data, d => d.count / sum)
  const datumWidth = `${100 / data.length}%`
  const refMax = referenceLines.map(line => {
    const sum = sumOfArray(line.data, d => d.count)
    return {
      sum,
      maxRatio: max(line.data, d => d.count / sum)
    }
  })
  const overallMaxRatio = max(
    [maxRatio]
      .concat(refMax.map(m => m.maxRatio))
  )

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
              height: `${d.count / sum / overallMaxRatio * 100}%`,
              backgroundColor: color ? color(d) : undefined
            }} />
          {referenceLines.map((line, lineI) => (
            <div {...styles.line}
              key={`ref${lineI}`}
              style={{
                borderTopColor: line.color,
                height: `${line.data[i].count / refMax[lineI].sum / overallMaxRatio * 100}%`
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
