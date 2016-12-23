// adapted from https://github.com/zensh/route-trie

const WORD_REG = /^\S+$/;
const SEPERATOR = ' ';

function defineNode (parent, frags, fn) {
  const frag = frags.shift();
  const child = parseNode(parent, frag, fn);

  if (!frags.length) {
    child.endpoint = true;
    return child;
  }

  if (child.wildcard) {
    throw new Error(`Can not define pattern after wildcard: "${child.pattern}"`);
  }

  return defineNode(child, frags, fn);
}

function parseNode (parent, frag, fn) {
  let _frag = frag;

  if (frag.slice(0,2) === '::') {
    _frag = frag.slice(1);
  }

  if (parent.children[_frag]) { return parent.children[_frag]; }

  const node = new Node(parent, fn);

  if (frag === '') {
    parent.children[''] = node;
  } else if (frag[0] === ':') {
    let regex;
    let name = frag.slice(1);
    const trailing = name[name.length - 1];

    if (trailing === ')') {
      const index = name.indexOf('(');
      if (index > 0) {
        regex = name.slice(index + 1, name.length - 1);
        if (regex.length > 0) {
          name = name.slice(0, index);
          node.regex = new RegExp(regex);
        } else {
          throw new Error(`Invalid pattern: "${frag}"`);
        }
      }
    } else if (trailing === '*') {
      name = name.slice(0, name.length - 1);
      node.wildcard = true;
    }

    // name must be word characters `[0-9A-Za-z_]`
    if (!WORD_REG.test(name)) {
      throw new Error(`Invalid pattern: "${frag}"`);
    }

    node.name = name;
    node.idx = parent.varyChildren.length;
    parent.varyChildren.push(node);
  } else if (frag[0] === '*' || frag[0] === '(' || frag[0] === ')') {
    throw new Error(`Invalid pattern: "${frag}"`);
  } else if (frag.slice(0,2) === '::') {
    parent.children[_frag] = node;
  } else {
    parent.children[_frag] = node;
  }

  return node;
}

export class Matched {
  constructor () {
    // Either a Node pointer when matched or nil
    this.node = null;
    this.params = {};
  }
}

export class Node {
  constructor (parent, fn) {
    this.name = '';
    this.pattern = '';
    this.regex = null;
    this.endpoint = false;
    this.wildcard = false;
    this.varyChildren = [];
    this.parent = parent;
    this.children = Object.create(null);
    this.fn = fn;
  }
}

function match (fragment, node, varyIndex=0) {
  if (node.children[fragment]) {
    return node.children[fragment];
  }

  if (node.varyChildren) {
    return node.varyChildren
      .slice(varyIndex)
      .find(n => n.wildcard || n.regex && n.regex.test(fragment));
  }
}

export default class Trie {
  constructor () {
    this.root = new Node(null);
  }

  define (pattern, fn) {
    const node = defineNode(this.root, pattern.split(SEPERATOR), fn);

    if (node.pattern === '') {
      node.pattern = pattern;
    }

    return node;
  }

  match (path) {
    const end = path.length;
    const res = new Matched();

    let start = 0;
    let parent = this.root;


    // read string to seperator for fragment = frag
    // find first child node that matches frag
    // if match is end node, return node
    // if match is not end mode, check if match child matches fragment
    // else check if next child matches fragment
    // if no more children, return null

    /*
    for (let i = 0; i <= end; i++) {
      if (i < end && path[i] !== SEPERATOR) {
        continue;
      }

      const frag = path.slice(start, i);
      const node = matchNode(parent, frag);

      if (!node) {
        return res;
      }

      parent = node;

      if (parent.name) {
        if (parent.wildcard) {
          res.params[parent.name] = path.slice(start, end);
          break;
        } else {
          res.params[parent.name] = frag;
        }
      }

      start = i + 1;
    }
    */

    if (parent.endpoint) {
      res.node = parent;
    }

    return res;
  }
}
