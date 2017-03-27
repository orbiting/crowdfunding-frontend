import React from 'react'
import { gql, withApollo, graphql } from 'react-apollo'

import withData from '../lib/withData'
import App from '../components/App'

import {
  H1, P, MediumContainer
} from '@project-r/styleguide'

const publishedFaqs = gql`
query {
  faqs(status: PUBLISHED) {
    id
    status
    question
    answer
    createdAt
    updatedAt
  }
}
`

const FaqList = ({data: {faqs}}) => (
  <div>{
    faqs.map(entry => (
      <P key={entry.id}>{ `${entry.question}: ${entry.answer}` }</P>
    ))
  }</div>
)

const ConnectedFaqList = graphql(publishedFaqs)(withApollo(FaqList))

export default withData((props) => (
  <App>
    <MediumContainer>
      <H1>FAQ</H1>
      <P>
        Antworten zu den brennenden Fragen.
      </P>
      <ConnectedFaqList />
    </MediumContainer>
  </App>
))
