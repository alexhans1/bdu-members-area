// Update with your config settings.

module.exports = {

	development: {
		client: 'mysql',
		connection: {
			host: 'db.hosting-agency.de',
			user: process.env.db_user,
			password: process.env.db_password,
			database: 'db6107x1',
			charset: 'utf8'
		}
	},

	staging: {
		client: 'mysql',
		connection: {
			host: 'localhost',
			user: 'root',
			password: '',
			database: 'bdudbtest',
			charset: 'utf8'
		},
		migrations: {
			tableName: 'knex_migrations'
		}
	},

	production: {
		client: 'postgresql',
		connection: {
			database: 'my_db',
			user:     'username',
			password: 'password'
		},
		pool: {
			min: 2,
			max: 10
		},
		migrations: {
			tableName: 'knex_migrations'
		}
	}

};
