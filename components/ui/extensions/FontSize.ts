import { Mark, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType
      unsetFontSize: () => ReturnType
    }
  }
}

export const FontSize = Mark.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
      defaultSize: null as string | null,
    }
  },

  addAttributes() {
    return {
      fontSize: {
        default: this.options.defaultSize,
        parseHTML: element => (element as HTMLElement).style.fontSize || null,
        renderHTML: attributes => {
          if (!attributes.fontSize) return {}
          return { style: `font-size: ${attributes.fontSize}` }
        },
      },
    }
  },

  parseHTML() {
    return [
      { style: 'font-size' },
      { tag: 'span[style*="font-size"]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setFontSize:
        (size: string) => ({ chain }) => {
          return chain().setMark('fontSize', { fontSize: size }).run()
        },
      unsetFontSize:
        () => ({ chain }) => chain().setMark('fontSize', { fontSize: null }).run(),
    }
  },
})
