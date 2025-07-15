import { KinModel } from './type.js';
import toGedcom from './gedcom/to_gedcom.js';

/**
 * Transforms the given KinModel to the target format.
 *
 * @param data the KinModel
 *
 */
export default function transform(data: KinModel, options: { format: 'gedcom' | 'xml' }): string {
  if (options.format === 'xml') {
    throw 'XML is not supported';
  }
  return toGedcom(data);
}
