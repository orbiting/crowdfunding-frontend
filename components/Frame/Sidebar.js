import React from 'react'

import Accordion from '../Accordion'
import Status from '../Status'

import Router from 'next/router'
import Link from 'next/link'

import {
  Button,
  linkRule, P
} from '@project-r/styleguide'

export default () => (
  <div>
    <Status />
    <Button big primary onClick={() => {
      Router.push('/pledge').then(() => window.scrollTo(0, 0))
    }}>Mitmachen</Button>
    <br />
    <Button big>Erinnern</Button>
    <br /><br />
    <Accordion onSelect={params => {
      Router.push({
        pathname: '/pledge',
        query: params
      }).then(() => window.scrollTo(0, 0))
    }} />
    <P>
      <Link href='/merci'>
        <a {...linkRule}>Schon unterstützt?</a>
      </Link>
    </P>
  </div>
)
