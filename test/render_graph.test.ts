import { describe, expect, test } from 'vitest';
import renderGraph from '../src/render_graph.js';
import { KinModel } from '../src/type.js';
import { parse, GraphASTNode, LiteralASTNode } from '@ts-graphviz/ast';

describe('Render Graph', () => {
  test('should render person as node', () => {
    const kinmodel: KinModel = {
      families: [],
      people: {
        PersonId: {
          givenName: 'First Name',
          surname: 'Abc'
        }
      },
      styles: {}
    };

    const dot = renderGraph(kinmodel, 'dark', 'LR');
    const ast = parse(dot);

    expect(ast.children[0].type).toBe('Graph');
    const graph = ast.children[0] as GraphASTNode;
    // find all children of type Node
    const nodes = graph.children.filter((node) => node.type === 'Node');
    // only one node for the single person should be present
    expect(nodes).toHaveLength(1);
    // verify the nodes Id is the same as the person id
    expect(nodes[0].id.value).toBe('PersonId');
  });

  test('should render birth date', () => {
    const kinmodel: KinModel = {
      families: [],
      people: {
        PersonId: {
          givenName: 'First Name',
          surname: 'Abc',
          born: '01.01.2000'
        }
      },
      styles: {}
    };

    const dot = renderGraph(kinmodel, 'dark', 'LR');
    const ast = parse(dot);

    expect(ast.children[0].type).toBe('Graph');
    const graph = ast.children[0] as GraphASTNode;
    // find all children of type Node
    const nodes = graph.children.filter((node) => node.type === 'Node');
    expect(nodes).toHaveLength(1);
    expect(nodes[0].id.value).toBe('PersonId');
    const attributes = nodes[0].children.filter((node) => node.type === 'Attribute' && node.key.value === 'label');
    expect(attributes).toHaveLength(1);
    expect((attributes[0].value as LiteralASTNode<string>).value).toContain('*01.01.2000');
  });

  test('should render death date', () => {
    const kinmodel: KinModel = {
      families: [],
      people: {
        PersonId: {
          givenName: 'First Name',
          surname: 'Abc',
          died: '01.01.1900'
        }
      },
      styles: {}
    };

    const dot = renderGraph(kinmodel, 'dark', 'LR');
    const ast = parse(dot);

    expect(ast.children[0].type).toBe('Graph');
    const graph = ast.children[0] as GraphASTNode;
    // find all children of type Node
    const nodes = graph.children.filter((node) => node.type === 'Node');
    expect(nodes).toHaveLength(1);
    expect(nodes[0].id.value).toBe('PersonId');
    const attributes = nodes[0].children.filter((node) => node.type === 'Attribute' && node.key.value === 'label');
    expect(attributes).toHaveLength(1);
    expect((attributes[0].value as LiteralASTNode<string>).value).toContain('†01.01.1900');
  });

  test('should render age', () => {
    const kinmodel: KinModel = {
      families: [],
      people: {
        PersonId: {
          givenName: 'First Name',
          surname: 'Abc',
          born: '01.01.1900',
          died: '02.02.1990'
        }
      },
      styles: {}
    };

    const dot = renderGraph(kinmodel, 'dark', 'LR');
    const ast = parse(dot);

    expect(ast.children[0].type).toBe('Graph');
    const graph = ast.children[0] as GraphASTNode;
    // find all children of type Node
    const nodes = graph.children.filter((node) => node.type === 'Node');
    expect(nodes).toHaveLength(1);
    expect(nodes[0].id.value).toBe('PersonId');
    const attributes = nodes[0].children.filter((node) => node.type === 'Attribute' && node.key.value === 'label');
    expect(attributes).toHaveLength(1);
    expect((attributes[0].value as LiteralASTNode<string>).value).toContain('(90)');
  });

  test('should render family and house', () => {
    const kinmodel: KinModel = {
      families: [
        {
          house: 'House Name',
          parents: ['X', 'Y'],
          children: ['Z']
        }
      ],
      people: {
        X: {
          surname: 'X Parent',
          givenName: 'X'
        },
        Y: {
          surname: 'Y Parent',
          givenName: 'Y'
        },
        Z: {
          surname: 'Z Child',
          givenName: 'Z'
        }
      },
      styles: {}
    };

    const dot = renderGraph(kinmodel, 'dark', 'LR');
    const ast = parse(dot);

    expect(ast.children[0].type).toBe('Graph');
    const graph = ast.children[0] as GraphASTNode;
    // find all children of type Node
    const nodes = graph.children.filter((node) => node.type === 'Node');
    // three nodes as three persons are given
    expect(nodes).toHaveLength(3);
    // verify the node Ids correspond to the person Ids
    expect(nodes[0].id.value).toBe('X');
    expect(nodes[1].id.value).toBe('Y');
    expect(nodes[2].id.value).toBe('Z');
    // a subgraph is created for the house
    const subgraphs = graph.children.filter((node) => node.type === 'Subgraph');
    expect(subgraphs).toHaveLength(1);
    expect(subgraphs[0].id!.value).toBe('cluster_family_0');
    // the house has the given label
    const attributes = subgraphs[0].children.filter(
      (node) => node.type === 'Attribute' && node.key.value === 'label' && node.value.value === '<b>House Name</b>'
    );
    expect(attributes).toHaveLength(1);
  });

  test('should render nested families', () => {
    const kinmodel: KinModel = {
      families: [
        {
          house: 'House Name',
          parents: ['X', 'Y'],
          children: ['Z'],
          families: [
            {
              parents: ['Z', 'A'],
              children: ['B'],
              families: [
                {
                  parents: ['B', 'C'],
                  children: ['D']
                }
              ]
            }
          ]
        }
      ],
      people: {
        A: {},
        B: {},
        C: {},
        D: {},
        X: {},
        Y: {},
        Z: {}
      },
      styles: {}
    };

    const dot = renderGraph(kinmodel, 'dark', 'LR');
    const ast = parse(dot);

    expect(ast.children[0].type).toBe('Graph');
    const graph = ast.children[0] as GraphASTNode;

    const nodes = graph.children.filter((node) => node.type === 'Node');
    expect(nodes).toHaveLength(7);

    const subgraphs = graph.children.filter((node) => node.type === 'Subgraph');
    expect(subgraphs).toHaveLength(1);
    expect(subgraphs[0].id!.value).toBe('cluster_family_0');
    const attributes = subgraphs[0].children.filter(
      (node) => node.type === 'Attribute' && node.key.value === 'label' && node.value.value === '<b>House Name</b>'
    );
    expect(attributes).toHaveLength(1);

    const subsubGraphs = subgraphs[0].children.filter((node) => node.type === 'Subgraph');
    expect(subsubGraphs).toHaveLength(1);

    const subsubsubGraphs = subsubGraphs[0].children.filter((node) => node.type === 'Subgraph');
    expect(subsubsubGraphs).toHaveLength(1);

    const subsubsubsubGraphs = subsubsubGraphs[0].children.filter((node) => node.type === 'Subgraph');
    expect(subsubsubsubGraphs).toHaveLength(0);
  });

  // children2
  // parents2
  // born / died / gender
});
