import React from 'react'
import {css} from 'glamor'
import {feature, mesh} from 'topojson-client'
import {geoPath} from 'd3-geo'

const topology = require('./data/ch-cantons.json')
const cantons = feature(topology, topology.objects.cantons).features
const cantonMesh = mesh(topology)
const path = geoPath(null)

const WIDTH = 960
const HEIGHT = 500

const styles = {
  container: css({
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
  })
}

export default ({data, fill, fillOpacity}) => (
  <div {...styles.container}>
    <svg {...styles.svg} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
      {cantons.map(canton => {
        const d = data.find(d => d.key === canton.properties.abbr)

        return (
          <path
            key={canton.properties.abbr}
            d={path(canton)}
            fill={fill}
            fillOpacity={fillOpacity(d, canton)} />
        )
      })}
      <path fill='none' stroke='#fff' strokeWidth='1.5' d={path(cantonMesh)} />
    </svg>
  </div>
)
