import Low from 'lowdb';
import underscoredb from 'underscore-db';

export default async function DB() {
  const db = new Low();
  db._.mixin(underscoredb);
  return db;
}
