import { KinModel } from './type.js';

/**
 * Provides statistics for the given KinModel.
 *
 * @param data the KinModel
 *
 */
export default function statistics(data: KinModel): string {
  const people = Object.keys(data.people).length;

  return 'People: ' + people + '\n';
}
