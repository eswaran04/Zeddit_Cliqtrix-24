const Bots = require("./handlers/botHandler");	
const Functions = require("./handlers/functionHandler");    
const Commands = require("./handlers/commandHandler");    
const Widgets = require("./handlers/widgetHandler");    

const appService = async (reqData) => {
    const component = reqData.type;
    let responseOutput = {};
    if (component === "function") {
        responseOutput = await Functions.handler(reqData);
    } else if (component === "bot") {	
        responseOutput = await Bots.handler(reqData);
    } else if (component === "command") {	
        responseOutput = await Commands.handler(reqData);
    } else if(component === "widget") {  
        responseOutput = await Widgets.handler(reqData);
    }
    return responseOutput;
};

module.exports = appService;
