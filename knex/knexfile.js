const { defaultsDeep } = require("lodash");
const environmentBase = {
  client: "pg",
  connection: {
    database: "postgres",
    password: "postgrespassword",
    user: "postgres",
  },
  migrations: {
    tableName: "knex_migrations",
    stub: "migrationTemplate.js",
  },
};

module.exports = {
  local: environmentBase,
  development: defaultsDeep({ connection: { host: "postgres" }}, environmentBase),
  production: defaultsDeep({ connection: process.env.DATABASE_URL }, environmentBase)
};
