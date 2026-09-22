"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useCallback, useRef, useState } from "react";
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  ImageIcon,
  Loader2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Undo2,
  Redo2,
  Minus,
} from "lucide-react";
import { api } from "@/lib/api";
import type { Editor } from "@tiptap/react";

const STORAGE_PUBLIC_URL = (process.env.NEXT_PUBLIC_STORAGE_PUBLIC_URL ?? "").replace(/\/$/, "");

// Pasted HTML may carry <img>s that live in our own storage (copied from another article). Re-ingest
// them so every image belongs to exactly one entity — the sweep/delete logic depends on it.
// Ingest failing keeps the original src: pasting must never be blocked.
async function cloneOwnImages(html: string): Promise<string> {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const imgs = [...doc.querySelectorAll("img")].filter((i) => i.src.startsWith(`${STORAGE_PUBLIC_URL}/`));
  await Promise.all(
    imgs.map(async (img) => {
      try {
        const { content } = await api.media.ingest(img.src, "content");
        if (content) img.setAttribute("src", content);
      } catch {
        /* keep original */
      }
    }),
  );
  return doc.body.innerHTML;
}

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
};

function ToolbarButton({ onClick, active, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
        active
          ? "bg-primary-light text-primary"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-0.5" />;
}

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export function RichTextEditor({ value, onChange, placeholder = "İçeriği buraya yazın..." }: Props) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<Editor | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      TiptapImage.configure({
        HTMLAttributes: { class: "max-w-full h-auto rounded-lg" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight,
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
      handlePaste: (_view, event) => {
        const html = event.clipboardData?.getData("text/html");
        if (!STORAGE_PUBLIC_URL || !html || !html.includes(STORAGE_PUBLIC_URL)) return false;
        event.preventDefault();
        void cloneOwnImages(html).then((cloned) => editorRef.current?.commands.insertContent(cloned));
        return true;
      },
    },
  });

  editorRef.current = editor;

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string;
    const url = window.prompt("URL girin:", prev);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  async function handleImageSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !editor) return;
    setUploadingImage(true);
    try {
      const variants = await api.media.upload(file, "content");
      const url = variants.content;
      if (url) editor.chain().focus().setImage({ src: url }).run();
    } catch {
      window.alert("Görsel yüklenirken bir hata oluştu.");
    } finally {
      setUploadingImage(false);
    }
  }

  if (!editor) return null;

  return (
    <div className="tiptap-editor rounded-lg border border-gray-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-100 bg-gray-50">
        {/* Undo / Redo */}
        <ToolbarButton title="Geri Al (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Yinele (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Headings */}
        <ToolbarButton title="Başlık 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Başlık 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Başlık 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Inline formatting */}
        <ToolbarButton title="Kalın (Ctrl+B)" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="İtalik (Ctrl+I)" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Altı Çizili (Ctrl+U)" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Üstü Çizili" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Vurgula" active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight().run()}>
          <Highlighter className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton title="Madde İmleri" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Numaralı Liste" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Alıntı" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Yatay Çizgi" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Alignment */}
        <ToolbarButton title="Sola Hizala" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Ortala" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Sağa Hizala" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Link */}
        <ToolbarButton title="Bağlantı (Ctrl+K)" active={editor.isActive("link")} onClick={setLink}>
          <Link2 className="h-4 w-4" />
        </ToolbarButton>

        {/* Image */}
        <ToolbarButton title="Görsel Ekle" disabled={uploadingImage} onClick={() => imageInputRef.current?.click()}>
          {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
        </ToolbarButton>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageSelected}
          className="hidden"
        />
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
