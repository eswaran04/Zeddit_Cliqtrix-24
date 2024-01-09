const CommonUtil = require("../utils/commonUtil");	
const DatabaseUtil = require("../utils/databaseUtil");	
const botHandler = require("./botHandler");	
const axios = require("axios");	
const qs = require('qs');	

const Functions = (function () {
	let reqData;
	let reqParams;
	let tabs = [
		{ "label": "Home 🏠", "id": "homeTab" },
		{ "label": "My Posts 📂", "id": "posts" },
		{ "label": "Trending Post 🔥", "id": "trend" },
		{ "label": "Create Post ➕", "id": "createpost" },
		{ "label": "View Post 🔍", "id": "viewpost" }
	]
	const _handler = async (data) => {
		_initialize(data);
		let response;
		const handler = reqData.handler.type;
		if (handler === "button_handler") {
			response = await _buttonHandler();
		} else if (handler === "form_handler") {	
			response = await _formHandler();
		} else if (handler === "applet_button_handler") {
			response = await _appletButtonHandler();
		}
		return response;
	};

	const _initialize = (data) => {
		reqData = data;
		reqParams = data.params;
	};

	const _buttonHandler = async () => {
		let response = {};
		if (reqData.name === "zrsrcpagenext") {
			let zuid = reqData.params.access.user_id;

			if (!(await DatabaseUtil.rUsers.rdoesUserExists(zuid))) {
				await DatabaseUtil.rUsers.raddUser(zuid);
			}
			const token = await DatabaseUtil.rUsers.rgetToken(zuid);
			if (token != undefined && token != null) {

				if (Number(reqData.params.arguments.page) > Number(reqData.params.arguments.total_page)) {
					return response = {
						text: `Max Results Found`,
					}
				}

				let page = Number(reqData.params.arguments.page);
				let limit = Number(reqData.params.arguments.limit);
				let query = reqData.params.arguments.query;
				let subreddit = reqData.params.arguments.subreddit;
				let offset = (page - 1) * limit;
				const header = { Authorization: `Bearer ${token}` };


				let result = await axios.get(`https://oauth.reddit.com/r/${subreddit}/search`, {
					headers: header,
					params: { raw_json: 1, q: `${query}`, limit: 50, sort: "relevance", count: limit, after: offset },
				});

				let totalPages = Math.ceil(result.data.data.dist / limit);

				response = {
					text: `*${result.data.data.dist}* Results Found on *${subreddit}* \n---\n\n `,
					type: "message_edit",
					card: {
						title: `Results for *Query: * __${query}__ (Page ${page}/${totalPages})`,
						theme: "prompt",
					},
					buttons: [
						{
							label: "Prev Page",
							hint: '',
							type: "+",
							action: {
								type: "invoke.function",
								data: {
									name: "zrsrcpageprev",
								}
							},
							arguments: {
								page: Number(page) - 1,
								total_page: totalPages,
								query: query,
								subreddit: subreddit,
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
								page: Number(page) + 1,
								total_page: totalPages,
								query: query,
								subreddit: subreddit,
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
					response.text += `*${index + 1}.* [${result.data.data.children[index].data.title}](https://www.reddit.com${result.data.data.children[index].data.permalink}) \n *upvote ratio: * ${result.data.data.children[index].data.upvote_ratio} *Ups: * ${CommonUtil.formatNumber(result.data.data.children[index].data.ups)} *Downs: * ${CommonUtil.formatNumber(result.data.data.children[index].data.downs)} *Comments: *${CommonUtil.formatNumber(result.data.data.children[index].data.num_comments)} \n *Created: *${new Date(result.data.data.children[index].data.created_utc * 1000).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'long', timeStyle: 'medium' })}\n *SubReddit_ID: * ${result.data.data.children[index].data.name} \n\n`;
				}

			} else {
				botHandler._notLoggedIn(zuid);
			}
		} else if (reqData.name === "zrsrcpageprev") {
			let zuid = reqData.params.access.user_id;

			if (!(await DatabaseUtil.rUsers.rdoesUserExists(zuid))) {
				await DatabaseUtil.rUsers.raddUser(zuid);
			}
			const token = await DatabaseUtil.rUsers.rgetToken(zuid);
			if (token != undefined && token != null) {

				if (Number(reqData.params.arguments.page) < 1) {
					return response = {
						text: `Imagine getting negative results lol`,
					}
				}

				let page = Number(reqData.params.arguments.page);
				let limit = Number(reqData.params.arguments.limit);
				let query = reqData.params.arguments.query;
				let subreddit = reqData.params.arguments.subreddit;
				let offset = (page - 1) * limit;
				const header = { Authorization: `Bearer ${token}` };


				let result = await axios.get(`https://oauth.reddit.com/r/${subreddit}/search`, {
					headers: header,
					params: { raw_json: 1, q: `${query}`, limit: 50, sort: "relevance", count: limit, after: offset },
				});

				let totalPages = Math.ceil(result.data.data.dist / limit);

				response = {
					text: `*${result.data.data.dist}* Results Found on *${subreddit}* \n---\n\n `,
					type: "message_edit",
					card: {
						title: `Results for *Query: * __${query}__ (Page ${page}/${totalPages})`,
						theme: "prompt",
					},
					buttons: [
						{
							label: "Prev Page",
							hint: '',
							type: "+",
							action: {
								type: "invoke.function",
								data: {
									name: "zrsrcpageprev",
								}
							},
							arguments: {
								page: Number(page) - 1,
								total_page: totalPages,
								query: query,
								subreddit: subreddit,
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
								page: Number(page) + 1,
								total_page: totalPages,
								query: query,
								subreddit: subreddit,
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
					response.text += `*${index + 1}.* [${result.data.data.children[index].data.title}](https://www.reddit.com${result.data.data.children[index].data.permalink}) \n *upvote ratio: * ${result.data.data.children[index].data.upvote_ratio} *Ups: * ${CommonUtil.formatNumber(result.data.data.children[index].data.ups)} *Downs: * ${CommonUtil.formatNumber(result.data.data.children[index].data.downs)} *Comments: *${CommonUtil.formatNumber(result.data.data.children[index].data.num_comments)} \n *Created: *${new Date(result.data.data.children[index].data.created_utc * 1000).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'long', timeStyle: 'medium' })}\n *SubReddit_ID: * ${result.data.data.children[index].data.name} \n\n`;
				}
			} else {
				botHandler._notLoggedIn(zuid);
			}
		} else if (reqData.name === "pagenext") {
			let zuid = reqData.params.access.user_id;

			if (!(await DatabaseUtil.rUsers.rdoesUserExists(zuid))) {
				await DatabaseUtil.rUsers.raddUser(zuid);
			}
			const token = await DatabaseUtil.rUsers.rgetToken(zuid);
			if (token != undefined && token != null) {

				if (Number(reqData.params.arguments.page) > Number(reqData.params.arguments.total_page)) {
					return response = {
						text: `Max Results Found`,
					}
				}

				let page = Number(reqData.params.arguments.page);
				let limit = Number(reqData.params.arguments.limit);
				let subreddit = reqData.params.arguments.subreddit;
				let offset = (page - 1) * limit;
				let category = reqData.params.arguments.category;
				const header = { Authorization: `Bearer ${token}` };

				let result = await axios.get(`https://oauth.reddit.com/r/${subreddit}/${category}`, {
					headers: header,
					params: { raw_json: 1, limit: 50, count: limit, after: offset },
				});

				let totalPages = Math.ceil(result.data.data.dist / limit);
				response = {
					text: `*${result.data.data.dist}* Results Found on *${CommonUtil.firstLetCap(subreddit)}* \n---\n\n `,
					type: "message_edit",
					card: {
						title: `${CommonUtil.firstLetCap(category)} Posts for *Reddit: * __${CommonUtil.firstLetCap(subreddit)}__ (Page ${page}/${totalPages})`,
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
								page: Number(page) - 1,
								total_page: totalPages,
								subreddit: subreddit,
								limit: limit,
								offset: offset,
								category: category,
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
								page: Number(page) + 1,
								total_page: totalPages,
								subreddit: subreddit,
								limit: limit,
								offset: offset,
								category: category,
							}
						}
					],
				};

				for (let i = 0; i < limit; i++) {
					let index = offset + i;
					if (index >= result.data.data.dist) {
						break;
					}
					response.text += `*${index + 1}.* [${result.data.data.children[index].data.title}](https://www.reddit.com${result.data.data.children[index].data.permalink}) \n *upvote ratio: * ${result.data.data.children[index].data.upvote_ratio} *Ups: * ${CommonUtil.formatNumber(result.data.data.children[index].data.ups)} *Downs: * ${CommonUtil.formatNumber(result.data.data.children[index].data.downs)} *Comments: *${CommonUtil.formatNumber(result.data.data.children[index].data.num_comments)} \n *Created: *${new Date(result.data.data.children[index].data.created_utc * 1000).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'long', timeStyle: 'medium' })}\n *SubReddit_ID: * ${result.data.data.children[index].data.name} \n\n`;
				}


			} else {
				botHandler._notLoggedIn(zuid);
			}

		} else if (reqData.name === "pageprev") {
			let zuid = reqData.params.access.user_id;

			if (!(await DatabaseUtil.rUsers.rdoesUserExists(zuid))) {
				await DatabaseUtil.rUsers.raddUser(zuid);
			}
			const token = await DatabaseUtil.rUsers.rgetToken(zuid);
			if (token != undefined && token != null) {

				if (Number(reqData.params.arguments.page) < 1) {
					return response = {
						text: `Imagine getting negative results lol`,
					}
				}

				let page = Number(reqData.params.arguments.page);
				let limit = Number(reqData.params.arguments.limit);
				let subreddit = reqData.params.arguments.subreddit;
				let offset = (page - 1) * limit;
				let category = reqData.params.arguments.category;
				const header = { Authorization: `Bearer ${token}` };

				let result = await axios.get(`https://oauth.reddit.com/r/${subreddit}/${category}`, {
					headers: header,
					params: { raw_json: 1, limit: 50, count: limit, after: offset },
				});

				let totalPages = Math.ceil(result.data.data.dist / limit);

				response = {
					text: `*${result.data.data.dist}* Results Found on *${CommonUtil.firstLetCap(subreddit)}* \n---\n\n `,
					type: "message_edit",
					card: {
						title: `${CommonUtil.firstLetCap(category)} Posts for *Reddit: * __${CommonUtil.firstLetCap(subreddit)}__ (Page ${page}/${totalPages})`,
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
								page: Number(page) - 1,
								total_page: totalPages,
								subreddit: subreddit,
								limit: limit,
								offset: offset,
								category: category,
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
								page: Number(page) + 1,
								total_page: totalPages,
								subreddit: subreddit,
								limit: limit,
								offset: offset,
								category: category,
							}
						}
					],
				};

				for (let i = 0; i < limit; i++) {
					let index = offset + i;
					if (index >= result.data.data.dist) {
						break;
					}
					response.text += `*${index + 1}.* [${result.data.data.children[index].data.title}](https://www.reddit.com${result.data.data.children[index].data.permalink}) \n *upvote ratio: * ${result.data.data.children[index].data.upvote_ratio} *Ups: * ${CommonUtil.formatNumber(result.data.data.children[index].data.ups)} *Downs: * ${CommonUtil.formatNumber(result.data.data.children[index].data.downs)} *Comments: *${CommonUtil.formatNumber(result.data.data.children[index].data.num_comments)} \n *Created: *${new Date(result.data.data.children[index].data.created_utc * 1000).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'long', timeStyle: 'medium' })}\n *SubReddit_ID: * ${result.data.data.children[index].data.name} \n\n`;
				}


			} else {
				botHandler._notLoggedIn(zuid);
			}
		}

		return response;
	};

	const _appletButtonHandler = async () => {
		let response = {};
		let zuid = reqData.params.access.user_id;
		let object = JSON.parse(reqData.params.target.id)
		console.log(object);
		if (object.id === "widgetlgout") {
			await DatabaseUtil.rUsers.rupdateSettings(zuid, { Token: null });
			//CommonUtil.getBannerResponse("You have successfully logged out. ✅", false);
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

			response = {
				"type": "applet",
				"data_type": "info",
				"tabs": tabs,
				"info": {
					"title": "You haven't Authorized your Account Yet!",
					"description": "Click here to Login.",
					"image_url": "https://cdn.discordapp.com/attachments/757988905177055332/1174405168402542622/logo-contains-z-and-r-letter_2.jpg?ex=6579ee0b&is=6567790b&hm=49a1a732ddba55b3f03bd803bdf80e0a8b58a4e4ee4a9e8ad16bc72487738156&",
					"button": {
						"label": "Login with OAuth",
						"type": "open.url",
						"url": `https://www.reddit.com/api/v1/authorize?${qs.stringify(params)}`
					}
				},
				"active_tab": "homeTab"
			};
			
			return response;
		} else if (object.id === "nxtpgtrend") {
			let zuid = reqData.params.access.user_id;

			if (!(await DatabaseUtil.rUsers.rdoesUserExists(zuid))) {
				await DatabaseUtil.rUsers.raddUser(zuid);
			}
			const token = await DatabaseUtil.rUsers.rgetToken(zuid);
			if (token != undefined && token != null) {
				if (object.page > object.total_page) {
					return response = CommonUtil.getBannerResponse("Maximum results found", true)
				}

				let page = object.page;
				let limit = object.limit;
				let offset = (page - 1) * limit;
				const header = { Authorization: `Bearer ${token}` };

				let result = await axios.get(`https://oauth.reddit.com/best`, {
					headers: header,
					params: { raw_json: 1, limit: 50, count: limit, after: offset },
				});
				let totalPages = Math.ceil(result.data.data.dist / limit);

				let posts = result.data.data.children;
				let head = { "title": `Trending Post 🔥 (Page ${page}/${totalPages})`, "navigation": "new" };

				let button = [
					{
						"label": "Prev Page",
						"type": "invoke.function",
						"name": "widgetlogout",
						"id": {
							"id": "prvpgtrend",
							page: page - 1,
							total_page: totalPages,
							limit: limit,
							offset: offset,
						}
					},
					{
						"label": "Next Page",
						"type": "invoke.function",
						"name": "widgetlogout",
						"id": {
							"id": "nxtpgtrend",
							page: page + 1,
							total_page: totalPages,
							limit: limit,
							offset: offset,
						}
					}
				]
				let footer = { "buttons": button };
				let elements = [];
				let i = 0
				for (let i = 0; i < limit; i++) {
					let index = offset + i;
					if (index >= result.data.data.dist) {
						break;
					}
					elements.push(
						{
							"type": "text",
							"text": `*${index + 1}.* [${result.data.data.children[index].data.title}](https://www.reddit.com${result.data.data.children[index].data.permalink}) \n *upvote ratio: * ${result.data.data.children[index].data.upvote_ratio} *Ups: * ${CommonUtil.formatNumber(result.data.data.children[index].data.ups)} *Downs: * ${CommonUtil.formatNumber(result.data.data.children[index].data.downs)} *Comments: *${CommonUtil.formatNumber(result.data.data.children[index].data.num_comments)} \n *Created: *${new Date(result.data.data.children[index].data.created_utc * 1000).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'long', timeStyle: 'medium' })}\n *SubReddit_ID: * ${result.data.data.children[index].data.name} \n\n`
						},
						{
							"type": "buttons",
							"buttons": [
								{
									"label": "Open this on View Post 🔍",
									"type": "invoke.function",
									"name": "widgetlogout",
									"id": {
										"id": "comments",
										"post_id": result.data.data.children[index].data.name,
									}
								},
							]
						},
						{
							"type": "divider"
						}
					);
				}

				let sections = [
					{
						"id": 1,
						"elements": elements
					},
				]

				response = {
					"type": "applet",
					"tabs": tabs,
					"active_tab": "trend",
					"header": head,
					"footer": footer,
					"sections": sections
				};

			} else {
				botHandler._notLoggedIn(zuid);
			}
			return response;
		} else if (object.id === "prvpgtrend") {
			let zuid = reqData.params.access.user_id;

			if (!(await DatabaseUtil.rUsers.rdoesUserExists(zuid))) {
				await DatabaseUtil.rUsers.raddUser(zuid);
			}
			const token = await DatabaseUtil.rUsers.rgetToken(zuid);
			if (token != undefined && token != null) {
				if (object.page < 1) {
					return response = CommonUtil.getBannerResponse("Cant go to negative pages", true)
				}

				let page = object.page;
				let limit = object.limit;
				let offset = (page - 1) * limit;
				const header = { Authorization: `Bearer ${token}` };

				let result = await axios.get(`https://oauth.reddit.com/best`, {
					headers: header,
					params: { raw_json: 1, limit: 50, count: limit, after: offset },
				});
				let totalPages = Math.ceil(result.data.data.dist / limit);

				let posts = result.data.data.children;
				let head = { "title": `Trending Post 🔥 (Page ${page}/${totalPages})`, "navigation": "new" };

				let button = [
					{
						"label": "Prev Page",
						"type": "invoke.function",
						"name": "widgetlogout",
						"id": {
							"id": "prvpgtrend",
							page: page - 1,
							total_page: totalPages,
							limit: limit,
							offset: offset,
						}
					},
					{
						"label": "Next Page",
						"type": "invoke.function",
						"name": "widgetlogout",
						"id": {
							"id": "nxtpgtrend",
							page: page + 1,
							total_page: totalPages,
							limit: limit,
							offset: offset,
						}
					}
				]
				let footer = { "buttons": button };
				let elements = [];
				let i = 0
				for (let i = 0; i < limit; i++) {
					let index = offset + i;
					if (index >= result.data.data.dist) {
						break;
					}
					elements.push(
						{
							"type": "text",
							"text": `*${index + 1}.* [${result.data.data.children[index].data.title}](https://www.reddit.com${result.data.data.children[index].data.permalink}) \n *upvote ratio: * ${result.data.data.children[index].data.upvote_ratio} *Ups: * ${CommonUtil.formatNumber(result.data.data.children[index].data.ups)} *Downs: * ${CommonUtil.formatNumber(result.data.data.children[index].data.downs)} *Comments: *${CommonUtil.formatNumber(result.data.data.children[index].data.num_comments)} \n *Created: *${new Date(result.data.data.children[index].data.created_utc * 1000).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'long', timeStyle: 'medium' })}\n *SubReddit_ID: * ${result.data.data.children[index].data.name} \n\n`
						},
						{
							"type": "buttons",
							"buttons": [
								{
									"label": "Open this on View Post 🔍",
									"type": "invoke.function",
									"name": "widgetlogout",
									"id": {
										"id": "comments",
										"post_id": result.data.data.children[index].data.name,
									}
								},
							]
						},
						{
							"type": "divider"
						}
					);
				}

				let sections = [
					{
						"id": 1,
						"elements": elements
					},
				]

				response = {
					"type": "applet",
					"tabs": tabs,
					"active_tab": "trend",
					"header": head,
					"footer": footer,
					"sections": sections
				};

			} else {
				botHandler._notLoggedIn(zuid);
			}
			return response;
		} else if (object.id === "nxtpgpost") {
			try {
				let zuid = reqData.params.access.user_id;

				if (!(await DatabaseUtil.rUsers.rdoesUserExists(zuid))) {
					await DatabaseUtil.rUsers.raddUser(zuid);
				}
				const token = await DatabaseUtil.rUsers.rgetToken(zuid);
				if (token != undefined && token != null) {
					if (object.page > object.total_page) {
						return response = CommonUtil.getBannerResponse("Maximum results found", true)
					}

					let page = object.page;
					let limit = object.limit;
					let offset = (page - 1) * limit;
					const header = { Authorization: `Bearer ${token}` };

					let res = await axios.get("https://oauth.reddit.com/api/v1/me", { headers: header, params: { raw_json: 1 } })
					let result = await axios.get(`https://oauth.reddit.com/user/${res.data.name}/submitted`, {
						headers: header,
						params: { raw_json: 1, limit: 100, count: limit, after: offset },
					})
					let totalPages = Math.ceil(result.data.data.dist / limit);

					let head = { "title": `My Posts 📂 > (Page ${page}/${totalPages})`, "navigation": "new" };
					let button = [
						{
							"label": "Prev Page",
							"type": "invoke.function",
							"name": "widgetlogout",
							"id": {
								"id": "prvpgpost",
								page: page - 1,
								total_page: totalPages,
								limit: limit,
								offset: offset,
							}
						},
						{
							"label": "Next Page",
							"type": "invoke.function",
							"name": "widgetlogout",
							"id": {
								"id": "nxtpgpost",
								page: page + 1,
								total_page: totalPages,
								limit: limit,
								offset: offset,
							}
						}
					]
					let footer = { "buttons": button };
					let elements = [];
					for (let i = 0; i < limit; i++) {
						let index = offset + i;
						if (index >= result.data.data.dist) {
							break;
						}
						elements.push(
							{
								"type": "text",
								"text": `*Post Title* - __${result.data.data.children[index].data.title}__\n*Under Subreddit* - [${result.data.data.children[index].data.subreddit_name_prefixed}](https://www.reddit.com/${result.data.data.children[index].data.subreddit_name_prefixed})\n*Post URL* - [Link](${result.data.data.children[index].data.url})\n*Posted @* - ${new Date(result.data.data.children[index].data.created_utc * 1000)}\n *SubReddit_ID: * ${result.data.data.children[index].data.name} \n`
							},
							{
								"type": "divider"
							}
						);
					}

					let sections = [
						{
							"id": 1,
							"elements": elements
						},
					]

					response = {
						"type": "applet",
						"tabs": tabs,
						"active_tab": "posts",
						"header": head,
						"footer": footer,
						"sections": sections
					};
				} else {
					botHandler._notLoggedIn(zuid);
				}
			} catch (e) {
				console.log(e)
			}

		} else if (object.id === "prvpgpost") {

			let zuid = reqData.params.access.user_id;

			if (!(await DatabaseUtil.rUsers.rdoesUserExists(zuid))) {
				await DatabaseUtil.rUsers.raddUser(zuid);
			}
			const token = await DatabaseUtil.rUsers.rgetToken(zuid);
			if (token != undefined && token != null) {
				if (object.page < 1) {
					return response = CommonUtil.getBannerResponse("Can't go to negative pages", true)
				}

				let page = object.page;
				let limit = object.limit;
				let offset = (page - 1) * limit;
				const header = { Authorization: `Bearer ${token}` };

				let res = await axios.get("https://oauth.reddit.com/api/v1/me", { headers: header, params: { raw_json: 1 } })
				let result = await axios.get(`https://oauth.reddit.com/user/${res.data.name}/submitted`, {
					headers: header,
					params: { raw_json: 1, limit: 100, count: limit, after: offset },
				})
				let totalPages = Math.ceil(result.data.data.dist / limit);

				let head = { "title": `My Posts 📂 > (Page ${page}/${totalPages})`, "navigation": "new" };

				let button = [
					{
						"label": "Prev Page",
						"type": "invoke.function",
						"name": "widgetlogout",
						"id": {
							"id": "prvpgpost",
							page: page - 1,
							total_page: totalPages,
							limit: limit,
							offset: offset,
						}
					},
					{
						"label": "Next Page",
						"type": "invoke.function",
						"name": "widgetlogout",
						"id": {
							"id": "nxtpgpost",
							page: page + 1,
							total_page: totalPages,
							limit: limit,
							offset: offset,
						}
					}
				]
				let footer = { "buttons": button };
				let elements = [];
				for (let i = 0; i < limit; i++) {
					let index = offset + i;
					if (index >= result.data.data.dist) {
						break;
					}
					elements.push(
						{
							"type": "text",
							"text": `*Post Title* - __${result.data.data.children[index].data.title}__\n*Under Subreddit* - [${result.data.data.children[index].data.subreddit_name_prefixed}](https://www.reddit.com/${result.data.data.children[index].data.subreddit_name_prefixed})\n*Post URL* - [Link](${result.data.data.children[index].data.url})\n*Posted @* - ${new Date(result.data.data.children[index].data.created_utc * 1000)}\n *SubReddit_ID: * ${result.data.data.children[index].data.name} \n`
						},
						{
							"type": "divider"
						}
					);
				}

				let sections = [
					{
						"id": 1,
						"elements": elements
					},
				]

				response = {
					"type": "applet",
					"tabs": tabs,
					"active_tab": "posts",
					"header": head,
					"footer": footer,
					"sections": sections
				};
			}

		} else if (object.id === "comments") {
			try {
				if (!(await DatabaseUtil.rUsers.rdoesUserExists(zuid))) {
					await DatabaseUtil.rUsers.raddUser(zuid);
				}

				const token = await DatabaseUtil.rUsers.rgetToken(zuid);
				const header = { Authorization: `Bearer ${token}` };

				if (token !== undefined && token !== null) {
					let result = await axios.get(`https://oauth.reddit.com/by_id/${object.post_id}`, {
						headers: header,
					});
					console.log(result.data.data.children[0].data)

					if (result.data.data.children[0].data.num_comments > 0) {
						let cmdRes = await axios.get(`https://oauth.reddit.com/r/${result.data.data.children[0].data.subreddit}/comments/${result.data.data.children[0].data.id}`, {
							headers: header,
						})

						//console.log(cmdRes.data[1].data.children[0].data)
						if (result.data.data.children[0].data.post_hint == null || result.data.data.children[0].data.post_hint == "link") {
							let head = { "title": `View Post 🔍 (ID - ${object.post_id})`, "navigation": "new" };
							let button = [
								{
									"label": "Add Comment to this post",
									"type": "invoke.function",
									"name": "addcommentform",
									"id": {
										"id": "add_cmd",
										"pid": result.data.data.children[0].data.name,
									}
								},
								{
									"label": "Go to Post",
									"type": "open.url",
									"url": `${result.data.data.children[0].data.url}`
								}

							]
							let footer = { "buttons": button };
							let elements = [];
							elements.push(
								{
									"type": "text",
									"text": `*Author: * [${result.data.data.children[0].data.author}](https://www.reddit.com/user/${result.data.data.children[0].data.author}) \n *Title: * [${result.data.data.children[0].data.title}](${result.data.data.children[0].data.url}) \n *Subreddit: * [r/${result.data.data.children[0].data.subreddit}](https://www.reddit.com/r/${result.data.data.children[0].data.subreddit}) \n *Ups: * ${CommonUtil.formatNumber(result.data.data.children[0].data.ups)} *Downs: * ${CommonUtil.formatNumber(result.data.data.children[0].data.downs)} \n *Comments: *${CommonUtil.formatNumber(result.data.data.children[0].data.num_comments)} \n *Created: *${new Date(result.data.data.children[0].data.created_utc * 1000).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'long', timeStyle: 'medium' })}\n`
								},
								{
									"type": "text",
									"text": `*Selftext: * ${(result.data.data.children[0].data.selftext).substring(0, 450)}` + "..."
								},
								{
									"type": "divider",
								},
								{
									"type": "text",
									"text": `*Comments*`
								},
							)

							let cmt_count = result.data.data.children[0].data.num_comments
							console.log(cmt_count)
							cmt_count = cmt_count > 5 ? 5 : cmt_count

							for (let i = 0; i < cmt_count; i++) {
								if (!cmdRes.data[1].data.children[i]) continue;
								let author = await cmdRes.data[1].data.children[i].data.author;
								let comment = await (cmdRes.data[1].data.children[i].data.body).substring(0, 450) + "..."
								let auth = `*${i + 1}.* [${author}](https://www.reddit.com/user/${author})`
								let cmt = `*Comment: * ${comment}`

								elements.push(
									{
										"type": "text",
										"text": auth
									},
									{
										"type": "text",
										"text": cmt
									},
									{
										"type": "divider"
									}
								)
							}

							let sections = [
								{
									"id": 1,
									"elements": elements
								}
							]
							response = {
								"type": "applet",
								"tabs": tabs,
								"active_tab": "viewpost",
								"header": head,
								"footer": footer,
								"sections": sections
							}

						} else if (result.data.data.children[0].data.post_hint == "image") {
							let head = { "title": `View Post 🔍 (ID - ${object.post_id})`, "navigation": "new" };
							let button = [
								{
									"label": "Add Comment",
									"type": "invoke.function",
									"name": "addcommentform",
									"id": {
										"id": "add_cmd",
										"pid": result.data.data.children[0].data.name,
									}
								},
								{
									"label": "Go to Post",
									"type": "open.url",
									"url": `${result.data.data.children[0].data.url}`
								}

							]
							let footer = { "buttons": button };
							let elements = [];
							elements.push(
								{
									"type": "text",
									"text": `*Author: * [${result.data.data.children[0].data.author}](https://www.reddit.com/user/${result.data.data.children[0].data.author}) \n *Title: * [${result.data.data.children[0].data.title}](${result.data.data.children[0].data.url}) \n *Subreddit: * [r/${result.data.data.children[0].data.subreddit}](https://www.reddit.com/r/${result.data.data.children[0].data.subreddit}) \n *Ups: * ${CommonUtil.formatNumber(result.data.data.children[0].data.ups)} *Downs: * ${CommonUtil.formatNumber(result.data.data.children[0].data.downs)} \n *Comments: *${CommonUtil.formatNumber(result.data.data.children[0].data.num_comments)} \n *Created: *${new Date(result.data.data.children[0].data.created_utc * 1000).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'long', timeStyle: 'medium' })}\n`
								},
								{
									"type": "images",
									"style": {
										"view": "carousel",
										"size": "small",
									},
									"data": [
										{
											"url": `${result.data.data.children[0].data.url_overridden_by_dest}`,
											"description": "Reddit post"
										}
									]
								},
								{
									"type": "divider",
								},
								{
									"type": "text",
									"text": `*Comments*`
								},
							)

							let cmt_count = result.data.data.children[0].data.num_comments
							cmt_count = cmt_count > 5 ? 5 : cmt_count

							for (let i = 0; i < cmt_count; i++) {
								if (!cmdRes.data[1].data.children[i]) continue;
								let author = await cmdRes.data[1].data.children[i].data.author;
								let comment = await (cmdRes.data[1].data.children[i].data.body).substring(0, 450) + "..."
								let auth = `*${i + 1}.* [${author}](https://www.reddit.com/user/${author})`
								let cmt = `*Comment: * ${comment}`

								elements.push(
									{
										"type": "text",
										"text": auth
									},
									{
										"type": "text",
										"text": cmt
									},
									{
										"type": "divider"
									}
								)
							}

							let sections = [
								{
									"id": 1,
									"elements": elements
								}
							]
							response = {
								"type": "applet",
								"tabs": tabs,
								"active_tab": "viewpost",
								"header": head,
								"footer": footer,
								"sections": sections
							}
						} else if (result.data.data.children[0].data.is_video) {
							let head = { "title": `View Post 🔍 (ID - ${object.post_id})`, "navigation": "new" };
							let button = [
								{
									"label": "Add Comment",
									"type": "invoke.function",
									"name": "addcommentform",
									"id": {
										"id": "add_cmd",
										"pid": result.data.data.children[0].data.name,
									}
								},
								{
									"label": "Go to Post",
									"type": "open.url",
									"url": `${result.data.data.children[0].data.url}`
								}

							]
							let footer = { "buttons": button };
							let elements = [];
							elements.push(
								{
									"type": "text",
									"text": `*Author: * [${result.data.data.children[0].data.author}](https://www.reddit.com/user/${result.data.data.children[0].data.author}) \n *Title: * [${result.data.data.children[0].data.title}](${result.data.data.children[0].data.url}) \n *Subreddit: * [r/${result.data.data.children[0].data.subreddit}](https://www.reddit.com/r/${result.data.data.children[0].data.subreddit}) \n *Ups: * ${CommonUtil.formatNumber(result.data.data.children[0].data.ups)} *Downs: * ${CommonUtil.formatNumber(result.data.data.children[0].data.downs)} \n *Comments: *${CommonUtil.formatNumber(result.data.data.children[0].data.num_comments)} \n *Created: *${new Date(result.data.data.children[0].data.created_utc * 1000).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'long', timeStyle: 'medium' })}\n *Video Link: * [Click Here](${result.data.data.children[0].data.url})\n`
								},

								{
									"type": "divider",
								},
								{
									"type": "text",
									"text": `*Comments*`
								},
							)

							let cmt_count = result.data.data.children[0].data.num_comments
							cmt_count = cmt_count > 5 ? 5 : cmt_count

							for (let i = 0; i < cmt_count; i++) {
								if (!cmdRes.data[1].data.children[i]) continue;
								let author = await cmdRes.data[1].data.children[i].data.author;
								let comment = await (cmdRes.data[1].data.children[i].data.body).substring(0, 450) + "..."
								let auth = `*${i + 1}.* [${author}](https://www.reddit.com/user/${author})`
								let cmt = `*Comment: * ${comment}`

								elements.push(
									{
										"type": "text",
										"text": auth
									},
									{
										"type": "text",
										"text": cmt
									},
									{
										"type": "divider"
									}
								)
							}

							let sections = [
								{
									"id": 1,
									"elements": elements
								}
							]
							response = {
								"type": "applet",
								"tabs": tabs,
								"active_tab": "viewpost",
								"header": head,
								"footer": footer,
								"sections": sections
							}
						}
					} else {
						if (result.data.data.children[0].data.post_hint == null || result.data.data.children[0].data.post_hint == "link") {
							let head = { "title": `View Post 🔍 (ID - ${object.post_id})`, "navigation": "new" };
							let button = [
								{
									"label": "Add Comment",
									"type": "invoke.function",
									"name": "addcommentform",
									"id": {
										"id": "add_cmd",
										"pid": result.data.data.children[0].data.name,

									}
								},
								{
									"label": "Go to Post",
									"type": "open.url",
									"url": `${result.data.data.children[0].data.url}`
								}

							]
							let footer = { "buttons": button };
							let elements = [];
							elements.push(
								{
									"type": "text",
									"text": `*Author: * [${result.data.data.children[0].data.author}](https://www.reddit.com/user/${result.data.data.children[0].data.author}) \n *Title: * [${result.data.data.children[0].data.title}](${result.data.data.children[0].data.url}) \n *Subreddit: * [r/${result.data.data.children[0].data.subreddit}](https://www.reddit.com/r/${result.data.data.children[0].data.subreddit}) \n *Ups: * ${CommonUtil.formatNumber(result.data.data.children[0].data.ups)} *Downs: * ${CommonUtil.formatNumber(result.data.data.children[0].data.downs)} \n *Comments: *${CommonUtil.formatNumber(result.data.data.children[0].data.num_comments)} \n *Created: *${new Date(result.data.data.children[0].data.created_utc * 1000).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'long', timeStyle: 'medium' })}\n`
								},
								{
									"type": "text",
									"text": `*Selftext: * ${(result.data.data.children[0].data.selftext).substring(0, 450)}` + "..."
								},
								{
									"type": "divider",
								},
								{
									"type": "text",
									"text": `*Comments*`
								},
								{
									"type": "text",
									"text": `No one commented yet`
								},
							)

							let sections = [
								{
									"id": 1,
									"elements": elements
								}
							]
							response = {
								"type": "applet",
								"tabs": tabs,
								"active_tab": "viewpost",
								"header": head,
								"footer": footer,
								"sections": sections
							}
						} else if (result.data.data.children[0].data.post_hint == "image") {
							let head = { "title": `View Post 🔍 (ID - ${object.post_id})`, "navigation": "new" };
							let button = [
								{
									"label": "Add Comment",
									"type": "invoke.function",
									"name": "addcommentform",
									"id": {
										"id": "add_cmd",
										"pid": result.data.data.children[0].data.name,

									}
								},
								{
									"label": "Go to Post",
									"type": "open.url",
									"url": `${result.data.data.children[0].data.url}`
								}

							]
							let footer = { "buttons": button };
							let elements = [];
							elements.push(
								{
									"type": "text",
									"text": `*Author: * [${result.data.data.children[0].data.author}](https://www.reddit.com/user/${result.data.data.children[0].data.author}) \n *Title: * [${result.data.data.children[0].data.title}](${result.data.data.children[0].data.url}) \n *Subreddit: * [r/${result.data.data.children[0].data.subreddit}](https://www.reddit.com/r/${result.data.data.children[0].data.subreddit}) \n *Ups: * ${CommonUtil.formatNumber(result.data.data.children[0].data.ups)} *Downs: * ${CommonUtil.formatNumber(result.data.data.children[0].data.downs)} \n *Comments: *${CommonUtil.formatNumber(result.data.data.children[0].data.num_comments)} \n *Created: *${new Date(result.data.data.children[0].data.created_utc * 1000).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'long', timeStyle: 'medium' })}\n`
								},
								{
									"type": "images",
									"style": {
										"view": "carousel",
										"size": "small",
									},
									"data": [
										{
											"url": `${result.data.data.children[0].data.url_overridden_by_dest}`,
											"description": "Reddit post"
										}
									]
								},
								{
									"type": "divider",
								},
								{
									"type": "text",
									"text": `*Comments*`
								},
								{
									"type": "text",
									"text": `No one commented yet`
								}
							)


							let sections = [
								{
									"id": 1,
									"elements": elements
								}
							]
							response = {
								"type": "applet",
								"tabs": tabs,
								"active_tab": "viewpost",
								"header": head,
								"footer": footer,
								"sections": sections
							}
						} else if (result.data.data.children[0].data.is_video) {
							let head = { "title": `View Post 🔍 (ID - ${object.post_id})`, "navigation": "new" };
							let button = [
								{
									"label": "Add Comment",
									"type": "invoke.function",
									"name": "addcommentform",
									"id": {
										"id": "add_cmd",
										"pid": result.data.data.children[0].data.name,
									}
								},
								{
									"label": "Go to Post",
									"type": "open.url",
									"url": `${result.data.data.children[0].data.url}`
								}

							]
							let footer = { "buttons": button };
							let elements = [];
							elements.push(
								{
									"type": "text",
									"text": `*Author: * [${result.data.data.children[0].data.author}](https://www.reddit.com/user/${result.data.data.children[0].data.author}) \n *Title: * [${result.data.data.children[0].data.title}](${result.data.data.children[0].data.url}) \n *Subreddit: * [r/${result.data.data.children[0].data.subreddit}](https://www.reddit.com/r/${result.data.data.children[0].data.subreddit}) \n *Ups: * ${CommonUtil.formatNumber(result.data.data.children[0].data.ups)} *Downs: * ${CommonUtil.formatNumber(result.data.data.children[0].data.downs)} \n *Comments: *${CommonUtil.formatNumber(result.data.data.children[0].data.num_comments)} \n *Created: *${new Date(result.data.data.children[0].data.created_utc * 1000).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'long', timeStyle: 'medium' })}\n *Video Link: * [Click Here](${result.data.data.children[0].data.url})\n`
								},

								{
									"type": "divider",
								},
								{
									"type": "text",
									"text": `*Comments*`
								},
								{
									"type": "text",
									"text": `No one commented yet`
								}
							)


							let sections = [
								{
									"id": 1,
									"elements": elements
								}
							]
							response = {
								"type": "applet",
								"tabs": tabs,
								"active_tab": "viewpost",
								"header": head,
								"footer": footer,
								"sections": sections
							}
						}
					}
					return response;

				} else {
					return _notLoggedIn(zuid);
				}
			} catch (error) {
				console.log(error);
			}

		} else if (object.id === "add_cmd") {
			let zuid = reqData.params.access.user_id;

			if (!(await DatabaseUtil.rUsers.rdoesUserExists(zuid))) {
				await DatabaseUtil.rUsers.raddUser(zuid);
			}
			const token = await DatabaseUtil.rUsers.rgetToken(zuid);
			if (token != undefined && token != null) {
				return {
					"type": "form",
					"title": "Post Comment Form",
					"name": "Post Comment Form",
					"button_label": "Submit",
					"inputs": [
						{
							"name": "text",
							"label": "Comment",
							"placeholder": "Write you thoughts about the post",
							"min_length": "5",
							"mandatory": true,
							"type": "text"
						},
						{
							"name": "pid",
							"value": `${object.pid}`,
							"type": "hidden"
						}
					],
					"action": {
						"type": "invoke.function",
						"name": "addcommentform"
					}
				}

			} else {
				botHandler._notLoggedIn(zuid);
			}
		}
	}

	const _formHandler = async () => {
		try {
			let response = {};
			console.log(reqData.params.form.values);

			if (reqData.name == "postredditform") {
				let zuid = reqData.params.access.user_id;

				if (!(await DatabaseUtil.rUsers.rdoesUserExists(zuid))) {
					await DatabaseUtil.rUsers.raddUser(zuid);
				}
				const token = await DatabaseUtil.rUsers.rgetToken(zuid);
				if (token != undefined && token != null) {
					const header = {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/x-www-form-urlencoded'
					};
					let result = await axios.post(
						`https://oauth.reddit.com/api/submit`,
						{
							sr: reqData.params.form.values.subreddit_name,
							kind: "self",
							title: reqData.params.form.values.title, // Use the form value for the title
							text: reqData.params.form.values.text_content, // Use the form value for the text
							api_type: "json",
						},
						{
							headers: header,
						}
					);

					if (result.data.json.errors.length == 0) {
						response = {
							"type": "applet",
							"data_type": "info",
							"tabs": tabs,
							"info": {
								"title": "Success! 🥳",
								"description": "Your Post Has been Submited to the Reddit.\nYou Can go to (My Posts 📂) or click the below button to see the post\nIf you want to post again click on refresh button",
								"button": {
									"label": "Link to post",
									"type": "open.url",
									"url": `${result.data.json.data.url}`
								}
							},
							"active_tab": "createpost"
						};
					} else {
						response = {
							"type": "applet",
							"data_type": "info",
							"tabs": tabs,
							"info": {
								"title": "Error! 😕",
								"description": `Err_Code : ${result.data.json.errors[0][0]}\nReason : ${result.data.json.errors[0][1]} \n\n If you want to post again click on refresh button`,
							},
							"active_tab": "createpost"
						};
					}
					console.log(result.data);
				} else {
					botHandler._notLoggedIn(zuid);
				}
			} else if (reqData.name == "viewpostform") {
				try {
					let zuid = reqData.params.access.user_id;
					if (!(await DatabaseUtil.rUsers.rdoesUserExists(zuid))) {
						await DatabaseUtil.rUsers.raddUser(zuid);
					}
					let post_id = reqData.params.form.values.post_id;
					const token = await DatabaseUtil.rUsers.rgetToken(zuid);
					const header = { Authorization: `Bearer ${token}` };

					if (token !== undefined && token !== null) {
						let result = await axios.get(`https://oauth.reddit.com/by_id/${post_id}`, {
							headers: header,
						});


						if (result.data.data.children[0].data.num_comments > 0) {
							let cmdRes = await axios.get(`https://oauth.reddit.com/r/${result.data.data.children[0].data.subreddit}/comments/${result.data.data.children[0].data.id}`, {
								headers: header,
							})

							console.log(cmdRes.data[1].data.children[0].data.author)


							if (result.data.data.children[0].data.post_hint == null) {
								let head = { "title": `View Post 🔍 (ID - ${post_id})`, "navigation": "new" };
								let button = [
									{
										"label": "Add Comment",
										"type": "invoke.function",
										"name": "addcommentform",
										"id": {
											"id": "add_cmd",
											"pid": result.data.data.children[0].data.name,
										}
									},
									{
										"label": "Go to Post",
										"type": "open.url",
										"url": `${result.data.data.children[0].data.url}`
									}

								]
								let footer = { "buttons": button };
								let elements = [];
								elements.push(
									{
										"type": "text",
										"text": `*Author: * [${result.data.data.children[0].data.author}](https://www.reddit.com/user/${result.data.data.children[0].data.author}) \n *Title: * [${result.data.data.children[0].data.title}](${result.data.data.children[0].data.url}) \n *Subreddit: * [r/${result.data.data.children[0].data.subreddit}](https://www.reddit.com/r/${result.data.data.children[0].data.subreddit}) \n *Ups: * ${CommonUtil.formatNumber(result.data.data.children[0].data.ups)} *Downs: * ${CommonUtil.formatNumber(result.data.data.children[0].data.downs)} \n *Comments: *${CommonUtil.formatNumber(result.data.data.children[0].data.num_comments)} \n *Created: *${new Date(result.data.data.children[0].data.created_utc * 1000).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'long', timeStyle: 'medium' })}\n`
									},
									{
										"type": "text",
										"text": `*Selftext: * ${(result.data.data.children[0].data.selftext).substring(0, 450)}` + "..."
									},
									{
										"type": "divider",
									},
									{
										"type": "text",
										"text": `*Comments*`
									},
								)

								let cmt_count = result.data.data.children[0].data.num_comments
								cmt_count = cmt_count > 5 ? 5 : cmt_count

								for (let i = 0; i < cmt_count; i++) {
									let author = await cmdRes.data[1].data.children[i].data.author;
									let comment = await (cmdRes.data[1].data.children[i].data.body).substring(0, 450) + "..."
									let auth = `*${i + 1}.* [${author}](https://www.reddit.com/user/${author})`
									let cmt = `*Comment: * ${comment}`

									elements.push(
										{
											"type": "text",
											"text": auth
										},
										{
											"type": "text",
											"text": cmt
										},
										{
											"type": "divider"
										}
									)
								}

								let sections = [
									{
										"id": 1,
										"elements": elements
									}
								]
								response = {
									"type": "applet",
									"tabs": tabs,
									"active_tab": "viewpost",
									"header": head,
									"footer": footer,
									"sections": sections
								}

							} else if (result.data.data.children[0].data.post_hint == "image") {
								let head = { "title": `View Post 🔍 (ID - ${post_id})`, "navigation": "new" };
								let button = [
									{
										"label": "Add Comment",
										"type": "invoke.function",
										"name": "addcommentform",
										"id": {
											"id": "add_cmd",
											"pid": result.data.data.children[0].data.name,

										}
									},
									{
										"label": "Go to Post",
										"type": "open.url",
										"url": `${result.data.data.children[0].data.url}`
									}

								]
								let footer = { "buttons": button };
								let elements = [];
								elements.push(
									{
										"type": "text",
										"text": `*Author: * [${result.data.data.children[0].data.author}](https://www.reddit.com/user/${result.data.data.children[0].data.author}) \n *Title: * [${result.data.data.children[0].data.title}](${result.data.data.children[0].data.url}) \n *Subreddit: * [r/${result.data.data.children[0].data.subreddit}](https://www.reddit.com/r/${result.data.data.children[0].data.subreddit}) \n *Ups: * ${CommonUtil.formatNumber(result.data.data.children[0].data.ups)} *Downs: * ${CommonUtil.formatNumber(result.data.data.children[0].data.downs)} \n *Comments: *${CommonUtil.formatNumber(result.data.data.children[0].data.num_comments)} \n *Created: *${new Date(result.data.data.children[0].data.created_utc * 1000).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'long', timeStyle: 'medium' })}\n`
									},
									{
										"type": "images",
										"style": {
											"view": "carousel",
											"size": "small",
										},
										"data": [
											{
												"url": `${result.data.data.children[0].data.url_overridden_by_dest}`,
												"description": "Reddit post"
											}
										]
									},
									{
										"type": "divider",
									},
									{
										"type": "text",
										"text": `*Comments*`
									},
								)

								let cmt_count = result.data.data.children[0].data.num_comments
								cmt_count = cmt_count > 5 ? 5 : cmt_count

								for (let i = 0; i < cmt_count; i++) {
									let author = await cmdRes.data[1].data.children[i].data.author;
									let comment = await (cmdRes.data[1].data.children[i].data.body).substring(0, 450) + "..."
									let auth = `*${i + 1}.* [${author}](https://www.reddit.com/user/${author})`
									let cmt = `*Comment: * ${comment}`

									elements.push(
										{
											"type": "text",
											"text": auth
										},
										{
											"type": "text",
											"text": cmt
										},
										{
											"type": "divider"
										}
									)
								}

								let sections = [
									{
										"id": 1,
										"elements": elements
									}
								]
								response = {
									"type": "applet",
									"tabs": tabs,
									"active_tab": "viewpost",
									"header": head,
									"footer": footer,
									"sections": sections
								}
							} else if (result.data.data.children[0].data.is_video) {
								let head = { "title": `View Post 🔍 (ID - ${post_id})`, "navigation": "new" };
								let button = [
									{
										"label": "Add Comment",
										"type": "invoke.function",
										"name": "addcommentform",
										"id": {
											"id": "add_cmd",
											"pid": result.data.data.children[0].data.name,

										}
									},
									{
										"label": "Go to Post",
										"type": "open.url",
										"url": `${result.data.data.children[0].data.url}`
									}

								]
								let footer = { "buttons": button };
								let elements = [];
								elements.push(
									{
										"type": "text",
										"text": `*Author: * [${result.data.data.children[0].data.author}](https://www.reddit.com/user/${result.data.data.children[0].data.author}) \n *Title: * [${result.data.data.children[0].data.title}](${result.data.data.children[0].data.url}) \n *Subreddit: * [r/${result.data.data.children[0].data.subreddit}](https://www.reddit.com/r/${result.data.data.children[0].data.subreddit}) \n *Ups: * ${CommonUtil.formatNumber(result.data.data.children[0].data.ups)} *Downs: * ${CommonUtil.formatNumber(result.data.data.children[0].data.downs)} \n *Comments: *${CommonUtil.formatNumber(result.data.data.children[0].data.num_comments)} \n *Created: *${new Date(result.data.data.children[0].data.created_utc * 1000).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'long', timeStyle: 'medium' })}\n *Video Link: * [Click Here](${result.data.data.children[0].data.url})\n`
									},

									{
										"type": "divider",
									},
									{
										"type": "text",
										"text": `*Comments*`
									},
								)

								let cmt_count = result.data.data.children[0].data.num_comments
								cmt_count = cmt_count > 5 ? 5 : cmt_count

								for (let i = 0; i < cmt_count; i++) {
									let author = await cmdRes.data[1].data.children[i].data.author;
									let comment = await (cmdRes.data[1].data.children[i].data.body).substring(0, 450) + "..."
									let auth = `*${i + 1}.* [${author}](https://www.reddit.com/user/${author})`
									let cmt = `*Comment: * ${comment}`

									elements.push(
										{
											"type": "text",
											"text": auth
										},
										{
											"type": "text",
											"text": cmt
										},
										{
											"type": "divider"
										}
									)
								}

								let sections = [
									{
										"id": 1,
										"elements": elements
									}
								]
								response = {
									"type": "applet",
									"tabs": tabs,
									"active_tab": "viewpost",
									"header": head,
									"footer": footer,
									"sections": sections
								}
							}
						} else {
							if (result.data.data.children[0].data.post_hint == null) {
								let head = { "title": `View Post 🔍 (ID - ${post_id})`, "navigation": "new" };
								let button = [
									{
										"label": "Add Comment",
										"type": "invoke.function",
										"name": "addcommentform",
										"id": {
											"id": "add_cmd",
											"pid": result.data.data.children[0].data.name,

										}
									},
									{
										"label": "Go to Post",
										"type": "open.url",
										"url": `${result.data.data.children[0].data.url}`
									}

								]
								let footer = { "buttons": button };
								let elements = [];
								elements.push(
									{
										"type": "text",
										"text": `*Author: * [${result.data.data.children[0].data.author}](https://www.reddit.com/user/${result.data.data.children[0].data.author}) \n *Title: * [${result.data.data.children[0].data.title}](${result.data.data.children[0].data.url}) \n *Subreddit: * [r/${result.data.data.children[0].data.subreddit}](https://www.reddit.com/r/${result.data.data.children[0].data.subreddit}) \n *Ups: * ${CommonUtil.formatNumber(result.data.data.children[0].data.ups)} *Downs: * ${CommonUtil.formatNumber(result.data.data.children[0].data.downs)} \n *Comments: *${CommonUtil.formatNumber(result.data.data.children[0].data.num_comments)} \n *Created: *${new Date(result.data.data.children[0].data.created_utc * 1000).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'long', timeStyle: 'medium' })}\n`
									},
									{
										"type": "text",
										"text": `*Selftext: * ${(result.data.data.children[0].data.selftext).substring(0, 450)}` + "..."
									},
									{
										"type": "divider",
									},
									{
										"type": "text",
										"text": `*Comments*`
									},
									{
										"type": "text",
										"text": `No one commented yet`
									},
								)

								let sections = [
									{
										"id": 1,
										"elements": elements
									}
								]
								response = {
									"type": "applet",
									"tabs": tabs,
									"active_tab": "viewpost",
									"header": head,
									"footer": footer,
									"sections": sections
								}
							} else if (result.data.data.children[0].data.post_hint == "image") {
								let head = { "title": `View Post 🔍 (ID - ${post_id})`, "navigation": "new" };
								let button = [
									{
										"label": "Add Comment",
										"type": "invoke.function",
										"name": "addcommentform",
										"id": {
											"id": "add_cmd",
											"pid": result.data.data.children[0].data.name,
										}
									},
									{
										"label": "Go to Post",
										"type": "open.url",
										"url": `${result.data.data.children[0].data.url}`
									}

								]
								let footer = { "buttons": button };
								let elements = [];
								elements.push(
									{
										"type": "text",
										"text": `*Author: * [${result.data.data.children[0].data.author}](https://www.reddit.com/user/${result.data.data.children[0].data.author}) \n *Title: * [${result.data.data.children[0].data.title}](${result.data.data.children[0].data.url}) \n *Subreddit: * [r/${result.data.data.children[0].data.subreddit}](https://www.reddit.com/r/${result.data.data.children[0].data.subreddit}) \n *Ups: * ${CommonUtil.formatNumber(result.data.data.children[0].data.ups)} *Downs: * ${CommonUtil.formatNumber(result.data.data.children[0].data.downs)} \n *Comments: *${CommonUtil.formatNumber(result.data.data.children[0].data.num_comments)} \n *Created: *${new Date(result.data.data.children[0].data.created_utc * 1000).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'long', timeStyle: 'medium' })}\n`
									},
									{
										"type": "images",
										"style": {
											"view": "carousel",
											"size": "small",
										},
										"data": [
											{
												"url": `${result.data.data.children[0].data.url_overridden_by_dest}`,
												"description": "Reddit post"
											}
										]
									},
									{
										"type": "divider",
									},
									{
										"type": "text",
										"text": `*Comments*`
									},
									{
										"type": "text",
										"text": `No one commented yet`
									}
								)


								let sections = [
									{
										"id": 1,
										"elements": elements
									}
								]
								response = {
									"type": "applet",
									"tabs": tabs,
									"active_tab": "viewpost",
									"header": head,
									"footer": footer,
									"sections": sections
								}
							} else if (result.data.data.children[0].data.is_video) {
								let head = { "title": `View Post 🔍 (ID - ${post_id})`, "navigation": "new" };
								let button = [
									{
										"label": "Add Comment",
										"type": "invoke.function",
										"name": "addcommentform",
										"id": {
											"id": "add_cmd",
											"pid": result.data.data.children[0].data.name,

										}
									},
									{
										"label": "Go to Post",
										"type": "open.url",
										"url": `${result.data.data.children[0].data.url}`
									}

								]
								let footer = { "buttons": button };
								let elements = [];
								elements.push(
									{
										"type": "text",
										"text": `*Author: * [${result.data.data.children[0].data.author}](https://www.reddit.com/user/${result.data.data.children[0].data.author}) \n *Title: * [${result.data.data.children[0].data.title}](${result.data.data.children[0].data.url}) \n *Subreddit: * [r/${result.data.data.children[0].data.subreddit}](https://www.reddit.com/r/${result.data.data.children[0].data.subreddit}) \n *Ups: * ${CommonUtil.formatNumber(result.data.data.children[0].data.ups)} *Downs: * ${CommonUtil.formatNumber(result.data.data.children[0].data.downs)} \n *Comments: *${CommonUtil.formatNumber(result.data.data.children[0].data.num_comments)} \n *Created: *${new Date(result.data.data.children[0].data.created_utc * 1000).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'long', timeStyle: 'medium' })}\n *Video Link: * [Click Here](${result.data.data.children[0].data.url})\n`
									},

									{
										"type": "divider",
									},
									{
										"type": "text",
										"text": `*Comments*`
									},
									{
										"type": "text",
										"text": `No one commented yet`
									}
								)


								let sections = [
									{
										"id": 1,
										"elements": elements
									}
								]
								response = {
									"type": "applet",
									"tabs": tabs,
									"active_tab": "viewpost",
									"header": head,
									"footer": footer,
									"sections": sections
								}
							}
						}
						return response;

					} else {
						return _notLoggedIn(zuid);
					}
				} catch (error) {
					CommonUtil.getBannerResponse("Invalid Post ID. ❌", true)
					return {
						"type": "applet",
						"data_type": "form",
						"tabs": tabs,
						"active_tab": "viewpost",
						"form": {
							"mode": "kiosk",
							"title": "View Reddit Post",
							"name": "viewpostform",
							"button_label": "Submit",
							"inputs": [
								{
									"name": "post_id",
									"label": "Post ID",
									"placeholder": "Enter the ID of the post (Eg : t3_189kspj)",
									"hint": "Can be obtained for Zeddit Bot or Check #Trending Post 🔥",
									"min_length": "0",
									"max_length": "20",
									"mandatory": true,
									"type": "text"
								}
							],
							"action": {
								"type": "invoke.function",
								"name": "viewpostform",
							}
						}
					}

				}
			} else if (reqData.name == "addcommentform") {
				let zuid = reqData.params.access.user_id;

				if (!(await DatabaseUtil.rUsers.rdoesUserExists(zuid))) {
					await DatabaseUtil.rUsers.raddUser(zuid);
				}
				const token = await DatabaseUtil.rUsers.rgetToken(zuid);
				if (token != undefined && token != null) {
					const header = {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/x-www-form-urlencoded'
					};
					let result = await axios.post(
						`https://oauth.reddit.com/api/comment`,
						{
							api_type: 'json',
							thing_id: reqData.params.form.values.pid,
							text: reqData.params.form.values.text,
						},
						{
							headers: header,
						}
					);
					if (result.data.json.errors.length > 0) {
						response = CommonUtil.getBannerResponse(`Reason : ${result.data.json.errors[0][1]}`, true);
					} else {
						response = CommonUtil.getBannerResponse("Comment Added. ✅", false);
					}
				} else {
					botHandler._notLoggedIn(zuid);
				}

			}
			return response;
		} catch (err) {
			console.log(err);
		}
	};


	return {
		handler: _handler
	};
})();

module.exports = Functions;
