const CommonUtil = require("../utils/commonUtil");	
const DatabaseUtil = require("../utils/databaseUtil");	
const axios = require("axios");
const qs = require('qs');

const Bots = (function () {
	let reqData;
	const _handler = async (data) => {
		_initialize(data);
		let response;
		const handler = reqData.handler.type;
		switch (handler) {
			case "execution_handler":	
				response = await _executionHandler();
				break;
			case "suggestion_handler":	
				response = await _suggestionHandler();
		}
		return response;
	};

	const _initialize = (data) => {
		reqData = data;
	};


	const _executionHandler = async () => {
		const zuid = reqData.params.access.user_id;
		if (!(await DatabaseUtil.rUsers.rdoesUserExists(zuid))) {
			await DatabaseUtil.rUsers.raddUser(zuid);
		}

		//const currency = await DatabaseUtil.users.getCurrency(zuid);

		const cmdName = reqData.name;
		switch (cmdName) {
			case "zrlogin":
				return await _zrlogincmd(zuid);
			case "zrlogout":
				return await _zrlogoutcmd(zuid);
			case "zrhelp":
				return await _zrhelpcmd();
		}
	};

	const _suggestionHandler = async () => {
		//const zuid = reqData.params.access.user_id;
		//if (!(await DatabaseUtil.users.doesUserExists(zuid))) {
		//	await DatabaseUtil.users.addUser(zuid);
		//}

		//const currency = await DatabaseUtil.users.getCurrency(zuid);
		/*
		const cmdName = reqData.name;
		switch (cmdName) {
		    
			case "zrprofile":	
				return await _zrprofilesug();
		}
		*/
	};

	const _zrlogincmd = async (zuid) => {
		try {
			const zuid = reqData.params.access.user_id;
			if (!(await DatabaseUtil.rUsers.rdoesUserExists(zuid))) {
				await DatabaseUtil.rUsers.raddUser(zuid);
			}

			const token = await DatabaseUtil.rUsers.rgetToken(zuid);
			if (token !== undefined && token !== null) {
				return {
					text: "🎉 You are already logged in! 🎉", 
					card: {
						title: "👍 Already Logged In 👍", 
						"thumbnail": "https://cdn.discordapp.com/attachments/757988905177055332/1174405168402542622/logo-contains-z-and-r-letter_2.jpg?ex=6567790b&is=6555040b&hm=6348219940be7b0f48327d69f31d9eb768740261b6c22dccc0c3b287796cb5fe&",
						theme: "modern-inline", 
					},
				};
			} else {
				const CLIENT_ID = 'reddit_client_id';
				const REDIRECT_URI = '';
				const params = {
					client_id: CLIENT_ID,
					response_type: 'code',
					state: zuid,
					redirect_uri: REDIRECT_URI,
					duration: 'permanent',
					scope: '*'
				};

				let response = {
					"text": "👋To access your Zeddit bot! please log in with your Reddit account.",
					"card": {
						"thumbnail": "https://cdn.discordapp.com/attachments/757988905177055332/1174405168402542622/logo-contains-z-and-r-letter_2.jpg?ex=6567790b&is=6555040b&hm=6348219940be7b0f48327d69f31d9eb768740261b6c22dccc0c3b287796cb5fe&",
						"theme": "modern-inline"
					},
					"buttons": [
						{
							"label": "Reddit OAuth Link",
							"hint": "",
							"type": "+",
							"action": {
								"type": "open.url",
								"data": {
									"web": `https://www.reddit.com/api/v1/authorize?${qs.stringify(params)}`
								}
							}
						}
					],
					"slides": [
						{
							"type": "images",
							"data": [
								"https://cdn.discordapp.com/attachments/757988905177055332/1174409677958828032/download.png?ex=65677d3e&is=6555083e&hm=a79391c7f528d2610127dbc1e92d5f76243da611a1e57018fe081da1ebfea013&"
							]
						}
					]
				};
				return response;
			}
		} catch (error) {
			throw error;
		}
	}

	const _zrlogoutcmd = async (zuid) => {
		try {
			const zuid = reqData.params.access.user_id;
			if (!(await DatabaseUtil.rUsers.rdoesUserExists(zuid))) {
				await DatabaseUtil.rUsers.raddUser(zuid);
			}

			const token = await DatabaseUtil.rUsers.rgetToken(zuid);
			if (token !== undefined && token !== null) {
				await DatabaseUtil.rUsers.rupdateSettings(zuid, { Token: null });
				return {
					text: "You have successfully logged out. ✅", 
					card: {
						"thumbnail": "https://cdn.discordapp.com/attachments/757988905177055332/1174405168402542622/logo-contains-z-and-r-letter_2.jpg?ex=6567790b&is=6555040b&hm=6348219940be7b0f48327d69f31d9eb768740261b6c22dccc0c3b287796cb5fe&",
						title: "Logged Out", 
						theme: "modern-inline", 
					},
				};
			} else {
				const CLIENT_ID = 'reddit_client_id';
				const REDIRECT_URI = '';
				const params = {
					client_id: CLIENT_ID,
					response_type: 'code',
					state: zuid,
					redirect_uri: REDIRECT_URI,
					duration: 'permanent',
					scope: '*'
				};

				return {
					text: "You are not logged in yet. ❌ \n\n Click the below button if you want to", 
					card: {
						title: "Not Logged In", 
						"thumbnail": "https://cdn.discordapp.com/attachments/757988905177055332/1174405168402542622/logo-contains-z-and-r-letter_2.jpg?ex=6567790b&is=6555040b&hm=6348219940be7b0f48327d69f31d9eb768740261b6c22dccc0c3b287796cb5fe&",
						theme: "modern-inline", 
					},
					buttons: [
						{
							"label": "Reddit OAuth Link",
							"hint": "",
							"type": "+",
							"action": {
								"type": "open.url",
								"data": {
									"web": `https://www.reddit.com/api/v1/authorize?${qs.stringify(params)}`
								}
							}
						}
					]
				};
			}

		} catch (error) {
			throw error;
		}
	}

	const _zrhelpcmd = async () => {
		try {
			const response = {
				"text": "### Authentication :-\n\n*1)* /zrlogin - *To Authenticate your Reddit Account with cliq*\n \n*2)* /zrlogout - *To Logout your Account from cliq*\n\n---\n---\n### Utilities :-\n\n*1)* /zrprofile *or* /zrpf - *To Fetch your Reddit Account Profile into cliq*\n---\n*2)* /zrsearchsubr *or* /zrssr - *Lists 20 Subreddit Name for the given name or Just try New/Popular/Default*\n\n!*Usage: * */zrsearchsubr* {name or new/popular/default}\n!*Ex1: * */zrsearchsubr* Zoho\n!*Ex2: * */zrsearchsubr* popular\n\n---\n*3)* /zrsearch *or* /zrs - *Lists 10 Posts from Reddit for the query*\n\n!*Usage: * */zrsearch* {subreddit_name} {Query}\n!*Ex :* */zrsearch* programming __what is devops__\n\n---\n*4)* /zrgetpostbyid *or* /zrgetpid - *Get Content and Insights of the particular post(id can be copied from __/zrsearch__ Results)*\n\n!*Usage: * */zrgetpostbyid* {post_id}\n!*Ex :* */zrgetpostbyid* t3_17yerpp \n\n---\n*5)* /zrgethotpost *or* /zrgethot - *Lists 10 Hot Posts for given Subreddit*\n\n!*Usage: * */zrgethot* {subreddit_name}\n!*Ex :* */zrgethot* programming\n\n---\n*6)* /zrgetnewpost *or* /zrgetnew - *Lists 10 New Posts for given Subreddit*\n\n!*Usage: * */zrgetnew* {subreddit_name}\n!*Ex :* */zrgetnew* nodejs\n\n---\n*7)* /zrgettoppost *or* /zrgettop - *Lists 10 Top Posts for given Subreddit*\n\n!*Usage: * */zrgettop* {subreddit_name}\n!*Ex :* */zrgettop* python\n\n---\n*8)* /zrgetrisingpost *or* /zrgetrising - *Lists 10 Rising Posts for given Subreddit*\n\n!*Usage: * */zrgetrising* {subreddit_name}\n!*Ex :* */zrgetrising* askreddit\n\n---\n*9)* /zrgetcontroversialpost *or* /zrgetcon - *Lists 10 Controversial Posts for given Subreddit*\n\n!*Usage: * */zrgetcon* {subreddit_name}\n!*Ex :* */zrgetcon* programming\n\n\n---\n---\n\n### Help :-\n\n*1)* /zrhelp - *This Menu*",
				"card": {
				"title": "List of Zeddit Bot Commands",
				"thumbnail": "https://cdn.discordapp.com/attachments/757988905177055332/1174405168402542622/logo-contains-z-and-r-letter_2.jpg?ex=6567790b&is=6555040b&hm=6348219940be7b0f48327d69f31d9eb768740261b6c22dccc0c3b287796cb5fe&",
				"theme": "prompt"
				}
			};
			return response;
		} catch (error) {
			throw error;
		}
	}

	return {
		handler: _handler
	};
})();

module.exports = Bots;
