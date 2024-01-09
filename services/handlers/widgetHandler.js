const CommonUtil = require("../utils/commonUtil");	
const DatabaseUtil = require("../utils/databaseUtil");	
const axios = require("axios");
const qs = require('qs');

const Widgets = (function () {
    let tabs = [
        { "label": "Home 🏠", "id": "homeTab" },
        { "label": "My Posts 📂", "id": "posts" },
        { "label": "Trending Post 🔥", "id": "trend" },
        { "label": "Create Post ➕", "id": "createpost" },
        { "label": "View Post 🔍", "id": "viewpost" }
    ]
    let reqData;
    let reqParams;
    const _handler = async (data) => {
        _initialize(data);
        let response;
        const handler = reqData.handler.type;
        if (handler === "view_handler") {
            response = await _viewHandler();
        }
        return response;
    };

    const _initialize = (data) => {
        reqData = data;
        reqParams = data.params;
    };

    const _viewHandler = async () => {
        let event = reqData.params.event;

        switch (event) {
            case "load":
                return await _load();
            case "refresh":
                return await _refresh();
            case "tab_click":
                return await _tabClick();
        }
    };


    const _load = async () => {
        return await _homeTab(reqData)
    }

    const _refresh = async () => {
        try {
            const zuid = reqData.params.access.user_id;
            if (!(await DatabaseUtil.rUsers.rdoesUserExists(zuid))) {
                await DatabaseUtil.rUsers.raddUser(zuid);
            }
            const token = await DatabaseUtil.rUsers.rgetToken(zuid);
            if (token !== undefined && token !== null) {
                let curTab = reqData.params.target.id;

                switch (curTab) {
                    case "homeTab":
                        return await _homeTab(reqData);
                    case "posts":
                        return await _posts();
                    case "createpost":
                        return await _createpost();
                    case "trend":
                        return await _trend(reqData);
                    case "viewpost":
                        return await _viewpost(reqData);
                }
            } else {
                return CommonUtil.widNotLoggedIn(reqData, zuid);
            }
        } catch (error) {
            CommonUtil.widError();
        }
    }

    const _tabClick = async () => {
        try {
            const zuid = reqData.params.access.user_id;
            if (!(await DatabaseUtil.rUsers.rdoesUserExists(zuid))) {
                await DatabaseUtil.rUsers.raddUser(zuid);
            }
            const token = await DatabaseUtil.rUsers.rgetToken(zuid);
            if (token !== undefined && token !== null) {
                let curTab = reqData.params.target.id;

                switch (curTab) {
                    case "homeTab":
                        return await _homeTab(reqData);
                    case "posts":
                        return await _posts();
                    case "createpost":
                        return await _createpost();
                    case "trend":
                        return await _trend(reqData);
                    case "viewpost":
                        return await _viewpost(reqData);
                }
            } else {
                return CommonUtil.widNotLoggedIn(reqData, zuid);
            }
        } catch (error) {
            CommonUtil.widError(reqData);
        }

    }

    const _homeTab = async (reqData) => {
        try {
            const zuid = reqData.params.access.user_id;
            if (!(await DatabaseUtil.rUsers.rdoesUserExists(zuid))) {
                await DatabaseUtil.rUsers.raddUser(zuid);
            }
            const token = await DatabaseUtil.rUsers.rgetToken(zuid);
            if (token !== undefined && token !== null) {
                const header = { 'Authorization': `Bearer ${token}` }
                let res = await axios.get("https://oauth.reddit.com/api/v1/me", { headers: header, params: { raw_json: 1 } })
                let data = res.data;
                let button = [
                    {
                        "label": "Logout",
                        "type": "invoke.function",
                        "name": "widgetlogout",
                        "id": {
                            "id": "widgetlgout",
                        }
                    }
                ]
                let display_name = data.subreddit.title == "" ? "Not Set" : data.subreddit.title;
                let userName = data.name;
                let created_utc = new Date(data.created_utc * 1000).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'long', timeStyle: 'medium' });
                let verified = data.verified == true ? "✅" : "❌";
                let over_18 = data.over_18 == true ? "✅" : "❌";
                let karma = data.total_karma;

                let respo = await axios.get(`https://oauth.reddit.com/subreddits/mine/subscriber`, { headers: header, params: { raw_json: 1, limit: 100 } })
                let subs = respo.data.data.children;
                let sub_count = respo.data.data.dist;
                if (sub_count > 0) {
                    let head = { "title": `Home 🏠`, "navigation": "new" };
                    let resp = {
                        "type": "applet",
                        "tabs": tabs,
                        "active_tab": "homeTab",
                        "header": head,
                        "footer": { "buttons": button, "text": "Made With ❤️ by Eswaran" },
                        "sections": [
                            {
                                "id": 'home',
                                "elements": [
                                    {
                                        "type": "text",
                                        "text": `*BASIC PROFILE INFORMATION*\n---\n*Diplay Name:* ${display_name} \n*userName:* ${userName}\n*Created At:* ${created_utc}\n*Verified:* ${verified}\n*18+:* ${over_18}\n*Karma:* ${karma}`
                                    },
                                    {
                                        "type": "divider"
                                    },
                                ]
                            }
                        ]
                    }

                    // Loop through subs and add them to resp
                    resp.sections[0].elements.push({
                        "type": "text",
                        "text": `*SUBREDDITS FOLLOWING*\n---\n`
                    });
                    let i = 0
                    for (let sub of subs) {
                        resp.sections[0].elements.push({
                            "type": "text",
                            "text": (i + 1) + `) [r/${sub.data.display_name}](https://www.reddit.com${sub.data.url}) - ${CommonUtil.formatNumber(sub.data.subscribers)} Subscribers`
                        });
                        i++;
                    }

                    resp.sections[0].elements.push({
                        "type": "divider"
                    });

                    return resp;
                } else {
                    return {
                        "type": "applet",
                        "tabs": tabs,
                        "active_tab": "homeTab",
                        "header": { "title": `My Profile and Communities`, "navigation": "new" },
                        "footer": { "buttons": button, "text": "Made With ❤️ by Eswaran" },
                        "sections": [
                            {
                                "id": 'home',
                                "elements": [
                                    {
                                        "type": "text",
                                        "text": `*BASIC INFORMATION*\n---\n*Diplay Name:* ${display_name} \n*userName:* ${userName}\n*Created At:* ${created_utc}\n*Verified:* ${verified}\n*18+:* ${over_18}\n*Karma:* ${karma}`
                                    },
                                    {
                                        "type": "divider"
                                    },
                                    {
                                        "type": "text",
                                        "text": `*SUBREDDITS FOLLOWING*\n---\n`
                                    },
                                    {
                                        "type": "text",
                                        "text": `You are not following any Subreddits.`
                                    },
                                    {
                                        "type": "divider"
                                    },
                                ]
                            }
                        ]
                    }
                }
            } else {
                return CommonUtil.widNotLoggedIn(reqData, zuid);
            }
        } catch (error) {
            CommonUtil.widError();
        }
    }

    const _posts = async () => {
        try {
            const zuid = reqData.params.access.user_id;
            if (!(await DatabaseUtil.rUsers.rdoesUserExists(zuid))) {
                await DatabaseUtil.rUsers.raddUser(zuid);
            }
            const token = await DatabaseUtil.rUsers.rgetToken(zuid);

            if (token !== undefined && token !== null) {
                const header = { Authorization: `Bearer ${token}` }
                let page = 1
                let limit = 10;
                let offset = (page - 1) * limit;
                let res = await axios.get("https://oauth.reddit.com/api/v1/me", { headers: header, params: { raw_json: 1 } })
                console.log(res.data.name)
                let result = await axios.get(`https://oauth.reddit.com/user/${res.data.name}/submitted`, {
                    headers: header,
                    params: { raw_json: 1, limit: 100, count: limit, after: offset },
                })
                let posts_count = result.data.data.dist;
                console.log(posts_count)
                if (posts_count != 0) {
                    let posts = result.data.data.children;
                    let head = { "title": `My Posts 📂 > Showing New ${limit} Results`, "navigation": "new" }
                    let footer = { "text": "Made with ❤️ By Eswaran" }
                    let elements = [];

                    let i = 0;
                    posts.forEach(post => {
                        if(i > 9){
                            return
                        }
                        elements.push(
                            {
                                "type": "text",
                                "text": `${i+1}. *Post Title* - __${post.data.title}__\n*Under Subreddit* - [${post.data.subreddit_name_prefixed}](https://www.reddit.com/${post.data.subreddit_name_prefixed})\n*Post URL* - [Link](${post.data.url})\n*Posted @* - ${new Date(post.data.created_utc * 1000)}\n *SubReddit_ID: * ${post.data.name} \n`
                            },
                            {
                                "type": "divider"
                            }
                        );
                        i++;
                    });

                    let sections = [
                        {
                            "id": 1,
                            "elements": elements
                        },
                    ]

                    return {
                        "type": "applet",
                        "tabs": tabs,
                        "active_tab": "posts",
                        "header": head,
                        "footer": footer,
                        "sections": sections
                    };
                } else {
                    return {
                        "type": "applet",
                        "tabs": tabs,
                        "active_tab": "posts",
                        "header": { "title": `My Posts 📂`, "navigation": "new" },
                        "footer": { "text": "Made with ❤️ By Eswaran" },
                        "sections": [
                            {
                                "id": 1,
                                "elements": [
                                    {
                                        "type": "text",
                                        "text": "You haven't posted anything yet."
                                    },
                                    {
                                        "type": "divider"
                                    },
                                ]
                            },
                        ]
                    };
                }
            } else {
                return CommonUtil.widNotLoggedIn(reqData, zuid);
            }

        } catch (error) {
            console.log(error);
        }
    }

    const _createpost = async () => {
        return {
            "type": "applet",
            "data_type": "form",
            "tabs": tabs,
            "active_tab": "createpost",
            "form": {
                "mode": "kiosk",
                "title": "Reddit Post Form",
                "name": "redditpostform",
                "hint": "Fill the Details and Submit to post in Reddit",
                "button_label": "Post",
                "inputs": [
                    /*
                    {
                        "name": "type",
                        "label": "Post Type",
                        "mandatory": true,
                        "type": "radio",
                        "options": [
                            {
                                "value": "txt",
                                "label": "Text"
                            },
                            {
                                "value": "img",
                                "label": "Image or Video"
                            },
                            {
                                "value": "Link",
                                "label": "Link"
                            }
                        ]
                    },
                    */
                    {
                        "name": "subreddit_name",
                        "label": "Subreddit Name",
                        "placeholder": "Enter the name of the Subreddit to which the content to be posted",
                        "min_length": "0",
                        "max_length": "50",
                        "mandatory": true,
                        "type": "text"
                    },
                    {
                        "name": "title",
                        "label": "Post Title",
                        "placeholder": "Title for the Reddit Post",
                        "min_length": "10",
                        "max_length": "300",
                        "mandatory": true,
                        "type": "text"
                    },
                    {
                        "name": "text_content",
                        "label": "Text Content",
                        "placeholder": "Tell Something about the post",
                        "min_length": "20",
                        "max_length": "300",
                        "mandatory": false,
                        "type": "textarea"
                    },
                    /*
                    {
                        "name": "file",
                        "label": "Image or video",
                        "placeholder": "Upload Single Image or Video post ",
                        "mandatory": false,
                        "type": "file"
                    }
                    */
                ],
                "action": {
                    "type": "invoke.function",
                    "name": "postredditform"
                }
            }
        }
    }

    const _trend = async (reqData) => {
        try {
            let zuid = reqData.params.access.user_id;
            if (!(await DatabaseUtil.rUsers.rdoesUserExists(zuid))) {
                await DatabaseUtil.rUsers.raddUser(zuid);
            }

            const token = await DatabaseUtil.rUsers.rgetToken(zuid);
            const header = { Authorization: `Bearer ${token}` };

            if (token !== undefined && token !== null) {

                let page = 1
                let limit = 5;
                let offset = (page - 1) * limit;

                let result = await axios.get(`https://oauth.reddit.com/best`, {
                    headers: header,
                    params: { raw_json: 1, limit: 50, count: limit, after: offset },
                });

                console.log(result.data.data)

                if (result.data.data.dist == 0) {
                    return {
                        "type": "applet",
                        "tabs": tabs,
                        "active_tab": "trend",
                        "header": { "title": `Trending Post 🔥`, "navigation": "new" },
                        "footer": { "text": "Made with ❤️ By Eswaran" },
                        "sections": [
                            {
                                "id": 'home',
                                "elements": [
                                    {
                                        "type": "text",
                                        "text": `*No Trending Post Found.*`
                                    },
                                ]
                            }
                        ]
                    };
                } else {
                    let totalPages = Math.ceil(result.data.data.dist / limit);
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
                            },
                        );
                    }

                    let sections = [
                        {
                            "id": 1,
                            "elements": elements
                        },
                    ]

                    return {
                        "type": "applet",
                        "tabs": tabs,
                        "active_tab": "trend",
                        "header": head,
                        "footer": footer,
                        "sections": sections
                    };
                }
            } else {
                return _notLoggedIn(zuid);
            }

        } catch (error) {
            console.log(error);
        }

    }

    const _viewpost = async (reqData) => {
        try {
            let zuid = reqData.params.access.user_id;
            if (!(await DatabaseUtil.rUsers.rdoesUserExists(zuid))) {
                await DatabaseUtil.rUsers.raddUser(zuid);
            }

            const token = await DatabaseUtil.rUsers.rgetToken(zuid);
            const header = { Authorization: `Bearer ${token}` };

            if (token !== undefined && token !== null) {
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

            } else {
                return _notLoggedIn(zuid);
            }

        } catch (error) {
            console.log(error);
        }
    }

    return {
        handler: _handler
    };
})();

module.exports = Widgets;
