import React, {Component} from 'react'
import withData from '../lib/withData'

import {
  NarrowContainer
} from '@project-r/styleguide'

import {
  STATIC_BASE_URL
} from '../constants'

import Frame from '../components/Frame'
import PledgeForm from '../components/Pledge/Form'
import PledgeReceivePayment from '../components/Pledge/ReceivePayment'

class PledgePage extends Component {
  render () {
    const meta = {
      title: 'Jetzt mitmachen beim Crowdfunding',
      description: 'Lasst uns gemeinsam ein neues Fundament für unabhängigen Journalismus bauen!',
      image: `${STATIC_BASE_URL}/static/social-media/main.jpg`
    }

    const {url} = this.props

    let pledgeId
    if (url.query.orderID) {
      pledgeId = url.query.orderID.split('_')[0]
    }
    if (url.query.item_name) {
      pledgeId = url.query.item_name.split('_')[0]
    }
    if (url.query.pledgeId) {
      pledgeId = url.query.pledgeId
    }

    return (
      <Frame meta={meta} url={url} sidebar={false}>
        <NarrowContainer>
          {pledgeId ? (
            <PledgeReceivePayment
              pledgeId={pledgeId}
              query={url.query} />
          ) : (
            <PledgeForm query={url.query} />
          )}
        </NarrowContainer>
      </Frame>
    )
  }
}

export default withData(PledgePage)
