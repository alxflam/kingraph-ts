export const DEFAULT_STYLES = {
  ':edge': {
    dir: 'none',
    color: '#cccccc'
  },
  ':house': {
    style: 'filled',
    labeljust: 'l',
    fontname: 'Helvetica, Arial, sans-serif',
    fontsize: 16,
    margin: 10
  },
  ':house-2': {
    color: '#ffffff'
  },
  // Family subgraph
  ':family': {
    label: '',
    style: 'invis',
    margin: 0
  },
  ':node': {
    shape: 'box',
    style: 'filled',
    fontname: 'Helvetica, Arial, sans-serif',
    width: 2.5,
    color: '#cccccc'
  },
  ':digraph': {
    rankdir: 'LR',
    ranksep: 0.4,
    splines: 'ortho'
  },
  ':union': {
    shape: 'circle',
    style: 'filled',
    penwidth: 1,
    label: '',
    height: 0.1,
    width: 0.1
  },
  ':children': {
    shape: 'box',
    style: 'filled',
    label: '',
    height: 0.005 /* Make it look like a line. Brilliant! */,
    penwidth: 0,
    width: 0.1
  },
  ':parent-link': {
    weight: 2 /* give priority to be straighter than parent2 */
  },
  ':parent2-link': {
    style: 'dashed',
    penwidth: 1,
    weight: 1
  },
  ':parent-child-link': {
    weight: 3 /* prefer bridges to be straight */
  },
  ':child-link': {
    dir: 'forward',
    arrowhead: 'tee',
    arrowsize: 2,
    weight: 2
  },
  ':child2-link': {
    style: 'dashed',
    penwidth: 1,
    weight: 1
  }
};

export const LIGHT_MODE_DEVIATIONS = {
  ':house': {
    color: '#FAFAFA'
  },
  ':node': {
    fillcolor: 'white'
  }
};

export const DARK_MODE_DEVIATIONS = {
  ':bgcolor': {
    bgcolor: '#23272A'
  },
  ':house': {
    color: '#2C2F33',
    fontcolor: 'white'
  },
  ':node': {
    fillcolor: '#36393F',
    fontcolor: 'white'
  },
  ':union': {
    color: 'white'
  }
};
