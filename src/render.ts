import renderGraph from './render_graph.js';
import { instance } from '@viz-js/viz';
import { JSDOM } from 'jsdom';
import { KinModel } from './type.js';

/**
 * Renders the graph in 'dot' or 'svg' file format.
 *
 * @param options specifies rendering options (theme and file format)
 *
 */
export default async function render(data: KinModel, options: { format: 'dot' | 'svg'; theme: 'dark' | 'light' }): Promise<string> {
  const format = options.format;

  const dot = renderGraph(data, options.theme);

  switch (format) {
    case 'dot':
      return dot;
    case 'svg':
      try {
        const window = new JSDOM().window;
        global.DOMParser = window.DOMParser;
        global.XMLSerializer = window.XMLSerializer;

        const viz = await Promise.resolve(instance());
        // TODO to support images, the images need to be given as an option, e.g.:
        // images: [{ name: 'person.jpg', width: 100, height: 100 }]
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
