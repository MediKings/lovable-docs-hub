import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Installation", href: "#installation", level: 2 },
  { title: "Schémas Zod", href: "#schemas", level: 2 },
  { title: "Formulaire de base", href: "#basic-form", level: 2 },
  { title: "Validation avancée", href: "#advanced", level: 2 },
  { title: "Composants réutilisables", href: "#reusable", level: 2 },
  { title: "Formulaire complet", href: "#complete", level: 2 },
  { title: "Validation côté serveur", href: "#server", level: 2 },
];

const installCode = `npm install zod react-hook-form @hookform/resolvers`;

const schemasCode = `// src/schemas/auth.ts
import { z } from "zod";

// ✅ Schéma de login
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis")
    .min(8, "Minimum 8 caractères"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ✅ Schéma d'inscription avec confirmation
export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Minimum 3 caractères")
      .max(30, "Maximum 30 caractères")
      .regex(/^[a-zA-Z0-9_]+$/, "Lettres, chiffres et _ uniquement"),
    email: z.string().email("Email invalide"),
    password: z
      .string()
      .min(8, "Minimum 8 caractères")
      .regex(/[A-Z]/, "Au moins une majuscule")
      .regex(/[0-9]/, "Au moins un chiffre")
      .regex(/[^A-Za-z0-9]/, "Au moins un caractère spécial"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// ✅ Schéma de post avec transformation
export const postSchema = z.object({
  title: z
    .string()
    .min(3, "Minimum 3 caractères")
    .max(200, "Maximum 200 caractères")
    .transform((val) => val.trim()),
  content: z
    .string()
    .min(10, "Le contenu doit contenir au moins 10 caractères"),
  is_published: z.boolean().default(false),
  tags: z
    .array(z.string())
    .max(5, "Maximum 5 tags")
    .optional()
    .default([]),
});

export type PostFormData = z.infer<typeof postSchema>;`;

const basicFormCode = `// src/components/forms/login-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/schemas/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form, FormControl, FormField,
  FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";

export const LoginForm = () => {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    // Les données sont déjà validées et typées
    console.log("Login:", data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="nom@ghennySoft.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Connexion..." : "Se connecter"}
        </Button>
      </form>
    </Form>
  );
};`;

const advancedCode = `// ✅ Validations conditionnelles
const contactSchema = z.discriminatedUnion("contactType", [
  z.object({
    contactType: z.literal("email"),
    email: z.string().email(),
  }),
  z.object({
    contactType: z.literal("phone"),
    phone: z.string().regex(/^\\+?[0-9]{10,15}$/, "Numéro invalide"),
  }),
]);

// ✅ Validation asynchrone (vérifier si l'email existe déjà)
const registerSchema = z.object({
  email: z
    .string()
    .email()
    .refine(
      async (email) => {
        const res = await fetch(\`/api/check-email?email=\${email}\`);
        const { available } = await res.json();
        return available;
      },
      { message: "Cet email est déjà utilisé" }
    ),
});

// ✅ Schéma de mise à jour partiel
const updatePostSchema = postSchema.partial();
// Tous les champs deviennent optionnels

// ✅ Réutilisation avec extend
const baseUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
});

const adminSchema = baseUserSchema.extend({
  role: z.enum(["admin", "superadmin"]),
  permissions: z.array(z.string()),
});

// ✅ Validation de fichier
const fileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((f) => f.size <= 5 * 1024 * 1024, "Max 5 Mo")
    .refine(
      (f) => ["image/jpeg", "image/png", "image/webp"].includes(f.type),
      "Format accepté : JPEG, PNG ou WebP"
    ),
});`;

const reusableCode = `// src/components/forms/form-input.tsx
"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  FormControl, FormField, FormItem,
  FormLabel, FormMessage, FormDescription,
} from "@/components/ui/form";

interface FormInputProps {
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  type?: string;
}

// ✅ Input réutilisable connecté à React Hook Form
export const FormInput = ({
  name,
  label,
  placeholder,
  description,
  type = "text",
}: FormInputProps) => {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input type={type} placeholder={placeholder} {...field} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

// ✅ Utilisation simplifiée
const RegisterForm = () => {
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormInput name="username" label="Nom d'utilisateur" />
        <FormInput name="email" label="Email" type="email" />
        <FormInput name="password" label="Mot de passe" type="password" />
        <FormInput
          name="confirmPassword"
          label="Confirmer"
          type="password"
        />
        <Button type="submit">S'inscrire</Button>
      </form>
    </Form>
  );
};`;

const completeCode = `// ✅ Formulaire complet : création d'article avec Tiptap
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postSchema, type PostFormData } from "@/schemas/post";
import { useCreatePost } from "@/hooks/use-posts";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form, FormControl, FormField,
  FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";

export const CreatePostForm = () => {
  const { mutate, isPending } = useCreatePost();

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
      is_published: false,
      tags: [],
    },
  });

  const onSubmit = (data: PostFormData) => {
    mutate(data, {
      onSuccess: () => form.reset(),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre de l'article</FormLabel>
              <FormControl>
                <Input placeholder="Mon super article" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenu</FormLabel>
              <FormControl>
                <TiptapEditor
                  content={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_published"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="!mt-0">
                Publier immédiatement
              </FormLabel>
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Création..." : "Créer l'article"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
          >
            Réinitialiser
          </Button>
        </div>
      </form>
    </Form>
  );
};`;

const serverCode = `// ✅ Validation côté serveur avec Zod (Next.js Server Actions)
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

const createPostSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  content: z.string().min(10),
  is_published: z.boolean().default(false),
});

export async function createPost(formData: FormData) {
  // Valider les données entrantes
  const parsed = createPostSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    is_published: formData.get("is_published") === "true",
  });

  if (!parsed.success) {
    return {
      error: parsed.error.flatten().fieldErrors,
    };
  }

  // Données validées et typées
  const { title, content, is_published } = parsed.data;

  await db.post.create({
    data: { title, content, is_published, authorId: getCurrentUserId() },
  });

  revalidatePath("/posts");
  return { success: true };
}

// ✅ Validation d'API Route Handler
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createPostSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "Validation failed", details: parsed.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }

  const post = await db.post.create({ data: parsed.data });
  return NextResponse.json(post, { status: 201 });
}`;

const ZodReactHookForm = () => {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Zod & React Hook Form — Validation</h1>

      <p>
        Zod pour la définition des schémas de validation et React Hook Form pour la gestion 
        des formulaires sont la combinaison standard chez GhennySoft. Ensemble, ils offrent 
        une validation type-safe de bout en bout.
      </p>

      <Callout type="info" title="Stack formulaire GhennySoft">
        <strong>Zod</strong> (schémas) + <strong>React Hook Form</strong> (état formulaire) + 
        <strong>@hookform/resolvers</strong> (pont) + <strong>Shadcn Form</strong> (composants UI)
      </Callout>

      <hr />

      <h2 id="installation">Installation</h2>
      <CodeBlock code={installCode} language="bash" />

      <h2 id="schemas">Schémas Zod</h2>
      <p>
        Les schémas sont centralisés dans <code>src/schemas/</code> et réutilisés 
        côté client et serveur. Chaque schéma exporte son type inféré.
      </p>
      <CodeBlock code={schemasCode} language="typescript" />

      <h2 id="basic-form">Formulaire de base</h2>
      <p>
        Utiliser les composants <code>Form</code> de Shadcn/UI pour une intégration 
        automatique des labels, messages d'erreur et accessibilité.
      </p>
      <CodeBlock code={basicFormCode} language="tsx" />

      <h2 id="advanced">Validation avancée</h2>
      <CodeBlock code={advancedCode} language="typescript" />

      <h2 id="reusable">Composants réutilisables</h2>
      <p>
        Créer des composants de formulaire réutilisables pour éviter la répétition 
        du pattern <code>FormField → FormItem → FormControl</code>.
      </p>
      <CodeBlock code={reusableCode} language="tsx" />

      <h2 id="complete">Formulaire complet</h2>
      <p>
        Exemple combinant Zod, React Hook Form, Tiptap et TanStack Query pour un formulaire 
        de création d'article avec éditeur riche.
      </p>
      <CodeBlock code={completeCode} language="tsx" />

      <h2 id="server">Validation côté serveur</h2>
      <p>
        Les mêmes schémas Zod sont réutilisés côté serveur dans les Server Actions 
        et API Route Handlers pour une validation cohérente.
      </p>
      <CodeBlock code={serverCode} language="tsx" />

      <Callout type="warning" title="Règle critique">
        Ne jamais faire confiance aux données côté client uniquement. 
        <strong>Toujours valider côté serveur</strong> avec les mêmes schémas Zod.
      </Callout>

      <DocsPagination
        prev={{ title: "Tiptap", href: "/docs/nextjs-libs/tiptap" }}
        next={{ title: "Next.js Frontend Setup", href: "/docs/nextjs-frontend/setup" }}
      />
    </DocsLayout>
  );
};

export default ZodReactHookForm;
