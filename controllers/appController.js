const router = require("express").Router();	
const CommonUtil = require("../services/utils/commonUtil");	
const appService = require("../services/appService");	

router.post("/", async (req, res) => {
	let responseOutput = {};
	try {
		
		if (!CommonUtil.isValidCliqSignature(req)) {
			return res.status(401).json({
				output: {
					text: "Unauthorized Request:Invalid signature."	
				}
			});
		}
		//console.log(req.body);
		responseOutput = await appService(req.body);
	} catch (error) {
		console.log(error);
		responseOutput = CommonUtil.getBannerResponse(
			"Something went wrong. Try again later :(",	
			true
		);
	}

	return res.status(200).json({
		output: responseOutput
	});
});

module.exports = router;
