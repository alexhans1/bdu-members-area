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

	test: {
		client: 'mysql',
		connection: {
			host: 'localhost',
			user: 'root',
			password: '',
			database: 'bdudbdev',
			charset: 'utf8'
		}
	},

	production: {
		client: 'postgresql',
		connection: process.env.DATABASE_URL,
		pool: {
			min: 2,
			max: 10
		},
		migrations: {
			directory: '../db/migrations',
			tableName: 'knex_migrations'
		}
	}

};