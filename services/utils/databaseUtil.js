const rUsers = require("../../models/redditUsersModel");	

const CommonUtil = require("./commonUtil");	

const DatabaseUtil = {
	rUsers: (function () {
		const _rdoesUserExists = async (zuid) => {
			return await rUsers.exists({ zuid });
		};

		const _raddUser = async (zuid) => {
			const doc = new rUsers({ zuid });
			await doc.save();
		};

		const _rupdateSettings = async (zuid, update) => {
			const doc = rUsers.findOneAndUpdate({ zuid }, update);
			await doc.exec();
		};

		const _rgetToken = async (zuid) => {
			const doc = await rUsers.findOne({ zuid }, "Token").lean(); 
			const timestamp = await rUsers.findOne({ zuid }, "timestamp").lean(); 
			const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000); // 12 hours ago

			if (timestamp.timestamp < twelveHoursAgo) {
				await DatabaseUtil.rUsers.rupdateSettings(zuid, { Token: null });
				return null;
			}

			return doc.Token;
		};

		return {
			rdoesUserExists: _rdoesUserExists,
			raddUser: _raddUser,
			rupdateSettings: _rupdateSettings,
			rgetToken: _rgetToken
		};
	})()
};

module.exports = DatabaseUtil;
