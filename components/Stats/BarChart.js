import React from 'react'
import {css, merge} from 'glamor'
import {max, sum as sumOfArray} from 'd3-array'

import {
  colors, fontFamilies
} from '@project-r/styleguide'

const X_LABEL_HEIGHT = 20
const styles = {
  container: css({
    position: 'relative'
  }),
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
  }),
  xTick: css({
    position: 'absolute',
    bottom: -X_LABEL_HEIGHT,
    fontFamily: fontFamilies.sansSerifRegular,
    fontSize: 14,
    left: -10,
    right: -10,
    textAlign: 'center',
    color: colors.secondary,
    opacity: 0.4
  }),
  baseLine: css({
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -1,
    height: 1,
    backgroundColor: colors.divider
  })
}
styles.xLabel = merge(styles.xTick, {
  left: 0,
  textAlign: 'left'
})

export default ({
  data, title,
  max: maxValue,
  xTick, xLabel,
  color,
  height = 200, paddingLeft,
  referenceLines = []
}) => {
  const sum = sumOfArray(data, d => d.count)
  const maxRatio = maxValue
    ? maxValue / sum
    : max(data, d => d.count / sum)
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
    <div {...styles.container} style={{
      height,
      marginBottom: xTick ? X_LABEL_HEIGHT : 0,
      paddingLeft
    }}>
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
          {!!xTick && (
            <div {...styles.xTick}>
              {xTick(d, i)}
            </div>
          )}
        </div>
      ))}
      {!!xLabel && (
        <div {...styles.xLabel}>
          {xLabel}
        </div>
      )}
      <div {...styles.baseLine} />
    </div>
  )
}
