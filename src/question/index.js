const sqlite3 = require('sqlite3').verbose();

function traverse (dbpath, { fields, visitor, onEnd }) {
  const db = new sqlite3.Database(dbpath, sqlite3.OPEN_READONLY);
  db.each(
    "SELECT id,section,source,order_index FROM listenquestion",
    (error, row) => {
      visitor && visitor(error, row);
    },
    () => db.close((error) => {
      if (error) {
        console.error(`failed to close db(${dbpath}): `, error);
      }
      if (onEnd) {
        onEnd(error);
      }
    })
  );
}

module.exports = { traverse };
