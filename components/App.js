import {css} from 'glamor'

import 'glamor/reset'
import Header from './Header'

css.global('html', {boxSizing: 'border-box'})
css.global('*, *:before, *:after', {boxSizing: 'inherit'})

export default ({ children, cover }) => (
  <div>
    <Header cover={cover} />
    {children}
  </div>
)
