const sqlite3 = require('sqlite3').verbose();

function traverse (dbpath, { fields, visitor }) {
  const db = new sqlite3.Database(dbpath, sqlite3.OPEN_READONLY);
  db.each(
    "SELECT * FROM listenquestion",
    (error, row) => {
      visitor && visitor(error, row);
    },
    () => db.close((error) => {
      error && console.error(`failed to close db(${dbpath}): `, error);
    })
  );
}

module.exports = { traverse };
