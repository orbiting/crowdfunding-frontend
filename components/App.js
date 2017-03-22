import {css} from 'glamor'

import 'glamor/reset'

css.global('html', {boxSizing: 'border-box'})
css.global('*, *:before, *:after', {boxSizing: 'inherit'})

export default ({ children }) => children
