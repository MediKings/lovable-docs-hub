import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Installation", href: "#installation", level: 2 },
  { title: "Éditeur de base", href: "#basic", level: 2 },
  { title: "Toolbar personnalisée", href: "#toolbar", level: 2 },
  { title: "Extensions utiles", href: "#extensions", level: 2 },
  { title: "Intégration formulaire", href: "#form", level: 2 },
  { title: "Rendu du contenu", href: "#render", level: 2 },
];

const installCode = `npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder \\
  @tiptap/extension-link @tiptap/extension-image @tiptap/extension-code-block-lowlight \\
  @tiptap/extension-heading @tiptap/extension-highlight lowlight`;

const basicCode = `// src/components/editor/tiptap-editor.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import { EditorToolbar } from "./editor-toolbar";

interface TiptapEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export const TiptapEditor = ({
  content = "",
  onChange,
  placeholder = "Commencez à écrire...",
  editable = true,
}: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        codeBlock: false, // Remplacé par lowlight
      }),
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline" },
      }),
      Highlight,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[200px] p-4 focus:outline-none",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="border rounded-lg overflow-hidden">
      {editable && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
};`;

const toolbarCode = `// src/components/editor/editor-toolbar.tsx
"use client";

import { type Editor } from "@tiptap/react";
import {
  Bold, Italic, Strikethrough, Code,
  Heading2, Heading3, List, ListOrdered,
  Quote, Undo, Redo, Link as LinkIcon,
  Highlighter, Minus,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";

interface EditorToolbarProps {
  editor: Editor;
}

export const EditorToolbar = ({ editor }: EditorToolbarProps) => {
  const addLink = () => {
    const url = window.prompt("URL du lien :");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b p-2 bg-muted/50">
      {/* Formatage texte */}
      <Toggle
        size="sm"
        pressed={editor.isActive("bold")}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("italic")}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("strike")}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("code")}
        onPressedChange={() => editor.chain().focus().toggleCode().run()}
      >
        <Code className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("highlight")}
        onPressedChange={() =>
          editor.chain().focus().toggleHighlight().run()
        }
      >
        <Highlighter className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Titres */}
      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 2 })}
        onPressedChange={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
      >
        <Heading2 className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 3 })}
        onPressedChange={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
      >
        <Heading3 className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Listes & blocs */}
      <Toggle
        size="sm"
        pressed={editor.isActive("bulletList")}
        onPressedChange={() =>
          editor.chain().focus().toggleBulletList().run()
        }
      >
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("orderedList")}
        onPressedChange={() =>
          editor.chain().focus().toggleOrderedList().run()
        }
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("blockquote")}
        onPressedChange={() =>
          editor.chain().focus().toggleBlockquote().run()
        }
      >
        <Quote className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Actions */}
      <Toggle size="sm" onPressedChange={addLink}>
        <LinkIcon className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        onPressedChange={() =>
          editor.chain().focus().setHorizontalRule().run()
        }
      >
        <Minus className="h-4 w-4" />
      </Toggle>

      <div className="flex-1" />

      <Toggle
        size="sm"
        onPressedChange={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        onPressedChange={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo className="h-4 w-4" />
      </Toggle>
    </div>
  );
};`;

const extensionsCode = `// ✅ Code blocks avec coloration syntaxique
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";

const lowlight = createLowlight(common);

const editor = useEditor({
  extensions: [
    // ...autres extensions
    CodeBlockLowlight.configure({ lowlight }),
  ],
});

// ✅ Upload d'images
import Image from "@tiptap/extension-image";

const editor = useEditor({
  extensions: [
    Image.configure({
      HTMLAttributes: {
        class: "rounded-lg max-w-full h-auto",
      },
    }),
  ],
});

// Insérer une image
const addImage = (url: string) => {
  editor?.chain().focus().setImage({ src: url }).run();
};

// ✅ Limite de caractères
import CharacterCount from "@tiptap/extension-character-count";

const editor = useEditor({
  extensions: [
    CharacterCount.configure({ limit: 5000 }),
  ],
});

// Afficher le compteur
const count = editor?.storage.characterCount;
// count.characters() — count.words()`;

const formCode = `// ✅ Intégration avec React Hook Form + Zod
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TiptapEditor } from "@/components/editor/tiptap-editor";

const postSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  content: z
    .string()
    .min(10, "Le contenu doit contenir au moins 10 caractères")
    .refine(
      (val) => val !== "<p></p>",
      "Le contenu ne peut pas être vide"
    ),
});

type PostFormData = z.infer<typeof postSchema>;

export const PostForm = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: { title: "", content: "" },
  });

  const onSubmit = (data: PostFormData) => {
    console.log("HTML content:", data.content);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="text-sm font-medium">Titre</label>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <input {...field} className="w-full border rounded-lg p-2" />
          )}
        />
        {errors.title && (
          <p className="text-destructive text-sm mt-1">
            {errors.title.message}
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium">Contenu</label>
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <TiptapEditor
              content={field.value}
              onChange={field.onChange}
            />
          )}
        />
        {errors.content && (
          <p className="text-destructive text-sm mt-1">
            {errors.content.message}
          </p>
        )}
      </div>

      <Button type="submit">Publier</Button>
    </form>
  );
};`;

const renderCode = `// ✅ Rendu sécurisé du contenu HTML (lecture seule)
// Option 1 : Tiptap en mode non-éditable
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export const TiptapRenderer = ({ content }: { content: string }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable: false,
  });

  return <EditorContent editor={editor} />;
};

// Option 2 : generateHTML (sans instancier l'éditeur)
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";

export const RenderContent = ({ json }: { json: JSONContent }) => {
  const html = generateHTML(json, [StarterKit]);

  return (
    <div
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

// ⚠️ Si vous utilisez dangerouslySetInnerHTML avec du contenu utilisateur,
// assurez-vous de sanitizer le HTML avec DOMPurify :
import DOMPurify from "dompurify";

const safeHtml = DOMPurify.sanitize(rawHtml);`;

const TiptapEditor = () => {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Tiptap — Éditeur de texte riche</h1>

      <p>
        Tiptap est l'éditeur WYSIWYG standard chez GhennySoft pour les contenus 
        riches (articles de blog, commentaires, pages CMS). Il est extensible, 
        headless et s'intègre parfaitement avec React et Shadcn/UI.
      </p>

      <Callout type="info" title="Headless = personnalisable">
        Tiptap ne fournit aucun style par défaut. La toolbar et le rendu sont 
        entièrement contrôlés par vos composants — idéal pour notre design system.
      </Callout>

      <hr />

      <h2 id="installation">Installation</h2>
      <CodeBlock code={installCode} language="bash" />

      <h2 id="basic">Éditeur de base</h2>
      <CodeBlock code={basicCode} language="tsx" />

      <h2 id="toolbar">Toolbar personnalisée</h2>
      <p>
        La toolbar utilise les composants <code>Toggle</code> de Shadcn/UI pour refléter 
        l'état actif de chaque action de formatage.
      </p>
      <CodeBlock code={toolbarCode} language="tsx" />

      <h2 id="extensions">Extensions utiles</h2>
      <CodeBlock code={extensionsCode} language="tsx" />

      <h2 id="form">Intégration formulaire</h2>
      <p>
        Tiptap s'intègre avec React Hook Form via un <code>Controller</code>. 
        La validation Zod vérifie que le contenu HTML n'est pas vide.
      </p>
      <CodeBlock code={formCode} language="tsx" />

      <h2 id="render">Rendu du contenu</h2>
      <CodeBlock code={renderCode} language="tsx" />

      <Callout type="warning" title="Sécurité">
        Toujours sanitizer le HTML utilisateur avant de le rendre avec 
        <code>dangerouslySetInnerHTML</code>. Utilisez <strong>DOMPurify</strong>.
      </Callout>

      <DocsPagination
        prev={{ title: "TanStack Query", href: "/docs/nextjs-libs/tanstack-query" }}
        next={{ title: "Zod & React Hook Form", href: "/docs/nextjs-libs/zod-rhf" }}
      />
    </DocsLayout>
  );
};

export default TiptapEditor;
