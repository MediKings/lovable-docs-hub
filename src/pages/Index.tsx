import { Link } from "react-router-dom";
import { ArrowRight, Book, Code, Database, Shield, GitBranch, Layers, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/10 via-transparent to-transparent" />
        <div className="max-w-5xl mx-auto px-6 py-24 md:py-32 relative">
          <div className="text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent-primary/10 text-accent-primary text-sm font-medium mb-6">
              GhennySoft Engineering
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Standards de Codage{" "}
              <span className="text-accent-primary">GhennySoft</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Guide uniforme des conventions, bonnes pratiques et standards de développement 
              pour tous les projets de l'entreprise. Illustré par des projets concrets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gap-2 bg-accent-primary hover:bg-accent-primary/90 text-white">
                <Link to="/docs">
                  Explorer les standards
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/docs/naming">
                  Conventions de nommage
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-border">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8 text-center">Ce que couvre ce guide</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={FileCode}
              title="Nommage & Clean Code"
              description="Conventions de nommage des fichiers, variables, constantes et principes Clean Code."
            />
            <FeatureCard
              icon={Layers}
              title="Frontend & Backend"
              description="Standards React, Next.js, Tailwind CSS, Django REST Framework et API REST."
            />
            <FeatureCard
              icon={GitBranch}
              title="Git & Workflow"
              description="Nommage des commits, Git Flow, revues de code et processus CI/CD."
            />
            <FeatureCard
              icon={Shield}
              title="Sécurité & Librairies"
              description="Bonnes pratiques de sécurité, librairies recommandées et leur utilité."
            />
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8 text-center">Accès rapide</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <QuickLinkCard
              title="Standards Next.js"
              description="Architecture, routing, Server Components et bonnes pratiques Next.js."
              href="/docs/frontend/nextjs"
            />
            <QuickLinkCard
              title="Commits Git"
              description="Conventional Commits, préfixes, messages clairs et traçabilité."
              href="/docs/git/commits"
            />
            <QuickLinkCard
              title="Sécurité"
              description="Injection, authentification, CORS, gestion des secrets et audit."
              href="/docs/security"
            />
          </div>
        </div>
      </section>

      {/* Projet illustration */}
      <section className="py-20 border-t border-border">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-4 text-center">Projet d'illustration</h2>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            Nos standards sont illustrés à travers un projet concret : une API Blog construite 
            avec Django REST Framework utilisant des APIView.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <QuickLinkCard
              title="Modèles Django"
              description="Post, Comment et Like avec relations et bonnes pratiques."
              href="/docs/models/post"
            />
            <QuickLinkCard
              title="Serializers DRF"
              description="Sérialisation, validation et champs calculés."
              href="/docs/serializers/post"
            />
            <QuickLinkCard
              title="Views APIView"
              description="CRUD, commentaires, likes et compteur de vues."
              href="/docs/views/posts"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">GS</span>
              </div>
              <span className="font-semibold">GhennySoft</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 GhennySoft. Standards de codage — Usage interne.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: typeof Book; title: string; description: string }) {
  return (
    <div className="text-center md:text-left">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-accent-primary/10 mb-4">
        <Icon className="w-6 h-6 text-accent-primary" />
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function QuickLinkCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <Link
      to={href}
      className="group block p-6 rounded-xl border border-border bg-card hover:border-accent-primary/50 hover:shadow-lg transition-all duration-200"
    >
      <h3 className="font-semibold mb-2 group-hover:text-accent-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <span className="text-sm font-medium text-accent-primary inline-flex items-center gap-1">
        En savoir plus
        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
      </span>
    </Link>
  );
}
