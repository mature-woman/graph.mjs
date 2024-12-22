# graph.mjs
Module for creating smart graphs

## Example
```html
<section id='graph'>
</section>
```
```js
import("/js/modules/graph.mjs").then((graph) => {
    // Imported the graph.mjs module

    // Initializing an instance of the graph.mjs
    const instance = new graph.default(document.getElementById('graph'));
        
    // Initializing node for the graph
    const bebra = instance.write({
      title: 'bebra',
      description: 'i am a fat juicy smelly bebra',
      link: 'https://bebra.mirzaev.sexy'
    });
        
    // Initializing node for the graph
    const root = instance.write({
      title: 'root node'
    });
        
    // Initializing node for the graph
    const anarchy = instance.write({
      title: 'anarchy',
    });

    // Connectiong the bebra node to the root node
    core.connect(bebra, root);

    // Connectiong the anarchy node to the root node
    core.connect(anarchy, root);

    // Initializing the feet node and connect to the bebra node
    core.connect(instance.write({ title: 'feet' }, bebra);
});
```