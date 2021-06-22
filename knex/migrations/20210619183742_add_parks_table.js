exports.up = async function (knex) {
  // language=sql
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS parks (
      id SERIAL NOT NULL PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      name TEXT NOT NULL,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL
    );

    INSERT INTO parks (name, latitude, longitude) values
    ('bartholomew', 30.305177, -97.697469),
    ('chestnut', 30.277067251010195, -97.71699243984315),
    ('eastwoods', 30.290943, -97.731715),
    ('liz-carpenter', 30.26211031582992, -97.75441430399374),
    ('lott', 30.271041206071896, -97.7297671152558),
    ('metz', 30.252258120681006, -97.71810034083994),
    ('mueller-branch-park', 30.300190, -97.702812),
    ('ricky-guerrero', 30.247392178325605, -97.76433234845857),
    ('rosewood', 30.27109617907063, -97.71390894361079);
  `);
};

exports.down = async function (knex) {
  // language=sql
  await knex.raw(`DROP TABLE IF EXISTS parks;`);
};
