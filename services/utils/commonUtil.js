const crypto = require("crypto");	
const axios = require("axios");
const qs = require('qs');
const config = require("../../config/appKeys");	

const CommonUtil = (function () {
    let tabs = [
        { "label": "Home 🏠", "id": "homeTab" },
        { "label": "My Posts 📂", "id": "posts" },
        { "label": "Trending Post 🔥", "id": "trend" },
        { "label": "Create Post ➕", "id": "createpost" },
		{ "label": "View Post 🔍", "id": "viewpost"}
    ]

	const _isValidCliqSignature = (req) => {
		let isValidSignature = false;
		if(req.body.handler.type === "button_handler" || req.body.handler.type === "applet_button_handler" || req.body.handler.type === "form_handler") {
			return true;
		}
		const signature = req.headers["x-cliq-signature"];	
		if (typeof signature !== "undefined") {
			const verifier = crypto.createVerify("sha256");	
			verifier.update(JSON.stringify(req.body));
			let publicKey = "-----BEGIN PUBLIC KEY-----\n";	
			publicKey += config.CLIQ_APP_PUBLIC_KEY;
			publicKey += "\n-----END PUBLIC KEY-----";		
			isValidSignature = verifier.verify(publicKey, signature, "base64");	
		}
		return isValidSignature;
	};

	const _isEmptyString = (value) => {
		return (
			(typeof value == "string" && !value.trim()) ||	
			typeof value == "undefined" ||	
			value === null
		);
	};

	const _getBannerResponse = (text, isFailure) => {
		let response = { type: "banner", text, status: "success" };	
		if (isFailure) {
			response.status = "failure";	
		}
		return response;
	};

	const _formatNumber = (number) => {
		const million = 1000000;
		const thousand = 1000;
	  
		if (number >= million) {
		  return (number / million).toFixed(1) + 'm';
		} else if (number >= thousand) {
		  return (number / thousand).toFixed(0) + 'k';
		} else {
		  return number;
		}
	}

	const _firstLetCap = (str) => {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	const _widNotLoggedIn = async (reqData, zuid) => {
		let curTab = reqData.params.target.id == undefined && reqData.params.target.id == null ?  "homeTab" : reqData.params.target.id;

		const CLIENT_ID = 'fDTlhjLR5Z8PDD-unEhUfw';
		const REDIRECT_URI = 'https://desired-ghoul-verbally.ngrok-free.app/reddit/callback';
		const params = {
			client_id: CLIENT_ID,
			response_type: 'code',
			state: zuid,
			redirect_uri: REDIRECT_URI,
			duration: 'permanent',
			scope: '*'
		};

		return {
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
			"active_tab": curTab
		};
	}

	const _widError = async() => {
		return {
			"type": "applet",
			"data_type": "info",
			"tabs": tabs,
			"info": {
				"title": "Error encountered!",
				"description": "Something Went Wrong try again after some time",
				"image_url": "https://cdn.discordapp.com/attachments/757988905177055332/1174405168402542622/logo-contains-z-and-r-letter_2.jpg?ex=6579ee0b&is=6567790b&hm=49a1a732ddba55b3f03bd803bdf80e0a8b58a4e4ee4a9e8ad16bc72487738156&",
			},
			"active_tab": "homeTab"
		}
	}

	return {
		isValidCliqSignature: _isValidCliqSignature,
		isEmptyString: _isEmptyString,
		getBannerResponse: _getBannerResponse,
		formatNumber: _formatNumber,
		firstLetCap: _firstLetCap,
		widNotLoggedIn: _widNotLoggedIn,
		widError: _widError
	};
})();

module.exports = CommonUtil;
