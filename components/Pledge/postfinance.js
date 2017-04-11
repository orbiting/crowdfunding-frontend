import sha1 from 'js-sha1'
import {ascending} from 'd3-array'
import {PUBLIC_BASE_URL, PF_PSPID, PF_INPUT_SECRET} from '../../constants'

export const getParams = ({
  alias,
  orderId,
  amount
}) => {
  const params = [
    {
      key: 'PSPID',
      value: PF_PSPID
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
      value: `${PUBLIC_BASE_URL}/pledge`
    },
    {
      key: 'EXCEPTIONURL',
      value: `${PUBLIC_BASE_URL}/pledge`
    },
    {
      key: 'DECLINEURL',
      value: `${PUBLIC_BASE_URL}/pledge`
    },
    {
      key: 'CANCELURL',
      value: `${PUBLIC_BASE_URL}/pledge`
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
  // ensure correct order for valid sha1
  params.sort((a, b) => ascending(a.key, b.key))

  const paramsString = params.map(param => (
    `${param.key}=${param.value}${PF_INPUT_SECRET}`
  )).join('')

  params.push({
    key: 'SHASIGN',
    value: sha1(paramsString).toUpperCase()
  })

  return params
}
