exports.up = async function (knex) {
  // language=sql
  await knex.schema.table('parks', table => {
    table.renameColumn('name', 'parkKey');
  });
  await knex.schema.table('parks', table => {
    table.string('name', 128);
  });
  const splashPadNames = [
    { name: 'Bartholomew', parkKey: 'bartholomew' },
    { name: 'Chestnut', parkKey: 'chestnut' },
    { name: 'Eastwoods', parkKey: 'eastwoods' },
    { name: 'Liz Carpenter', parkKey: 'liz-carpenter' },
    { name: 'Lott', parkKey: 'lott' },
    { name: 'Metz', parkKey: 'metz' },
    { name: 'Mary Elizabeth Branch', parkKey: 'mueller-branch-park' },
    { name: 'Ricky Guerrero', parkKey: 'ricky-guerrero' },
    { name: 'Rosewood', parkKey: 'rosewood' },
    { name: 'Pease', parkKey: 'pease' },
  ]

  await Promise.all(splashPadNames.map(async ({name, parkKey}) => {
    await knex('parks').where('parkKey', parkKey).update({name});
  }));
};

exports.down = async function (knex) {
  // language=sql
  await knex.schema.table('parks', table => {
    table.dropColumn('name');
  })
  await knex('parks').renameColumn('parkKey', 'name');
};
