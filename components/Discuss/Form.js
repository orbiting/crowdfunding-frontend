import React, {Component} from 'react'
import {gql, graphql} from 'react-apollo'
import {compose} from 'redux'
import AutosizeInput from 'react-textarea-autosize'

import withT from '../../lib/withT'
import withMe from '../../lib/withMe'
import {mergeField} from '../../lib/utils/fieldState'

import RawHtml from '../RawHtml'
import ErrorMessage from '../ErrorMessage'
import {InlineSpinner} from '../Spinner'
import {styles as fieldSetStyles} from '../FieldSet'
import {query as testimonialQuery} from '../Testimonial/Me'

import CommentView from './CommentView'
import {feed as feedQuery} from './queries'

import {
  Field, Button, Interaction, Radio, Label
} from '@project-r/styleguide'

import pollColors from '../Vote/colors'

const {H2, P} = Interaction

class CommentForm extends Component {
  constructor (props) {
    super(props)
    const {edit} = props
    this.state = {
      loading: false,
      serverError: undefined,
      values: {
        comment: (edit && edit.content) || ''
      },
      errors: {},
      dirty: {}
    }
  }
  handleComment (value, shouldValidate, t) {
    this.setState(mergeField({
      field: 'comment',
      value,
      error: (
        value.trim().length < 5 &&
        t('discuss/form/comment/label/error')
      ),
      dirty: shouldValidate
    }))
  }
  componentWillMount () {
    const {values} = this.state
    this.handleComment(values.comment, false, this.props.t)
  }
  send () {
    const {values, tag} = this.state

    this.setState(() => ({
      loading: true,
      serverError: undefined
    }))

    const {edit} = this.props
    const isNew = !(edit && edit.id)
    const method = isNew
      ? 'submitComment'
      : 'editComment'

    this.props[method]({
      content: values.comment,
      tags: [tag].filter(Boolean)
    })
      .then(() => {
        this.setState((state) => ({
          loading: false,
          values: {
            ...state.values,
            comment: ''
          }
        }))
        if (this.props.onSave) {
          this.props.onSave()
        }
      })
      .catch(error => {
        this.setState(() => ({
          loading: false,
          serverError: error
        }))
      })
  }
  render () {
    const {
      t, me, data, edit,
      feedName, maxLength
    } = this.props

    const {
      dirty, values, errors,
      loading, serverError
    } = this.state

    const errorMessages = Object.keys(errors)
      .map(key => errors[key])
      .filter(Boolean)
    const isNew = !(edit && edit.id)

    return (
      <div>
        <form onSubmit={event => {
          event.preventDefault()
          if (errorMessages.length) {
            this.setState((state) => ({
              dirty: {
                comment: true
              }
            }))
            return
          }
          this.send()
        }}>
          <Field label={t('discuss/form/comment/label')}
            name='comment'
            renderInput={(props) => (
              <AutosizeInput {...fieldSetStyles.autoSize}
                {...props} />
            )}
            error={dirty.comment && errors.comment}
            value={values.comment}
            onChange={(_, value, shouldValidate) => {
              this.handleComment(value, shouldValidate, t)
            }} />
          <RawHtml type={Label} dangerouslySetInnerHTML={{
            __html: t('discuss/comment/hint', {
              count: maxLength - values.comment.length
            })
          }} />
          <br />
          {isNew && (
            <P>
              <Label>{t('discuss/comment/tag')}</Label><br />
              {Object.keys(pollColors).map(key => (
                <span>
                  <span style={{whiteSpace: 'nowrap'}}>
                    <Radio
                      checked={key === this.state.tag}
                      onChange={() => {
                        this.setState({
                          tag: this.state.tag === key
                            ? undefined
                            : key
                        })
                      }}>
                      {t(`vote/${feedName}/options/${key}/title`, undefined, key)}
                    </Radio>
                  </span>
                  {' '}&nbsp;{' '}
                </span>
              ))}
            </P>
          )}
          <br />
          <RawHtml type={Label} dangerouslySetInnerHTML={{
            __html: t(
              (
                data.me &&
                data.me.testimonial &&
                data.me.testimonial.image
              )
              ? 'discuss/comment/hint/photo'
              : 'discuss/comment/hint/noPhoto'
            )
          }} />
          <br />
          {!!values.comment.trim() && (
            <div>
              <H2>{t('discuss/form/preview')}</H2>
              <CommentView {...{
                t: t,
                feedName: feedName,
                content: values.comment,
                tags: this.state.tag
                  ? [this.state.tag]
                  : edit ? edit.tags || [] : [],
                authorName: me.name,
                authorImage: (
                  data.me &&
                  data.me.testimonial &&
                  data.me.testimonial.image
                )
              }} />
              <br />
            </div>
          )}
          <br />
          {loading
            ? <InlineSpinner />
            : (
              <div style={{opacity: errorMessages.length ? 0.5 : 1}}>
                <Button type='submit'>
                  {t('discuss/form/submit')}
                </Button>
              </div>
            )
          }
          {!!serverError && <ErrorMessage error={serverError} />}
        </form>
      </div>
    )
  }
}

const submitComment = gql`
mutation submitComment($feedName: String!, $content: String!, $tags: [String!]!) {
  submitComment(feedName: $feedName, content: $content, tags: $tags)
}
`
const editComment = gql`
mutation editComment($commentId: ID!, $content: String!) {
  editComment(commentId: $commentId, content: $content)
}
`

export default compose(
  graphql(testimonialQuery),
  graphql(submitComment, {
    props: ({mutate, ownProps}) => ({
      submitComment: ({content, tags}) => mutate({
        variables: {
          feedName: ownProps.feedName,
          content,
          tags
        },
        refetchQueries: [{
          query: feedQuery,
          variables: {
            name: ownProps.feedName
          }
        }]
      })
    })
  }),
  graphql(editComment, {
    props: ({mutate, ownProps}) => ({
      editComment: ({content}) => mutate({
        variables: {
          commentId: ownProps.edit.id,
          content
        },
        refetchQueries: [{
          query: feedQuery,
          variables: {
            name: ownProps.feedName
          }
        }]
      })
    })
  }),
  withMe,
  withT
)(CommentForm)
