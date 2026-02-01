import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "PostSerializer", href: "#post-serializer", level: 2 },
  { title: "PostListSerializer", href: "#post-list-serializer", level: 2 },
  { title: "Champs calculés", href: "#computed-fields", level: 2 },
];

const postSerializerCode = `from rest_framework import serializers
from .models import Post


class PostSerializer(serializers.ModelSerializer):
    """
    Serializer complet pour un article.
    Utilisé pour le détail et la création/modification.
    """
    author = serializers.StringRelatedField(read_only=True)
    author_id = serializers.IntegerField(source='author.id', read_only=True)
    
    # Champs calculés (read-only)
    like_count = serializers.IntegerField(read_only=True)
    comment_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Post
        fields = [
            'id',
            'title',
            'slug',
            'content',
            'excerpt',
            'author',
            'author_id',
            'created_at',
            'updated_at',
            'published_at',
            'is_published',
            'view_count',
            'like_count',
            'comment_count',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'view_count',
        ]`;

const postListSerializerCode = `class PostListSerializer(serializers.ModelSerializer):
    """
    Serializer allégé pour la liste des articles.
    Exclut le contenu complet pour des performances optimales.
    """
    author = serializers.StringRelatedField(read_only=True)
    like_count = serializers.IntegerField(read_only=True)
    comment_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Post
        fields = [
            'id',
            'title',
            'slug',
            'excerpt',
            'author',
            'created_at',
            'is_published',
            'view_count',
            'like_count',
            'comment_count',
        ]`;

const slugAutoGenerationCode = `from django.utils.text import slugify


class PostSerializer(serializers.ModelSerializer):
    # ... autres champs
    
    def create(self, validated_data):
        # Générer le slug automatiquement si non fourni
        if 'slug' not in validated_data or not validated_data['slug']:
            validated_data['slug'] = slugify(validated_data['title'])
        
        return super().create(validated_data)
    
    def validate_slug(self, value):
        # Vérifier l'unicité du slug
        if Post.objects.filter(slug=value).exists():
            raise serializers.ValidationError(
                "Un article avec ce slug existe déjà."
            )
        return value`;

export default function PostSerializerPage() {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>PostSerializer</h1>
      
      <p>
        Les serializers transforment les objets Django en JSON et vice-versa.
        Nous utilisons deux serializers pour les articles : un complet et un allégé.
      </p>

      <h2 id="post-serializer">Serializer complet</h2>

      <CodeBlock code={postSerializerCode} language="python" />

      <Callout type="info" title="StringRelatedField">
        <code>StringRelatedField</code> utilise la méthode <code>__str__</code> 
        du modèle User pour afficher le nom de l'auteur au lieu de son ID.
      </Callout>

      <h2 id="post-list-serializer">Serializer pour la liste</h2>

      <p>
        Pour la liste des articles, on utilise un serializer allégé qui exclut 
        le contenu complet pour de meilleures performances :
      </p>

      <CodeBlock code={postListSerializerCode} language="python" />

      <h2 id="computed-fields">Champs calculés</h2>

      <p>
        Les champs <code>like_count</code> et <code>comment_count</code> sont 
        des propriétés définies dans le modèle. DRF les sérialise automatiquement.
      </p>

      <h3>Génération automatique du slug</h3>

      <CodeBlock code={slugAutoGenerationCode} language="python" />

      <Callout type="tip" title="Validation personnalisée">
        La méthode <code>validate_slug</code> est appelée automatiquement 
        lors de la validation. Elle vérifie l'unicité du slug.
      </Callout>

      <DocsPagination
        prev={{ title: "Modèle Like", href: "/docs/models/like" }}
        next={{ title: "CommentSerializer", href: "/docs/serializers/comment" }}
      />
    </DocsLayout>
  );
}
