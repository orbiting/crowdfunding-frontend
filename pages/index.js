import React, {Component} from 'react'

import App from '../src/components/App'
import Center from '../src/components/Center'
import Crowdfunding from '../src/components/Crowdfunding'
import withData from '../src/apollo/withData'
import {Router} from '../routes'


const Index = ({loading}) => {
	if (loading) {
		return <span>...</span>
	}
	return (
		<div>
      <h1><Crowdfunding /></h1>
		</div>
	)
}

export default withData((props) => (
  <App>
    <Center>
      <Index/>
    </Center>
  </App>
))
