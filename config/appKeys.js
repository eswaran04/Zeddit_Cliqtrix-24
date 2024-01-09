module.exports =
	process.env.NODE_ENV === "production" ? require("./prodKeys") : require("./devKeys");