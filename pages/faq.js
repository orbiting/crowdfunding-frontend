import React, { Component } from 'react'
import { gql, graphql } from 'react-apollo'

import withData from '../lib/withData'
import withMe from '../lib/withMe'
import Frame from '../components/Frame'
import Content from '../components/Frame/Content'
import SignIn from '../components/Auth/SignIn'

import {
  H2, P, Field, Button
} from '@project-r/styleguide'

/*
List of published questions and answers
 */
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
      question: '',
      successfullySubmitted: false
    }

    this.questionRefSetter = (ref) => {
      this.questionRef = ref
    }

    this.changeHandler = this.changeHandler.bind(this)
    this.submitHandler = this.submitHandler.bind(this)
  }

  changeHandler (event) {
    this.setState({
      question: event.target.value
    })
  }

  submitHandler (event) {
    event.preventDefault()
    this.props
      .mutate({ variables: { question: this.state.question } })
      .then(({ data: { success } }) => {
        this.setState({
          successfullySubmitted: true
        })
      })
      .catch(error => {
        console.log(error)
      })
  }

  render () {
    const {me} = this.props
    const question = this.state.question
    const allowSubmit = question.length > 5
    return !this.state.successfullySubmitted
      ? (
        <div>
          <form onSubmit={this.submitHandler}>
            <H2>Hast Du Frage?</H2>
            <P>
              <Field
                value={question}
                onChange={this.changeHandler}
                ref={this.questionRefSetter}
                label='Deine Frage (mind. 5 Zeichen)'
                />
            </P>
            {me ? (<P>
              Als {me.name || me.email}<br />
              <Button type='submit' disabled={!allowSubmit}>
                Abschicken
              </Button>
            </P>) : (
              <SignIn />
            )}
          </form>
        </div>
      )
      : (
        <div>
          <P>
            <strong>Vielen Dank für Deinen Input.</strong>
          </P>
          <P>Du liest von uns.</P>
        </div>
      )
  }
}

const ConnectedQuestionForm = graphql(submitQuestion)(withMe(QuestionForm))

/*
Faq page
 */
export default withData(({url}) => (
  <Frame url={url}>
    <Content>
      <P>
        Antworten zu den brennenden Fragen.
      </P>
      <ConnectedFaqList />
      <ConnectedQuestionForm />
    </Content>
  </Frame>
))
