import React, {Component} from 'react'
import {geoAlbers} from 'd3-geo'
import {timer} from 'd3-timer'

import {
  colors, fontFamilies
} from '@project-r/styleguide'

const toGeoJson = data => ({
  type: 'FeatureCollection',
  features: data.map(d => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [d.lon, d.lat]
    }
  }))
})

class PostalCodeMap extends Component {
  constructor (...args) {
    super(...args)

    this.state = {}
    this.projection = geoAlbers()
      .rotate([0, 0])
    this.containerRef = ref => {
      this.container = ref
    }
    this.canvasRef = ref => {
      this.canvas = ref
    }
    this.measure = () => {
      const width = this.container.getBoundingClientRect().width
      const height = Math.min(width / 1.5, window.innerHeight * 0.65)

      const extentData = this.props.extentData || this.props.data
      if (
        width !== this.state.width ||
        extentData !== this.state.extentData
      ) {
        if (!this.state.extentData) {
          this.projection.fitExtent(
            [[10, 10], [width - 10, height - 10]],
            toGeoJson(extentData)
          )
          this.draw()
        } else {
          const targetProjection = geoAlbers()
            .rotate([0, 0])
            .fitExtent(
              [[10, 10], [width - 10, height - 10]],
              toGeoJson(extentData)
            )

          const currentScale = this.projection.scale()
          const targetScale = targetProjection.scale()
          const currentTranslate = this.projection.translate()
          const targetTranslate = targetProjection.translate()

          const duration = 1000
          if (this.timer) {
            this.timer.stop()
          }
          this.timer = timer(elapsed => {
            const t = Math.min(elapsed / duration, 1)
            this.projection.scale(
              currentScale * (1 - t) + targetScale * t
            )
            this.projection.translate(
              [
                currentTranslate[0] * (1 - t) + targetTranslate[0] * t,
                currentTranslate[1] * (1 - t) + targetTranslate[1] * t
              ]
            )
            this.draw()
            if (t >= 1) {
              this.timer.stop()
            }
          })
        }

        this.setState({
          width,
          height,
          extentData
        }, () => {
          this.draw()
        })
      } else {
        this.draw()
      }
    }
  }
  componentDidMount () {
    window.addEventListener('resize', this.measure)
    this.measure()
  }
  componentDidUpdate () {
    this.measure()
  }
  componentWillUnmount () {
    window.removeEventListener('resize', this.measure)
  }
  draw () {
    const {width, height} = this.state
    const {projection} = this
    const {data, labels, labelOptions} = this.props

    const devicePixelRatio = window.devicePixelRatio || 1
    this.canvas.width = width * devicePixelRatio
    this.canvas.height = height * devicePixelRatio

    const ctx = this.canvas.getContext('2d')

    ctx.scale(devicePixelRatio, devicePixelRatio)
    ctx.clearRect(0, 0, width, height)
    ctx.save()

    const scale = projection.scale()
    const radius = d => (
      Math.max(0.5, Math.sqrt(d.count) * scale * 0.00001)
    )

    ctx.beginPath()
    this.circles = data.map((d, i) => {
      const [cx, cy] = projection([d.lon, d.lat])
      const r = radius(d)

      ctx.moveTo(cx + r, cy)
      ctx.arc(cx, cy, r, 0, 2 * Math.PI)

      return {
        cx,
        cy,
        r,
        d
      }
    })
    ctx.globalAlpha = 0.1
    ctx.fillStyle = colors.primary
    ctx.fill()
    ctx.globalAlpha = 1
    ctx.strokeStyle = colors.primary
    ctx.stroke()

    if (labels.length) {
      ctx.font = `12px ${fontFamilies.sansSerifRegular}`

      ctx.textAlign = labelOptions.center ? 'center' : 'start'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = colors.primary
      ctx.strokeStyle = '#fff'

      labels.forEach((d, i) => {
        let [x, y] = projection([d.lon, d.lat])
        y -= 1
        if (!labelOptions.center) {
          x += radius(d)
        }
        if (labelOptions.xOffset) {
          x += labelOptions.xOffset
        }
        const text = labelOptions.postalCode
          ? d.postalCode : d.name

        ctx.lineWidth = 2
        ctx.strokeText(text, x, y)
        ctx.fillText(text, x, y)
      })
    }

    ctx.restore()
  }
  render () {
    const {width, height} = this.state

    return (
      <div ref={this.containerRef}>
        <canvas ref={this.canvasRef}
          style={{width, height}} />
      </div>
    )
  }
}

export default PostalCodeMap
