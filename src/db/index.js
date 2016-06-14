import Cryptr from 'cryptr';
import Low from 'lowdb';
import fs from 'fs-extra';
import underscoredb from 'underscore-db';

export const deserialize = cryptr => {
  return str => {
    if (!str) { return {}; }
    const decrypted = cryptr.decrypt(str);
    const obj = JSON.parse(decrypted);
    return obj;
  };
};

export const serialize = cryptr => {
  return obj => {
    const str = JSON.stringify(obj);
    const encrypted = cryptr.encrypt(str);
    return encrypted;
  };
};

export const read = (readFile) => {
  return (path, deserialize) => {
    return new Promise((resolve, reject) => {
      readFile(path).then(data => {
        try {
          resolve(deserialize(data));
        } catch (e) {
          reject(e);
        }
      });
    });
  };
};

export const write = writeFile => {
  return (path, obj, serialize) => {
    return new Promise((resolve, reject) => {
      try {
        const data = serialize(obj);
        writeFile(path, data).then(resolve, reject);
      } catch (e) {
        reject(e);
      }
    });
  };
};

export const readLocal = (path) => {
  return new Promise((resolve, reject) => {
    fs.ensureFile(path, (err) => {
      if (err) { return reject(err); }
      fs.readFile(path, 'utf8', (err, data) => {
        if (err) { return reject(err); }
        return resolve(data);
      });
    });
  });
};

export const writeLocal = (path, data) => {
  return new Promise((resolve, reject) => {
    fs.ensureFile(path, (err) => {
      if (err) { return reject(err); }
      fs.writeFile(path, data, 'utf8', (err) => {
        if (err) { return reject(err); }
        return resolve(data);
      });
    });
  });
};

export async function DB ({ path, key, readFile=readLocal, writeFile=writeLocal }) {
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
