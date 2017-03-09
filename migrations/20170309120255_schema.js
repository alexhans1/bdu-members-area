
exports.up = function(knex, Promise) {

    return Promise.all([

        knex.schema.createTableIfNotExists('users', function(table) {
            table.increments();
            table.string('email').unique().notNullable();
            table.string('password').notNullable();
            table.string('name');
            table.string('vorname');
            table.string('gender');
            table.string('food');
            table.string('image');
            table.integer('position');
            table.string('resetPasswordToken');
            table.integer('resetPasswordExpires');
        }),

        knex.schema.createTableIfNotExists('tournaments', function(table){
            table.increments();
            table.string('name').notNullable();
            table.string('ort');
            table.date('startdate');
            table.date('enddate');
            table.date('deadline');
            table.string('format');
            table.string('league');
            table.string('accommodation');
            table.decimal('speakerprice',6,2);
            table.decimal('judgeprice',6,2);
            table.integer('rankingvalue');
            table.integer('teamspots');
            table.integer('judgespots');
            table.string('link');
            table.string('comments');
            table.string('language').notNullable();
        }),

        knex.schema.createTableIfNotExists('tournaments_users', function(table){
            table.increments('t_u_id').primary();
            table.integer('user_id').unsigned().references('id').inTable('users');
            table.integer('tournament_id').unsigned().references('id').inTable('tournaments');
            table.string('role');
            table.string('teamname');
            table.integer('attended');
            table.decimal('price_owed',6,2);
            table.decimal('price_paid',6,2).defaultTo(0);
            table.text('comment');
            table.timestamps();
        }),

        knex.schema.createTableIfNotExists('bugs', function(table){
            table.increments();
            table.integer('status').defaultTo(0);
            table.text('description').notNullable();
            table.string('type').notNullable();
            table.integer('user_id').unsigned().references('id').inTable('users');
            table.timestamps();
        })

    ])

};

exports.down = function(knex, Promise) {

    return Promise.all([
        knex.schema.dropTable('users'),
        knex.schema.dropTable('tournaments'),
        knex.schema.dropTable('tournaments_users'),
        knex.schema.dropTable('bugs')
    ])

};
