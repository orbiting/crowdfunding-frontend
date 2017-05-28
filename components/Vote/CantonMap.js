import React, {Component} from 'react'
import {css, merge} from 'glamor'
import {feature, mesh} from 'topojson-client'
import {geoPath} from 'd3-geo'
import {scaleQuantize} from 'd3-scale'
import {extent} from 'd3-array'
import {color} from 'd3-color'

import {
  Label, fontFamilies, colors
} from '@project-r/styleguide'

import ContextBox, {ContextBoxValue} from '../Stats/ContextBox'

import {swissNumbers, countFormat} from '../../lib/utils/formats'

const topology = require('./data/ch-cantons.json')
const cantons = feature(topology, topology.objects.cantons).features
const cantonMesh = mesh(topology)
const path = geoPath(null)

const WIDTH = 960
const HEIGHT = 500

const styles = {
  container: css({
    position: 'relative',
    paddingTop: 10
  }),
  svgContainer: css({
    position: 'relative',
    height: 0,
    width: '100%',
    paddingBottom: `${HEIGHT / WIDTH * 100}%`
  }),
  svg: css({
    position: 'absolute',
    height: '100%',
    width: '100%',
    left: 0,
    top: 0
  }),
  legendItems: css({
    position: 'absolute',
    right: 0,
    top: 0,
    fontSize: 12,
    lineHeight: 1.2,
    fontFamily: fontFamilies.sansSerifRegular,
    fontFeatureSettings: '"tnum" 1, "kern" 1'
  }),
  legendItemsBelow: css({
    position: 'relative',
    top: 'auto',
    right: 'auto',
    paddingTop: 10
  }),
  legendItem: css({
    display: 'inline-block',
    position: 'relative',
    whiteSpace: 'nowrap',
    paddingLeft: 13,
    marginRight: 10
  }),
  legendColor: css({
    display: 'inline-block',
    position: 'absolute',
    left: 0,
    top: 4,
    width: 8,
    height: 8
  }),
  noInteraction: css({
    pointerEvents: 'none'
  }),
  noSelect: css({
    userSelect: 'none'
  })
}

const ZERO_COLOR = '#ccc'
const NA_COLOR = colors.error

const numberFormat = swissNumbers.format('05.1%')

class CantonMap extends Component {
  constructor (...args) {
    super(...args)

    this.state = {
      legendBelow: false
    }
    this.containerRef = ref => {
      this.container = ref
    }
    this.measure = () => {
      let {width} = this.container.getBoundingClientRect()

      if (
        width !== this.state.width
      ) {
        this.setState(() => ({
          width
        }))
      }
    }
  }
  componentDidMount () {
    window.addEventListener('resize', this.measure)
    this.measure()
  }
  componentWillUnmount () {
    window.removeEventListener('resize', this.measure)
  }
  render () {
    const {data, fill, accessor, t} = this.props
    const {width, hover} = this.state
    const legendBelow = width < 520

    const fillColor = color(fill)
    const dataValues = data.map(d => accessor(d) / d.count)
    const valuesExtent = extent(
      dataValues
        .filter(Boolean)
    )
    const scale = scaleQuantize()
      .domain(valuesExtent)
      .range([
        fillColor.brighter(0.8),
        fillColor.brighter(0.4),
        fillColor,
        fillColor.darker(0.4),
        fillColor.darker(0.8)
      ])
    const range = scale.range()
    const legendItems = range.map((value, i) => {
      const extent = scale.invertExtent(value)
      const safeExtent = [
        extent[0] === undefined
          ? valuesExtent[0]
          : extent[0],
        extent[1] === undefined || i === range.length - 1
          ? valuesExtent[1]
          : (extent[1] - 0.001)
      ]
      return {
        value: scale(safeExtent[0]),
        label: `${numberFormat(safeExtent[0])} - ${numberFormat(safeExtent[1])}`
      }
    })
    const hasZero = dataValues.find(value => value === 0) !== undefined
    if (hasZero) {
      legendItems.push({
        value: ZERO_COLOR,
        label: t.pluralize('vote/result/votes', {
          count: 0,
          formattedCount: '0'
        })
      })
    }
    const hasMissingCantons = cantons.find(canton => !data.find(d => d.key === canton.properties.abbr))
    if (hasMissingCantons) {
      legendItems.push({
        value: NA_COLOR,
        label: t('vote/result/labels/null')
      })
    }
    const others = data.find(d => d.key === 'others')

    const blur = () => {
      this.setState(() => ({
        hover: undefined
      }))
    }

    return (
      <div {...styles.container} ref={this.containerRef}>
        <div {...styles.svgContainer}>
          <svg {...styles.svg} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
            {cantons.map(canton => {
              const d = data.find(d => d.key === canton.properties.abbr)
              const count = d ? accessor(d) : undefined

              let fill
              if (count) {
                fill = scale(count / d.count)
              } else if (count === 0) {
                fill = ZERO_COLOR
              } else {
                fill = NA_COLOR
              }
              const focus = (event) => {
                const {top, left} = this.container.getBoundingClientRect()

                const rect = event.target.getBoundingClientRect()
                const x = rect.left + rect.width / 2 - left
                const y = rect.top - top

                this.setState(() => ({
                  hover: {
                    canton,
                    count,
                    d,
                    y,
                    x
                  }
                }))
              }

              return (
                <path
                  key={canton.properties.abbr}
                  onTouchStart={focus}
                  onTouchEnd={blur}
                  onMouseEnter={focus}
                  onMouseLeave={blur}
                  {...styles.noSelect}
                  d={path(canton)}
                  fill={fill} />
              )
            })}
            <path {...styles.noInteraction}
              fill='none'
              stroke='#fff'
              strokeWidth='1.5'
              d={path(cantonMesh)} />
            {!!hover && (
              <path {...styles.noInteraction}
                key={`hover-${hover.canton.properties.abbr}`}
                fill='none'
                stroke='#000'
                strokeWidth='2'
                d={path(hover.canton)} />
            )}
          </svg>
        </div>
        <div {...merge(styles.legendItems, legendBelow && styles.legendItemsBelow)}>
          <Label>{t('vote/result/mapLegend')}</Label><br />
          {legendItems.map((legendItem, i) => (
            <span key={i}>
              <span {...styles.legendItem}>
                <span {...styles.legendColor}
                  style={{backgroundColor: legendItem.value}} />
                {legendItem.label}
              </span>
              {legendBelow ? ' ' : <br />}
            </span>
          ))}
        </div>
        {!!others && (
          <div style={{marginTop: 5}}>
            <Label>{t('vote/result/unkownVotes', {count: accessor(others)})}</Label>
          </div>
        )}
        {!!hover && (
          <ContextBox
            orientation='top'
            x={hover.x}
            y={hover.y - 10}
            contextWidth={width}>
            <ContextBoxValue
              label={hover.canton.properties.name}>
              {hover.d
                ? [
                  `${numberFormat(hover.count / hover.d.count)}`,
                  `(${t.pluralize('vote/result/votes', {
                    count: hover.count,
                    formattedCount: countFormat(hover.count)
                  })})`
                ].join(' ')
                : t('vote/result/labels/null')
              }
            </ContextBoxValue>
          </ContextBox>
        )}
      </div>
    )
  }
}

export default CantonMap
