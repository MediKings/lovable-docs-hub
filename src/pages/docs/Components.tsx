import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Vue d'ensemble", href: "#overview", level: 2 },
  { title: "Text", href: "#text", level: 2 },
  { title: "View", href: "#view", level: 2 },
  { title: "Image", href: "#image", level: 2 },
  { title: "Button", href: "#button", level: 2 },
];

const textCode = `import { Text } from '@/components/ui/text';

const TextExample = () => {
  return (
    <Text variant="heading">
      Bienvenue dans DevDocs !
    </Text>
  );
};`;

const viewCode = `import { View } from '@/components/ui/view';

const LayoutExample = () => {
  return (
    <View className="flex flex-col gap-4 p-6">
      <View className="bg-primary p-4 rounded-lg">
        Premier élément
      </View>
      <View className="bg-secondary p-4 rounded-lg">
        Second élément
      </View>
    </View>
  );
};`;

const imageCode = `import { Image } from '@/components/ui/image';

const ImageExample = () => {
  return (
    <Image
      src="/hero-image.png"
      alt="Description de l'image"
      className="w-full h-64 object-cover rounded-lg"
    />
  );
};`;

const buttonCode = `import { Button } from '@/components/ui/button';

const ButtonExample = () => {
  return (
    <div className="flex gap-4">
      <Button variant="default">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  );
};`;

export default function Components() {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Composants de base</h1>
      
      <p>
        DevDocs fournit un ensemble de composants de base prêts à l'emploi. Ces composants sont 
        les blocs de construction fondamentaux pour créer votre interface utilisateur.
      </p>

      <h2 id="overview">Vue d'ensemble</h2>

      <p>
        Les composants de base sont conçus pour être simples, accessibles et personnalisables. 
        Ils suivent les meilleures pratiques de design et sont optimisés pour les performances.
      </p>

      <table>
        <thead>
          <tr>
            <th>Composant</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>Text</code></td>
            <td>Affiche du texte avec différents styles</td>
          </tr>
          <tr>
            <td><code>View</code></td>
            <td>Conteneur de base pour la mise en page</td>
          </tr>
          <tr>
            <td><code>Image</code></td>
            <td>Affiche des images avec support du lazy loading</td>
          </tr>
          <tr>
            <td><code>Button</code></td>
            <td>Bouton interactif avec plusieurs variantes</td>
          </tr>
        </tbody>
      </table>

      <h2 id="text">Text</h2>

      <p>
        Le composant <code>Text</code> est utilisé pour afficher du texte. Il supporte 
        différentes variantes pour les titres, paragraphes, et texte de mise en forme.
      </p>

      <CodeBlock code={textCode} language="tsx" />

      <Callout type="tip">
        Utilisez la prop <code>variant</code> pour changer rapidement le style du texte : 
        <code>heading</code>, <code>subheading</code>, <code>body</code>, <code>caption</code>.
      </Callout>

      <h2 id="view">View</h2>

      <p>
        Le composant <code>View</code> est le conteneur de base pour créer des layouts. 
        Il fonctionne comme une <code>div</code> mais avec des props supplémentaires pour 
        faciliter la mise en page.
      </p>

      <CodeBlock code={viewCode} language="tsx" />

      <h2 id="image">Image</h2>

      <p>
        Le composant <code>Image</code> affiche des images de manière optimisée avec 
        support du lazy loading et des placeholders.
      </p>

      <CodeBlock code={imageCode} language="tsx" />

      <Callout type="info">
        Fournissez toujours un attribut <code>alt</code> descriptif pour l'accessibilité.
      </Callout>

      <h2 id="button">Button</h2>

      <p>
        Le composant <code>Button</code> offre plusieurs variantes et tailles pour 
        s'adapter à tous les contextes.
      </p>

      <CodeBlock code={buttonCode} language="tsx" />

      <DocsPagination
        prev={{ title: "Introduction", href: "/docs" }}
        next={{ title: "Fondamentaux React", href: "/docs/react-fundamentals" }}
      />
    </DocsLayout>
  );
}
