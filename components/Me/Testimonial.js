import React, {Component} from 'react'
import {gql, graphql} from 'react-apollo'
import {compose} from 'redux'
import {range} from 'd3-array'

import withT from '../../lib/withT'
import {mergeFields} from '../../lib/utils/fieldState'

import ErrorMessage from '../ErrorMessage'
import {InlineSpinner} from '../Spinner'
import Loader from '../Loader'
import FieldSet, {getErrors} from '../FieldSet'
import RawHtml from '../RawHtml'

import {
  Interaction, Button
} from '@project-r/styleguide'

const {H2, P} = Interaction

const fields = (t) => [
  {
    label: t('testimonial/role/label'),
    name: 'role'
  },
  {
    label: t('testimonial/quote/label'),
    name: 'quote',
    validator: (value) => (
      (
        !value.trim() &&
        t('testimonial/quote/error')
      )
    )
  }
]

const readFile = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new window.FileReader()
    fileReader.addEventListener('load', (event) => {
      const url = event.target.result
      // Strip out the information about the mime type of the file and the encoding
      // at the beginning of the file (e.g. data:image/gif;base64,).
      const content = url.replace(/^(.+,)/, '')
      resolve({
        filename: file.name,
        content,
        url
      })
    })

    fileReader.addEventListener('error', (error) => {
      reject(error)
    })

    fileReader.readAsDataURL(file)
  })
}

const randomSeed = (length = 5) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  return range(length).map(() => {
    return possible.charAt(Math.floor(Math.random() * possible.length))
  }).join('')
}

class Testimonial extends Component {
  constructor (props) {
    super(props)
    this.state = {
      submitting: false,
      serverError: undefined,
      imageError: undefined,
      success: false,
      values: {},
      errors: {},
      dirty: {}
    }
  }
  onFile (e) {
    const {t} = this.props
    const file = e.target.files[0]
    if (file.type.indexOf('image/') === 0) {
      this.setState(() => ({
        imageError: ''
      }))
      readFile(file)
        .then(({content, url, filename}) => {
          this.setState(() => ({
            image: {
              content,
              url
            }
          }))
        })
        .catch(() => {
          this.setState(() => ({
            imageError: t('testimonial/pickImage/readError')
          }))
        })
    } else {
      this.setState(() => ({
        imageError: t('testimonial/pickImage/invalidType')
      }))
    }
  }
  submit () {
    const {values, image} = this.state

    this.setState(() => ({
      submitting: true,
      success: false,
      serverError: undefined
    }))

    this.props.submit({
      role: values.role,
      quote: values.quote,
      image: image ? image.content : undefined
    })
      .then(() => {
        // give keycdn a few seconds to pruge
        // https://www.keycdn.com/support/purge-cdn-cache/
        setTimeout(() => {
          this.setState(() => ({
            submitting: false,
            success: true,
            image: undefined,
            imageHash: randomSeed()
          }))
          // reload image again just in case
          setTimeout(() => {
            this.setState(() => ({
              imageHash: randomSeed()
            }))
          }, 5000)
        }, 3000)
      })
      .catch(error => {
        this.setState(() => ({
          submitting: false,
          serverError: error
        }))
      })
  }
  updateFields (props) {
    this.setState((state) => {
      const testimonial = props.testimonial || {}
      const values = {
        ...state.values,
        quote: testimonial.quote || '',
        role: testimonial.role || ''
      }
      const errors = getErrors(
        fields(props.t),
        values
      )

      return {
        values,
        errors: {
          ...state.errors,
          ...errors
        }
      }
    })
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.testimonial !== this.props.testimonial) {
      this.updateFields(nextProps)
    }
  }
  componentDidMount () {
    this.updateFields(this.props)
  }
  render () {
    const {t, loading, error, testimonial} = this.props
    const {
      values, dirty, errors,
      submitting,
      serverError,
      image, imageHash
    } = this.state

    const imageSrc = image
      ? image.url
      : testimonial && `${testimonial.image}${imageHash ? `?${imageHash}` : ''}`
    const imageMissing = !imageSrc && t('testimonial/pickImage/empty')
    const imageError = this.state.imageError || (dirty.image && imageMissing)

    const errorMessages = Object.keys(errors)
      .map(key => errors[key])
      .concat(imageMissing)
      .filter(Boolean)

    return (
      <Loader loading={loading} error={error} render={() => (
        <div style={{marginBottom: 40}}>
          <H2>{t('testimonial/title')}</H2>
          <RawHtml type={P} dangerouslySetInnerHTML={{
            __html: t('testimonial/description')
          }} />
          <form onSubmit={event => {
            event.preventDefault()
            if (errorMessages.length) {
              this.setState((state) => ({
                dirty: {
                  ...state.dirty,
                  quote: true,
                  role: true
                }
              }))
              return
            }
            this.submit()
          }}>
            <FieldSet
              values={values}
              errors={errors}
              dirty={dirty}
              fields={fields(t)}
              onChange={(fields) => {
                this.setState(mergeFields(fields))
              }} />
            <br />
            <input
              type='file'
              accept='image/*'
              ref={ref => { this.fileInput = ref }}
              onChange={event => this.onFile(event)}
              style={{display: 'none'}}
            />
            <Button black onClick={(event) => {
              event.preventDefault()
              this.fileInput.value = null
              this.fileInput.click()
            }}>
              {t('testimonial/pickImage')}
            </Button>
            <br />
            {!!imageError && <ErrorMessage error={imageError} />}
            <br />
            {!!imageSrc && (
              <div style={{marginBottom: 20}}>
                <div style={{
                  backgroundImage: `url(${imageSrc})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  width: 256,
                  height: 256
                }} />
              </div>
            )}

            {!!serverError && <ErrorMessage error={serverError} />}
            {submitting
              ? <InlineSpinner />
              : (
                <div style={{opacity: errorMessages.length ? 0.5 : 1}}>
                  <Button type='submit'>
                    {t('testimonial/submit')}
                  </Button>
                </div>
              )
            }
          </form>
        </div>
      )} />
    )
  }
}

const mutation = gql`mutation submitTestimonial($role: String!, $quote: String!, $image: String) {
  submitTestimonial(role: $role, quote: $quote, image: $image) {
    id
  }
}`
const query = gql`query myTestimonial {
  me {
    id
    testimonial {
      id
      name
      role
      quote
      image
      video {
        hls
        mp4
        youtube
      }
    }
  }
}`

export default compose(
  graphql(mutation, {
    props: ({mutate}) => ({
      submit: variables => mutate({
        variables,
        refetchQueries: [{
          query
        }]
      })
    })
  }),
  graphql(query, {
    props: ({data}) => ({
      loading: data.loading,
      error: data.error,
      testimonial: data.loading ? undefined : data.me && data.me.testimonial
    })
  }),
  withT
)(Testimonial)
