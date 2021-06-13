### Common commands

#### Make a migration file

```shell
$npx knex migrate:make <migration_name>
```

#### List completed and pending migrations: 

```shell
$ npx knex migrate:list
```

#### Run pending migrations

```shell
$ npx knex migrate:latest
```

For more commands, visit http://knexjs.org/#Migrations-CLI

TODO: add info about knexfile, environments