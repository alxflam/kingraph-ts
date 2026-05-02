import renderGraph from './render_graph.js';
import { Graphviz } from '@hpcc-js/wasm-graphviz';
import { KinModel } from './type.js';
import reduceToAncestors from './reduce_tree.js';

/**
 * Renders the graph in 'dot' or 'svg' file format.
 *
 * @param options specifies rendering options (theme and file format)
 *
 */
export default async function render(
  data: KinModel,
  options: { format: 'dot' | 'svg'; theme: 'dark' | 'light'; drawDirection: 'LR' | 'TB'; ancestorGraph: boolean; ancestorLeaf: string | undefined }
): Promise<string> {
  const format = options.format;

  if (options.ancestorGraph && options.ancestorLeaf) {
    // filter the kinmodel for direct ancestors of the ancestorLeaf
    reduceToAncestors(data, options.ancestorLeaf);
  }

  const dot = renderGraph(data, options.theme, options.drawDirection);

  switch (format) {
    case 'dot':
      return dot;
    case 'svg':
      try {
        const graphviz = await Graphviz.load();
        const svg = graphviz.dot(dot);
        return svg;
      } finally {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (global as any).DOMParser;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (global as any).XMLSerializer;
      }
  }
}
