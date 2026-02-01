import { Link } from "react-router-dom";
import { ArrowRight, Book, Zap, Code, Users } from "lucide-react";
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
              Documentation v1.0
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Apprenez. Construisez.{" "}
              <span className="text-accent-primary">Déployez.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Une documentation claire et complète pour maîtriser les technologies modernes 
              du développement web. Commencez dès maintenant.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gap-2 bg-accent-primary hover:bg-accent-primary/90 text-header">
                <Link to="/docs">
                  Commencer
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  Voir sur GitHub
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-border">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={Book}
              title="Documentation complète"
              description="Des guides détaillés couvrant chaque aspect du framework."
            />
            <FeatureCard
              icon={Zap}
              title="Démarrage rapide"
              description="Soyez opérationnel en quelques minutes avec nos tutoriels."
            />
            <FeatureCard
              icon={Code}
              title="Exemples de code"
              description="Des exemples pratiques que vous pouvez copier et adapter."
            />
            <FeatureCard
              icon={Users}
              title="Communauté active"
              description="Rejoignez une communauté de développeurs passionnés."
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
              title="Les Bases"
              description="Apprenez les fondamentaux de React et du framework."
              href="/docs"
            />
            <QuickLinkCard
              title="Composants"
              description="Explorez notre bibliothèque de composants UI."
              href="/docs/components"
            />
            <QuickLinkCard
              title="API Reference"
              description="Documentation technique complète de l'API."
              href="/api"
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
                <span className="text-header font-bold text-lg">D</span>
              </div>
              <span className="font-semibold">DevDocs</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 DevDocs. Tous droits réservés.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                GitHub
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Discord
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Twitter
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
