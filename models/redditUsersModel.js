const mongoose = require("mongoose");	

const redditUsersModel = mongoose.Schema({
	zuid: {
		type: String,
		required: true,
		index: true,
		unique: true
	},
	Token: String,
	timestamp: {
		type: Date,
		default: Date.now
	}
});
	

module.exports = mongoose.model("rUsers", redditUsersModel);