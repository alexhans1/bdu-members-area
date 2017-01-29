var Schema = {
	users: {
		id: {type: 'increments', nullable: false, primary: true},
		email: {type: 'string', maxlength: 254, nullable: false, unique: true},
		password: {type: 'string', maxlength: 254, nullable: false},
		name: {type: 'string', maxlength: 150, nullable: true},
		vorname: {type: 'string', maxlength: 150, nullable: true},
		gender: {type: 'string', maxlength: 150, nullable: false},
		food: {type: 'string', maxlength: 20, nullable: true},
		image: {type: 'string', maxlength: 150, nullable: true},
		role: {type: 'integer', maxlength: 150, nullable: true},
		resetPasswordToken: {type: 'string', maxlength: 100, nullable: true},
		resetPasswordExpires: {type: 'integer', nullable: true}
	},
	tournaments: {
		id: {type: 'increments', nullable: false, primary: true},
		name: {type: 'string', maxlength: 250, nullable: false},
		ort: {type: 'string', maxlength: 150, nullable: true},
		startdate: {type: 'date', nullable: true},
		enddate: {type: 'date', nullable: true},
		deadline: {type: 'date', nullable: true},
		format: {type: 'string', maxlength: 150, nullable: true},
		league: {type: 'string', maxlength: 150, nullable: true},
		accommodation: {type: 'string', maxlength: 150, nullable: true},
		speakerprice: {type: 'decimal', maxlength: 150, nullable: true},
		judgeprice: {type: 'string', maxlength: 150, nullable: true},
		rankingvalue: {type: 'string', maxlength: 150, nullable: true},
		link: {type: 'string', maxlength: 150, nullable: true},
		teamspots: {type: 'string', maxlength: 150, nullable: true},
		judgespots: {type: 'string', maxlength: 150, nullable: true},
		comments: {type: 'string', maxlength: 500, nullable: true},
		language: {type: 'string', maxlength: 150, nullable: true},
	},
	tournaments_users: {
		user_id: {type: 'integer', nullable: false, primary: true},
		tournament_id: {type: 'integer', nullable: false, primary: true},
		role: {type: 'string', maxlength: 150, nullable: false},
		teamname: {type: 'string', maxlength: 150, nullable: false, unique: true},
		attended: {type: 'integer', maxlength: 3, fieldtype: 'medium', nullable: false},
		price_owed: {type: 'decimal', fieldtype: 'medium', nullable: false},
		price_paid: {type: 'decimal', fieldtype: 'medium', nullable: false},
		comment: {type: 'text', maxlength: 16777215, fieldtype: 'medium', nullable: false},
		created_at: {type: 'dateTime', nullable: false},
		updated_at: {type: 'dateTime', nullable: true}
	}
};
module.exports = Schema;