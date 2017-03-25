// Update with your config settings.

module.exports = {

	development: {
		client: 'mysql',
		connection: {
			host: 'db.hosting-agency.de',
			user: 'dbuser30796',
			password: process.env.db_password,
			database: 'db6107x1',
			charset: 'utf8'
		},
        migrations: {
            tableName: 'knex_migrations'
        }
	},

	staging: {
		client: 'mysql',
		connection: {
			host: 'localhost',
			user: 'root',
			password: '',
			database: 'bdudbdev',
			charset: 'utf8'
		},
		migrations: {
			tableName: 'knex_migrations'
		}
	},

	production: {
        client: 'mysql',
        connection: {
            host: 'db.hosting-agency.de',
            user: 'dbuser31247',
            password: process.env.db_password,
            database: 'db6107x2',
            charset: 'utf8'
        },
        migrations: {
            tableName: 'knex_migrations'
        }
	}

};
