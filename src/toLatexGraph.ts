import { KinModel } from './type.js';
import to_latex from './latex/to_latex.js';

/**
 * Transforms the given KinModel to a LaTeX graph for the given ancestor leaf.
 *
 * @param data the KinModel
 *
 */
export default function toLatexGraph(data: KinModel, generations: number, ancestorLeaf: string): string {
  return to_latex(data, generations, ancestorLeaf);
}
