import Image from '@tiptap/extension-image'
import { Node as ProseNode } from '@tiptap/pm/model'
import { Editor } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'

interface ImageAttrs {
  src: string;
  alt?: string;
  title?: string;
  width?: string;
  style?: string;
}

// Extiende el nodo image para añadir soporte de redimensionado con handles.
export const ResizableImage = Image.extend({
  name: 'image', // sobreescribe el nodo original

  addAttributes() {
    return {
      ...this.parent?.(),
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: null }, // porcentaje ej. "45%"
      style: { default: null }, // para floats / centrado existentes
    }
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: ImageAttrs }) {
    const { width, style, ...rest } = HTMLAttributes
    const figureAttrs: Record<string,string> = {
      class: 'resizable-image' + (style?.includes('float:left') ? ' float-left' : style?.includes('float:right') ? ' float-right' : ''),
      style: ''
    }
    if (width) figureAttrs.style += `width:${width};`
    if (style) figureAttrs.style += style
    return ['figure', figureAttrs, ['img', rest]]
  },

  addNodeView() {
    return ({ node, editor, getPos }: { node: ProseNode; editor: Editor; getPos: () => number }) => {
      const figure = document.createElement('figure')
      figure.className = 'resizable-image'
      const img = document.createElement('img')
      img.draggable = false
      img.src = (node.attrs as ImageAttrs).src
      if (node.attrs.alt) img.alt = node.attrs.alt
      if (node.attrs.title) img.title = node.attrs.title
      if (node.attrs.style) figure.setAttribute('style', node.attrs.style)
      if (node.attrs.width) figure.style.width = node.attrs.width

      figure.appendChild(img)

      const handleSide = document.createElement('span')
      handleSide.className = 'resize-handle'
      const handleCorner = document.createElement('span')
      handleCorner.className = 'resize-handle-corner'
      figure.appendChild(handleSide)
      figure.appendChild(handleCorner)

      let startX = 0
      let startWidth = 0

      const startDrag = (e: MouseEvent) => {
        e.preventDefault()
        startX = e.clientX
        startWidth = figure.getBoundingClientRect().width
        document.addEventListener('mousemove', onDrag)
        document.addEventListener('mouseup', stopDrag)
      }

      const onDrag = (e: MouseEvent) => {
        const delta = e.clientX - startX
  const parent = figure.parentElement?.getBoundingClientRect().width || (editor.options.element as HTMLElement | null)?.clientWidth || 800
        const newPx = Math.max(40, startWidth + delta)
        const pct = Math.min(100, Math.max(5, (newPx / parent) * 100))
        figure.style.width = pct.toFixed(2) + '%'
      }

      const stopDrag = () => {
        document.removeEventListener('mousemove', onDrag)
        document.removeEventListener('mouseup', stopDrag)
        // Persistimos atributo ancho en nodo
        editor.commands.updateAttributes(this.name, { width: figure.style.width })
      }

      handleSide.addEventListener('mousedown', (e) => startDrag(e))
      handleCorner.addEventListener('mousedown', (e) => startDrag(e))

      figure.addEventListener('click', () => {
        if (!editor.isEditable) return
  const pos = getPos()
  const resolved = editor.state.doc.resolve(pos)
  const sel = TextSelection.near(resolved)
  editor.view.dispatch(editor.state.tr.setSelection(sel))
      })

      return {
        dom: figure,
        update: (updatedNode: ProseNode) => {
          if (updatedNode.type.name !== this.name) return false
          const attrs = updatedNode.attrs as ImageAttrs
            if (attrs.src !== img.src) img.src = attrs.src
          if (attrs.alt) img.alt = attrs.alt
          if (attrs.title) img.title = attrs.title
          if (attrs.width) figure.style.width = attrs.width
          return true
        },
        selectNode: () => { figure.classList.add('ProseMirror-selectednode') },
        deselectNode: () => { figure.classList.remove('ProseMirror-selectednode') },
      }
    }
  },
})

export default ResizableImage
