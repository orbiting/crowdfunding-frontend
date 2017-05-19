import marked from 'marked'

const renderer = new marked.Renderer()

renderer.image = (href, title, text) => (
  renderer.link(
    href,
    title,
    text || title || 'Bild ansehen'
  )
)
renderer.strong = (text) => '<b>' + text + '</b>'

marked.setOptions({
  renderer,
  gfm: true,
  tables: true,
  breaks: true,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
})

export default marked
