import { Link } from "react-router-dom";
import { ArrowRight, Book, Code, Database, Heart } from "lucide-react";
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
              Django REST Framework
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              API Blog avec{" "}
              <span className="text-accent-primary">Django REST Framework</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Apprenez à créer une API REST complète pour un blog avec CRUD, 
              commentaires, likes et compteur de vues en utilisant APIView.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gap-2 bg-accent-primary hover:bg-accent-primary/90 text-white">
                <Link to="/docs">
                  Commencer le tutoriel
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="https://www.django-rest-framework.org/" target="_blank" rel="noopener noreferrer">
                  Documentation DRF
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-border">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8 text-center">Ce que vous allez apprendre</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={Database}
              title="Modèles Django"
              description="Post, Comment et Like avec relations et méthodes utiles."
            />
            <FeatureCard
              icon={Code}
              title="Serializers DRF"
              description="Sérialisation des données avec validation et champs calculés."
            />
            <FeatureCard
              icon={Book}
              title="APIView"
              description="Contrôle total avec des vues basées sur classes."
            />
            <FeatureCard
              icon={Heart}
              title="Likes & Vues"
              description="Système de likes et compteur de vues intelligent."
            />
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8 text-center">Liens rapides</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <QuickLinkCard
              title="Modèles"
              description="Définition des modèles Post, Comment et Like."
              href="/docs/models/post"
            />
            <QuickLinkCard
              title="Serializers"
              description="Transformation des données en JSON et validation."
              href="/docs/serializers/post"
            />
            <QuickLinkCard
              title="Views (APIView)"
              description="Création des endpoints CRUD avec APIView."
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
                <span className="text-lg">🐍</span>
              </div>
              <span className="font-semibold">DRF Blog API</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 DRF Blog API Tutorial. Tous droits réservés.
            </p>
            <div className="flex gap-6">
              <a href="https://github.com/encode/django-rest-framework" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                GitHub DRF
              </a>
              <a href="https://www.django-rest-framework.org/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Docs DRF
              </a>
            </div>
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
