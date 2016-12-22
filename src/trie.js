const wordReg = /^\w+$/;
const doubleColonReg = /::\w*$/;
const trimSlashReg = /^\//;

function defineNode (parent, frags) {
  const frag = frags.shift();
  const child = parseNode(parent, frag);

  if (!frags.length) {
    child.endpoint = true;
    return child;
  }
  if (child.wildcard) {
    throw new Error(`Can not define pattern after wildcard: "${child.pattern}"`);
  }
  return defineNode(child, frags);
}

function matchNode (parent, frag) {
  let child = parent.children[frag];

  if (!child) {
    child = parent.varyChild;

    if (child && child.regex && !child.regex.test(frag)) {
      child = null;
    }
  }

  return child;
}

function parseNode (parent, frag) {
  let _frag = frag;
  if (doubleColonReg.test(frag)) {
    _frag = frag.slice(1);
  }

  _frag = _frag.toLowerCase();

  if (parent.children[_frag]) { return parent.children[_frag]; }

  const node = new Node(parent);

  if (frag === '') {
    parent.children[''] = node;
  } else if (doubleColonReg.test(frag)) {
    parent.children[_frag] = node;
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
    if (!wordReg.test(name)) {
      throw new Error(`Invalid pattern: "${frag}"`);
    }
    node.name = name;
    const child = parent.varyChild;
    if (child) {
      if (child.name !== name || child.wildcard !== node.wildcard) {
        throw new Error(`Invalid pattern: "${frag}"`);
      }

      if (child.regex && child.regex.toString() !== node.regex.toString()) {
        throw new Error(`Invalid pattern: "${frag}"`);
      }

      return child;
    }

    parent.varyChild = node;
  } else if (frag[0] === '*' || frag[0] === '(' || frag[0] === ')') {
    throw new Error(`Invalid pattern: "${frag}"`);
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
  constructor (parent) {
    this.name = '';
    this.pattern = '';
    this.regex = null;
    this.endpoint = false;
    this.wildcard = false;
    this.varyChild = null;
    this.parent = parent;
    this.children = Object.create(null);
  }
}

export default class Trie {
  constructor () {
    this.root = new Node(null);
  }

  define (pattern) {
    if (typeof pattern !== 'string') {throw new TypeError('Pattern must be string.');}
    const _pattern = pattern.replace(trimSlashReg, '');
    const node = defineNode(this.root, _pattern.split(' '));

    if (node.pattern === '') {node.pattern = pattern;}
    return node;
  }

  match (path) {
    // the path should be normalized before match, just as path.normalize do in Node.js
    if (typeof path !== 'string') {throw new TypeError('Path must be string.');}

    let start = 0;
    const end = path.length;
    const res = new Matched();
    let parent = this.root;

    for (let i = 0; i <= end; i++) {
      if (i < end && path[i] !== ' ') {continue;}

      const frag = path.slice(start, i);
      let node = matchNode(parent, frag);

      if (!node) {
        node = matchNode(parent, frag.toLowerCase());
      }

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

    if (parent.endpoint) {
      res.node = parent;
    }
    return res;
  }
}
