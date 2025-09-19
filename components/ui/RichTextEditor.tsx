"use client";
import React, { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import { Node as ProseMirrorNode } from "@tiptap/pm/model";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import ResizableImage from "@/components/ui/extensions/ResizableImage";
import { TextStyle } from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";
import { FontSize } from "@/components/ui/extensions/FontSize";
import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import FontFamily from "@tiptap/extension-font-family";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import HorizontalRule from "@tiptap/extension-horizontal-rule";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
};

const RichTextEditor: React.FC<Props> = ({ value, onChange, placeholder = "Escribe el contenido...", minHeight = 250 }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [imageAttrs, setImageAttrs] = useState<{src:string;width?:string} | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
        paragraph: {
          HTMLAttributes: {
            style: 'white-space: pre-wrap;'
          }
        }
      }),
      Underline,
      TextStyle,
    FontFamily.configure({ types: ["textStyle"] }),
    FontSize,
      Color,
      Highlight,
      Link.configure({ openOnClick: true, autolink: true, protocols: ['http', 'https', 'mailto'] }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      HorizontalRule,
      ResizableImage.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder })
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: `prose max-w-none focus:outline-none`,
      },
    },
    immediatelyRender: false,
    onUpdate({ editor }: { editor: Editor }) {
      onChange(editor.getHTML());
    },
  });

  const run = (cb: (e: Editor) => void) => editor && cb(editor);
  const toggleFontSize = (size: string) => run(e => {
    if (!size) e.chain().focus().unsetFontSize().run();
    else e.chain().focus().setFontSize(size).run();
  });

  const insertImageFromCloudinary = async (file: File) => {
    if (!file || !editor) return;
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`, { method: "POST", body: fd });
      const data = await res.json();
      if (data.secure_url) {
        editor.chain().focus().setImage({ src: data.secure_url, alt: file.name }).run();
      }
    } catch (e) {
      console.error("Error subiendo imagen:", e);
    }
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (file) insertImageFromCloudinary(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    if (!editor) return;
    const update = () => {
      const { from, to } = editor.state.selection;
      let attrs: {src:string;width?:string} | null = null;
      editor.state.doc.nodesBetween(from, to, (node: ProseMirrorNode) => {
        if (node.type.name === 'image') {
          attrs = { src: node.attrs.src, width: node.attrs.width };
        }
      });
      setImageAttrs(attrs);
    };
    update();
    editor.on('selectionUpdate', update);
    editor.on('transaction', update);
    return () => {
      editor.off('selectionUpdate', update);
      editor.off('transaction', update);
    };
  }, [editor]);

  const getCurrentFontSize = () => {
    if (!editor) return '16px';
    const { from, to } = editor.state.selection;
    let found: string | null = null;
    editor.state.doc.nodesBetween(from, to, (node: ProseMirrorNode) => {
      const mark = node.marks?.find((m) => (m.type.name === 'fontSize' || m.type.name === 'textStyle') && (m.attrs.fontSize));
      if (mark && mark.attrs.fontSize) { found = mark.attrs.fontSize; return false; }
      return undefined;
    });
    return found || '16px';
  };
  const currentFontSize = getCurrentFontSize();
  const currentFontFamily = (() => {
    if (typeof window === 'undefined') return 'Poppins, sans-serif';
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return 'Poppins, sans-serif';
    const range = sel.getRangeAt(0);
    const parent = range.startContainer.parentElement as HTMLElement | null;
    if (!parent) return 'Poppins, sans-serif';
    const fam = parent.style.fontFamily || getComputedStyle(parent).fontFamily;
    return fam?.split(',').slice(0,1).join(',') || 'Poppins, sans-serif';
  })();

  const isReady = mounted && !!editor;

  const updateSelectedImage = (updates: Record<string, string | number>) => {
    editor.chain().focus().updateAttributes('image', updates).run();
  };


  const Icon = ({ name }: { name: string }) => {
    const common = "w-4 h-4";
    switch (name) {
      case 'bold':
        return (<svg className={common} viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 15H9v4H6V5h8a4 4 0 010 8 4 4 0 01-.5 2zM9 7v4h5a2 2 0 100-4H9zM9 13v4h5a2 2 0 100-4H9z"/></svg>);
      case 'italic':
        return (<svg className={common} viewBox="0 0 24 24" fill="currentColor"><path d="M10 4v2h2.58l-3.16 12H7v2h7v-2h-2.58l3.16-12H17V4z"/></svg>);
      case 'underline':
        return (<svg className={common} viewBox="0 0 24 24" fill="currentColor"><path d="M12 17a5 5 0 005-5V4h-2v8a3 3 0 11-6 0V4H7v8a5 5 0 005 5zm-7 3v2h14v-2H5z"/></svg>);
      case 'strike':
        return (<svg className={common} viewBox="0 0 24 24" fill="currentColor"><path d="M3 11v2h9.5c1.93 0 3.5.57 3.5 1.75 0 .88-.9 1.75-3 1.75-1.63 0-3.03-.48-4.17-1.21l-1.52 1.28C8.5 18 10.53 19 13 19c3.22 0 5-1.52 5-3.5 0-1.83-1.32-3.05-3.2-3.5H21v-2H3zm9.5-6c-2.35 0-3.94 1.02-4.76 2.28l1.7 1.06C10 7.6 10.9 7 12.5 7c1.6 0 2.5.6 2.5 1.5 0 .35-.1.64-.28.9h2.32c.3-.53.46-1.12.46-1.8C17.5 5.48 15.72 5 12.5 5z"/></svg>);
      case 'align-left':
        return (<svg className={common} viewBox="0 0 24 24" fill="currentColor"><path d="M3 5h14v2H3V5zm0 4h18v2H3V9zm0 4h14v2H3v-2zm0 4h18v2H3v-2z"/></svg>);
      case 'align-center':
        return (<svg className={common} viewBox="0 0 24 24" fill="currentColor"><path d="M4 5h16v2H4V5zm2 4h12v2H6V9zm-2 4h16v2H4v-2zm2 4h12v2H6v-2z"/></svg>);
      case 'align-right':
        return (<svg className={common} viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h14v2H7V5zM3 9h18v2H3V9zm4 4h14v2H7v-2zM3 17h18v2H3v-2z"/></svg>);
      case 'align-justify':
        return (<svg className={common} viewBox="0 0 24 24" fill="currentColor"><path d="M3 5h18v2H3V5zm0 4h18v2H3V9zm0 4h18v2H3v-2zm0 4h18v2H3v-2z"/></svg>);
      case 'bullet':
        return (<svg className={common} viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h14v2H7V5zM3 5h2v2H3V5zm4 6h14v2H7v-2zM3 11h2v2H3v-2zm4 6h14v2H7v-2zM3 17h2v2H3v-2z"/></svg>);
      case 'ordered':
        return (<svg className={common} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5h13v2H8V5zM3 6h2V4H3v1h1v1H3V6zm0 4h2v2H3v-1h1v-.5H3V10zm0 6h2v2H3v-1h1v-.5H3V16zM8 11h13v2H8v-2zm0 6h13v2H8v-2z"/></svg>);
      case 'task':
        return (<svg className={common} viewBox="0 0 24 24" fill="currentColor"><path d="M3 5h18v2H3V5zm0 4h12v2H3V9zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm15.59-8L17 11.59 15.41 10 14 11.41 17 14.41 20 11.41 18.59 10z"/></svg>);
      case 'quote':
        return (<svg className={common} viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h6v6H9v4H5v-6h2V7zm10 0h6v6h-4v4h-4v-6h2V7z"/></svg>);
      case 'hr':
        return (<svg className={common} viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="11" width="16" height="2"/></svg>);
      case 'highlight':
        return (<svg className={common} viewBox="0 0 24 24" fill="currentColor"><path d="M3 17l6-6 4 4-6 6H3v-4zm9.7-9.3l2.6-2.6a1 1 0 011.4 0l2.6 2.6a1 1 0 010 1.4l-2.6 2.6-4-4z"/></svg>);
      case 'link':
        return (<svg className={common} viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12a5 5 0 015-5h3v2H8.9a3 3 0 000 6H12v2H8.9a5 5 0 01-5-5zm7-1h3.1a3 3 0 010 6H12v2h2.9a5 5 0 000-10H10.9v2z"/></svg>);
      case 'unlink':
        return (<svg className={common} viewBox="0 0 24 24" fill="currentColor"><path d="M17 7h-3v2h3a3 3 0 010 6h-3v2h3a5 5 0 000-10zM10 7H7a5 5 0 000 10h3v-2H7a3 3 0 110-6h3V7z"/></svg>);
      case 'undo':
        return (<svg className={common} viewBox="0 0 24 24" fill="currentColor"><path d="M7 7v4H3l6 6 6-6H11V7H7z"/></svg>);
      case 'redo':
        return (<svg className={common} viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-6 6h4v4h4V7h-2z"/></svg>);
      case 'image':
        return (<svg className={common} viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14h18zM5 5h14v9l-4-4-3 3-2-2-5 5V5z"/></svg>);
      case 'clear':
        return (<svg className={common} viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h12v2H6v-2zM16 3l5 5-9.5 9.5H6.5V12.5L16 3z"/></svg>);
      default: return null;
    }
  };

  const markButtons: Array<{key:string; active: () => boolean; run: () => void; title:string; icon:string}> = editor ? [
    { key:'bold', active: () => editor.isActive('bold'), run: () => editor.chain().focus().toggleBold().run(), title:'Negrita', icon:'bold' },
    { key:'italic', active: () => editor.isActive('italic'), run: () => editor.chain().focus().toggleItalic().run(), title:'Cursiva', icon:'italic' },
    { key:'underline', active: () => editor.isActive('underline'), run: () => editor.chain().focus().toggleUnderline().run(), title:'Subrayado', icon:'underline' },
    { key:'strike', active: () => editor.isActive('strike'), run: () => editor.chain().focus().toggleStrike().run(), title:'Tachado', icon:'strike' },
    { key:'highlight', active: () => editor.isActive('highlight'), run: () => editor.chain().focus().toggleHighlight().run(), title:'Resaltar', icon:'highlight' },
    { key:'blockquote', active: () => editor.isActive('blockquote'), run: () => editor.chain().focus().toggleBlockquote().run(), title:'Cita', icon:'quote' },
  ] : [];
  const alignButtons: Array<{val:string; icon:string; title:string}> = [
    { val:'left', icon:'align-left', title:'Alinear izquierda' },
    { val:'center', icon:'align-center', title:'Centrar' },
    { val:'right', icon:'align-right', title:'Alinear derecha' },
    { val:'justify', icon:'align-justify', title:'Justificar' },
  ];
  const listButtons: Array<{check:string; run:()=>void; icon:string; title:string}> = editor ? [
    { check:'bulletList', run:() => editor.chain().focus().toggleBulletList().run(), icon:'bullet', title:'Lista con viñetas' },
    { check:'orderedList', run:() => editor.chain().focus().toggleOrderedList().run(), icon:'ordered', title:'Lista numerada' },
    { check:'taskList', run:() => editor.chain().focus().toggleTaskList().run(), icon:'task', title:'Checklist' },
  ] : [];

  useEffect(() => {
    const container = wrapperRef.current;
    if(!container) return;
    const onScroll = () => setScrolled(container.scrollTop > 8);
    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
  }, [isReady]);

  return (
    <div className="border rounded-xl shadow-sm overflow-y-auto bg-white" ref={wrapperRef} style={{ maxHeight: '80vh', position:'relative' }}>
      <div className={`flex flex-wrap items-center gap-3 p-3 border-b bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-20 transition-all duration-200 ${scrolled ? 'shadow-lg border-gray-200' : 'border-gray-100'} ${!isReady ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">Fuente:</span>
          <select
            className="border border-gray-300 px-2 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={currentFontFamily}
            onChange={(e) => editor?.chain().focus().setFontFamily(e.target.value).run()}
            disabled={!isReady}
          >
          <option value="Poppins, sans-serif">Poppins</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="Times New Roman, serif">Times</option>
          <option value="Courier New, monospace">Courier</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">Tamaño:</span>
          <select className="border border-gray-300 px-2 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" value={currentFontSize} onChange={(e) => toggleFontSize(e.target.value)} disabled={!isReady}>
          {['12px','14px','16px','18px','20px','24px','28px','32px','40px','48px'].map(size => (
            <option key={size} value={size}>{size.replace('px','')}</option>
          ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">Estilo:</span>
          <select className="border border-gray-300 px-2 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" onChange={(e) => {
          const v = e.target.value;
          if (!editor) return;
          if (v === 'p') editor.chain().focus().setParagraph().run();
          else if (v === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run();
          else if (v === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run();
          else if (v === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run();
          else if (v === 'h4') editor.chain().focus().toggleHeading({ level: 4 }).run();
          }} defaultValue="p">
            <option value="p">Párrafo</option>
            <option value="h1">Título 1</option>
            <option value="h2">Título 2</option>
            <option value="h3">Título 3</option>
            <option value="h4">Título 4</option>
          </select>
        </div>

        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
          {markButtons.map(b => (
            <button key={b.key} className={`p-2 rounded-md transition-all duration-150 hover:bg-gray-100 ${b.active()? 'bg-blue-100 text-blue-700': 'text-gray-600'}`} disabled={!isReady} title={b.title} type="button" onClick={b.run}>
              <Icon name={b.icon}/>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
          <input type="color" className="w-8 h-8 rounded border-none cursor-pointer" onChange={(e)=> editor?.chain().focus().setColor(e.target.value).run()} title="Color texto" disabled={!isReady} />
          <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors" onClick={() => editor?.chain().focus().unsetColor().run()} disabled={!isReady} type="button" title="Limpiar color">Reset</button>
        </div>

        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
          {alignButtons.map(a => (
            <button key={a.val} disabled={!isReady} className={`p-2 rounded-md transition-all duration-150 hover:bg-gray-100 ${editor?.isActive({ textAlign: a.val }) ? 'bg-blue-100 text-blue-700':'text-gray-600'}`} title={a.title} type="button" onClick={()=>editor?.chain().focus().setTextAlign(a.val).run()}>
              <Icon name={a.icon}/>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
          {listButtons.map(b => (
            <button key={b.icon} className={`p-2 rounded-md transition-all duration-150 hover:bg-gray-100 ${editor?.isActive(b.check)?'bg-blue-100 text-blue-700':'text-gray-600'}`} disabled={!isReady} onClick={b.run} type="button" title={b.title}>
              <Icon name={b.icon}/>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
          <button className="p-2 rounded-md transition-all duration-150 hover:bg-gray-100 text-gray-600" onClick={() => editor?.chain().focus().setHorizontalRule().run()} type="button" title="Regla horizontal"><Icon name="hr"/></button>
          <button className="p-2 rounded-md transition-all duration-150 hover:bg-gray-100 text-gray-600" onClick={() => editor.chain().focus().sinkListItem('listItem').run()} type="button" title="Aumentar sangría">→</button>
          <button className="p-2 rounded-md transition-all duration-150 hover:bg-gray-100 text-gray-600" onClick={() => editor.chain().focus().liftListItem('listItem').run()} type="button" title="Reducir sangría">←</button>
        </div>

        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
          <button className={`p-2 rounded-md transition-all duration-150 hover:bg-gray-100 ${editor?.isActive('link') ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`} onClick={() => {
            const url = prompt('URL del enlace');
            if (url) editor?.chain().focus().setLink({ href: url }).run();
          }} type="button" title="Insertar enlace"><Icon name="link"/></button>
          <button className="p-2 rounded-md transition-all duration-150 hover:bg-gray-100 text-gray-600" onClick={() => editor.chain().focus().unsetLink().run()} type="button" title="Quitar enlace"><Icon name="unlink"/></button>
        </div>

        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
          <button className="p-2 rounded-md transition-all duration-150 hover:bg-gray-100 text-gray-600" onClick={() => editor?.chain().focus().undo().run()} type="button" title="Deshacer"><Icon name="undo"/></button>
          <button className="p-2 rounded-md transition-all duration-150 hover:bg-gray-100 text-gray-600" onClick={() => editor?.chain().focus().redo().run()} type="button" title="Rehacer"><Icon name="redo"/></button>
          <button className="p-2 rounded-md transition-all duration-150 hover:bg-gray-100 text-gray-600" onClick={() => editor?.chain().focus().clearNodes().unsetAllMarks().run()} type="button" title="Limpiar formato"><Icon name="clear"/></button>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={!isReady} />
        <button className="px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg" type="button" onClick={() => fileInputRef.current?.click()} title="Insertar imagen">
          <Icon name="image"/>
          <span className="ml-2 text-sm">Imagen</span>
        </button>
      </div>

      <div className="p-6" style={{ minHeight }}>
        {!value && <div className="text-gray-400 mb-4 text-lg">{placeholder}</div>}
        <EditorContent editor={editor} />
        {imageAttrs && (
          <div className="mt-4 p-4 border border-blue-200 rounded-lg bg-blue-50 flex flex-wrap items-center gap-3 text-sm">
            <span className="font-semibold text-blue-800">🖼️ Configuración de imagen:</span>
            <label className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-blue-200">
              <span className="text-blue-700 font-medium">Ancho:</span>
              <input
                type="number"
                min={10}
                max={100}
                className="border border-blue-300 px-2 py-1 w-16 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={parseInt(imageAttrs.width?.replace('%','') || '100',10)}
                onChange={(e)=> updateSelectedImage({ width: `${e.target.value}%` })}
              />
              <span className="text-blue-700">%</span>
            </label>
            <div className="flex gap-2">
              <button type="button" className="px-3 py-1.5 rounded-lg bg-white border border-blue-200 hover:bg-blue-100 transition-colors text-blue-700 font-medium" onClick={()=>updateSelectedImage({ style: 'display:block;margin:0 auto;' })}>Centrar</button>
              <button type="button" className="px-3 py-1.5 rounded-lg bg-white border border-blue-200 hover:bg-blue-100 transition-colors text-blue-700 font-medium" onClick={()=>updateSelectedImage({ style: 'float:left;margin:4px 12px 4px 0;' })}>Izquierda</button>
              <button type="button" className="px-3 py-1.5 rounded-lg bg-white border border-blue-200 hover:bg-blue-100 transition-colors text-blue-700 font-medium" onClick={()=>updateSelectedImage({ style: 'float:right;margin:4px 0 4px 12px;' })}>Derecha</button>
              <button type="button" className="px-3 py-1.5 rounded-lg bg-white border border-blue-200 hover:bg-blue-100 transition-colors text-blue-700 font-medium" onClick={()=>updateSelectedImage({ style: '' })}>Reset</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;
