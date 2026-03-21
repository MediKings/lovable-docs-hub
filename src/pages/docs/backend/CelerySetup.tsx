import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Installation", href: "#installation", level: 2 },
  { title: "Configuration", href: "#configuration", level: 2 },
  { title: "Créer une tâche", href: "#tasks", level: 2 },
  { title: "Tâches périodiques", href: "#periodic", level: 2 },
  { title: "Intégration Blog API", href: "#blog-integration", level: 2 },
  { title: "Monitoring", href: "#monitoring", level: 2 },
];

const installCode = `# Installation
pip install celery[redis] django-celery-beat django-celery-results`;

const celeryAppCode = `# project/celery.py

import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "project.settings")

app = Celery("project")

# Charger la config depuis settings.py avec le préfixe CELERY_
app.config_from_object("django.conf:settings", namespace="CELERY")

# Découverte automatique des tâches dans chaque app
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Tâche de debug pour vérifier que Celery fonctionne."""
    print(f"Request: {self.request!r}")`;

const initCode = `# project/__init__.py

from .celery import app as celery_app

__all__ = ["celery_app"]`;

const settingsCode = `# settings.py — Configuration Celery

# Broker (Redis)
CELERY_BROKER_URL = "redis://127.0.0.1:6379/0"

# Backend de résultats
CELERY_RESULT_BACKEND = "django-db"

# Sérialisation
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"

# Timezone
CELERY_TIMEZONE = "UTC"
CELERY_ENABLE_UTC = True

# Limites
CELERY_TASK_SOFT_TIME_LIMIT = 300   # 5 min (warning)
CELERY_TASK_TIME_LIMIT = 600        # 10 min (kill)
CELERY_TASK_ACKS_LATE = True
CELERY_WORKER_PREFETCH_MULTIPLIER = 1

# Beat (tâches périodiques)
CELERY_BEAT_SCHEDULER = "django_celery_beat.schedulers:DatabaseScheduler"

INSTALLED_APPS += [
    "django_celery_beat",
    "django_celery_results",
]`;

const taskCode = `# blog/tasks.py

from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings


@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,
    name="blog.send_notification_email",
)
def send_notification_email(self, recipient_email: str, post_title: str):
    """
    Envoie un email de notification pour un nouvel article.
    Retry automatique en cas d'échec (max 3 fois).
    """
    try:
        send_mail(
            subject=f"Nouvel article : {post_title}",
            message=f"Un nouvel article a été publié : {post_title}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            fail_silently=False,
        )
    except Exception as exc:
        raise self.retry(exc=exc)


@shared_task(name="blog.generate_post_summary")
def generate_post_summary(post_id: int):
    """
    Génère un résumé automatique d'un article (tâche lourde).
    """
    from blog.models import Post
    
    post = Post.objects.get(pk=post_id)
    
    # Logique de génération de résumé (IA, NLP, etc.)
    summary = post.content[:200] + "..."
    
    post.summary = summary
    post.save(update_fields=["summary"])
    
    return f"Résumé généré pour : {post.title}"`;

const periodicCode = `# blog/tasks.py — Tâches périodiques

from celery import shared_task
from celery.schedules import crontab
from django.utils import timezone
from datetime import timedelta


@shared_task(name="blog.cleanup_old_drafts")
def cleanup_old_drafts():
    """
    Supprime les brouillons non modifiés depuis 30 jours.
    Exécutée chaque nuit à 3h00.
    """
    from blog.models import Post
    
    threshold = timezone.now() - timedelta(days=30)
    deleted_count, _ = Post.objects.filter(
        is_published=False,
        updated_at__lt=threshold,
    ).delete()
    
    return f"{deleted_count} brouillon(s) supprimé(s)"


@shared_task(name="blog.reset_daily_view_counts")
def aggregate_daily_stats():
    """
    Agrège les statistiques quotidiennes de vues.
    Exécutée chaque jour à minuit.
    """
    from blog.models import Post
    from django.db.models import Sum
    
    total_views = Post.objects.aggregate(
        total=Sum("view_count")
    )["total"] or 0
    
    # Sauvegarder dans un modèle de stats quotidiennes
    # DailyStat.objects.create(date=timezone.now().date(), total_views=total_views)
    
    return f"Stats agrégées : {total_views} vues totales"`;

const beatConfigCode = `# project/celery.py — Ajouter le beat_schedule

app.conf.beat_schedule = {
    "cleanup-old-drafts": {
        "task": "blog.cleanup_old_drafts",
        "schedule": crontab(hour=3, minute=0),  # Tous les jours à 3h
    },
    "aggregate-daily-stats": {
        "task": "blog.reset_daily_view_counts",
        "schedule": crontab(hour=0, minute=0),  # Tous les jours à minuit
    },
    "send-weekly-digest": {
        "task": "blog.send_weekly_digest",
        "schedule": crontab(
            hour=9,
            minute=0,
            day_of_week="monday",
        ),  # Chaque lundi à 9h
    },
}`;

const viewIntegrationCode = `# blog/views.py — Appel de tâches depuis les vues

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from blog.tasks import send_notification_email, generate_post_summary


class PostCreateView(APIView):
    """Création d'article avec tâches asynchrones."""

    def post(self, request) -> Response:
        serializer = PostSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        post = serializer.save(author=request.user)
        
        # Tâches asynchrones (non bloquantes)
        if post.is_published:
            # Notifier les abonnés
            subscribers = User.objects.filter(
                is_subscribed=True
            ).values_list("email", flat=True)
            
            for email in subscribers:
                send_notification_email.delay(email, post.title)
        
        # Générer un résumé en arrière-plan
        generate_post_summary.delay(post.id)
        
        return Response(
            PostSerializer(post).data,
            status=status.HTTP_201_CREATED,
        )`;

const runCommandsCode = `# Lancer le worker Celery
celery -A project worker --loglevel=info --concurrency=4

# Lancer le beat scheduler (tâches périodiques)
celery -A project beat --loglevel=info

# Lancer les deux en même temps (dev uniquement)
celery -A project worker --beat --loglevel=info

# Monitoring avec Flower
pip install flower
celery -A project flower --port=5555`;

const CelerySetup = () => {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Celery — Tâches asynchrones</h1>

      <p>
        Celery permet d'exécuter des tâches en arrière-plan (emails, génération de résumés,
        nettoyage de données) sans bloquer les requêtes HTTP.
        Chez GhennySoft, nous utilisons Redis comme broker.
      </p>

      <h2 id="installation">Installation</h2>
      <CodeBlock code={installCode} language="bash" />

      <h2 id="configuration">Configuration</h2>

      <p>Créer le fichier de configuration Celery :</p>
      <CodeBlock code={celeryAppCode} language="python" />

      <p>Enregistrer l'app dans <code>__init__.py</code> :</p>
      <CodeBlock code={initCode} language="python" />

      <p>Ajouter la configuration dans <code>settings.py</code> :</p>
      <CodeBlock code={settingsCode} language="python" />

      <Callout type="tip" title="CELERY_TASK_ACKS_LATE">
        Avec <code>acks_late=True</code>, le message n'est acquitté qu'après l'exécution
        de la tâche. En cas de crash du worker, la tâche sera ré-exécutée automatiquement.
      </Callout>

      <h2 id="tasks">Créer une tâche</h2>

      <p>
        Les tâches sont définies dans <code>tasks.py</code> de chaque app Django.
        Utilisez <code>@shared_task</code> pour la portabilité :
      </p>

      <CodeBlock code={taskCode} language="python" />

      <Callout type="warning" title="Retry & Idempotence">
        Toute tâche avec retry doit être <strong>idempotente</strong> : l'exécuter
        plusieurs fois doit produire le même résultat.
      </Callout>

      <h2 id="periodic">Tâches périodiques (Beat)</h2>

      <p>
        Celery Beat permet de planifier des tâches récurrentes (cron-like) :
      </p>

      <CodeBlock code={periodicCode} language="python" />

      <p>Configuration du schedule dans <code>celery.py</code> :</p>

      <CodeBlock code={beatConfigCode} language="python" />

      <h2 id="blog-integration">Intégration Blog API</h2>

      <p>
        Exemple concret d'appel de tâches Celery depuis les vues du blog :
      </p>

      <CodeBlock code={viewIntegrationCode} language="python" />

      <Callout type="info" title=".delay() vs .apply_async()">
        <ul>
          <li><code>.delay(arg1, arg2)</code> — raccourci simple</li>
          <li><code>.apply_async(args=[...], countdown=60)</code> — options avancées (délai, queue, etc.)</li>
        </ul>
      </Callout>

      <h2 id="monitoring">Monitoring & Commandes</h2>

      <CodeBlock code={runCommandsCode} language="bash" />

      <Callout type="tip" title="Flower">
        Flower fournit un dashboard web pour monitorer les workers, les tâches en cours,
        les échecs et les performances. Indispensable en production.
      </Callout>

      <DocsPagination
        prev={{ title: "Redis — Cache & Sessions", href: "/docs/backend/redis" }}
        next={{ title: "Authentification JWT", href: "/docs/authentication" }}
      />
    </DocsLayout>
  );
};

export default CelerySetup;
