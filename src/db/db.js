import Cryptr from 'cryptr';
import Low from 'lowdb';
import fs from 'fs-extra';
import underscoredb from 'underscore-db';

export const deserialize = cryptr => (str) => {
  if (!str) { return {}; }
  try {
    const keysArray = JSON.parse(str);
    const obj = {};
    keysArray.forEach((key) => {
      obj[key[0]] = JSON.parse(cryptr.decrypt(key[1]));
    });
    return obj;
  } catch (err) {
    const decrypted = cryptr.decrypt(str);
    const obj = JSON.parse(decrypted);
    return obj;
  }
};

export const serialize = cryptr => (obj) => {
  const keysArray = [];
  Object.keys(obj).forEach((key) => {
    const data = cryptr.encrypt(JSON.stringify(obj[key]));
    keysArray.push([key, data]);
  });
  return JSON.stringify(keysArray);
};

export const read = readFile => (path, deserializeFn) => new Promise((resolve, reject) => {
  readFile(path).then((data) => {
    try {
      resolve(deserializeFn(data));
    } catch (e) {
      reject(e);
    }
  });
});

export const write = writeFile => (path, obj, serializeFn) => new Promise((resolve, reject) => {
  try {
    const data = serializeFn(obj);
    writeFile(path, data).then(resolve, reject);
  } catch (e) {
    reject(e);
  }
});

export const readLocal = path => new Promise((resolve, reject) => (
  /* eslint no-shadow: 0 */
  fs.ensureFile(path, (err) => {
    if (err) { return reject(err); }
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) { return reject(err); }
      return resolve(data);
    });
  })
));

export const writeLocal = (path, data) => new Promise((resolve, reject) => (
  /* eslint no-shadow: 0 */
  fs.ensureFile(path, (err) => {
    if (err) { return reject(err); }
    fs.writeFile(path, data, 'utf8', (err) => {
      if (err) { return reject(err); }
      return resolve(data);
    });
  })
));

export async function DB({ path, key, readFile = readLocal, writeFile = writeLocal, name }) {
  const cryptr = new Cryptr(key || name);
  const dbPath = path || `./data/${name}.json`;

  const db = await new Low(dbPath, {
    storage: {
      read: read(readFile),
      write: write(writeFile),
    },
    format: {
      deserialize: deserialize(cryptr),
      serialize: serialize(cryptr),
    },
  });

  db._.mixin(underscoredb);
  return db;
}
