const client = "pg";
const migrations = {
  tableName: "knex_migrations",
  stub: "migrationTemplate.js",
};
const user = process.env.DB_USER;

module.exports = {
  development: {
    client,
    connection: {
      database: "postgres",
      password: "postgrespassword",
      user: "postgres",
    },
    migrations,
  },
  prd: {
    client,
    connection: process.env.DATABASE_URL,
    migrations,
  },
};
