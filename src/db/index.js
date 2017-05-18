import Low from 'lowdb';
import lodashid from 'lodash-id';

export default async function DB() {
  const db = new Low('db');
  db._.mixin(lodashid);
  return db;
}
