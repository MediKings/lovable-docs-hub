import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "CommentSerializer", href: "#comment-serializer", level: 2 },
  { title: "Nested Serializer", href: "#nested", level: 2 },
];

const commentSerializerCode = `from rest_framework import serializers
from .models import Comment


class CommentSerializer(serializers.ModelSerializer):
    """
    Serializer pour les commentaires.
    L'auteur et le post sont assignés dans la vue.
    """
    author = serializers.StringRelatedField(read_only=True)
    author_id = serializers.IntegerField(source='author.id', read_only=True)
    
    class Meta:
        model = Comment
        fields = [
            'id',
            'content',
            'author',
            'author_id',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']`;

const nestedSerializerCode = `class PostDetailSerializer(serializers.ModelSerializer):
    """
    Serializer pour le détail d'un article avec ses commentaires.
    """
    author = serializers.StringRelatedField(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
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
            'created_at',
            'updated_at',
            'view_count',
            'like_count',
            'comment_count',
            'comments',  # Liste des commentaires imbriqués
        ]`;

const validationCode = `class CommentSerializer(serializers.ModelSerializer):
    # ... autres définitions
    
    def validate_content(self, value):
        """
        Valide le contenu du commentaire.
        """
        if len(value) < 10:
            raise serializers.ValidationError(
                "Le commentaire doit contenir au moins 10 caractères."
            )
        
        # Filtrer les mots interdits (exemple simple)
        forbidden_words = ['spam', 'pub']
        for word in forbidden_words:
            if word.lower() in value.lower():
                raise serializers.ValidationError(
                    "Le commentaire contient des mots interdits."
                )
        
        return value`;

const CommentSerializerPage = () => {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>CommentSerializer</h1>
      
      <p>
        Le serializer de commentaires est simple : l'auteur et l'article 
        sont assignés automatiquement dans la vue.
      </p>

      <h2 id="comment-serializer">Définition</h2>

      <CodeBlock code={commentSerializerCode} language="python" />

      <Callout type="tip" title="Champs en lecture seule">
        <code>author</code> et <code>post</code> sont assignés dans la vue, 
        pas par l'utilisateur. Ils sont donc en lecture seule.
      </Callout>

      <h2 id="nested">Commentaires imbriqués</h2>

      <p>
        Pour afficher les commentaires directement dans le détail d'un article, 
        utilisez un serializer imbriqué :
      </p>

      <CodeBlock code={nestedSerializerCode} language="python" />

      <h3>Validation personnalisée</h3>

      <CodeBlock code={validationCode} language="python" />

      <Callout type="warning" title="Performances">
        L'imbrication de serializers peut créer des requêtes N+1. 
        Utilisez <code>select_related</code> et <code>prefetch_related</code> 
        dans vos vues pour optimiser.
      </Callout>

      <DocsPagination
        prev={{ title: "PostSerializer", href: "/docs/serializers/post" }}
        next={{ title: "LikeSerializer", href: "/docs/serializers/like" }}
      />
    </DocsLayout>
  );
};

export default CommentSerializerPage;
