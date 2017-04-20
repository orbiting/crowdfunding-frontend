import React, {Component} from 'react'
import {gql, graphql} from 'react-apollo'
import {compose} from 'redux'

import withT from '../../lib/withT'
import withMe from '../../lib/withMe'

import SignIn from '../Auth/SignIn'

import {
  Interaction, Field, Button
} from '@project-r/styleguide'

import {H2} from './List'
const {P} = Interaction

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
    const {me, t} = this.props
    const question = this.state.question
    const allowSubmit = question.length > 5
    return !this.state.successfullySubmitted
      ? (
        <div>
          <form onSubmit={this.submitHandler}>
            <H2>{t('faq/form/title')}</H2>
            <P>
              <Field
                value={question}
                onChange={this.changeHandler}
                ref={this.questionRefSetter}
                label={t('faq/form/question/label')}
                />
            </P>
            {me ? (<P>
              {me.name || me.email}<br />
              <Button type='submit' disabled={!allowSubmit}>
                {t('faq/form/question/submit')}
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
            <strong>{t('faq/form/merci/title')}</strong>
          </P>
          <P>{t('faq/form/merci/text')}</P>
        </div>
      )
  }
}

export default compose(
  graphql(submitQuestion),
  withMe,
  withT
)(QuestionForm)
