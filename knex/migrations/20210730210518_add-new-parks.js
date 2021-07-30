exports.up = async function (knex) {
  // language=sql
  await knex('parks').insert([
    {name: "Garey Park", parkKey: 'garey-park', latitude: 30.5951116, longitude: -97.7911144 },
    {name: "El Salido Pool", parkKey: 'el-Salido-pool', latitude: 30.4559019, longitude: -97.8213422 },
    {name: "The Quarry Splash Pad", parkKey: 'quarry', latitude: 30.5589698, longitude: -97.7638846 },
    {name: "Brushy Creek Lake Park", parkKey: 'brushy-creek', latitude: 30.5082356, longitude: -97.7744262 },
    {name: "Robin Bledsoe", parkKey: 'robin-bledsoe', latitude: 30.565384, longitude: -97.8682155 },
    {name: "Lakewood Park", parkKey: 'lakewood-park', latitude: 30.5568748, longitude: -97.868798 },
    {name: "Morgan's Wonderland", parkKey: 'morgan-wonderland', latitude: 29.5391095, longitude: -98.3947984 },
    {name: "Buda Amphitheater", parkKey: 'buda-amphitheater', latitude: 30.0852076, longitude: -97.8449873 },
    {name: "Green Meadows Park", parkKey: 'green-meadows', latitude: 30.062852, longitude: -97.8175262 },
    {name: "Bailey Splash Pad", parkKey: 'bailey', latitude: 30.3025043, longitude: -97.749463 },
    {name: "Clarksville", parkKey: 'clarksville', latitude: 30.565384, longitude: -97.8682155 },
  ]);
};

exports.down = async function (knex) {
  // language=sql
  await knex.raw(``);
};
