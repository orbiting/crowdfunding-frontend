import React, {Component} from 'react'
import {css, merge} from 'glamor'
import {feature, mesh} from 'topojson-client'
import {geoPath} from 'd3-geo'
import {scaleQuantize} from 'd3-scale'
import {extent} from 'd3-array'
import {color} from 'd3-color'

import {
  Label, fontFamilies
} from '@project-r/styleguide'

import {swissNumbers} from '../../lib/utils/formats'

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
  })
}

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
      const {width} = this.container.getBoundingClientRect()

      const legendBelow = width < 520
      if (legendBelow !== this.state.legendBelow) {
        this.setState(() => ({
          legendBelow
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
    const {legendBelow} = this.state

    const fillColor = color(fill)
    const valuesExtent = extent(
      data.map(accessor)
        .filter(Boolean)
    )
    const scale = scaleQuantize()
      .domain(valuesExtent)
      .range([
        fillColor.brighter(0.6),
        fillColor.brighter(0.3),
        fillColor,
        fillColor.darker(0.3),
        fillColor.darker(0.6)
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

    return (
      <div {...styles.container} ref={this.containerRef}>
        <div {...styles.svgContainer}>
          <svg {...styles.svg} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
            {cantons.map(canton => {
              const d = data.find(d => d.key === canton.properties.abbr)
              const value = d ? accessor(d) : 0

              return (
                <path
                  key={canton.properties.abbr}
                  d={path(canton)}
                  fill={value ? scale(value) : '#ccc'} />
              )
            })}
            <path fill='none' stroke='#fff' strokeWidth='1.5' d={path(cantonMesh)} />
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
      </div>
    )
  }
}

export default CantonMap
