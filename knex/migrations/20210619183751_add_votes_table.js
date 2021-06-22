exports.up = async function (knex) {
  // language=sql
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS votes (
      id serial NOT NULL PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      park_id integer REFERENCES parks,
      status BOOLEAN NOT NULL
    );
  `);
};

exports.down = async function (knex) {
  // language=sql
  await knex.raw(`DROP TABLE IF EXISTS votes;`);
};
