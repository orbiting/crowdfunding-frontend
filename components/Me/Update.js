import React, {Component} from 'react'
import {gql, graphql} from 'react-apollo'
import {compose} from 'redux'
import {mergeFields} from '../../lib/utils/fieldState'
import FieldSet, {getErrors} from '../FieldSet'
import {InlineSpinner} from '../Spinner'
import {intersperse} from '../../lib/utils/helpers'
import Loader from '../Loader'
import {errorToString} from '../../lib/utils/errors'
import {swissTime} from '../../lib/utils/formats'

import withT from '../../lib/withT'
import AddressForm, {COUNTRIES, fields as addressFields} from './AddressForm'

import {
  H2, Label, Button, P, A, colors
} from '@project-r/styleguide'

const birthdayFormat = '%d.%m.%Y'
const birthdayUserFormat = swissTime.format(birthdayFormat)
const birthdayUserParse = swissTime.parse(birthdayFormat)

const birthdayAPIFormat = swissTime.format('%Y-%m-%dT00:00:00.000Z')
const birthdayBaseParse = swissTime.parse('%Y-%m-%d')
const birthdayAPIParse = (string) => (
  string && birthdayBaseParse(string.split('T')[0])
)

const fields = (t) => [
  {
    label: t('merci/updateMe/birthday/label'),
    name: 'birthday',
    mask: '11.11.1111',
    maskChar: '_',
    validator: (value) => {
      const parsedDate = birthdayUserParse(value)
      return (
        (
          (
            value.trim().length <= 0 &&
            t('merci/updateMe/birthday/error/empty')
          ) ||
          (
            (
              parsedDate === null ||
              parsedDate > (new Date()) ||
              parsedDate < (new Date(1798, 3, 12))
            ) &&
            t('merci/updateMe/birthday/error/invalid')
          )
        )
      )
    }
  }
]

const getValues = (me) => {
  let addressState = {}
  if (me.address) {
    addressState = {
      name: me.address.name || me.name,
      line1: me.address.line1,
      line2: me.address.line2,
      postalCode: me.address.postalCode,
      city: me.address.city,
      country: me.address.country
    }
  } else if (me) {
    addressState.name = me.name
  }

  const parsedBirthday = birthdayAPIParse(me.birthday)

  return {
    birthday: parsedBirthday ? birthdayUserFormat(parsedBirthday) : '',
    ...addressState
  }
}

class Update extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isEditing: false,
      showErrors: false,
      values: {
        country: COUNTRIES[0]
      },
      errors: {},
      dirty: {}
    }
  }
  startEditing () {
    const {me} = this.props
    this.setState((state) => ({
      isEditing: true,
      values: {
        ...state.values,
        ...getValues(me)
      }
    }))
  }
  autoEdit () {
    if (this.props.me && !this.checked) {
      this.checked = true
      const {t} = this.props

      const errors = getErrors(
        fields(t).concat(addressFields(t)),
        getValues(this.props.me)
      )

      const errorMessages = Object.keys(errors)
        .map(key => errors[key])
        .filter(Boolean)
      errorMessages.length && this.startEditing()
    }
  }
  componentDidMount () {
    this.autoEdit()
  }
  componentDidUpdate () {
    this.autoEdit()
  }
  render () {
    const {t, me, loading, error} = this.props
    const {
      values, dirty, errors,
      updating, isEditing
    } = this.state

    const errorMessages = Object.keys(errors)
      .map(key => errors[key])
      .filter(Boolean)

    return (
      <Loader loading={loading} error={error} render={() => (
        <div>
          {!isEditing ? (
            <div>
              <H2>{t('merci/updateMe/title')}</H2>
              <P>
                {!!me.address && intersperse(
                  [
                    me.address.name,
                    me.address.line1,
                    me.address.line2,
                    `${me.address.postalCode} ${me.address.city}`,
                    me.address.country
                  ].filter(Boolean),
                  (_, i) => <br key={i} />
                )}
              </P>
              <P>
                <Label key='birthday'>{t('merci/updateMe/birthday/label')}</Label><br />
                {birthdayUserFormat(birthdayAPIParse(me.birthday))}
              </P>
              <A href='#' onClick={(e) => {
                e.preventDefault()
                this.startEditing()
              }}>{t('merci/updateMe/edit')}</A>
            </div>
          ) : (
            <div>
              <H2>{t('merci/updateMe/title')}</H2>
              <AddressForm
                values={values}
                errors={errors}
                dirty={dirty}
                onChange={(fields) => {
                  this.setState(mergeFields(fields))
                }} />
              <FieldSet
                values={values}
                errors={errors}
                dirty={dirty}
                onChange={(fields) => {
                  this.setState(mergeFields(fields))
                }}
                fields={fields(t)} />
              <Label>{t('merci/updateMe/birthday/hint')}</Label>
              <br /><br /><br />
              {updating ? (
                <div style={{textAlign: 'center'}}>
                  <InlineSpinner />
                  <br />
                  {t('merci/updateMe/updating')}
                </div>
              ) : (
                <div>
                  {!!this.state.showErrors && errorMessages.length > 0 && (
                    <div style={{color: colors.error, marginBottom: 40}}>
                      {t('pledge/submit/error/title')}<br />
                      <ul>
                        {errorMessages.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {!!this.state.error && (
                    <div style={{color: colors.error, marginBottom: 40}}>
                      {this.state.error}
                    </div>
                  )}
                  <div style={{opacity: errorMessages.length ? 0.5 : 1}}>
                    <Button onClick={() => {
                      if (errorMessages.length) {
                        this.setState((state) => Object.keys(state.errors).reduce(
                          (nextState, key) => {
                            nextState.dirty[key] = true
                            return nextState
                          },
                          {
                            showErrors: true,
                            dirty: {}
                          }
                        ))
                        return
                      }
                      this.setState(() => ({updating: true}))
                      this.props.update({
                        user: {
                          name: me.name,
                          email: me.email,
                          birthday: birthdayAPIFormat(
                            birthdayUserParse(values.birthday)
                          )
                        },
                        address: {
                          name: values.name,
                          line1: values.line1,
                          line2: values.line2,
                          postalCode: values.postalCode,
                          city: values.city,
                          country: values.country
                        }
                      }).then(() => {
                        this.setState(() => ({
                          updating: false,
                          isEditing: false
                        }))
                      }).catch((error) => {
                        this.setState(() => ({
                          updating: false,
                          error: errorToString(error)
                        }))
                      })
                    }}>{t('merci/updateMe/submit')}</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )} />
    )
  }
}

const mutation = gql`mutation updateMe($user: UserInput!, $address: AddressInput!) {
  updateMe(user: $user, address: $address) {
    id
  }
}`
const query = gql`query myAddress {
  me {
    id
    name
    email
    birthday
    address {
      name
      line1
      line2
      postalCode
      city
      country
    }
  }
}`

export default compose(
  graphql(mutation, {
    props: ({mutate}) => ({
      update: variables => mutate({
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
      me: data.me
    })
  }),
  withT
)(Update)
