const express = require("express");	
const morgan = require("morgan");	
const mongoose = require("mongoose");	
const axios = require("axios");	
const qs = require('qs');	
const DatabaseUtil = require("./services/utils/databaseUtil");	

const config = require("./config/appKeys");	
const appController = require("./controllers/appController");	

const PORT = process.env.PORT || 8080;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("[:date[web]] :method :url :status :total-time ms"));

app.use("/api/v1/reddit", appController);	

app.use("/reddit/callback", async (req, res) => {
	
	const CLIENT_ID = 'Reddir_Client_ID';
	const CLIENT_SECRET = 'Reddit_Client_Secret';
	const zuid = req.query.state;
	const code = req.query.code;
	const params = {
		grant_type: 'authorization_code',
		code,
		redirect_uri: ''
	};
	const headers = {
		Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
	};
	const response = await axios.post('https://www.reddit.com/api/v1/access_token', qs.stringify(params), { headers });
	const { access_token } = response.data;

	DatabaseUtil.rUsers.rupdateSettings(zuid, { Token: access_token });
	//close the tab
	//res.send("<script>window.close();</script>");
	res.send("<center><b>You have successfully logged in to Reddit. You can close this tab now.<b> <br> And Start Running Commands on Cliq.</center>");
})

app.use("/", (req, res) => {
	return res.status(200).json({
		message: "Welcome! Ready to connect with Reddit."	
	});
});

app.use((req, res) => {
	return res.status(404).json({
		message: "Not Found: Incorrect URL."	
	});
});

app.listen(PORT, async () => {
	try {
		mongoose.set('strictQuery', true);
		mongoose.connect(config.MONGODB_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		});
		console.log("MongoDB connection SUCCESS");
	} catch (error) {
		console.error(error);	
	}
	console.log(`APP LISTENING ON PORT ${PORT} - ${new Date()}`);
});
