import React, {Component} from 'react'
import {css} from 'glamor'
import Link from 'next/link'
import 'glamor/reset'
import Router from 'next/router'

import track from '../../lib/piwik'

import IconLink from '../IconLink'
import Newsletter from './PureNewsletter'

import {
  mediaQueries, fontFamilies
} from '@project-r/styleguide'

import {
  COUNTDOWN_DATE
} from '../../constants'

css.global('html', {boxSizing: 'border-box'})
css.global('*, *:before, *:after', {boxSizing: 'inherit'})

const EMAIL = 'kontakt@republik.ch'

export const SPACE = 60

const linkRule = css({
  textDecoration: 'none',
  color: 'inherit',
  ':hover': {
    opacity: 0.6
  }
})

export const A = ({children, ...props}) => (
  <a {...props} {...linkRule}>{children}</a>
)

const styles = {
  container: css({
    marginTop: SPACE * 2,
    paddingBottom: SPACE,
    textAlign: 'center'
  }),
  nav: css({
    marginTop: SPACE,
    marginBottom: SPACE,
    [mediaQueries.mUp]: {
      marginTop: SPACE,
      marginBottom: SPACE * 2
    }
  }),
  mainNav: css({
    fontFamily: fontFamilies.sansSerifRegular,
    fontSize: 44,
    lineHeight: '60px'
  }),
  address: css({
    lineHeight: 1.6,
    fontStyle: 'normal'
  })
}

class Footer extends Component {
  componentDidMount () {
    Router.onRouteChangeComplete = (url) => {
      clearTimeout(this.timeout)
      this.setState({loading: false})

      // update url manually, seems necessary after client navigation
      track(['setCustomUrl', window.location.href])
      track(['trackPageView'])
    }
  }
  componentWillUnmount () {
    Router.onRouteChangeComplete = null
  }
  render () {
    const {url, inverted} = this.props
    const crowdfundingLive = (new Date()) > COUNTDOWN_DATE

    return (
      <div {...styles.container}>
        <Newsletter inverted={inverted} />

        <div {...styles.nav}>
          <div {...styles.mainNav}>
            {url.pathname === '/' || url.pathname === '/countdown' ? (
              <Link href='/manifest'>
                <a {...linkRule}>Manifest</a>
              </Link>
            ) : (
              <Link {...(crowdfundingLive ? {
                href: '/'
              } : {
                href: '/countdown',
                as: '/'
              })}>
                <a {...linkRule}>
                  {crowdfundingLive ? 'Crowdfunding' : 'Countdown'}
                </a>
              </Link>
            )}
            <br />
            <A href='https://project-r.construction/' target='_blank'>Project R</A>
          </div>
        </div>

        <address {...styles.address} style={{marginBottom: 20}}>
          <A href='https://goo.gl/maps/j1F8cXQhrmo' target='_blank'>
            Republik<br />
            c/o Hotel Rothaus<br />
            Sihlhallenstrasse 1<br />
            8004 Zürich<br />
          </A>
          <A href={`mailto:${EMAIL}`}>
            {EMAIL}
          </A>
        </address>

        <IconLink fill={inverted ? '#fff' : '#000'} icon='facebook' href='https://www.facebook.com/RepublikMagazin' target='_blank' />
        <IconLink fill={inverted ? '#fff' : '#000'} icon='twitter' href='https://twitter.com/RepublikMagazin' target='_blank' />
      </div>
    )
  }
}

export default Footer
