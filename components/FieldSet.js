import React, {Component, PropTypes} from 'react'

import {
  Field, AutocompleteField
} from '@project-r/styleguide'

import MaskedInput from 'react-maskedinput'

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
    const errors = fields.reduce(
      (acumulator, {name, validator}) => {
        if (validator) {
          acumulator[name] = validator(values[name])
        }
        return acumulator
      },
      {}
    )

    onChange({
      values,
      errors
    })
  }
  render () {
    const {
      fields,
      values, errors, dirty,
      onChange
    } = this.props
    return (
      <span>
        {fields.map(({label, type, name, validator, autocomplete, mask}) => {
          let Component = Field
          let additionalProps = {}
          if (autocomplete) {
            Component = AutocompleteField
            additionalProps.items = autocomplete
          } else if (mask) {
            additionalProps.renderInput = (props) => <MaskedInput {...props} placeholderChar=' ' mask={mask} />
          }
          return (
            <span key={name}>
              <Component label={label} type={type}
                {...additionalProps}
                name={name}
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
              <br />
            </span>
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
    autocomplete: PropTypes.arrayOf(PropTypes.string),
    mask: PropTypes.string
  })).isRequired,
  onFieldChange: PropTypes.func
}

export default FieldSet
