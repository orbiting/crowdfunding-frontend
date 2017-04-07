import sha1 from 'js-sha1'
import {ascending} from 'd3-array'

export const getParams = ({
  alias,
  orderId,
  amount
}) => {
  const params = [
    {
      key: 'PSPID',
      value: 'projectrTEST'
    },
    {
      key: 'ORDERID',
      value: orderId || ''
    },
    {
      key: 'AMOUNT',
      value: amount || ''
    },
    {
      key: 'CURRENCY',
      value: 'CHF'
    },
    {
      key: 'LANGUAGE',
      value: 'de_DE'
    },
    {
      key: 'PM',
      value: 'PostFinance Card'
    },
    {
      key: 'BRAND',
      value: 'PostFinance Card'
    },
    {
      key: 'ACCEPTURL',
      value: 'http://localhost:3003/pledge'
    },
    {
      key: 'EXCEPTIONURL',
      value: 'http://localhost:3003/pledge'
    },
    {
      key: 'DECLINEURL',
      value: 'http://localhost:3003/pledge'
    },
    {
      key: 'CANCELURL',
      value: 'http://localhost:3003/pledge'
    },
    {
      key: 'ALIAS',
      value: alias || ''
    },
    {
      key: 'ALIASUSAGE',
      value: 'membership'
    }
  ]
  params.sort((a, b) => ascending(a.key, b.key))

  const secret = 'h9PqtTTb9txDBBrVaX6U'
  const paramsString = params.map(param => (
    `${param.key}=${param.value}${secret}`
  )).join('')

  params.push({
    key: 'SHASIGN',
    value: sha1(paramsString).toUpperCase()
  })

  return params
}
