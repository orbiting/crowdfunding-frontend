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

const {H3, P} = Interaction

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
    this.fieldRef = ref => {
      this.field = ref
    }
  }
  handleComment (value, shouldValidate, t) {
    const {maxLength} = this.props
    this.setState(mergeField({
      field: 'comment',
      value,
      error: (
        value.trim().length < 5 &&
        t('discuss/form/comment/label/errorMin')
      ) || (
        value.trim().length > maxLength &&
        t('discuss/form/comment/label/errorMax', {
          count: maxLength
        })
      ),
      dirty: shouldValidate
    }))
  }
  componentWillMount () {
    const {values} = this.state
    this.handleComment(values.comment, false, this.props.t)
  }
  componentDidMount () {
    const {edit} = this.props
    if (edit && edit.id && this.field && this.field.input) {
      this.field.input.focus()
    }
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
      .then(({data}) => {
        this.setState((state) => ({
          loading: false,
          values: {
            ...state.values,
            comment: ''
          }
        }))
        if (this.props.onSave) {
          this.props.onSave(data[method])
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

    const hasPublicTestimonial = !!(
      data.me &&
      data.me.testimonial &&
      data.me.testimonial.image &&
      data.me.testimonial.published &&
      !data.me.testimonial.adminUnpublished
    )

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
            ref={this.fieldRef}
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
                <span key={key}>
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
          {!!values.comment.trim() && (
            <div>
              <H3>{t('discuss/form/preview')}</H3>
              <CommentView {...{
                t: t,
                feedName: feedName,
                content: values.comment,
                tags: this.state.tag
                  ? [this.state.tag]
                  : edit ? edit.tags || [] : [],
                authorName: me.name,
                authorImage: (
                  hasPublicTestimonial &&
                  data.me.testimonial.image
                )
              }} />
            </div>
          )}
          <br />
          <RawHtml type={Label} dangerouslySetInnerHTML={{
            __html: t(
              hasPublicTestimonial
              ? 'discuss/comment/hint/photo'
              : 'discuss/comment/hint/noPhoto'
            )
          }} />
          <br />
          <div style={{margin: '10px 0'}}>
            {loading
              ? <InlineSpinner />
              : (
                <div style={{opacity: errorMessages.length ? 0.5 : 1}}>
                  <Button type='submit'>
                    {t(`discuss/form/${isNew ? 'submit' : 'edit'}`)}
                  </Button>
                </div>
              )
            }
          </div>
          {!!serverError && <ErrorMessage error={serverError} />}
        </form>
      </div>
    )
  }
}

const submitComment = gql`
mutation submitComment($feedName: String!, $content: String!, $tags: [String!]!) {
  submitComment(feedName: $feedName, content: $content, tags: $tags) {
    id
  }
}
`
const editComment = gql`
mutation editComment($commentId: ID!, $content: String!) {
  editComment(commentId: $commentId, content: $content) {
    id
  }
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
