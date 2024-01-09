const qs = require('qs');
const CommonUtil = require("../utils/commonUtil");
const DatabaseUtil = require("../utils/databaseUtil");	
const axios = require('axios');
const { performance } = require('perf_hooks');

const Bots = (function () {
	let reqData;
	const _handler = async (data) => {
		_initialize(data);
		let response;
		const handler = reqData.handler.type;
		switch (handler) {
			case "welcome_handler":
				response = await _welcomeHandler();
				break;
			case "action_handler":
				response = await _actionHandler();
				break
			case "participation_handler":
				response = await _participationHandler();
				break
			case "message_handler":
				response = await _messageHandler(reqData);
				break
			case "mention_handler":
				response = await _mentionHandler();
		}
		return response;
	};

	const _initialize = (data) => {
		reqData = data;
	};

	const _welcomeHandler = async () => {
		if(reqData.params.newuser == false){
			return {
				text: "Hey there! 👋 Welcome Back I missed you alot \n\n Use *__/zrhelp__* to List all of my commands \n I am Basically a bot which integrates Reddit In Cliq",	
				"card": {
					"title": "I am Zeddit Bot",
					"thumbnail": "https://cdn.discordapp.com/attachments/757988905177055332/1174405168402542622/logo-contains-z-and-r-letter_2.jpg?ex=6567790b&is=6555040b&hm=6348219940be7b0f48327d69f31d9eb768740261b6c22dccc0c3b287796cb5fe&",
					"theme": "prompt"
				}
			}
		} else {
			return {
				text: "Hey there! 👋 Thanks for Subscribing me \n\n Use *__/zrhelp__* to List all of my commands \n I am Basically a bot which integrates Reddit In Cliq",	
				"card": {
					"title": "I am Zeddit Bot",
					"thumbnail": "https://cdn.discordapp.com/attachments/757988905177055332/1174405168402542622/logo-contains-z-and-r-letter_2.jpg?ex=6567790b&is=6555040b&hm=6348219940be7b0f48327d69f31d9eb768740261b6c22dccc0c3b287796cb5fe&",
					"theme": "prompt"
				}
			}
		}
		
	};

	const _mentionHandler = async () => {
		return {
			text: "Hey there! 👋 I see you mentioned me. How can I assist you today? \n\n Use *__/zrhelp__* to List all of my commands \n I am Basically a bot which integrates Reddit In Cliq",	
			"card": {
				"title": "I am Zeddit Bot",
				"thumbnail": "https://cdn.discordapp.com/attachments/757988905177055332/1174405168402542622/logo-contains-z-and-r-letter_2.jpg?ex=6567790b&is=6555040b&hm=6348219940be7b0f48327d69f31d9eb768740261b6c22dccc0c3b287796cb5fe&",
				"theme": "prompt"
			}
		}
	}

	const _actionHandler = async () => {
		//const zuid = reqData.params.access.user_id;
		//if (!(await DatabaseUtil.users.doesUserExists(zuid))) {
		//	await DatabaseUtil.users.addUser(zuid);
		//}

		//const currency = await DatabaseUtil.users.getCurrency(zuid);

		const actionName = reqData.handler.name;
		switch (actionName) {
			case "Authenticate":
				return await _Authenticate();
			case "Logout":
				return await _Logout();
			case "help":
				return await _help();
		}
	};

	const _messageHandler = async (reqData) => {
		const messageContent = reqData.params.message
		const zuid = reqData.params.access.user_id;

		if (!messageContent.toLowerCase().startsWith("/")) return;

		const [cmd, ...args] = messageContent
			.slice(1)
			.trim()
			.split(" ");

		switch (cmd) {
			case "zrlogin":
				return await _Authenticate();
			case "zrlogout":
				return await _Logout();
			case "zrprofile":
				return await _profile(zuid);
			case "zrpf":
				return await _profile(zuid);
			case "zrsearch":
				return await _search(zuid, args);
			case "zrs":
				return await _search(zuid, args);
			case "zrsearchsubr":
				return await _searchSubr(zuid, args);
			case "zrssr":
				return await _searchSubr(zuid, args);
			case "zrhelp":
				return await _help();
			case "zrgetpostbyid":
				return await _getpostbyid(zuid, args);
			case "zrgetpid":
				return await _getpostbyid(zuid, args);
			case "zrgethotpost":
				return await _getposts(zuid, args, 'hot');
			case "zrgethot":
				return await _getposts(zuid, args, 'hot');
			case "zrgetnewpost":
				return await _getposts(zuid, args, 'new');
			case "zrgetnew":
				return await _getposts(zuid, args, 'new');
			case "zrgettoppost":
				return await _getposts(zuid, args, 'top');
			case "zrgettop":
				return await _getposts(zuid, args, 'top');
			case "zrgetrisingpost":
				return await _getposts(zuid, args, 'rising');
			case "zrgetris":
				return await _getposts(zuid, args, 'rising');
			case "zrgetcontroversialpost":
				return await _getposts(zuid, args, 'controversial');
			case "zrgetcon":
				return await _getposts(zuid, args, 'controversial');
			case "zrping":
				return await _ping();
		}


	}

	const _participationHandler = async () => {
		const actionName = reqData.params.operation

		switch (actionName) {
			case "message_sent":
				return await _messageSentChat(reqData);
			/*
			case "added":
				return await _added();
			case "removed":
				return await _removed();
			
			case "message_edited":
				return await _message_edited();
			case "message_deleted":
				return await _message_deleted();
			*/
		}
	}

	const _messageSentChat = async (reqData) => {
		try {
			let messageContent = reqData.params.data.message.content.text;
			let zuid = reqData.params.access.user_id;

			if (!messageContent.toLowerCase().startsWith("/")) return;

			const [cmd, ...args] = messageContent
				.slice(1)
				.trim()
				.split(" ");

				switch (cmd) {
					case "zrlogin":
						return await _Authenticate();
					case "zrlogout":
						return await _Logout();
					case "zrprofile":
						return await _profile(zuid);
					case "zrpf":
						return await _profile(zuid);
					case "zrsearch":
						return await _search(zuid, args);
					case "zrs":
						return await _search(zuid, args);
					case "zrsearchsubr":
						return await _searchSubr(zuid, args);
					case "zrssr":
						return await _searchSubr(zuid, args);
					case "zrhelp":
						return await _help();
					case "zrgetpostbyid":
						return await _getpostbyid(zuid, args);
					case "zrgetpid":
						return await _getpostbyid(zuid, args);
					case "zrgethotpost":
						return await _getposts(zuid, args, 'hot');
					case "zrgethot":
						return await _getposts(zuid, args, 'hot');
					case "zrgetnewpost":
						return await _getposts(zuid, args, 'new');
					case "zrgetnew":
						return await _getposts(zuid, args, 'new');
					case "zrgettoppost":
						return await _getposts(zuid, args, 'top');
					case "zrgettop":
						return await _getposts(zuid, args, 'top');
					case "zrgetrisingpost":
						return await _getposts(zuid, args, 'rising');
					case "zrgetris":
						return await _getposts(zuid, args, 'rising');
					case "zrgetcontroversialpost":
						return await _getposts(zuid, args, 'controversial');
					case "zrgetcon":
						return await _getposts(zuid, args, 'controversial');
					case "zrping":
						return await _ping();
				}
		}
		catch (error) {
			throw error;
		}
	}

	const _Authenticate = async () => {
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
				const CLIENT_ID = 'Reddit_Client_ID';
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
	};

	const _Logout = async () => {
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
				return _notLoggedIn(zuid);
			}

		} catch (error) {
			throw error;
		}
	}

	const _help = async () => {
		try {
			return {
				"text": "### Authentication :-\n\n*1)* /zrlogin - *To Authenticate your Reddit Account with cliq*\n \n*2)* /zrlogout - *To Logout your Account from cliq*\n\n---\n---\n### Utilities :-\n\n*1)* /zrprofile *or* /zrpf - *To Fetch your Reddit Account Profile into cliq*\n---\n*2)* /zrsearchsubr *or* /zrssr - *Lists 20 Subreddit Name for the given name or Just try New/Popular/Default*\n\n!*Usage: * */zrsearchsubr* {name or new/popular/default}\n!*Ex1: * */zrsearchsubr* Zoho\n!*Ex2: * */zrsearchsubr* popular\n\n---\n*3)* /zrsearch *or* /zrs - *Lists 10 Posts from Reddit for the query*\n\n!*Usage: * */zrsearch* {subreddit_name} {Query}\n!*Ex :* */zrsearch* programming __what is devops__\n\n---\n*4)* /zrgetpostbyid *or* /zrgetpid - *Get Content and Insights of the particular post(id can be copied from __/zrsearch__ Results)*\n\n!*Usage: * */zrgetpostbyid* {post_id}\n!*Ex :* */zrgetpostbyid* t3_17yerpp \n\n---\n*5)* /zrgethotpost *or* /zrgethot - *Lists 10 Hot Posts for given Subreddit*\n\n!*Usage: * */zrgethot* {subreddit_name}\n!*Ex :* */zrgethot* programming\n\n---\n*6)* /zrgetnewpost *or* /zrgetnew - *Lists 10 New Posts for given Subreddit*\n\n!*Usage: * */zrgetnew* {subreddit_name}\n!*Ex :* */zrgetnew* nodejs\n\n---\n*7)* /zrgettoppost *or* /zrgettop - *Lists 10 Top Posts for given Subreddit*\n\n!*Usage: * */zrgettop* {subreddit_name}\n!*Ex :* */zrgettop* python\n\n---\n*8)* /zrgetrisingpost *or* /zrgetrising - *Lists 10 Rising Posts for given Subreddit*\n\n!*Usage: * */zrgetrising* {subreddit_name}\n!*Ex :* */zrgetrising* askreddit\n\n---\n*9)* /zrgetcontroversialpost *or* /zrgetcon - *Lists 10 Controversial Posts for given Subreddit*\n\n!*Usage: * */zrgetcon* {subreddit_name}\n!*Ex :* */zrgetcon* programming\n\n\n---\n---\n\n### Help :-\n\n*1)* /zrhelp - *This Menu* \n\n*1)* /zrping - *Check Whether I am Alive or Not!*",
				"card": {
				"title": "List of Zeddit Bot Commands",
				"thumbnail": "https://cdn.discordapp.com/attachments/757988905177055332/1174405168402542622/logo-contains-z-and-r-letter_2.jpg?ex=6567790b&is=6555040b&hm=6348219940be7b0f48327d69f31d9eb768740261b6c22dccc0c3b287796cb5fe&",
				"theme": "prompt"
				}
			};
		} catch (error) {
			throw error;
		}
	};

	const _profile = async (zuid) => {
		try {
			if (!(await DatabaseUtil.rUsers.rdoesUserExists(zuid))) {
				await DatabaseUtil.rUsers.raddUser(zuid);
			}

			const token = await DatabaseUtil.rUsers.rgetToken(zuid);
			if (token !== undefined && token !== null) {

				const header = { 'Authorization': `Bearer ${token}` }
				let res = await axios.get("https://oauth.reddit.com/api/v1/me", { headers: header, params: { raw_json: 1 } })
				let data = res.data;

				let display_name = data.subreddit.title == "" ? "Not Set" : data.subreddit.title;
				let userName = data.name;
				let created_utc = new Date(data.created_utc * 1000).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'long', timeStyle: 'medium' });
				let verified = data.verified == true ? "✅" : "❌";
				let over_18 = data.over_18 == true ? "✅" : "❌";
				let karma = data.total_karma;

				let has_gold_subscription = data.has_gold_subscription == true ? "✅" : "❌";
				let has_paypal_subscription = data.has_paypal_subscription == true ? "✅" : "❌";
				let has_subscribed_to_premium = data.has_subscribed_to_premium == true ? "✅" : "❌";
				let has_stripe_subscription = data.has_stripe_subscription == true ? "✅" : "❌";
				let linked_identities = data.linked_identities == "" ? "Not Linked" : data.linked_identities;

				let image = data.icon_img;


				let resp = {
					"text": `*BASIC INFORMATION*\n---\n*Diplay Name:* ${display_name} \n*userName:* ${userName}\n*Created At:* ${created_utc}\n*Verified:* ${verified}\n*18+:* ${over_18}\n*Karma:* ${karma}\n\n*SUBSCRIPTION INFORMATION*\n---\n*Gold Subscription:* ${has_gold_subscription}\n*Paypal Subsription:* ${has_paypal_subscription}\n*Premium Subsription:* ${has_subscribed_to_premium}\n*Stripe Subscription:* ${has_stripe_subscription}\n*Linked:* ${linked_identities}\n`,
					"card": {
						"title": `Profile of ${userName}`,
						"icon": `${image}`,
						"thumbnail": `${image}`,
						"theme": "prompt"
					},
					"buttons": [
						{
							"label": "Reddit URL",
							"hint": "",
							"type": "-",
							"action": {
								"type": "open.url",
								"data": {
									"web": `https://www.reddit.com/user/${userName}`
								}
							}
						}
					]
				}

				return resp;

			} else {
				return _notLoggedIn(zuid);
			}

		} catch (error) {
			throw error;
		}
	}

	const _search = async (zuid, args) => {
		try {
			if (!(await DatabaseUtil.rUsers.rdoesUserExists(zuid))) {
				await DatabaseUtil.rUsers.raddUser(zuid);
			}

			const token = await DatabaseUtil.rUsers.rgetToken(zuid);
			const header = { Authorization: `Bearer ${token}` };

			if (token !== undefined && token !== null) {
				if (args[0] == undefined) {
					return {
						text: "Please Enter the Reddit Name to Search \n\n *Usage :* /zrsearch {subreddit_name} {Query} \n *Example :* /zrsearch *python* __how to use pandas__",
						card: {
							title: "Get List of Reddit in a Subreddit",
							theme: "prompt",
						},
					};
				}

				let query = args.slice(1).join(" ");
				if (query == "") {
					return {
						text: `*__ERROR:__* Please Specify the Query in *${args[0]}* \n\n *Usage :* /zrsearch {subreddit_name} {Query} \n *Example :* /zrsearch *python* __how to use pandas__`,
						card: {
							title: "Get List of Reddit in a Subreddit",
							theme: "prompt",
						},
					};
				}
				let page = 1
				let limit = 10;
				let offset = (page - 1) * limit;

				let result = await axios.get(`https://oauth.reddit.com/r/${args[0]}/search`, {
					headers: header,
					params: { raw_json: 1, q: `${query}`, limit: 50, sort: "relevance", count: limit, after: offset },
				});

				if (result.data.data.dist == 0) {
					return {
						text: `No Results found Reddit - *${args[0]}* \n For Query - *${query}* \n\n *__Posibilities For this Error__* \n\n *1)* Subreddit Not Found \n *2)* Query Not Found \n *3)* Query is not in the Subreddit \n\n *Try Searching for Subreddit before searching for Query* \n*Usage :* /zrsearchSubr {subreddit_name} \n *Example :* /zrsearchSubr *python*`,
						card: {
							title: "Result Not Found",
							theme: "prompt",
						},
					};
				}

				let totalPages = Math.ceil(result.data.data.dist / limit);
				let resp = {
					text: `*${result.data.data.dist}* Results Found on *${args[0]}* \n---\n\n `,
					card: {
						title: `Results for *Query: * __${query}__ (Page ${page}/${totalPages})`,
						theme: "prompt",
					},
					buttons: [
						{
							label: "Prev Page",
							type: "+",
							action: {
								type: "invoke.function",
								data: {
									name: "zrsrcpageprev",
								}
							},
							arguments: {
								page: page - 1,
								total_page: totalPages,
								query: query,
								subreddit: args[0],
								limit: limit,
								offset: offset,
							}
						},
						{
							label: "Next Page",
							type: "+",
							action: {
								type: "invoke.function",
								data: {
									name: "zrsrcpagenext"
								}
							},
							arguments: {
								page: page + 1,
								total_page: totalPages,
								query: query,
								subreddit: args[0],
								limit: limit,
								offset: offset,
							}
						}
					],
				};

				for (let i = 0; i < limit; i++) {
					let index = offset + i;
					if (index >= result.data.data.dist) {
						break;
					}
					resp.text += `*${index + 1}.* [${result.data.data.children[index].data.title}](https://www.reddit.com${result.data.data.children[index].data.permalink}) \n *upvote ratio: * ${result.data.data.children[index].data.upvote_ratio} *Ups: * ${CommonUtil.formatNumber(result.data.data.children[index].data.ups)} *Downs: * ${CommonUtil.formatNumber(result.data.data.children[index].data.downs)} *Comments: *${CommonUtil.formatNumber(result.data.data.children[index].data.num_comments)} \n *Created: *${new Date(result.data.data.children[index].data.created_utc * 1000).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'long', timeStyle: 'medium' })}\n *SubReddit_ID: * ${result.data.data.children[index].data.name} \n\n`;
				}

				return resp;
			} else {
				return _notLoggedIn(zuid);
			}
		} catch (error) {
			throw error;
		}
	}

	const _searchSubr = async (zuid, args) => {
		try {
			if (!(await DatabaseUtil.rUsers.rdoesUserExists(zuid))) {
				await DatabaseUtil.rUsers.raddUser(zuid);
			}

			const token = await DatabaseUtil.rUsers.rgetToken(zuid);
			const header = { Authorization: `Bearer ${token}` };

			if (token !== undefined && token !== null) {
				if (args[0] === undefined) {
					return {
						text: "Please Enter the Subreddit Name to Search or Just Type /zrsearchSubr new/default/popular",
						card: {
							title: "Get List of Subreddit's",
							theme: "prompt",
						},
					};
				}
				let argss = args[0].toLowerCase();
				if (argss != "new" && argss != "popular" && argss != "default") {
					let subreddit = args.slice(0).join(" ");
					let result = await axios.get("https://oauth.reddit.com/subreddits/search", {
						headers: header,
						params: { raw_json: 1, limit: 20, q: `${subreddit}`, sort: "relevance" },
					});

					if (result.data.data.dist == 0) {
						return {
							text: `No Subreddit Found with name *${subreddit}* `,
							card: {
								title: "*Subreddit Not Fount*",
								theme: "prompt",
							},
						};
					}

					let resp = {
						text: `${result.data.data.dist} Subreddit's Found \n---\n\n `,
						card: {
							title: "Search Result of *" + subreddit + "*",
							theme: "prompt",
						},
					};
					let data = result.data.data;

					for (let i = 0; i < result.data.data.dist; i++) {
						resp.text += `*${i + 1}.* [r/${data.children[i].data.display_name}](https://www.reddit.com/r/${data.children[i].data.display_name}) - *${CommonUtil.formatNumber(data.children[i].data.subscribers)}* Members \n`;
					}

					return resp;
				} else {
					let result = await axios.get("https://oauth.reddit.com/subreddits/" + args[0], {
						headers: header,
						params: { raw_json: 1, limit: 20, sort: "relevance" },
					});

					if (result.data.data.dist == 0) {
						return {
							text: `No Subreddit Found with name *${args[0]}*`,
							card: {
								title: "Subreddit Not Fount",
								theme: "prompt",
							},
						};
					}

					let resp = {
						text: `${result.data.data.dist} Subreddit's Found \n---\n\n `,
						card: {
							title: "Search Result of *" + args[0] + "* Subreddit's",
							theme: "prompt",
						},
					};
					let data = result.data.data;

					for (let i = 0; i < result.data.data.dist; i++) {
						resp.text += `*${i + 1}.* [r/${data.children[i].data.display_name}](https://www.reddit.com/r/${data.children[i].data.display_name}) - *${CommonUtil.formatNumber(data.children[i].data.subscribers)}* Members \n`;
					}

					return resp;
				}
			} else {
				return _notLoggedIn(zuid);
			}
		} catch (error) {
			throw error;
		}
	};

	const _getpostbyid = async (zuid, args) => {
		try {
			if (!(await DatabaseUtil.rUsers.rdoesUserExists(zuid))) {
				await DatabaseUtil.rUsers.raddUser(zuid);
			}

			const token = await DatabaseUtil.rUsers.rgetToken(zuid);
			const header = { Authorization: `Bearer ${token}` };

			if (token !== undefined && token !== null) {
				if (!args[0]) {
					return {
						text: "Please Enter the Subreddit Name to Search or Just Type /zrgetsubreddit *id*",
						card: {
							title: "Get Subreddit Post By ID",
							theme: "prompt",
						},
					};
				}

				let result = await axios.get(`https://oauth.reddit.com/by_id/${args[0]}`, {
					headers: header,
				});

				if(result.data.data.children[0].data.num_comments > 0){
					let cmdRes = await axios.get(`https://oauth.reddit.com/r/${result.data.data.children[0].data.subreddit}/comments/${result.data.data.children[0].data.id}`, {
						headers: header,
					});

					console.log(cmdRes.data)
					if(result.data.data.children[0].data.post_hint == null){
						let resp = {
							text: `*Author: * [${result.data.data.children[0].data.author}](https://www.reddit.com/user/${result.data.data.children[0].data.author}) \n *Title: * [${result.data.data.children[0].data.title}](${result.data.data.children[0].data.url}) \n *Subreddit: * [r/${result.data.data.children[0].data.subreddit}](https://www.reddit.com/r/${result.data.data.children[0].data.subreddit}) \n *Ups: * ${CommonUtil.formatNumber(result.data.data.children[0].data.ups)} *Downs: * ${CommonUtil.formatNumber(result.data.data.children[0].data.downs)} \n *Comments: *${CommonUtil.formatNumber(result.data.data.children[0].data.num_comments)} \n *Created: *${new Date(result.data.data.children[0].data.created_utc * 1000).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'long', timeStyle: 'medium' })}\n\n *Selftext: * ${(result.data.data.children[0].data.selftext).substring(0, 800)+"..." + `\n\n *Comments: * \n\n`}`,
							card: {
								title: `Post By ID - ${args[0]}`,
								theme: "prompt",
							},
							buttons: [
								{
									label: "Reddit URL",
									type: "-",
									action: {
										type: "open.url",
										data: {
											web: `${result.data.data.children[0].data.url}`
										}
									}
								}
							]
						}
						let cmt_count = result.data.data.children[0].data.num_comments
						cmt_count = cmt_count > 3 ? 3 : cmt_count

						for(let i = 0; i < cmt_count; i++){
							resp.text += `*${i + 1}.* [${cmdRes.data[1].data.children[i].data.author}](https://www.reddit.com/user/${cmdRes.data[1].data.children[i].data.author}) - *${CommonUtil.formatNumber(cmdRes.data[1].data.children[i].data.score)}* Upvotes \n *Comment: * ${cmdRes.data[1].data.children[i].data.body} \n\n`
						}
						return resp;
					} else if(result.data.data.children[0].data.post_hint == "image"){
						let resp = {
							text: `*Author: * [${result.data.data.children[0].data.author}](https://www.reddit.com/user/${result.data.data.children[0].data.author}) \n *Title: * [${result.data.data.children[0].data.title}](${result.data.data.children[0].data.url}) \n *Subreddit: * [r/${result.data.data.children[0].data.subreddit}](https://www.reddit.com/r/${result.data.data.children[0].data.subreddit}) \n *Ups: * ${CommonUtil.formatNumber(result.data.data.children[0].data.ups)} *Downs: * ${CommonUtil.formatNumber(result.data.data.children[0].data.downs)} \n *Comments: *${CommonUtil.formatNumber(result.data.data.children[0].data.num_comments)} \n *Created: *${new Date(result.data.data.children[0].data.created_utc * 1000).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'long', timeStyle: 'medium' }) + `\n\n *Comments: * \n\n`}`,
							card: {
								title: `Post By ID - ${args[0]}`,
								theme: "modern-inline",
							},
							"slides": [
								{
								"type": "images",
								"title": "Post :",
								"data": [
									`${result.data.data.children[0].data.url_overridden_by_dest}`
								]
								}
							],
							buttons: [
								{
									label: "Reddit URL",
									type: "-",
									action: {
										type: "open.url",
										data: {
											web: `${result.data.data.children[0].data.url}`
										}
									}
								}
							]
						}

						let cmt_count = result.data.data.children[0].data.num_comments
						cmt_count = cmt_count > 3 ? 3 : cmt_count

						for(let i = 0; i < cmt_count; i++){
							resp.text += `*${i + 1}.* [${cmdRes.data[1].data.children[i].data.author}](https://www.reddit.com/user/${cmdRes.data[1].data.children[i].data.author}) - *${CommonUtil.formatNumber(cmdRes.data[1].data.children[i].data.score)}* Upvotes \n *Comment: * ${cmdRes.data[1].data.children[i].data.body} \n\n`
						}
						return resp;
					} else if (result.data.data.children[0].data.is_video){
						let resp = {
							text: `*Author: * [${result.data.data.children[0].data.author}](https://www.reddit.com/user/${result.data.data.children[0].data.author}) \n *Title: * [${result.data.data.children[0].data.title}](${result.data.data.children[0].data.url}) \n *Subreddit: * [r/${result.data.data.children[0].data.subreddit}](https://www.reddit.com/r/${result.data.data.children[0].data.subreddit}) \n *Ups: * ${CommonUtil.formatNumber(result.data.data.children[0].data.ups)} *Downs: * ${CommonUtil.formatNumber(result.data.data.children[0].data.downs)} \n *Comments: *${CommonUtil.formatNumber(result.data.data.children[0].data.num_comments)} \n *Created: *${new Date(result.data.data.children[0].data.created_utc * 1000).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'long', timeStyle: 'medium' })}\n *Video Link: * [Click Here](${result.data.data.children[0].data.url}) \n\n *Comments: * \n\n`,
							card: {
								title: `Post By ID - ${args[0]}`,
								theme: "prompt",
							},
							buttons: [
								{
									label: "Reddit URL",
									type: "-",
									action: {
										type: "open.url",
										data: {
											web: `${result.data.data.children[0].data.url}`
										}
									}
								}
							]
						}

						let cmt_count = result.data.data.children[0].data.num_comments
						cmt_count = cmt_count > 3 ? 3 : cmt_count

						for(let i = 0; i < cmt_count; i++){
							resp.text += `*${i + 1}.* [${cmdRes.data[1].data.children[i].data.author}](https://www.reddit.com/user/${cmdRes.data[1].data.children[i].data.author}) - *${CommonUtil.formatNumber(cmdRes.data[1].data.children[i].data.score)}* Upvotes \n *Comment: * ${cmdRes.data[1].data.children[i].data.body} \n\n`
						}
						return resp;
					}
				} else {
					if(result.data.data.children[0].data.post_hint == null){
						return {
							text: `*Author: * [${result.data.data.children[0].data.author}](https://www.reddit.com/user/${result.data.data.children[0].data.author}) \n *Title: * [${result.data.data.children[0].data.title}](${result.data.data.children[0].data.url}) \n *Subreddit: * [r/${result.data.data.children[0].data.subreddit}](https://www.reddit.com/r/${result.data.data.children[0].data.subreddit}) \n *Ups: * ${CommonUtil.formatNumber(result.data.data.children[0].data.ups)} *Downs: * ${CommonUtil.formatNumber(result.data.data.children[0].data.downs)} \n *Comments: *${CommonUtil.formatNumber(result.data.data.children[0].data.num_comments)} \n *Created: *${new Date(result.data.data.children[0].data.created_utc * 1000).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'long', timeStyle: 'medium' })}\n\n *Selftext: * ${(result.data.data.children[0].data.selftext).substring(0, 800)+"..."}`,
							card: {
								title: `Post By ID - ${args[0]}`,
								theme: "prompt",
							},
							buttons: [
								{
									label: "Reddit URL",
									type: "-",
									action: {
										type: "open.url",
										data: {
											web: `${result.data.data.children[0].data.url}`
										}
									}
								}
							]
						}
					} else if(result.data.data.children[0].data.post_hint == "image"){
						return {
							text: `*Author: * [${result.data.data.children[0].data.author}](https://www.reddit.com/user/${result.data.data.children[0].data.author}) \n *Title: * [${result.data.data.children[0].data.title}](${result.data.data.children[0].data.url}) \n *Subreddit: * [r/${result.data.data.children[0].data.subreddit}](https://www.reddit.com/r/${result.data.data.children[0].data.subreddit}) \n *Ups: * ${CommonUtil.formatNumber(result.data.data.children[0].data.ups)} *Downs: * ${CommonUtil.formatNumber(result.data.data.children[0].data.downs)} \n *Comments: *${CommonUtil.formatNumber(result.data.data.children[0].data.num_comments)} \n *Created: *${new Date(result.data.data.children[0].data.created_utc * 1000).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'long', timeStyle: 'medium' })}`,
							card: {
								title: `Post By ID - ${args[0]}`,
								theme: "modern-inline",
							},
							"slides": [
								{
								"type": "images",
								"title": "Post :",
								"data": [
									`${result.data.data.children[0].data.url_overridden_by_dest}`
								]
								}
							],
							buttons: [
								{
									label: "Reddit URL",
									type: "-",
									action: {
										type: "open.url",
										data: {
											web: `${result.data.data.children[0].data.url}`
										}
									}
								}
							]
						}
					} else if (result.data.data.children[0].data.is_video){
						return {
							text: `*Author: * [${result.data.data.children[0].data.author}](https://www.reddit.com/user/${result.data.data.children[0].data.author}) \n *Title: * [${result.data.data.children[0].data.title}](${result.data.data.children[0].data.url}) \n *Subreddit: * [r/${result.data.data.children[0].data.subreddit}](https://www.reddit.com/r/${result.data.data.children[0].data.subreddit}) \n *Ups: * ${CommonUtil.formatNumber(result.data.data.children[0].data.ups)} *Downs: * ${CommonUtil.formatNumber(result.data.data.children[0].data.downs)} \n *Comments: *${CommonUtil.formatNumber(result.data.data.children[0].data.num_comments)} \n *Created: *${new Date(result.data.data.children[0].data.created_utc * 1000).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'long', timeStyle: 'medium' })}\n\n *Video Link: * [Click Here](${result.data.data.children[0].data.url})`,
							card: {
								title: `Post By ID - ${args[0]}`,
								theme: "prompt",
							},
							buttons: [
								{
									label: "Reddit URL",
									type: "-",
									action: {
										type: "open.url",
										data: {
											web: `${result.data.data.children[0].data.url}`
										}
									}
								}
							]
						}
					}
				}

			} else {
				return _notLoggedIn(zuid);
			}
		} catch (error) {
			return {
				text: `*__ERROR:__* No Results Found with ID *${args[0]}* \n\n *Usage :* /zrgetpostbyid {ID} \n *Example :* /zrgetpid *t3_f6711h*`,
				card: {
					title: "Get Reddit Post with its ID",
					theme: "prompt",
				},
			};
		}
	}

	const _getposts = async (zuid, args, name) => {
		try {
			if (!(await DatabaseUtil.rUsers.rdoesUserExists(zuid))) {
				await DatabaseUtil.rUsers.raddUser(zuid);
			}

			const token = await DatabaseUtil.rUsers.rgetToken(zuid);
			const header = { Authorization: `Bearer ${token}` };

			if (token !== undefined && token !== null) {
				if (!args[0]) {
					return {
						text: `Please Enter the Subreddit Name to Search or Just Type /zrget${name}post *subreddit_name*`,
						card: {
							title: `Get ${CommonUtil.firstLetCap(name)} Post of Subreddit`,
							theme: "prompt",
						},
					};
				}

				let page = 1
				let limit = 10;
				let offset = (page - 1) * limit;

				let result = await axios.get(`https://oauth.reddit.com/r/${args[0]}/${name}`, {
					headers: header,
					params: { raw_json: 1, limit: 50, count: limit, after: offset },
				});

				if (result.data.data.dist == 0) {
					return {
						text: `No Results found with Reddit name - *${CommonUtil.firstLetCap(args[0])}* \n\n *__Posibilities For this Error__* \n\n *1)* Subreddit Not Found \n  \n\n *Try Searching for Subreddit before searching for Query* \n*Usage :* /zrgethotpost {subreddit_name} \n *Example :* /zrgethotpost *python*`,
						card: {
							title: "Result Not Found",
							theme: "prompt",
						},
					};
				}

				let totalPages = Math.ceil(result.data.data.dist / limit);
				let resp = {
					text: `*${result.data.data.dist}* Results Found on *${CommonUtil.firstLetCap(args[0])}* \n---\n\n `,
					card: {
						title: `${CommonUtil.firstLetCap(name)} Posts for *Reddit: * __${CommonUtil.firstLetCap(args[0])}__ (Page ${page}/${totalPages})`,
						theme: "prompt",
					},
					buttons: [
						{
							label: "Prev Page",
							type: "+",
							action: {
								type: "invoke.function",
								data: {
									name: "pageprev",
								}
							},
							arguments: {
								page: page - 1,
								total_page: totalPages,
								subreddit: args[0],
								limit: limit,
								offset: offset,
								category: name
							}
						},
						{
							label: "Next Page",
							type: "+",
							action: {
								type: "invoke.function",
								data: {
									name: "pagenext"
								}
							},
							arguments: {
								page: page + 1,
								total_page: totalPages,
								subreddit: args[0],
								limit: limit,
								offset: offset,
								category: name
							}
						}
					],
				};

				for (let i = 0; i < limit; i++) {
					let index = offset + i;
					if (index >= result.data.data.dist) {
						break;
					}
					resp.text += `*${index + 1}.* [${result.data.data.children[index].data.title}](https://www.reddit.com${result.data.data.children[index].data.permalink}) \n *upvote ratio: * ${result.data.data.children[index].data.upvote_ratio} *Ups: * ${CommonUtil.formatNumber(result.data.data.children[index].data.ups)} *Downs: * ${CommonUtil.formatNumber(result.data.data.children[index].data.downs)} *Comments: *${CommonUtil.formatNumber(result.data.data.children[index].data.num_comments)} \n *Created: *${new Date(result.data.data.children[index].data.created_utc * 1000).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'long', timeStyle: 'medium' })}\n *SubReddit_ID: * ${result.data.data.children[index].data.name} \n\n`;
				}

				return resp;
			} else {
				return _notLoggedIn(zuid);
			}

		} catch (error) {
			throw error;
		}
	}

	const _notLoggedIn = async (zuid) => {
		const CLIENT_ID = 'Reddit_client_id';
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
		}
	}

	performance.mark('A');
	const _ping = async () => {
		performance.mark('B');
    	performance.measure('A to B', 'A', 'B');
    	const measure = performance.getEntriesByName('A to B')[0];
    	console.log(measure.duration);
		return {
			text: "Pong! 🏓",
		};
		
	}


	return {
		handler: _handler
	};
})();

module.exports = Bots;
