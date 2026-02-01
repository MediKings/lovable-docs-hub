import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Introduction", href: "#introduction", level: 2 },
  { title: "Votre premier composant", href: "#premier-composant", level: 2 },
  { title: "JSX", href: "#jsx", level: 2 },
  { title: "Props", href: "#props", level: 2 },
  { title: "État (State)", href: "#state", level: 2 },
];

const firstComponentCode = `import React from 'react';

const Cat = () => {
  return (
    <div className="card">
      <h2>Hello, I am your cat!</h2>
    </div>
  );
};

export default Cat;`;

const jsxCode = `const getFullName = (firstName, lastName) => {
  return firstName + " " + lastName;
};

const Cat = () => {
  return (
    <h1>Hello, I am {getFullName("Luna", "Whiskers")}!</h1>
  );
};`;

const propsCode = `interface CatProps {
  name: string;
  age: number;
}

const Cat = ({ name, age }: CatProps) => {
  return (
    <div className="card">
      <h2>Je suis {name}, j'ai {age} ans</h2>
    </div>
  );
};

// Utilisation
<Cat name="Moustache" age={3} />`;

const stateCode = `import { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Vous avez cliqué {count} fois</p>
      <button onClick={() => setCount(count + 1)}>
        Cliquer
      </button>
    </div>
  );
};`;

export default function Introduction() {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Fondamentaux React</h1>
      
      <p>
        DevDocs fonctionne avec <a href="https://reactjs.org/" target="_blank" rel="noopener noreferrer">React</a>, 
        une bibliothèque open source populaire pour créer des interfaces utilisateur avec JavaScript. 
        Cette section vous aidera à démarrer ou à rafraîchir vos connaissances.
      </p>

      <p>Nous allons couvrir les concepts fondamentaux de React :</p>

      <ul>
        <li>composants</li>
        <li>JSX</li>
        <li>props</li>
        <li>state</li>
      </ul>

      <p>
        Si vous souhaitez approfondir, nous vous encourageons à consulter la{" "}
        <a href="https://react.dev/" target="_blank" rel="noopener noreferrer">
          documentation officielle de React
        </a>
        .
      </p>

      <hr />

      <h2 id="premier-composant">Votre premier composant</h2>

      <p>
        Le reste de cette introduction à React utilise des chats dans ses exemples : 
        des créatures amicales et accessibles qui ont besoin de noms et d'un café où travailler. 
        Voici votre tout premier composant Cat :
      </p>

      <CodeBlock code={firstComponentCode} language="tsx" />

      <Callout type="tip" title="Astuce">
        Les composants React sont des fonctions JavaScript qui retournent du JSX. 
        Le nom du composant doit commencer par une majuscule.
      </Callout>

      <p>
        Pour définir votre composant <code>Cat</code>, utilisez d'abord l'instruction{" "}
        <code>import</code> de JavaScript pour importer React :
      </p>

      <h2 id="jsx">JSX</h2>

      <p>
        React utilise JSX, une syntaxe qui permet d'écrire des éléments à l'intérieur de JavaScript. 
        Cela ressemble beaucoup au HTML, mais c'est du JavaScript ! Vous pouvez intégrer des 
        expressions JavaScript dans JSX en les entourant d'accolades.
      </p>

      <CodeBlock code={jsxCode} language="tsx" />

      <Callout type="info">
        Toute expression JavaScript fonctionne entre accolades, y compris les appels de fonction 
        comme <code>getFullName("Luna", "Whiskers")</code>.
      </Callout>

      <h2 id="props">Props</h2>

      <p>
        Les props sont des arguments passés aux composants React. Elles permettent de personnaliser 
        le comportement et l'apparence d'un composant.
      </p>

      <CodeBlock code={propsCode} language="tsx" />

      <Callout type="warning" title="Important">
        Les props sont en lecture seule ! Ne modifiez jamais directement les props dans un composant.
      </Callout>

      <h2 id="state">État (State)</h2>

      <p>
        L'état permet à un composant de "se souvenir" d'informations et de réagir aux interactions 
        utilisateur. Utilisez le hook <code>useState</code> pour ajouter de l'état à un composant.
      </p>

      <CodeBlock code={stateCode} language="tsx" />

      <p>
        Quand vous appelez <code>setCount</code>, React re-rend le composant avec la nouvelle valeur 
        de <code>count</code>.
      </p>

      <Callout type="danger" title="Attention">
        Ne modifiez jamais l'état directement avec <code>count = 1</code>. 
        Utilisez toujours la fonction de mise à jour <code>setCount</code>.
      </Callout>

      <DocsPagination
        next={{ title: "Composants de base", href: "/docs/components" }}
      />
    </DocsLayout>
  );
}
