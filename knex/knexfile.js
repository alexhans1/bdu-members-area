// Update with your config settings.

module.exports = {

	development: {
		client: 'mysql',
		connection: {
			host: 'db.hosting-agency.de',
			user: 'dbuser30796',
			password: 'berlindebating',
			database: 'db6107x1',
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