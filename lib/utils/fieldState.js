export const mergeFieldState = ({field, value, error, dirty}) => (state) => ({
  values: {
    ...state.values,
    [field]: value
  },
  errors: {
    ...state.errors,
    [field]: error
  },
  dirty: {
    ...state.dirty,
    [field]: dirty
  }
})
