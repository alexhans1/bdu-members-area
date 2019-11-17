
exports.up = function(knex, Promise) {
	return knex.schema.table('users', function(table) {
		table.datetime('last_mail').defaultTo('0000-00-00 00:00:00');
	});
};

exports.down = function(knex, Promise) {
	return knex.schema.table('users', function(table) {
		table.dropColumn('last_mail');
	});
};
