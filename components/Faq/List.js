import React from 'react'
import {gql, graphql} from 'react-apollo'

import {
  Interaction
} from '@project-r/styleguide'

const {P} = Interaction

const publishedFaqs = gql`
query {
  faqs {
    category
    question
    answer
  }
}
`

const FaqList = ({data: {loading, error, faqs}}) => {
  if (loading) {
    return <div>Lädt</div>
  }
  if (error) {
    return <div>{error.toString()}</div>
  }
  return (
    <div>{
      faqs.map(entry => (
        <div key={entry.id}>
          <P>
            <strong>{entry.question}</strong>
          </P>
          <P>{entry.answer}</P>
        </div>
      ))
    }</div>
  )
}

export default graphql(publishedFaqs)(FaqList)
