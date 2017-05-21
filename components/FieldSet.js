import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {css} from 'glamor'
import AutosizeInput from 'react-textarea-autosize'

import {
  Field
} from '@project-r/styleguide'

import MaskedInput from 'react-maskedinput'

export const styles = {
  mask: css({
    '::placeholder': {
      color: 'transparent'
    },
    ':focus': {
      '::placeholder': {
        color: '#ccc'
      }
    }
  }),
  autoSize: css({
    minHeight: 40,
    paddingTop: '7px !important',
    paddingBottom: '6px !important'
  })
}

export const getErrors = (fields, values) => {
  return fields.reduce(
    (acumulator, {name, validator}) => {
      if (validator) {
        acumulator[name] = validator(values[name])
      }
      return acumulator
    },
    {}
  )
}

class FieldSet extends Component {
  componentDidMount () {
    const {fields, values: initialValues, onChange} = this.props

    const values = fields.reduce(
      (acumulator, {name}) => {
        acumulator[name] = initialValues[name] || ''
        return acumulator
      },
      {}
    )
    const errors = getErrors(fields, values)

    onChange({
      values,
      errors
    }, true)
  }
  render () {
    const {
      fields,
      values, errors, dirty,
      onChange
    } = this.props
    return (
      <span>
        {fields.map(({label, type, autoComplete, name, validator, mask, autoSize, maskChar}) => {
          let Component = Field
          let additionalProps = {}
          if (autoSize) {
            additionalProps.renderInput = (props) => (
              <AutosizeInput {...styles.autoSize}
                {...props} />
            )
          }
          if (mask) {
            additionalProps.renderInput = (props) => (
              <MaskedInput
                {...props}
                {...styles.mask}
                placeholderChar={maskChar || ' '}
                mask={mask} />
            )
          }
          return (
            <Component key={name} label={label} type={type}
              {...additionalProps}
              name={autoComplete || name}
              autoComplete={autoComplete}
              value={values[name]}
              error={dirty[name] && errors[name]}
              onChange={(_, value, shouldValidate) => {
                onChange({
                  values: {
                    [name]: value
                  },
                  errors: validator ? {
                    [name]: validator(value)
                  } : {},
                  dirty: {
                    [name]: shouldValidate
                  }
                })
              }} />
          )
        })}
      </span>
    )
  }
}

FieldSet.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string,
    validator: PropTypes.func,
    autoComplete: PropTypes.string,
    mask: PropTypes.string
  })).isRequired,
  onFieldChange: PropTypes.func
}

export default FieldSet
