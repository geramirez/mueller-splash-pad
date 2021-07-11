exports.up = async function (knex) {
  // language=sql
  await knex('parks').insert({ name: 'pease', latitude: 30.281754288606752, longitude: -97.7521610530982 });
};

exports.down = async function (knex) {
  // cannot remove parks because of foreign key constraint
};
