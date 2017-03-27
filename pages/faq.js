import React, { Component } from 'react'
import { gql, graphql } from 'react-apollo'

import withData from '../lib/withData'
import App from '../components/App'

import {
  H1, P, MediumContainer, Field, Button
} from '@project-r/styleguide'

/*
List of published questions and answers
 */
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

const ConnectedFaqList = graphql(publishedFaqs)(FaqList)

/*
Question form
 */
const submitQuestion = gql`
mutation submitQuestion($question: String!) {
  submitQuestion(question: $question) {
    success
  }
}
`

class QuestionForm extends Component {
  constructor (...args) {
    super(...args)
    this.state = {
      successfullySubmitted: false
    }

    this.questionRefSetter = (ref) => {
      this.questionRef = ref
    }
    this.submitHandler = this.submitHandler.bind(this)
  }

  submitHandler () {
    const question = this.questionRef.input.value
    this.props
      .mutate({ variables: { question } })
      .then(({ data: { success } }) => {
        this.setState({
          successfullySubmitted: true
        })
      })
      .catch(error => {
        // window.alert('Pledge error')
        console.log(error)
      })
  }

  render () {
    return !this.state.successfullySubmitted
      ? (
        <div>
          <P>Hast du Frage?</P>
          <Field ref={this.questionRefSetter} label='Frage' />
          <Button onClick={this.submitHandler}>Abschicken</Button>
        </div>
      )
      : (
        <div>
          <P>This happened...</P>
        </div>
      )
  }
}

const ConnectedQuestionForm = graphql(submitQuestion)(QuestionForm)

/*
Faq page
 */
export default withData((props) => (
  <App>
    <MediumContainer>
      <H1>FAQ</H1>
      <P>
        Antworten zu den brennenden Fragen.
      </P>
      <ConnectedFaqList />
      <ConnectedQuestionForm />
    </MediumContainer>
  </App>
))
