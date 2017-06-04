'use strict';

module.exports = function (Bookshelf) {
	// User model
	const User = Bookshelf.Model.extend({
		tableName: 'users',
		hasTimestamps: true,

		tournaments: function () {
			return this.belongsToMany(Tournament).withPivot(['id','role','attended','teamname','comment','price_owed','price_paid','success','points','partner1','partner2','created_at','updated_at']);
		}
	});

	const Users = Bookshelf.Collection.extend({
		model: User
	});

// Tournament model
	const Tournament = Bookshelf.Model.extend({
		tableName: 'tournaments',
		hasTimestamps: true,

		users: function () {
			return this.belongsToMany(User).withPivot(['id','role','attended','teamname','comment','price_owed','price_paid','success','points','partner1','partner2','created_at','updated_at']);
		}
	});

	const Tournaments = Bookshelf.Collection.extend({
		model: Tournament
	});

	//Registration model
	const Registration = Bookshelf.Model.extend({
		tableName: 'tournaments_users',
		hasTimestamps: true
	});

	const Registrations = Bookshelf.Collection.extend({
		model: Registration
	});

	const Bug = Bookshelf.Model.extend({
		tableName: 'bugs',
		hasTimestamps: true,

		user: function() {
			return this.belongsTo(User);
		}
	});

	const Bugs = Bookshelf.Collection.extend({
		model: Bug
	});

	return {
		User,
		Users,
		Tournament,
		Tournaments,
		Registration,
		Registrations,
		Bug,
		Bugs
	}
};
