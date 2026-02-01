import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "LikeSerializer", href: "#like-serializer", level: 2 },
  { title: "Cas d'usage", href: "#use-cases", level: 2 },
];

const likeSerializerCode = `from rest_framework import serializers
from .models import Like


class LikeSerializer(serializers.ModelSerializer):
    """
    Serializer pour les likes.
    Généralement utilisé uniquement en lecture.
    """
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Like
        fields = ['id', 'user', 'created_at']
        read_only_fields = ['id', 'created_at']`;

const allSerializersCode = `# blog/serializers.py - Fichier complet

from rest_framework import serializers
from django.utils.text import slugify
from .models import Post, Comment, Like


class LikeSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Like
        fields = ['id', 'user', 'created_at']


class CommentSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)
    author_id = serializers.IntegerField(source='author.id', read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'content', 'author', 'author_id', 'created_at']
        read_only_fields = ['id', 'created_at']


class PostListSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)
    like_count = serializers.IntegerField(read_only=True)
    comment_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'excerpt', 'author',
            'created_at', 'view_count', 'like_count', 'comment_count'
        ]


class PostSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)
    author_id = serializers.IntegerField(source='author.id', read_only=True)
    like_count = serializers.IntegerField(read_only=True)
    comment_count = serializers.IntegerField(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'content', 'excerpt',
            'author', 'author_id', 'created_at', 'updated_at',
            'published_at', 'is_published', 'view_count',
            'like_count', 'comment_count', 'comments'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'view_count']

    def create(self, validated_data):
        if 'slug' not in validated_data or not validated_data['slug']:
            validated_data['slug'] = slugify(validated_data['title'])
        return super().create(validated_data)`;

export default function LikeSerializerPage() {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>LikeSerializer</h1>
      
      <p>
        Le serializer de like est le plus simple. Les likes sont généralement 
        gérés via un endpoint toggle plutôt que CRUD classique.
      </p>

      <h2 id="like-serializer">Définition</h2>

      <CodeBlock code={likeSerializerCode} language="python" />

      <h2 id="use-cases">Cas d'usage</h2>

      <p>Le serializer de like est principalement utilisé pour :</p>

      <ul>
        <li>Afficher la liste des utilisateurs ayant liké un article</li>
        <li>Retourner les détails d'un like créé</li>
      </ul>

      <Callout type="info" title="Endpoint Toggle">
        En pratique, les likes utilisent souvent un endpoint "toggle" qui 
        retourne simplement le statut et le compteur, sans passer par le serializer.
      </Callout>

      <hr />

      <h2>Récapitulatif des serializers</h2>

      <p>Voici le fichier <code>serializers.py</code> complet :</p>

      <CodeBlock code={allSerializersCode} language="python" />

      <DocsPagination
        prev={{ title: "CommentSerializer", href: "/docs/serializers/comment" }}
        next={{ title: "Views CRUD Articles", href: "/docs/views/posts" }}
      />
    </DocsLayout>
  );
}
