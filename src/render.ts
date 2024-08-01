import renderGraph from './render_graph.js';
import { instance } from '@viz-js/viz';
import { JSDOM } from 'jsdom';
import { KinModel } from './type.js';

/**
 * Renders the graph in 'dot' or 'svg' file format.
 *
 * @param String format Can be `dot` or `svg`, defaults to 'dot'.
 *
 */
export default async function render(data: KinModel, options: { format: 'dot' | 'svg' }): Promise<string> {
  const format = options.format;

  const dot = renderGraph(data);

  switch (format) {
    case 'dot':
      return dot;
    case 'svg':
      try {
        const window = new JSDOM().window;
        global.DOMParser = window.DOMParser;
        global.XMLSerializer = window.XMLSerializer;

        const viz = await Promise.resolve(instance());
        const svg = viz.renderSVGElement(dot, { format, engine: 'dot' });

        const serializer = new XMLSerializer();
        return serializer.serializeToString(svg);
      } finally {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (global as any).DOMParser;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (global as any).XMLSerializer;
      }
  }
}
