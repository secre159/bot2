const fs = require("fs");
const { keep_alive } = require("./keep_alive.js");
const http = require('https'); // or 'https' for https:// URLs
const login = require("fca-unofficial");
const axios = require("axios");
const NLPCloudClient = require('nlpcloud');
const google = require("googlethis");
const cheerio = require('cheerio');
const request = require('request');
const FormData = require('form-data');
const path = require('path');
const Innertube = require('youtubei.js');
const { PasteClient, Publicity, ExpireDate } = require("pastebin-api");
const Genius = require("genius-lyrics");
const { Configuration, OpenAIApi } = require("openai");
const cron = require('node-cron');
const date = require('./files/datetime');
const getVideoId = require('get-video-id');
const weatherjs = require("weather-js")

// GLOBAL MESSAGE STORAGE
let msgs = {};
let vips = ['100044362560006'];
let cd = {};
let vip = [100044362560006]
let threads = ""

//Async Function | TikTok Downloader
async function leechTT(link) {
    out = await axios.get("https://www.tiktokdownloader.org/check.php?v=" + link).then((response) => { return response.data.download_url }).catch((error) => { return "err" })
    return out
}

//Async Function | Leech mp3 Function
async function conv(v, t, e) {
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-Key': 'de0cfuirtgf67a'
    }
    results = await axios.post("https://backend.svcenter.xyz/api/convert-by-45fc4be8916916ba3b8d61dd6e0d6994", "v_id=" + v + "&ftype=mp3&fquality=128&token=" + t + "&timeExpire=" + e + "&client=yt5s.com", { headers: headers }).then((response) => { return response.data.d_url }).catch((error) => { return error.message });
    return results
}
async function fetch(query) {
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    results = await axios.post("https://yt5s.com/api/ajaxSearch", "q=" + query + "&vt=mp3", { headers: headers }).then((response) => { return response.data }).catch((error) => { return error.message });
    return results
}

async function leechmp3(query) {
    var songs = fetch(query);
    let resp = await songs.then((response) => {
        let slist = response;
        if (slist == "err") {
            return "err"
        }
        else if (slist.t < 1300) {
            let d_url = conv(slist.vid, slist.token, slist.timeExpires).then((response) => {
                return [response, slist.title]
            });
            return d_url
        }
        else if (slist.p == "search") {
            return 'err'
        }
        else if (slist.mess.startsWith("The video you want to download is posted on TikTok.")) {
            return 'tiktok'
        }
        else {
            return 'pakyo'
        }
    });
    return resp
}

//Async Function | Motivation/Quotes (Random/QOTD)
async function getWiki(q) {
    out = await axios.get("https://en.wikipedia.org/api/rest_v1/page/summary/" + q).then((response) => {
        return response.data
    }).catch((error) => {
        return error
    });
    return out
}

async function qt() {
    let qoute = await axios.get("https://zenquotes.io/api/random").then((response) => {
        return response.data
    }).catch((err) => {
        return null
    });
    return qoute
}

async function qtotd() {
    let qoute = await axios.get("https://zenquotes.io/api/today").then((response) => {
        return response.data
    }).catch((err) => {
        return null
    });
    return qoute
}

//Async Function | Bible Verse (Random/VOTD/CustomVerse)
async function verse() {
    let v = await axios.get("http://labs.bible.org/api/?passage=random&type=json").then((response) => {
        return response.data
    }).catch((err) => {
        console.error("Error [Verse of the day]: " + e)
        return null
    })
    return v
}

async function votd() {
    let v = await axios.get("https://labs.bible.org/api/?passage=votd&type=json").then((response) => {
        return response.data
    }).catch((err) => {
        console.error("Error [Verse of the day]: " + e)
        return null
    })
    return v
}

async function customverse(x) {
    let v = await axios.get("http://labs.bible.org/api/?passage=" + x + "&type=json").then((r) => {
        return r.data
    }).catch((e) => {
        console.error("Error [Custom verse]: " + e)
        return null
    })
    return v
}

//Async Function | Pinoy Bugtong
async function bugtong() {
    let output = await axios.get("https://api-pinoy-bugtong.vercel.app/").then((result) => {
        return result.data
    }).catch((error) => {
        console.error("Error [Api Riddle]: " + error)
        return null
    })
    return output
}

//Async Function | Guessing Word
async function words() {
    let result = await axios.get("https://random-words-api.vercel.app/word").then((r) => {
        return r.data[0]
    }).catch((e) => {
        return null
    })
    return result
}

//Async Function | Weather Search
async function weathersearch(location) {
    let result = await google.search(location, {
        page: 0,
        safe: true,
        additional_parameters: {
            hl: "en"
        }
    })
    return result
}

//Async Function | PDF Search
async function pdfsearch(query) {
    let result = await google.search(query, {
        safe: true
    })
    return result
}

//Login | Facebook (FbState.json)
login({ appState: JSON.parse(fs.readFileSync('fbstate.json', 'utf8')) }, (err, api) => {
    if (err) return console.error(err);

    //Time Check to Avoid Bot Deads | Node Cron Task Scheduler
    cron.schedule('*/10 * * * *', () => {
        var hours = date("Asia/Manila").getHours()
        var mins = date("Asia/Manila").getMinutes()
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; //The hour '0' should be '12'
        mins = mins < 10 ? '0' + mins : mins;
        console.log("Time Check " + hours + ":" + mins + " " + ampm)
        api.sendMessage("Time Check " + hours + ":" + mins + " " + ampm, "100044362560006");
    });

    //RefreshAppState | Every 60 Minutes
    cron.schedule('0 * * * *', () => {
        let A = api.getAppState();
        let B = JSON.stringify(A);
        fs.writeFileSync("fbstate.json", B, "utf8");
        api.sendMessage("[OK] AppState Refreshed Successfully!", "100044362560006")
    });

    //Bible Verse of the Day | Node Cron Task Scheduler
    cron.schedule('0 7 * * *', () => {
        api.getThreadList(20, null, ['INBOX'], (err, data) => {
            if (err) return console.error("Error [Thread List Cron]: " + err)
            let i = 0
            let j = 0

            votd("verse of the day").then((response) => {
                if (response == null) {
                    api.sendMessage("An error occured", "5244593602322408")
                } else {
                    let vresult = "Bible verse of the day:\n\n"
                    for (let i = 0; i < response.length; i++) {
                        vresult += `[ ${response[i].bookname} ${response[i].chapter}:${response[i].verse} ]\n${response[i].text}\n\n`
                    }
                    console.log("LOG [Verse of the day]: " + vresult)

                    //Print VOTD to All Threads
                    while (j < 10 && i < data.length) {
                        if (data[i].isGroup && data[i].name != data[i].threadID) {
                            api.sendMessage(vresult, data[i].threadID);
                            j++
                        }
                        i++
                    }
                }
            });
        });

    }, {
        scheduled: true,
        timezone: "Asia/Manila"
    });
 //cron auto send message
    cron.schedule('* 13 * * *', () => {
   api.sendMessage('Good afternoon☀️. The afternoon is that time in the day when you can fulfill that big dream of yours.\nHave the best afternoon💕',threadID);
 }, {
   scheduled: true,
   timezone: "Asia/Manila"
 });
     cron.schedule('0 12 * * *', () => {
   api.sendMessage('Happy Lunch☀️. kain na kayo 😁',threadID);
 }, {
   scheduled: true,
   timezone: "Asia/Manila"
 });

cron.schedule('0 * * * *', function() { api.sendMessage('🟢Currently Axczel Bot is running in service🟢\n⚠️Monitor Interval Every Hour⚠️');
});
 
 cron.schedule('* 8 * * *', () => {
   let v = verse()
                        v.then((response) => {
                            api.sendMessage("Good Morning😘🥰\n\nFrom the book of " + response.bookname + " chapter " + response.chapter + " verse " + response.verse + "\n\n" + response.text, event.threadID)
                        }).catch((err) => {
                            console.log(err)
                        })
 }, {
   scheduled: true,
   timezone: "Asia/Manila"
 });
    const listenEmitter = api.listen(async (err, event) => {
        if (err) return console.error(err);
        let sdrid = event.senderID;
        let trid = event.threadID;
        let msgid = event.messageID
        let input = event.body;

//Quotes of the Day | Node Cron Task Scheduler
    cron.schedule('0 7 * * *', () => {
        api.getThreadList(20, null, ['INBOX'], (err, data) => {
            if (err) return console.error("Error [Thread List Cron]: " + err)
            let i = 0
            let j = 0

            qtotd("quotes of the day").then((response) => {
                if (response == null) {
                    api.sendMessage("An error occured", "5244593602322408")
                } else {
                    let mresult = "Quotes of the day:\n\n"
                    for (let i = 0; i < response.length; i++) {
                        mresult += `${response[i].q} \n\n- ${response[i].a}\n\n`
                    }
                    //Print QOTD to All Threads
                    while (j < 10 && i < data.length) {
                        if (data[i].isGroup && data[i].name != data[i].threadID) {
                            api.sendMessage(mresult, data[i].threadID);
                            j++
                        }
                        i++
                    }
                }
            });
        });

    }, {
        scheduled: true,
        timezone: "Asia/Manila"
    });

    api.setOptions({
        listenEvents: true,
        selfListen: false,
        online: true
    });

    //Listen Events | Facebook B0T API
    const listenEmitter = api.listen(async (err, event) => {

        //JSON Parse
        let pinned = JSON.parse(fs.readFileSync("files/pinned.json", "utf8"));
        let settings = JSON.parse(fs.readFileSync("files/settings.json", "utf8"));
        let games = JSON.parse(fs.readFileSync("files/games.json", "utf8"));

        // MarkAsReadAll - Facebook Tools
        api.markAsReadAll((err) => {
            if (err) return console.error(err);
        });

        if (err) return console.error(err);
        switch (event.type) {

            case "message_reply":
                /*if (vips.includes(event.senderID)) {
                    api.setMessageReaction("❤️", event.messageID, (err) => {
                      }, true);
                } else {
                    api.setMessageReaction("😆", event.messageID, (err) => {
                    }, true);
                }*/

                let msgid = event.messageID
                let input = event.body;
                msgs[msgid] = input;

                if (settings.onBot && !threads.includes(event.threadID)) {

                    //Commands | RemoveBG
                    if (input.startsWith("//removebg")) {
                        const { threadID, messageID, type, messageReply } = event;
                        if (type != "message_reply") return
                        if (messageReply.attachments.length < 1) {
                            api.sendMessage("[ERR]⚠️No Image Detected!", event.threadID, event.messageID);
                        } else if (messageReply.attachments.length > 1) {
                            api.sendMessage("[ERR]❌Cannot use bulk bg remover at multiple image at same time, Select 1 Image Only!", event.threadID, event.messageID);
                        }
                        else if ((messageReply.attachments.length === 1) && (messageReply.attachments[0].type == 'photo')) {
                            const url = messageReply.attachments[0].url;
                            request(url).pipe(fs.createWriteStream(__dirname + '/attachments/removebg.png')).on('finish', () => {
                                const inputPath = './attachments/removebg.png';
                                const formData = new FormData();
                                formData.append('size', 'auto');
                                formData.append('image_file', fs.createReadStream(inputPath), path.basename(inputPath));

                                axios({
                                    method: 'post',
                                    url: 'https://api.remove.bg/v1.0/removebg',
                                    data: formData,
                                    responseType: 'arraybuffer',
                                    headers: {
                                        ...formData.getHeaders(),
                                        'X-Api-Key': 'UB8WrY6YRzeeZDTsxv9NYQ9C',
                                    },
                                    encoding: null
                                })
                                    .then((res) => {
                                        if (res.status != 200) return console.error('Error:', res.status, res.statusText);
                                        fs.writeFileSync("./attachments/removebg.png", res.data);
                                        var message = {
                                            body: ("Secre Bot BG Remover"),
                                            attachment:
                                                fs.createReadStream(__dirname + "/attachments/removebg.png")
                                        }
                                        api.sendMessage(message, event.threadID, event.messageID);
                                    })
                                    .catch((error) => {
                                        api.sendMessage("[ERR]❌Request Failed\n\n" + error, event.threadID, event.messageID);
                                        return console.error('Request failed:', error);
                                    });
                            })
                        }
                    }

                    //Commands | Getting FB Information from Users
                    /*if (input.startsWith("//getfb")) {
                        api.getUserInfo(event.messageReply.senderID, (err, data) => {
                            if (err) return console.log(err);

                            let name = data[event.messageReply.senderID]['name'];
                            let vanity = data[event.messageReply.senderID]['vanity'];
                            let profileUrl = data[event.messageReply.senderID]['profileUrl'];
                            let profileBio = data[event.messageReply.senderID]['profileBio'];

                            request(`https://graph.facebook.com/${event.messageReply.senderID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`).pipe(fs.createWriteStream('files.jpg')).on('finish', function () {
                                console.log('finished downloading files..');
                                var message = {
                                    body: `Name: ${name}\nUsername: ${vanity}\nUID: ${event.messageReply.senderID}\nProfile: ${profileUrl}`,
                                    attachment: fs.createReadStream(__dirname + '/files.jpg')
                                    .on ("end", async () => {
                                        if (fs.existsSync(__dirname + '/files.jpg')) {
                                            fs.unlink(__dirname + '/files.jpg', function (err) {
                                                if (err) console.log(err);
                                                console.log(__dirname + '/files.jpg is deleted');
                                            })
                                        }
                                    })

                                }
                                api.sendMessage(message, event.threadID, event.messageID);
                            })
                        });
                    }*/

                    //Commands | Unsent B0T Messages
                    if (input.startsWith("_unsend")) {
                        api.unsendMessage(event.messageReply.messageID, (err, data) => {
                            // if (err) return console.log(err);
                            if (err) return api.sendMessage("You can't unsend someone message!", event.threadID, event.messageID);
                        });
                    }

                    //Commands | Pinned Message
                    if (input.startsWith("_pin")) {
                        if (event.messageReply.body == "") { // == is equal to
                            api.sendMessage("No text Detected, Please Try Again.", event.threadID);
                        } else {
                            pinned.pin.message[event.threadID] = event.messageReply.body
                            pinned.pin.sender[event.threadID] = event.messageReply.senderID
                            api.sendMessage("Your message is now in Pinned.", event.threadID, event.messageID)
                            fs.writeFileSync("files/pinned.json", JSON.stringify(pinned), "utf8")
                        }
                    }

                    //Commands | QRCode Generator
                    if (input.startsWith("_qrcode")) {
                        let body = event.messageReply.body
                        let data = "http://api.qrserver.com/v1/create-qr-code/?150x150&data=" + body
                        let f = fs.createWriteStream(__dirname + "/attachments/qr.jpg")
                        let res = request(encodeURI(data))
                        res.pipe(f)
                        f.on("close", () => {
                            api.sendMessage({
                                body: "QR Code Generated",
                                attachment: fs.createReadStream(__dirname + "/attachments/qr.jpg").on("end", async () => {
                                    if (fs.existsSync(__dirname + "/attachments/qr.jpg")) {
                                        fs.unlink(__dirname + "/attachments/qr.jpg", (err) => {
                                            if (err) {
                                                console.log(err)
                                            }
                                        })
                                    }
                                })
                            }, event.threadID, event.messageID)
                        })
                    }
                    //End of Commands Event.MessageReply
                }
                break;

            case "message":
                /*if (vips.includes(event.senderID)) {
                    api.setMessageReaction("❤️", event.messageID, (err) => {
                    }, true);
                }*/
                if (event.attachments.length != 0) {
                    if (event.attachments[0].type == "photo") {
                        msgs[event.messageID] = ['img', event.attachments[0].url]
                    }
                    else if (event.attachments[0].type == "animated_image") {
                        msgs[event.messageID] = ['gif', event.attachments[0].url]
                    }
                    else if (event.attachments[0].type == "sticker") {
                        msgs[event.messageID] = ['sticker', event.attachments[0].url]
                    }
                    else if (event.attachments[0].type == "video") {
                        msgs[event.messageID] = ['vid', event.attachments[0].url]
                    }
                    else if (event.attachments[0].type == "audio") {
                        msgs[event.messageID] = ['vm', event.attachments[0].url]
                    }
                } else {
                    msgs[event.messageID] = event.body
                }
                if (event.body != null) {
                    let input = event.body;
                    let input2 = input.toLowerCase();

                    // Commands | Admin / VIP Control
                    if (vips.includes(event.senderID)) {
                        if (input.startsWith("Bot: Sleep") && settings.onBot) {
                            settings.onBot = false
                            fs.writeFileSync("files/settings.json", JSON.stringify(settings), "utf8")
                            api.sendMessage("Secre Bot is now sleeping..", event.threadID, event.messageID)
                            for (let i = 0; i < vip.length; i++) {
                                if (vip[i] != event.threadID) {
                                    api.sendMessage("Secre Bot has turned off!", vip[i])
                                }
                            }
                        }
                        if (input.startsWith("Bot: Activate") && threads.includes(event.threadID)) {
                            threads = threads.replace(event.threadID + " ", "")
                            api.sendMessage("Secre Bot is now activated in this conversation.", event.threadID, event.messageID)
                            for (let i = 0; i < vip.length; i++) {
                                if (vip[i] != event.threadID) {
                                    api.sendMessage("Secre Bot was activated from a custom thread!", vip[i])
                                }
                            }
                        }
                        if (input.startsWith("Bot: Kill") && !threads.includes(event.threadID)) {
                            threads += event.threadID + " "
                            api.sendMessage("Secre Bot is now deactivated in this conversation.", event.threadID, event.messageID)
                            for (let i = 0; i < vip.length; i++) {
                                if (vip[i] != event.threadID) {
                                    api.sendMessage("Secre Bot was deactivated from a custom thread!", vip[i])
                                }
                            }
                        }
                        if (input.startsWith("Bot: Wake up") && !settings.onBot) {
                            settings.onBot = true
                            fs.writeFileSync("files/settings.json", JSON.stringify(settings), "utf8")
                            api.sendMessage("Secre Bot is now awake.", event.threadID, event.messageID)
                            for (let i = 0; i < vip.length; i++) {
                                if (vip[i] != event.threadID) {
                                    api.sendMessage("Secre Bot has turned on!", vip[i])
                                }
                            }
                        }

                        if (input.startsWith("Unsend: On") && !settings.onUnsend) {
                            settings.onUnsend = true
                            fs.writeFileSync("files/settings.json", JSON.stringify(settings), "utf8")
                            api.sendMessage("Unsent is now Activated!", event.threadID, event.messageID)
                            for (let i = 0; i < vip.length; i++) {
                                api.sendMessage("Unsend is now Activated!", vip[i])
                            }
                        }

                        if (input.startsWith("Unsend: Off") && settings.onUnsend) {
                            settings.onUnsend = false
                            fs.writeFileSync("files/settings.json", JSON.stringify(settings), "utf8")
                            api.sendMessage("Unsent is now Deactivated!", event.threadID, event.messageID)
                            for (let i = 0; i < vip.length; i++) {
                                api.sendMessage("Unsend is now Deactivated!", vip[i])
                            }
                        }

                        if (input.startsWith("Status")) {
                            let m = "Secre Bot is currently active, "
                            if (settings.onBot) {
                                m += "also awake."
                            } else {
                                m += "but on sleep mode."
                            }
                            api.sendMessage(m, event.threadID, event.messageID)
                        }
                        else if (input.startsWith("RefreshAppState")) {
                            let A = api.getAppState();
                            let B = await JSON.stringify(A);
                            fs.writeFileSync("fbstate.json", B, "utf8");
                            api.sendMessage("[OK] AppState Refreshed Successfully!", event.threadID, event.messageID)
                        }

                        else if (input.startsWith("Settings")) {
                            api.sendMessage("Settings:" + "\n\n" + "Anti Unsend: " + ((settings.onUnsend) ? "On" : "Off") + "\n" + "Bot Active: " + ((settings.onBot) ? "On" : "Off"), event.threadID)
                        }

                        //Facebook Tools - Admin / VIP
                        else if (input.startsWith("SendMsg")) {
                            var text = input;
                            text = text.substring(8)
                            const threadid = text.split(" ");
                            const message = text.substring(text.indexOf(" ") + 1);
                            let gc;
                            if (threadid.length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: _sendmsg (name of gc) (message)", event.threadID);
                            } else {
                                switch (threadid[0]) {
                                    case "BSIT-1A-FAM":
                                        gc = "4264360213655329";
                                        break;

                                    case "CodeStack":
                                        gc = "5059004720874903";
                                        break;

                                    case "Android-Modificators":
                                        gc = "4740250299437612"
                                        break;

                                    default:
                                        api.sendMessage("Invalid ThreadName!", event.threadID);
                                }
                                api.getUserInfo(parseInt(event.senderID), (err, data) => {
                                    if (err) {
                                        api.sendMessage(err, event.threadID);
                                    } else {
                                        var id = Object.keys(data);
                                        var name = data[id].name;
                                        api.sendMessage({
                                            body: "Message from: @" + name + "\n\n" + message,
                                            mentions: [{
                                                tag: '@' + name,
                                                id: event.senderID,
                                            }]
                                        }, gc);
                                    }
                                });
                            }
                        }

                        else if (input.startsWith("Send")) {
                            var text = input;
                            text = text.substring(5)
                            if (event.threadID.length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: _sendmsg (thread id) (message)", event.threadID);
                            } else {
                                const threadid = text.split(" ");
                                const message = text.substring(text.indexOf(" ") + 1);

                                api.getUserInfo(parseInt(event.senderID), (err, data) => {
                                    if (err) {
                                        console.log(err)
                                    } else {
                                        var id = Object.keys(data);
                                        var name = data[id].name;
                                        api.sendMessage({
                                            body: "Message from: @" + name + "\n\n" + message,
                                            mentions: [{
                                                tag: '@' + name,
                                                id: event.senderID,
                                            }]
                                        }, threadid[0]);
                                        api.sendMessage("Message Sent!", event.threadID, event.messageID);
                                    }
                                });
                            }
                        }
                    }

                    if (settings.onBot && !threads.includes(event.threadID)) {

                        //Commands | Help
                        if (input.startsWith("_commands")) {
                            let data = input.split(" ");
                            if (data.length < 2) {
                                fs.readFile(__dirname + '/files/commands.txt', 'utf8', function (err, commands) {
                                    api.sendMessage(commands, event.threadID, event.messageID);
                                });
                            }
                        }

                        //Commands | Changelog
                        else if (input.startsWith("_changelog")) {
                            let data = input.split(" ");
                            if (data.length < 2) {
                                fs.readFile(__dirname + '/files/changelog.txt', 'utf8', function (err, changelog) {
                                    api.sendMessage(changelog, event.threadID, event.messageID);
                                });
                            }
                        }

                        //Commands | About
                        else if (input.startsWith("_about")) {
                            let data = input.split(" ");
                            if (data.length < 2) {
                                api.getUserID("axczel.xhan", (err, data) => {
                                    fs.readFile(__dirname + '/files/about.txt', 'utf8', function (err, about) {
                                        api.sendMessage({
                                            body: about + "\n\nDeveloped by: " + '@Axl Chan' + " <3",
                                            mentions: [{
                                                tag: '@Axl Chan',
                                                id: data[0].userID,
                                            }]
                                        }, event.threadID, event.messageID);
                                    });
                                });
                            }
                        }

                        //Commands | Remove Pinned Message
                        else if (input.startsWith("_removepin")) {
                            pinned.pin.message[event.threadID] = undefined
                            pinned.pin.sender[event.threadID] = undefined
                            api.sendMessage("Pinned has been removed Successfully", event.threadID);
                            fs.writeFileSync("files/pinned.json", JSON.stringify(pinned), "utf8")
                        }

                        //Commands | Show Pinned Message
                        else if (input.startsWith("_showpinned")) {
                            if (pinned.pin.message[event.threadID] == undefined) {
                                api.sendMessage("There is no pinned message for this thread.", event.hreadID);
                            } else {
                                api.getUserInfo(pinned.pin.sender[event.threadID], (err, data) => {
                                    let user = data[pinned.pin.sender[event.threadID]]['name']
                                    api.sendMessage("PINNED MESSAGE\n================\n\n" + pinned.pin.message[event.threadID] + "\n\nBy: " + user, event.threadID);
                                });
                            }
                        }

                        //Commands | YouTube Audio Downloader (Link Only)
                        else if (input.startsWith("_ytdl")) {
                            let data = input.split(" ");
                            if (data.length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: _ytdl <yt_link>", event.threadID);
                            } else {
                                api.sendMessage("🔃 Trying to Download...\n\n\nNotes:\n*If your request is still on processing, plaese wait until it is finished before requesting a new one!\n\n*Please do not spam, be responsible when using this command to avoid getting blocked!\n\n*One request at a time only, let the Bot do its job!\n\nThank you for your understanding, have a good day🥰!\n\n\nBy: Axl Chan", event.threadID, event.messageID);
                                try {
                                    let s = leechmp3(data[1]);
                                    s.then((response) => {
                                        if (response == "pakyo") {
                                            api.setMessageReaction("🖕🏾", event.messageID, (err) => {
                                            }, true);
                                            api.sendMessage("20mins Max Duration Only!😝", event.threadID, event.messageID);
                                        }
                                        else if (response == "err") {
                                            api.sendMessage("❌ Invalid Input", event.threadID, event.messageID);
                                            api.setMessageReaction("😭", event.messageID, (err) => {

                                            }, true);
                                        }
                                        else if (response == "tiktok") {
                                            api.sendMessage("❌ Youtube Only, Bawal Tiktok!", event.threadID, event.messageID);
                                            api.setMessageReaction("😡", event.messageID, (err) => {

                                            }, true);
                                        }
                                        else if (response[0] != undefined) {
                                            var file = fs.createWriteStream(__dirname + '/attachments/song.mp3');
                                            var targetUrl = response[0];
                                            var gifRequest = http.get(targetUrl, function (gifResponse) {
                                                gifResponse.pipe(file);
                                                file.on('finish', function () {
                                                    console.log('finished downloading..')
                                                    api.sendMessage('✅ Download Complete! Uploading...', event.threadID)
                                                    var message = {
                                                        body: "Here's your song for you!\n\n🎶 Song Title: " + response[1] + "\n\nHappy Listening!",
                                                        attachment: fs.createReadStream(__dirname + '/attachments/song.mp3')
                                                    }
                                                    api.sendMessage(message, event.threadID);
                                                });
                                            });
                                        }
                                    });
                                } catch (err) {
                                    api.sendMessage("⚠️ Error: " + err.message, event.threadID);
                                }
                            }
                        }

                        //Commands | TikTok Video Downloader
                        else if (input.startsWith("_tiktokdl")) {
                            let data = input.split(" ");
                            if (data.length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: _tiktokdl <tiktok_link>", event.threadID);
                            } else {
                                api.sendMessage("🔃 Trying to Download...\n\n\nNotes:\n*If your request is still on processing, plaese wait until it is finished before requesting a new one!\n\n*Please do not spam, be responsible when using this command to avoid getting blocked!\n\n*One request at a time only, let the Bot do its job!\n\nThank you for your understanding, have a good day🥰!\n\n\nBy: Axl Chan", event.threadID, event.messageID);
                                try {
                                    let s = leechTT(data[1]);
                                    s.then((response) => {
                                        if (response == "err") {
                                            api.sendMessage("❌ Invalid Input", event.threadID, event.messageID);
                                            api.setMessageReaction("😭", event.messageID, (err) => {

                                            }, true);
                                        }
                                        else {
                                            var file = fs.createWriteStream(__dirname + '/attachments/tiktok.mp4');
                                            var targetUrl = response;
                                            var gifRequest = http.get(targetUrl, function (gifResponse) {
                                                gifResponse.pipe(file);
                                                file.on('finish', function () {
                                                    console.log('finished downloading..')
                                                    api.sendMessage('✅ Download Complete! Uploading...', event.threadID)
                                                    var message = {
                                                        body: "Here's your video for you!\n\nEnjoy Watching!",
                                                        attachment: fs.createReadStream(__dirname + '/attachments/tiktok.mp4')
                                                    }
                                                    api.sendMessage(message, event.threadID);
                                                });
                                            });
                                        }
                                    });
                                } catch (err) {
                                    api.sendMessage("⚠️ Error: " + err.message, event.threadID);
                                }
                            }
                        }

                        //Commands | YouTube Video Downloader
                        else if (input.startsWith("_youtubedl")) {
                            let data = input.split(" ");
                            if (data.length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: _youtubedl <video title> / <yt_link>", event.threadID);
                            } else {
                                if (!(vips.includes(event.senderID))) {
                                    if (!(event.senderID in cd)) {
                                        cd[event.senderID] = Math.floor(Date.now() / 1000) + (60 * 3);
                                    }
                                    else if (Math.floor(Date.now() / 1000) < cd[event.senderID]) {
                                        api.sendMessage("Opps you're going to fast! Wait for " + Math.floor((cd[event.senderID] - Math.floor(Date.now() / 1000)) / 60) + " mins and " + (cd[event.senderID] - Math.floor(Date.now() / 1000)) % 60 + " seconds", event.threadID, event.messageID);
                                        return
                                    } else {
                                        cd[event.senderID] = Math.floor(Date.now() / 1000) + (60 * 3);
                                    }
                                }

                                data.shift()
                                const youtube = await new Innertube();
                                const search = await youtube.search(data.join(" "));
                                if (search.videos[0] === undefined) {
                                    api.sendMessage("Error: Invalid request.", event.threadID, event.messageID);
                                } else {
                                    api.sendMessage("Connecting to YouTube!", event.threadID, event.messageID);
                                    var timeleft = 3;
                                    var downloadTimer = setInterval(function () {
                                        if (timeleft <= 0) {
                                            clearInterval(downloadTimer);
                                            // api.sendMessage("A video has found!\n\nStarting to Download", event.threadID, event.messageID);
                                        }
                                        timeleft -= 1;
                                    }, 1000);
                                    const stream = youtube.download(search.videos[0].id, {
                                        format: 'mp4',
                                        quality: '480p',
                                        type: 'videoandaudio',
                                        bitrate: '2500',
                                        audioQuality: 'highest',
                                        loudnessDB: '20',
                                        audioBitrate: '550',
                                        fps: '30'
                                    });
                                    stream.pipe(fs.createWriteStream(__dirname + '/attachments/video.mp4'));

                                    stream.on('start', () => {
                                        console.info('[DOWNLOADER]', 'Starting download now!');
                                    });
                                    stream.on('info', (info) => {
                                        console.info('[DOWNLOADER]', `Downloading ${info.video_details.title} by ${info.video_details.metadata.channel_name}`);
                                    });
                                    stream.on('end', () => {
                                        var limit = 50 * 1024 * 1024; // 50MB in bytes
                                        fs.readFile(__dirname + '/attachments/video.mp4', function (err, data) {
                                            if (err) console.log(err)
                                            if (data.length > limit) {
                                                api.sendMessage("⚠️ [ERR]: File can't be Upload because it's too large", event.threadID, event.messageID)
                                            } else {
                                                console.info('[DOWNLOADER]', 'Done!')
                                                var message = {
                                                    body: "Here's your video for you!\n\nVideo Title: " + search.videos[0].title + "\n\nDescription: " + search.videos[0].description + " \n\nEnjoy Watching!",
                                                    attachment: [fs.createReadStream(__dirname + '/attachments/video.mp4')]
                                                }
                                                api.sendMessage(message, event.threadID, event.messageID).catch((err) => api.sendMessage("⚠️[ERR]: " + err, event.threadID, event.messageID));
                                            }
                                        })
                                    });
                                    stream.on('error', (err) => console.error('[ERROR]', err));
                                }
                            }
                        }

                        //Commands | YouTube Shorts Downloader
                        else if (input.startsWith("_ytshortsdl")) {
                            let data = input.split(" ");
                            if (data.length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: _ytshortsdl <shorts_link>", event.threadID);
                            } else {
                                if (!(vips.includes(event.senderID))) {
                                    if (!(event.senderID in cd)) {
                                        cd[event.senderID] = Math.floor(Date.now() / 1000) + (60 * 3);
                                    }
                                    else if (Math.floor(Date.now() / 1000) < cd[event.senderID]) {
                                        api.sendMessage("Opps you're going to fast! Wait for " + Math.floor((cd[event.senderID] - Math.floor(Date.now() / 1000)) / 60) + " mins and " + (cd[event.senderID] - Math.floor(Date.now() / 1000)) % 60 + " seconds", event.threadID, event.messageID);
                                        return
                                    } else {
                                        cd[event.senderID] = Math.floor(Date.now() / 1000) + (60 * 3);
                                    }
                                }
                                data.shift()
                                const youtube = await new Innertube();
                                const { id } = getVideoId(data.join(" "));
                                const search = await youtube.search("https://youtu.be/" + id);
                                if (search.videos[0] === undefined) {
                                    api.sendMessage("Error: Invalid request.", event.threadID, event.messageID);
                                } else {
                                    api.sendMessage("Connecting to YouTube Shorts!", event.threadID, event.messageID);
                                    var timeleft = 3;
                                    var downloadTimer = setInterval(function () {
                                        if (timeleft <= 0) {
                                            clearInterval(downloadTimer);
                                            //api.sendMessage("A video has found!\n\nStarting to Download", event.threadID, event.messageID);
                                        }
                                        timeleft -= 1;
                                    }, 1000);
                                    const stream = youtube.download(search.videos[0].id, {
                                        format: 'mp4',
                                        quality: '480p',
                                        type: 'videoandaudio',
                                        bitrate: '2500',
                                        audioQuality: 'highest',
                                        loudnessDB: '20',
                                        audioBitrate: '550',
                                        fps: '30'
                                    });
                                    stream.pipe(fs.createWriteStream(__dirname + '/attachments/shorts.mp4'));

                                    stream.on('start', () => {
                                        console.info('[DOWNLOADER]', 'Starting download now!');
                                    });
                                    stream.on('info', (info) => {
                                        console.info('[DOWNLOADER]', `Downloading ${info.video_details.title} by ${info.video_details.metadata.channel_name}`);
                                    });
                                    stream.on('end', () => {
                                        var limit = 50 * 1024 * 1024; // 50MB in bytes
                                        fs.readFile(__dirname + '/attachments/shorts.mp4', function (err, data) {
                                            if (err) console.log(err)
                                            if (data.length > limit) {
                                                api.sendMessage("⚠️ [ERR]: File can't be Upload because it's too large", event.threadID, event.messageID)
                                            } else {
                                                console.info('[DOWNLOADER]', 'Done!')
                                                var message = {
                                                    body: "Here's your video for you!\n\nVideo Title: " + search.videos[0].title + "\n\nDescription: " + search.videos[0].description + " \n\nEnjoy Watching!",
                                                    attachment: [fs.createReadStream(__dirname + '/attachments/shorts.mp4')]
                                                }
                                                api.sendMessage(message, event.threadID, event.messageID).catch((err) => api.sendMessage("⚠️ [ERR]: " + err, event.threadID, event.messageID));
                                            }
                                        })
                                    });
                                    stream.on('error', (err) => console.error('[ERROR]', err));
                                }
                            }
                        }

                        //Commands | YouTube Music Downloader
                        else if (input.startsWith("_ytplay")) {
                            let data = input.split(" ");
                            if (data.length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: _ytplay <song title> / <yt_link>", event.threadID);
                            } else {
                                if (!(vips.includes(event.senderID))) {
                                    if (!(event.senderID in cd)) {
                                        cd[event.senderID] = Math.floor(Date.now() / 1000) + (60 * 3);
                                    }
                                    else if (Math.floor(Date.now() / 1000) < cd[event.senderID]) {
                                        api.sendMessage("Opps you're going to fast! Wait for " + Math.floor((cd[event.senderID] - Math.floor(Date.now() / 1000)) / 60) + " mins and " + (cd[event.senderID] - Math.floor(Date.now() / 1000)) % 60 + " seconds", event.threadID, event.messageID);
                                        return
                                    } else {
                                        cd[event.senderID] = Math.floor(Date.now() / 1000) + (60 * 3);
                                    }
                                }
                                data.shift()
                                const youtube = await new Innertube();
                                const search = await youtube.search(data.join(" "));
                                if (search.videos[0] === undefined) {
                                    api.sendMessage("Error: Invalid request.", event.threadID, event.messageID);
                                } else {
                                    api.sendMessage("🔃 Requesting...", event.threadID, event.messageID);
                                    var timeleft = 3;
                                    var downloadTimer = setInterval(function () {
                                        if (timeleft <= 0) {
                                            clearInterval(downloadTimer);
                                            // api.sendMessage("A video has found!\n\nStarting to Download", event.threadID, event.messageID);
                                        }
                                        timeleft -= 1;
                                    }, 1000);
                                    const stream = youtube.download(search.videos[0].id, {
                                        format: 'mp3',
                                        bitrate: '2500',
                                        audioQuality: 'highest',
                                        loudnessDB: '20',
                                        audioBitrate: '550'
                                    });

                                    stream.pipe(fs.createWriteStream(__dirname + '/attachments/music.mp3'));

                                    stream.on('start', () => {
                                        console.info('[DOWNLOADER]', 'Starting download now!');
                                    });
                                    stream.on('info', (info) => {
                                        console.info('[DOWNLOADER]', `Downloading ${info.video_details.title} by ${info.video_details.metadata.channel_name}`);
                                    });
                                    stream.on('end', () => {
                                        var limit = 50 * 1024 * 1024; // 50MB in bytes
                                        fs.readFile(__dirname + '/attachments/music.mp3', function (err, data) {
                                            if (err) console.log(err)
                                            if (data.length > limit) {
                                                api.sendMessage("⚠️ [ERR]: File can't be Upload because it's too large", event.threadID, event.messageID)
                                            } else {
                                                console.info('[DOWNLOADER]', 'Done!')
                                                var message = {
                                                    body: "Here's your song for you!\n\n🎶 Song Title: " + search.videos[0].title + "\n\nHappy Listening!",
                                                    attachment: [fs.createReadStream(__dirname + '/attachments/music.mp3')]
                                                }
                                                api.sendMessage(message, event.threadID, event.messageID).catch((err) => api.sendMessage("⚠️ [ERR]: " + err, event.threadID, event.messageID));
                                            }
                                        })
                                    });
                                    stream.on('error', (err) => console.error('[ERROR]', err));
                                }
                            }
                        }

                        //Commands | YouTube Downloader with Genius Lyrics
                        else if (input.startsWith("_singalong")) {
                            let data = input.split(" ");
                            if (data.length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: _singalong <song title> / <yt_link>", event.threadID);
                            } else {
                                if (!(vips.includes(event.senderID))) {
                                    if (!(event.senderID in cd)) {
                                        cd[event.senderID] = Math.floor(Date.now() / 1000) + (60 * 3);
                                    }
                                    else if (Math.floor(Date.now() / 1000) < cd[event.senderID]) {
                                        api.sendMessage("Opps you're going to fast! Wait for " + Math.floor((cd[event.senderID] - Math.floor(Date.now() / 1000)) / 60) + " mins and " + (cd[event.senderID] - Math.floor(Date.now() / 1000)) % 60 + " seconds", event.threadID, event.messageID);
                                        return
                                    } else {
                                        cd[event.senderID] = Math.floor(Date.now() / 1000) + (60 * 3);
                                    }
                                }
                                data.shift()
                                const youtube = await new Innertube();
                                const search = await youtube.search(data.join(" "));
                                if (search.videos[0] === undefined) {
                                    api.sendMessage("Error: Invalid request.", event.threadID, event.messageID);
                                } else {
                                    api.sendMessage("🔃 Requesting...", event.threadID, event.messageID);
                                    var timeleft = 3;
                                    var downloadTimer = setInterval(function () {
                                        if (timeleft <= 0) {
                                            clearInterval(downloadTimer);
                                            // api.sendMessage("A video has found!\n\nStarting to Download", event.threadID, event.messageID);
                                        }
                                        timeleft -= 1;
                                    }, 1000);
                                    const stream = youtube.download(search.videos[0].id, {
                                        format: 'mp3',
                                        bitrate: '2500',
                                        audioQuality: 'highest',
                                        loudnessDB: '20',
                                        audioBitrate: '550'
                                    });

                                    // Genius Lyrics
                                    const Client = new Genius.Client("RF_40ktL7f4H55RYDtdL27nTZMewq9H9FKkJfuZmzHzq1Cpy_a4LoQi6lzsP5G2L");
                                    const searches = await Client.songs.search(search.videos[0].title);
                                    const firstSong = searches[0];
                                    const RES = await firstSong.lyrics();

                                    // api.sendMessage("Song Title: " + firstSong.fullTitle + "\n\n" +  RES + "\n\n" + "Link:\n" + firstSong.url, event.threadID, event.messageID);
                                    // console.log("About the Song:\n", firstSong, "\n");

                                    stream.pipe(fs.createWriteStream(__dirname + '/attachments/music.mp3'));

                                    stream.on('start', () => {
                                        console.info('[DOWNLOADER]', 'Starting download now!');
                                    });
                                    stream.on('info', (info) => {
                                        console.info('[DOWNLOADER]', `Downloading ${info.video_details.title} by ${info.video_details.metadata.channel_name}`);
                                    });
                                    stream.on('end', () => {
                                        var limit = 50 * 1024 * 1024; // 50MB in bytes
                                        fs.readFile(__dirname + '/attachments/music.mp3', function (err, data) {
                                            if (err) console.log(err)
                                            if (data.length > limit) {
                                                api.sendMessage("⚠️ [ERR]: File can't be Upload because it's too large", event.threadID, event.messageID)
                                            } else {
                                                console.info('[DOWNLOADER]', 'Done!')
                                                var message = {
                                                    body: "Here's your song for you!\n\nSong Title: " + search.videos[0].title + "\n\n" + "Lyrics:\n" + RES + "\n\nLink:\n" + firstSong.url,
                                                    attachment: [fs.createReadStream(__dirname + '/attachments/music.mp3')]
                                                }
                                                api.sendMessage(message, event.threadID, event.messageID).catch((err) => api.sendMessage("⚠️ [ERR]: " + err, event.threadID, event.messageID));
                                            }
                                        })
                                    });
                                    stream.on('error', (err) => console.error('[ERROR]', err));
                                }
                            }
                        }

                        //Commands | Facebook Video Downloader
                        else if (input.startsWith("_fbvideodl")) {
                            let data = input.split(" ");
                            if (data.length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: _fbvieodl <fb_link>", event.threadID);
                            } else {
                                data.shift()
                                api.sendMessage("Connecting to Facebook!", event.threadID, event.messageID)
                                axios.get('https://manhict.tech/api/fbDL?url=' + data.join(" ") + '/&apikey=CcIDaVqu')

                                    .then(response => {
                                        var videourl = response.data.result.hd;

                                        request(videourl).pipe(fs.createWriteStream(__dirname + '/attachments/facebookvid.mp4'))

                                            .on('finish', () => {
                                                var limit = 50 * 1024 * 1024; // 50MB in bytes
                                                fs.readFile(__dirname + '/attachments/music.mp3', function (err, data) {
                                                    if (err) console.log(err)
                                                    if (data.length > limit) {
                                                        api.sendMessage("⚠️ [ERR]: File can't be Upload because it's too large", event.threadID, event.messageID)
                                                    } else {
                                                        api.sendMessage({
                                                            body: "Facebook Video Downloader",
                                                            attachment: fs.createReadStream(__dirname + '/attachments/facebookvid.mp4')
                                                        }, event.threadID, event.messageID);
                                                    }
                                                })
                                            })
                                    })
                                    .catch(error => {
                                        api.sendMessage("⚠️ [ERR]: Invalid Facebook Video link or Can't Download Video from Groups.", event.threadID, event.messageID);
                                    })
                            }
                        }

                        /*
                        //Greetings | Chat with Sender ID 
                        else if (input2.toLowerCase().startsWith("morning")) {
                            let data = input;
                            // if (data.length < 2) {
                                api.getUserInfo(event.senderID, (err, data) => {
                                    if (err) return console.log(err)
                                        else{
                                            api.sendMessage(("Good afternoon too, " + data[event.senderID]['name']+ "\n\nHave a good day!"), event.threadID, event.messageID);
                                        }
                                })
                            // }
                        }
                        */

                        /*
                        //Greetings | Auto Reply 
                        if (input2.includes("evening") || input2.includes("Evening")) {
                            api.getUserInfo(event.senderID, (err, data) => {
                                if (err) {
                                    console.log(err)
                                } else {
                                    api.sendMessage("Good Evening din " + data[event.senderID]['name'], event.threadID, event.messageID)
                                }
                            })
                        }
                        */

                        //Commands | Wikipedia Search
                        else if (input.startsWith("_wiki")) {
                            let data = input.split(" ");
                            if (data.length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: _wiki <word>", event.threadID);
                            } else {
                                try {
                                    data.shift()
                                    var txtWiki = "";
                                    let res = await getWiki(data.join(" "));
                                    if (res === undefined) {
                                        throw new Error(`API RETURNED THIS: ${res}`)
                                    }
                                    if (res.title === undefined) {
                                        throw new Error(`API RETURNED THIS: ${res}`)
                                    }
                                    txtWiki += `🔎 You search the word '${res.title}' \n\n💡 TimeStamp: ${res.timestamp}\n\n💡 Description: ${res.description}\n\n💡 Info: ${res.extract}\n\nSource: https://en.wikipedia.org`

                                    api.sendMessage(`${txtWiki}`, event.threadID, event.messageID);
                                }
                                catch (err) {
                                    api.sendMessage(`⚠️ ${err.message}`, event.threadID, event.messageID);
                                }
                            }
                        }

                        //Commands | Motivation/Quotes (Random/QOTD)
                        else if (input.startsWith("_motivation")) {
                            qt("motivation").then((response) => {
                                if (response == null) {
                                    api.sendMessage("An error occured", "5244593602322408")
                                } else {
                                    let result;
                                    for (let i = 0; i < response.length; i++) {
                                        result = `${response[i].q} \n\n- ${response[i].a}\n\n`
                                    }
                                    api.sendMessage(result, event.threadID, event.messageID);
                                }
                            });
                        }

                        else if (input.startsWith("_quotesotd")) {
                            qtotd("quotes of the day").then((response) => {
                                if (response == null) {
                                    api.sendMessage("An error occured", "5244593602322408")
                                } else {
                                    let result = "Quotes of the day:\n\n"
                                    for (let i = 0; i < response.length; i++) {
                                        result += `${response[i].q} \n\n- ${response[i].a}\n\n`
                                    }
                                    api.sendMessage(result, event.threadID, event.messageID);
                                }
                            });
                        }

                        //Commands | Bible Verse (Random/VOTD/CustomVerse)
                        else if (input.startsWith("_verse")) {
                            verse("verse").then((response) => {
                                if (response == null) {
                                    api.sendMessage("An error occured", event.threadID);
                                } else {
                                    let result;
                                    for (let i = 0; i < response.length; i++) {
                                        result = `[ ${response[i].bookname} ${response[i].chapter}:${response[i].verse} ]\n\n${response[i].text}\n\n`
                                    }
                                    api.sendMessage(result, event.threadID, event.messageID);
                                }
                            });
                        }

                        else if (input.startsWith("_voftheday")) {
                            votd("votd").then((response) => {
                                if (response == null) {
                                    api.sendMessage("An error occured", event.threadID);
                                } else {
                                    let result = "Bible verse of the day:\n\n"
                                    for (let i = 0; i < response.length; i++) {
                                        result += `[ ${response[i].bookname} ${response[i].chapter}:${response[i].verse} ]\n${response[i].text}\n\n`
                                    }
                                    api.sendMessage(result, event.threadID, event.messageID);
                                }
                            });
                        }

                        else if (input.startsWith("_cusverse")) {
                            let data = input.split(" ")
                            if (data.length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: _cusverse <bible verse>", event.threadID);
                            } else {
                                data.shift()
                                let body = data.join(" ");
                                customverse(body).then((r) => {
                                    if (r == null) {
                                        api.sendMessage("Invalid format, please try again.", event.threadID, event.messageID)
                                    } else {
                                        let result = ""
                                        let total = r.length
                                        for (let i = 0; i < total; i++) {
                                            result += "[ " + r[i].bookname + " " + r[i].chapter + ":" + r[i].verse + " ]\n" + r[i].text + "\n\n"
                                        }
                                        api.sendMessage({
                                            body: `Here's the bible verse you've requested!\n\n${result}`
                                        }, event.threadID, event.messageID)
                                    }
                                })
                            }
                        }

                        //Commands | AnimeQuote
                        else if (input.startsWith("_animequote")) {
                            axios.get('https://animechan.vercel.app/api/random')
                                .then(response => {
                                    api.sendMessage("'" + response.data.quote + "'" + "\n\n- " + response.data.character + " (" + response.data.anime + ")", event.threadID, event.messageID);
                                })
                                .catch(error => {
                                    api.sendMessage(error, event.threadID, event.messageID);
                                });
                        }

                        //Commands | Meme (Random memes)
                        else if (input.startsWith("_meme")) {
                            axios.get('https://meme-api.herokuapp.com/gimme/memes')
                                .then(response => {
                                    var file = fs.createWriteStream(__dirname + '/attachments/memes.png');
                                    var targetUrl = response.data.url;
                                    var gifRequest = http.get(targetUrl, function (gifResponse) {
                                        gifResponse.pipe(file);
                                        file.on('finish', function () {
                                            console.log('Memes Downloading!')
                                            var message = {
                                                body: response.data.title + "\n\nAuthor: " + response.data.author,
                                                attachment: fs.createReadStream(__dirname + '/attachments/memes.png')
                                            }
                                            api.sendMessage(message, event.threadID, event.messageID);
                                            api.setMessageReaction("✅", event.messageID, (err) => { }, true);
                                        });
                                    });
                                })
                                .catch(error => {
                                    api.sendMessage("Failed to generate Memes, please try again!", event.threadID, event.messageID);
                                })
                        }

                        //Commands | DuckDuckGo Search
                        else if (input.startsWith("_dsearch")) {
                            let data = input.split(" ");
                            if (data.length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: _dsearch <anything>", event.threadID);
                            } else {
                                data.shift()
                                axios.get('https://api.duckduckgo.com/?q=' + data.join(" ") + '&format=json&pretty=1')
                                    .then(response => {
                                        api.sendMessage("🔎 You search for: " + data.join(" ") + "\nTopic: " + response.data.Heading + "\n\n" + response.data.Abstract + "\n\n" + response.data.Image + "", event.threadID, event.messageID);
                                    })
                                    .catch(error => {
                                        api.sendMessage(`❌ ${err.message}`, event.threadID, event.messageID);
                                    });
                            }
                        }

                        //Commands | Text Summarizer
                        else if (input.startsWith("_summarize")) {
                            let data = input.split(" ");
                            var { mentions, senderID, threadID, messageID } = event;
                            if (input.split(" ").length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: _summarize <text/paragraph>", threadID, messageID)
                            } else {
                                data.shift()
                                const client = new NLPCloudClient('bart-large-cnn', '740d43d1c2b754edd91b7686ff1b06a5bcfd8f23')
                                client.summarization(data.join(" ")).then(function ({ data }) {
                                    api.sendMessage("💠 Secre Bot x Summarizer 💠 \n\n" + data.summary_text, threadID, messageID)
                                }).catch(function (err) {
                                    api.sendMessage("⚠️ [ERR]: Status:" + err.response.status + "\nError Details: " + err.response.data.detail, threadID, messageID)
                                });
                            }
                        }

                        //Commands | Text to Audio/Speech
                        if (input.startsWith("_saytag")) {
                            let data = input.split(" ");
                            if (data.length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: _saytag <message>", event.threadID, event.messageID);
                            } else {
                                try {
                                    data.shift();
                                    let responses = "https://texttospeech.responsivevoice.org/v1/text:synthesize?text=" + encodeURIComponent(data.join(" ")) + "&lang=fil-PH&engine=g1&rate=0.5&key=0POmS5Y2&gender=female&pitch=0.5&volume=1";
                                    var file = fs.createWriteStream(__dirname + '/attachments/say.mp3');
                                    var gifRequest = http.get(responses, function (gifResponse) {
                                        gifResponse.pipe(file);
                                        file.on('finish', function () {
                                            console.log('finished downloading')
                                            var message = {
                                                attachment: fs.createReadStream(__dirname + '/attachments/say.mp3')
                                                    .on("end", async () => {
                                                        if (fs.existsSync(__dirname + '/attachments/say.mp3')) {
                                                            fs.unlink(__dirname + '/attachments/say.mp3', function (err) {
                                                                if (err) console.log(err);
                                                                console.log(__dirname + '/attachments/say.mp3 is deleted');
                                                            })
                                                        }
                                                    })
                                            }
                                            api.sendMessage(message, event.threadID, event.messageID);
                                        });
                                    });
                                } catch {
                                    api.sendMessage("Unexpected Error", event.threadID, event.messageID);
                                }
                            }
                        }

                        if (input.startsWith("_sayjap")) {
                            let data = input.split(" ");
                            if (data.length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: _sayjap <message>", event.threadID, event.messageID);
                            } else {
                                try {
                                    data.shift();
                                    let responses = "https://texttospeech.responsivevoice.org/v1/text:synthesize?text=" + encodeURIComponent(data.join(" ")) + "&lang=ja&engine=g1&rate=0.5&key=0POmS5Y2&gender=female&pitch=0.5&volume=1";
                                    var file = fs.createWriteStream(__dirname + '/attachments/sayjap.mp3');
                                    var gifRequest = http.get(responses, function (gifResponse) {
                                        gifResponse.pipe(file);
                                        file.on('finish', function () {
                                            console.log('finished downloading')
                                            var message = {
                                                attachment: fs.createReadStream(__dirname + '/attachments/sayjap.mp3')
                                                    .on("end", async () => {
                                                        if (fs.existsSync(__dirname + '/attachments/sayjap.mp3')) {
                                                            fs.unlink(__dirname + '/attachments/sayjap.mp3', function (err) {
                                                                if (err) console.log(err);
                                                                console.log(__dirname + '/attachments/sayjap.mp3 is deleted');
                                                            })
                                                        }
                                                    })
                                            }
                                            api.sendMessage(message, event.threadID, event.messageID);
                                        });
                                    });
                                } catch {
                                    api.sendMessage("Unexpected Error", event.threadID, event.messageID);
                                }
                            }
                        }

                        //Commands | Brainly
                        else if (input.startsWith("_brainly")) {
                            let text = input.split(" ")
                            text.shift()
                            const r = await google.search("Brainly" + text.join(" "));
                            const url = r.results[0].url;
                            const { data } = await axios.get(url);
                            //console.log(data)
                            //fs.writeFileSync("Axios.txt", data, "utf8");
                            const $ = cheerio.load(data);
                            const mainClass = $("h1[data-testid='question_box_text']");
                            const mainClass2 = $("div[class='brn-qpage-next-answer-box__content js-answer-content-section'] div div div");
                            const res = [];
                            mainClass.each((idx, el) => {
                                const total = {};
                                total.question = $(el).children("span[class='sg-text sg-text--large sg-text--bold sg-text--break-words brn-qpage-next-question-box-content__primary']").text();
                                res.push(total);
                            });
                            const res2 = [];
                            mainClass2.each((idx, el) => {
                                const total2 = {};
                                total2.answer = $(el).children("p").text();
                                res2.push(total2);
                            });
                            if ((res.length < 1) && (res2.length < 1)) {
                                api.sendMessage("[ERR]❌There's no available anwers for this question on brainly. try different one.", event.threadID, event.messageID)
                            } else {
                                var q = res[0].question;
                                var a = res2[0].answer;
                                api.sendMessage("💠 Secre Bot x Brainly 💠\n\n🔰 Question: " + q + "\n" + a, event.threadID, event.messageID)
                            }
                        }

                        //Commands | Google Search
                        const searching = async (searched) => {
                            let options = {
                                page: 0,
                                safe: false,
                                additional_params: {
                                    hl: "en"
                                }
                            }
                            return await google.search(`search ${searched}`, options);
                        };

                        if (input.startsWith("_google")) {
                            let data = input.split(" ");
                            if (data.length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: _google <anything>", event.threadID, event.messageID)
                            }
                            else {
                                try {
                                    data.shift()
                                    data = data.join(" ");
                                    let searched = data;
                                    let response = await searching(searched);
                                    let result = response.results;

                                    //console.log(response);

                                    if (result === undefined || Object.entries(result).length === 0) {
                                        throw new Error(`Search was unsuccessful: ${searched}`, event.threadID, event.messageID)
                                    }
                                    let msg = `💠 Google Search Result 💠\n\n`;
                                    msg += `🔎 You searched: ${searched}\n\n`;
                                    msg += `🔰 Title:\n ${result[0].title}\n`;
                                    msg += `\n📝 Description:\n [1]. ${result[0].description}\n`;
                                    msg += `\n🔗 Reference:\n [1]. ${result[0].url}`;

                                    api.sendMessage(msg, event.threadID)
                                }
                                catch (err) {
                                    api.sendMessage(`❌ ${err.message}`, event.threadID, event.messageID);
                                }
                            }
                        }

                        //Commands | Landscape
                        if (input.startsWith("_landscape")) {
                            request("https://source.unsplash.com/1600x900/?landscape").pipe(fs.createWriteStream(__dirname + '/attachments/landscape.png')).on('finish', () => {
                                var message = {
                                    attachment: fs.createReadStream(__dirname + '/attachments/landscape.png')
                                }
                                api.sendMessage(message, event.threadID, event.messageID)
                            })
                        }

                        //Commands | Pastebin
                        else if (input.startsWith("_pastebin")) {
                            const client = new PasteClient("9VTprhY4mTgpLwhKJlyx3XbM7i6wz-73");
                            var text = input;
                            text = text.substring(11)
                            const data = text.split(" ");
                            const message = text.substring(text.indexOf(" ") + 1);
                            let expiredate;
                            let expiredatename;
                            if (data.length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: _pastebin <expiredate> <any text>", event.threadID);
                            } else {
                                try {
                                    switch (data[0]) {
                                        case "N":
                                            expiredate = "N";
                                            expiredatename = "Never Expiry";
                                            break;

                                        case "10M":
                                            expiredate = "10M";
                                            expiredatename = "10 Minutes";
                                            break;

                                        case "1H":
                                            expiredate = "1H";
                                            expiredatename = "1 Hour";
                                            break;

                                        case "1D":
                                            expiredate = "1D";
                                            expiredatename = "1 Day";
                                            break;

                                        case "1W":
                                            expiredate = "1W";
                                            expiredatename = "1 Week";
                                            break;

                                        case "2W":
                                            expiredate = "2W";
                                            expiredatename = "2 Weeks";
                                            break;

                                        case "1M":
                                            expiredate = "1M";
                                            expiredatename = "1 Month";
                                            break;

                                        case "6M":
                                            expiredate = "6M";
                                            expiredatename = "6 Months";
                                            break;

                                        case "1Y":
                                            expiredate = "1Y";
                                            expiredatename = "1 Year";
                                            break;
                                    }

                                    const url = await client.createPaste({
                                        code: message,
                                        expireDate: expiredate,
                                        format: "javascript",
                                        name: "something.js",
                                        publicity: Publicity.Public,
                                    }); //.catch((err) => api.sendMessage(err, event.threadID));
                                    // console.log(url);

                                    api.sendMessage("Pastebin URL: \n" + url + "\nExpiry: " + expiredatename, event.threadID, event.messageID);
                                }
                                catch (err) {
                                    api.sendMessage(err, event.threadID);
                                }
                            }
                        }

                        //Commands | Genius Lyrics
                        else if (input.startsWith("_lyrics")) {
                            const Client = new Genius.Client("RF_40ktL7f4H55RYDtdL27nTZMewq9H9FKkJfuZmzHzq1Cpy_a4LoQi6lzsP5G2L");
                            let data = input.split(" ");
                            if (data.length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: _lyrics <song title>", event.threadID);
                            } else {
                                data.shift()
                                const searches = await Client.songs.search(data.join(" "));
                                const firstSong = searches[0];
                                const RES = await firstSong.lyrics();

                                api.sendMessage("Song Title: " + firstSong.fullTitle + "\n\n" + RES + "\n\n" + "Link:\n" + firstSong.url, event.threadID, event.messageID);
                                // console.log("About the Song:\n", firstSong, "\n");
                            }
                        }

                        //Commands | OpenAI
                        else if (input.startsWith("Secre")) {
                            const configuration = new Configuration({
                                apiKey: "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",
                            });
                            const openai = new OpenAIApi(configuration);
                            let data = input.split(" ");
                            if (data.length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: Secre <ask anything>)", event.threadID);
                            } else {
                                try {
                                    data.shift()
                                    const completion = await openai.createCompletion({
                                        model: "text-davinci-002",
                                        prompt: data.join(" "),
                                        temperature: 0.5,
                                        max_tokens: 2048,
                                        top_p: 0.3,
                                        frequency_penalty: 0.5,
                                        presence_penalty: 0.0,
                                    });
                                    api.sendMessage(completion.data.choices[0].text, event.threadID, event.messageID);
                                }
                                catch (error) {
                                    if (error.response) {
                                        console.log(error.response.status);
                                        console.log(error.response.data);
                                    } else {
                                        console.log(error.message);
                                        api.sendMessage(error.message, event.threadID);
                                    }
                                }
                            }
                        }

                        //Commands | Simsimi
                        else if (input.startsWith("Ali")) {
                            let data = input.split(" ");
                            if (data.length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: Ali <ask anything>", event.threadID, event.messageID);
                            } else {
                                try {
                                    data.shift()
                                    axios.get('https://api.simsimi.net/v2/?text=' + data.join(" ") + '&lc=en&cf=false&name=Mark')
                                        .then(response => {
                                            api.sendMessage(response.data['success'], event.threadID, event.messageID);
                                        })
                                }
                                catch (err) {
                                    api.sendMessage(`${err.message}`, event.threadID);
                                }
                            }
                        }

                        //Commands | Covid-19 Statistics
                        else if (input.startsWith("_covid19")) {
                            let data = input.split(" ");
                            if (data.length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: _covid19 <country>", event.threadID);
                            } else {
                                data.shift()
                                axios.get('https://disease.sh/v3/covid-19/countries/' + data.join(" "))
                                    .then(response => {
                                        var cases = new Intl.NumberFormat().format(response.data.cases);
                                        var todaycases = new Intl.NumberFormat().format(response.data.todayCases);
                                        var deaths = new Intl.NumberFormat().format(response.data.deaths);
                                        var todaydeaths = new Intl.NumberFormat().format(response.data.todayDeaths);
                                        var recovered = new Intl.NumberFormat().format(response.data.recovered);
                                        var todayrecovered = new Intl.NumberFormat().format(response.data.todayRecovered);
                                        var active = new Intl.NumberFormat().format(response.data.active);
                                        var critical = new Intl.NumberFormat().format(response.data.critical);
                                        var flag = response.data.countryInfo.flag;

                                        request(flag).pipe(fs.createWriteStream(__dirname + '/attachments/flag.png'))

                                            .on('finish', () => {
                                                api.sendMessage({
                                                    body: "Country: " + response.data.country + "\n\n" + "Cases: " + cases + "\nToday Cases: " + todaycases + "\nDeaths: " + deaths + "\nToday Deaths: " + todaydeaths + "\nRecovered: " + recovered + "\nToday Recovered: " + todayrecovered + "\nActive Cases: " + active + "\nCritical: " + critical,
                                                    attachment: fs.createReadStream(__dirname + '/attachments/flag.png')
                                                }, event.threadID, event.messageID);
                                            })
                                    })
                                    .catch(error => {
                                        console.log(error);
                                    });
                            }
                        }

                        //Commands | Facebook Tools
                        else if (input.startsWith("_getthread")) {
                            api.getThreadInfo(event.threadID, (err, info) => {
                                if (err) return console.error(err);
                                // console.log(info);

                                var message = {
                                    body: `Thread ID: ${info.threadID}\nName: ${info.threadName}`,
                                }
                                api.sendMessage(message, event.threadID);
                            });
                        }

                        else if (input.startsWith("_getallthreads")) {
                            api.getThreadList(20, null, ["INBOX"], (err, list) => {
                                if (err) return console.error(err);
                                let threads = "All Makuguren Threads\n\n"
                                for (let i = 0; i < list.length; i++) {
                                    threads += `ThreadName: ${list[i].name}\nThreadID: ${list[i].threadID}\n\n`
                                }
                                api.sendMessage(threads, event.threadID, event.messageID);
                            });
                        }

                        if (input.startsWith("_kick")) {
                            let data = input.split(" ");
                            if (data.length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: _kick <@user/mention>", event.threadID);
                            } else {
                                api.getThreadInfo(event.threadID, (err, info) => {
                                    var { mentions, senderID, threadID, messageID } = event;
                                    var mentionid = `${Object.keys(mentions)[0]}`;
                                    var admin = info.adminIDs;
                                    const res = [];
                                    for (let i = 0; i < admin.length; i++) {
                                        var gca = admin[i].id;
                                        res.push(gca);
                                    }
                                    var admin = res;
                                    if (admin.includes(event.senderID)) {
                                        if (admin.includes("100077926153301")) {
                                            api.removeUserFromGroup(mentionid, threadID);
                                        } else {
                                            api.sendMessage("[ERR] ❌ Possible Reasons\n\n1. Bot is not an Admin on GC.\n\nNote: To use //kick @user feature make sure to add this bot on your group admin", threadID, messageID);
                                        }
                                    } else {
                                        api.sendMessage("[ERR]⚠️ User is not a Group Admin", threadID, messageID);
                                    }
                                });
                            }
                        }

                        if (input.startsWith("_getfb")) {
                            api.getThreadInfo(event.threadID, (err, info) => {
                                var mentionid = `${Object.keys(event.mentions)[0]}`;

                                api.getUserInfo(mentionid, (err, data) => {
                                    if (err) return console.log(err);

                                    let name = data[mentionid]['name'];
                                    let vanity = data[mentionid]['vanity'];
                                    let profileUrl = data[mentionid]['profileUrl'];
                                    let profileBio = data[mentionid]['profileBio'];

                                    request(`https://graph.facebook.com/${mentionid}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`).pipe(fs.createWriteStream(__dirname + '/attachments/files.jpg')).on('finish', function () {
                                        console.log('finished downloading files..');
                                        var message = {
                                            body: `Name: ${name}\nUsername: ${vanity}\nUID: ${mentionid}\nProfile: ${profileUrl}`,
                                            attachment: fs.createReadStream(__dirname + '/attachments/files.jpg')
                                                .on("end", async () => {
                                                    if (fs.existsSync(__dirname + '/attachments/files.jpg')) {
                                                        fs.unlink(__dirname + '/attachments/files.jpg', function (err) {
                                                            if (err) console.log(err);
                                                            console.log(__dirname + '/attachments/files.jpg is deleted');
                                                        })
                                                    }
                                                })

                                        }
                                        api.sendMessage(message, event.threadID, event.messageID);
                                    })
                                });
                            });
                        }

                        if (input.startsWith("_getmyfb")) {
                            api.getUserInfo(event.senderID, (err, data) => {
                                if (err) return console.log(err);

                                let name = data[event.senderID]['name'];
                                let vanity = data[event.senderID]['vanity'];
                                let profileUrl = data[event.senderID]['profileUrl'];
                                let profileBio = data[event.senderID]['profileBio'];

                                request(`https://graph.facebook.com/${event.senderID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`).pipe(fs.createWriteStream(__dirname + '/attachments/files.jpg')).on('finish', function () {
                                    console.log('finished downloading files..');
                                    var message = {
                                        body: `Name: ${name}\nUsername: ${vanity}\nUID: ${event.senderID}\nProfile: ${profileUrl}`,
                                        attachment: fs.createReadStream(__dirname + '/attachments/files.jpg')
                                            .on("end", async () => {
                                                if (fs.existsSync(__dirname + '/attachments/files.jpg')) {
                                                    fs.unlink(__dirname + '/attachments/files.jpg', function (err) {
                                                        if (err) console.log(err);
                                                        console.log(__dirname + '/attachments/files.jpg is deleted');
                                                    })
                                                }
                                            })

                                    }
                                    api.sendMessage(message, event.threadID, event.messageID);
                                })
                            });
                        }

                        /*if (input.startsWith("//getfb")) {
                            let data = input.split(" ");
                            if (data.length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: //getfb <mention>", event.threadID);
                            } else {
                                api.getThreadInfo(event.threadID, (err, info) => {
                                    var mentionid = `${Object.keys(event.mentions)[0]}`;
                                    axios.get('https://manhict.tech/api/fbInfo?id=' + mentionid + '&apikey=CcIDaVqu')
                                    .then(response => {
                                        var name = response.data.result.name;
                                        var vanity = response.data.result.vanity;
                                        var birthday = response.data.result.birthday;
                                        var follow = response.data.result.follow;
                                        var profileurl = response.data.result.profileUrl;
                                        var gender = ((response.data.result.gender) ? "Male" : "Female");
                                        var hometown = response.data.result.hometown;
                                        var location = response.data.result.location;
                                        var relationship = response.data.result.relationship;
                                        var love = response.data.result.love;
                                        var website = response.data.result.website;
                                        var about = response.data.result.about;
                                        var quotes = response.data.result.quotes;
    
                                        request('https://graph.facebook.com/' + mentionid + '/picture?height=1500&width=1500&access_token=463372798834978|csqGyA8VWtIhabZZt-yhEBStl9Y').pipe(fs.createWriteStream(__dirname + '/attachments/profile.jpg'))
    
                                        .on('finish', () => {
                                            api.sendMessage({
                                                body: "Name: " + name + "\nUsername: " + vanity + "\nBirthday: " + birthday + "\nFollowers: " + follow + "\nProfile URL: " + profileurl + "\nGender: " + gender + "\nHometown: " + hometown + "\nLocation: " + location + "\nRelationship: " + relationship + "\nLove: " + love + "\nWebsite: " + website + "\nAbout: " + about + "\nQuotes: " + quotes,
                                                attachment: fs.createReadStream(__dirname + '/attachments/profile.jpg')
                                            }, event.threadID, event.messageID);
                                        })
                                    })
                                    .catch(error => {
                                        console.log(error);
                                    })
                                })
                            }
                        }*/

                        /*if (input.startsWith("//getmyfb")) {
                            api.getUserInfo(event.senderID, (err, data) => {
    
                                axios.get('https://manhict.tech/api/fbInfo?id=' + event.senderID + '&apikey=CcIDaVqu')
                                .then(response => {
                                    var name = response.data.result.name;
                                    var vanity = response.data.result.vanity;
                                    var birthday = response.data.result.birthday;
                                    var follow = response.data.result.follow;
                                    var profileurl = response.data.result.profileUrl;
                                    var gender = ((response.data.result.gender) ? "Male" : "Female");
                                    var hometown = response.data.result.hometown;
                                    var location = response.data.result.location;
                                    var relationship = response.data.result.relationship;
                                    var love = response.data.result.love;
                                    var website = response.data.result.website;
                                    var about = response.data.result.about;
                                    var quotes = response.data.result.quotes;
    
                                    request('https://graph.facebook.com/' + event.senderID + '/picture?height=1500&width=1500&access_token=463372798834978|csqGyA8VWtIhabZZt-yhEBStl9Y').pipe(fs.createWriteStream(__dirname + '/attachments/profile.jpg'))
    
                                    .on('finish', () => {
                                        api.sendMessage({
                                            body: "Name: " + name + "\nUsername: " + vanity + "\nBirthday: " + birthday + "\nFollowers: " + follow + "\nProfile URL: " + profileurl + "\nGender: " + gender + "\nHometown: " + hometown + "\nLocation: " + location + "\nRelationship: " + relationship + "\nLove: " + love + "\nWebsite: " + website + "\nAbout: " + about + "\nQuotes: " + quotes,
                                            attachment: fs.createReadStream(__dirname + '/attachments/profile.jpg')
                                        }, event.threadID, event.messageID);
                                    })
                                })
                                .catch(error => {
                                    console.log(error);
                                })
                            })
                        }*/

                        else if (input.startsWith("_changename")) {
                            let data = input.split(" ");
                            if (data.length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: _changename <GcName>", event.threadID);
                            } else {
                                data.shift()
                                api.setTitle(data.join(" "), event.threadID, (err, obj) => {
                                    if (err) return console.error(err);
                                });
                            }
                        }

                        else if (input.startsWith("_changenn")) {
                            var text = input;
                            text = text.substring(26)
                            let data = input.split(" ");
                            if (data.length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: _changenn <@user/mention> <nickname>", event.threadID);
                            } else {
                                api.getThreadInfo(event.threadID, (err, info) => {
                                    var mentionid = `${Object.keys(event.mentions)[0]}`;

                                    api.changeNickname(text, `${info.threadID}`, mentionid, (err) => {
                                        if (err) return api.sendMessage("[ERR]⚠️: " + `${err.error}`, event.threadID);
                                    });
                                });
                            }
                        }

                        else if (input.startsWith("_changemoji")) {
                            let data = input.split(" ");
                            if (data.length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: _changemoji <emoji>", event.threadID);
                            } else {
                                data.shift()
                                api.changeThreadEmoji(data.join(" "), event.threadID, (err) => {
                                    if (err) return console.error(err);
                                });
                            }
                        }

                        /*else if (input.startsWith("//proadmin")) {
                            var name = input;
                            name = name.substring(11)
                            let data = input.split(" ");
                            if (data.length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: //proadmin (@user/mention)", event.threadID);
                            } else {
                                api.getThreadInfo(event.threadID, (err,info) => {
                                    var mentionid = `${Object.keys(event.mentions)[0]}`;
    
                                    api.changeAdminStatus(event.threadID, mentionid, true, editAdminsCallback);
                                });
    
                                function editAdminsCallback(err) {
                                    if (err) return api.sendMessage(err.error, event.threadID);
                                }
                            }
                        }*/

                        else if (input.startsWith("_proadmin")) {
                            if (Object.keys(event.mentions).length === 0) {
                                api.sendMessage("[ERR] Invalid use of command, missing tagged user", event.threadID, event.messageID);
                            } else {
                                api.getThreadInfo(event.threadID, (err, info) => {
                                    var admin = info.adminIDs;
                                    const res = [];
                                    for (let i = 0; i < admin.length; i++) {
                                        var gca = admin[i].id;
                                        res.push(gca);
                                    }
                                    var mentionid = Object.keys(event.mentions);
                                    for (let i = 0; i < mentionid.length; i++) {
                                        var admin = res;
                                        if (admin.includes(event.senderID)) {
                                            if (admin.includes("100077926153301")) {
                                                api.changeAdminStatus(event.threadID, mentionid[i], true, err)
                                            } else {
                                                api.sendMessage("[ERR]❌ Possible Reasons\n\n1. Bot is not an Admin on GC.\n\nNote: To use >promote @user feature make sure to add this bot on your group admin", event.threadID, event.messageID);
                                            }
                                        } else {
                                            api.sendMessage("[ERR]⚠️ You are not a Group Admin", event.threadID, event.messageID);
                                        }
                                    }
                                });
                                function editAdminsCallback(err) {
                                    if (err) return console.error(err);

                                }
                            }
                        }

                        else if (input.startsWith("_deadmin")) {
                            if (Object.keys(event.mentions).length === 0) {
                                api.sendMessage("[ERR] Invalid use of command, missing tagged user", event.threadID, event.messageID);
                            } else {
                                api.getThreadInfo(event.threadID, (err, info) => {
                                    var admin = info.adminIDs;
                                    const res = [];
                                    for (let i = 0; i < admin.length; i++) {
                                        var gca = admin[i].id;
                                        res.push(gca);
                                    }
                                    var mentionid = Object.keys(event.mentions);
                                    for (let i = 0; i < mentionid.length; i++) {
                                        var admin = res;
                                        if (admin.includes(event.senderID)) {
                                            if (admin.includes("100077926153301")) {
                                                api.changeAdminStatus(event.threadID, mentionid[i], false, err)
                                            } else {
                                                api.sendMessage("[ERR]❌ Possible Reasons\n\n1. Bot is not an Admin on GC.\n\nNote: To use >promote @user feature make sure to add this bot on your group admin", event.threadID, event.messageID);
                                            }
                                        } else {
                                            api.sendMessage("[ERR]⚠️ You are not a Group Admin", event.threadID, event.messageID);
                                        }
                                    }
                                });
                                function editAdminsCallback(err) {
                                    if (err) return console.error(err);

                                }
                            }
                        }

                        //Commands | GetInstagram
                        else if (input.startsWith("_instagram")) {
                            let data = input.split(" ")
                            if (data.length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: //instagram <username>", event.threadID);
                            } else {
                                data.shift()
                                axios.get('https://api.popcat.xyz/instagram?user=' + data.join(" "))
                                    .then(response => {
                                        var username = response.data.username;
                                        var fullname = response.data.full_name;
                                        var biography = response.data.biography;
                                        var posts = response.data.posts;
                                        var reels = new Intl.NumberFormat().format(response.data.reels);
                                        var followers = new Intl.NumberFormat().format(response.data.followers);
                                        var following = new Intl.NumberFormat().format(response.data.following);
                                        var private = ((response.data.private) ? "Yes" : "No");
                                        var verified = ((response.data.verified) ? "Yes" : "No");
                                        var profilepic = response.data.profile_pic;

                                        request(profilepic).pipe(fs.createWriteStream(__dirname + '/attachments/instaprofile.png'))

                                            .on('finish', () => {
                                                api.sendMessage({
                                                    body: "Username: " + username + "\nFull Name: " + fullname + "\nBio: " + biography + "\nPosts: " + posts + "\nReels: " + reels + "\nFollowers: " + followers + "\nFollowing: " + following + "\nPrivate: " + private + "\nVerified: " + verified,
                                                    attachment: fs.createReadStream(__dirname + '/attachments/instaprofile.png')
                                                }, event.threadID, event.messageID);
                                            })
                                    })
                                    .catch(error => {
                                        //console.log(error);
                                        api.sendMessage("⚠️ [ERR] User not Found!", event.threadID, event.messageID);
                                    })
                            }
                        }

                        //Commands | Facts (Meme)
                        else if (input.startsWith("_facts")) {
                            let data = input.split(" ")
                            if (data.length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: _facts <any text>", event.threadID);
                            } else {
                                data.shift()
                                var url = "https://api.popcat.xyz/facts?text=" + data.join(" ");

                                request(url).pipe(fs.createWriteStream(__dirname + '/attachments/facts.png'))

                                    .on('finish', () => {
                                        api.sendMessage({
                                            attachment: fs.createReadStream(__dirname + '/attachments/facts.png')
                                        }, event.threadID, event.messageID);
                                    })
                            }
                        }

                        //Commands | Weather
                        else if (input.startsWith("_weather")) {
                            let data = input.split(" ")
                            if (data.length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: _weather <country/province/city>", event.threadID);
                            } else {
                                data.shift()
                                let weather = await weathersearch("weather " + data.join(" "))
                                console.log(weather.weather)
                                if (weather.weather == undefined || weather.weather.temperature == undefined) {
                                    weatherjs.find({
                                        weathersearch: data.join(" "),
                                        degreeType: 'C'
                                    }, (err, r) => {
                                        if (err) return console.error("Error [Weather]: " + err)
                                        let d = r[0]
                                        let m = "Location: " + d.location.name + "\n"
                                        m += "Temperature: " + d.current.temperature + "\n"
                                        m += "Sky: " + d.current.skytext + "\n"
                                        m += "Observation time: " + d.current.date + " " + d.current.observationtime
                                        api.sendMessage(m, event.threadID, event.messageID)
                                    })
                                } else {
                                    let output = weather.weather
                                    let m = "Location: " + output.location
                                    m += "\nForecast: " + output.forecast
                                    m += "\nTemperature: " + output.temperature + "°F" + " (" + ((output.temperature - 32) * 5 / 9) + "°C)"
                                    if (output.precipitation != undefined)
                                        m += "\nPrecipitation: " + output.precipitation
                                    if (output.humidity != undefined)
                                        m += "\nHumidity: " + output.humidity
                                    if (output.wind != undefined)
                                        m += "\nWind speed: " + output.wind
                                    api.sendMessage(m, event.threadID, event.messageID)
                                }
                            }
                        }

                        //Commands | PDF
                        else if (input.startsWith("_pdf")) {
                            let data = input.split(" ")
                            if (data.length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: _pdf <any books/guides>", event.threadID);
                            } else {
                                data.shift()
                                // api.setMessageReaction("🔎", event.messageID, (er) => {}, true)
                                let a = await pdfsearch(data.join(" ") + " pdf").then((r) => {
                                    return r
                                }).catch((e) => {
                                    console.log(e)
                                    return null
                                })
                                let b = a.results
                                console.log(b)
                                let d = true
                                e = 0
                                for (let c = 0; c < b.length; c++) {
                                    let title = b[c].title.replace(/\//gi, "_")
                                    if (b[c] != undefined && b[c].url.includes(".pdf")) {
                                        let file = fs.createWriteStream(__dirname + "/attachments/" + title + ".pdf")
                                        let name = `${__dirname}/attachments/${title}.pdf`
                                        try {
                                            d = false
                                            http.get(b[c].url, (r) => {
                                                r.pipe(file)
                                                file.on("finish", () => {
                                                    api.sendMessage({
                                                        body: `Source title: ${b[c].title}\nSource link: ${b[c].url}`,
                                                        attachment: fs.createReadStream(name).on("end", () => {
                                                            if (fs.existsSync(name)) {
                                                                fs.unlink(name, (err) => {
                                                                    if (err) return console.error("Error [PDF]: " + err)
                                                                    // api.setMessageReaction("👌", event.messageID, (er) => {}, true)
                                                                })
                                                            }
                                                        })
                                                    }, event.threadID, event.messageID)
                                                })
                                            })
                                        } catch (e) {
                                            if (fs.existsSync(name)) {
                                                fs.unlink(name, (err) => {
                                                    if (err) return console.error("Error [PDF]: " + err)
                                                    d = false
                                                })
                                            }
                                        }
                                    }
                                    e++
                                }
                                if (d && e >= b.length - 1) {
                                    api.sendMessage("I can't find a link on my query", event.threadID, event.messageID)
                                    // api.setMessageReaction("✖", event.messageID, (er) => {}, true)
                                }
                            }
                        }

                        //Commands | QRCode Generator
                        else if (input.startsWith("_qrcode")) {
                            let data = input.split(" ")
                            if (data.length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: _qrcode <text/message>", event.threadID);
                            } else {
                                data.shift()
                                let url = "http://api.qrserver.com/v1/create-qr-code/?150x150&data=" + data.join(" ")
                                let f = fs.createWriteStream(__dirname + "/attachments/qr.jpg")
                                let res = request(encodeURI(url))
                                res.pipe(f)
                                f.on("close", () => {
                                    api.sendMessage({
                                        body: "QR Code Generated",
                                        attachment: fs.createReadStream(__dirname + "/attachments/qr.jpg").on("end", async () => {
                                            if (fs.existsSync(__dirname + "/attachments/qr.jpg")) {
                                                fs.unlink(__dirname + "/attachments/qr.jpg", (err) => {
                                                    if (err) {
                                                        console.log(err)
                                                    }
                                                })
                                            }
                                        })
                                    }, event.threadID, event.messageID)
                                })
                            }
                        }

                        //Commands | Baybayin
                        else if (input.startsWith("_baybayin")) {
                            let data = input.split(" ")
                            if (data.length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: _baybayin <any text>", event.threadID);
                            } else {
                                data.shift()
                                axios.get('https://api-baybayin-transliterator.vercel.app/?text=' + data.join(" "))
                                    .then(response => {
                                        api.sendMessage("Result: " + response.data.baybay, event.threadID, event.messageID);
                                    })
                                    .catch(error => {
                                        api.sendMessage("⚠️ [ERR] " + error, event.threadID, event.messageID);
                                    })
                            }
                        }

                        //Commands | Games (Pinoy Bugtong)
                        else if (input.startsWith("_bugtong")) {
                            bugtong("bugtong").then((data) => {
                                if (data == null) {
                                    console.log("Check your console")
                                } else {
                                    games.bugtong.tanong = data.b
                                    games.bugtong.sagot = data.s[0]
                                    fs.writeFileSync("files/games.json", JSON.stringify(games), "utf8")
                                    console.log(data)
                                    api.sendMessage("Pinoy Bugtong\n\nTanong: " + data.b + "\n\nType: _secre ang sagot ay (sagot)", event.threadID, event.messageID);
                                }
                            })
                        }

                        else if (input.startsWith("_secre ang sagot ay")) {
                            let text = input;
                            text = text.substring(20)
                            if (text == games.bugtong.sagot) {
                                api.sendMessage("Tama! ang sagot ay " + games.bugtong.sagot, event.threadID, event.messageID);
                            } else {
                                api.sendMessage("Mali! ang tamang sagot ay " + games.bugtong.sagot, event.threadID, event.messageID);
                            }
                        }

                        //Commands | Games (Pinoy Bugtong)
                        else if (input.startsWith("_guessword")) {
                            words("words").then((r) => {
                                if (r == null) {
                                    console.log("Check your console")
                                } else {
                                    games.GuessingWord.word = r.word
                                    games.GuessingWord.definition = r.definition
                                    fs.writeFileSync("files/games.json", JSON.stringify(games), "utf8")
                                    console.log(r)
                                    api.sendMessage("Guessing Word Game\n\nHere's your Clue: " + r.pronunciation + "\nDefinition: " + r.definition + "\n\nType: //maku the answer is (answer)", event.threadID, event.messageID);
                                }
                            })
                        }

                        else if (input.startsWith("_secre the answer is")) {
                            let text = input;
                            text = text.substring(21)
                            if (text == games.GuessingWord.word) {
                                api.sendMessage("Correct! the answer is " + games.GuessingWord.word, event.threadID, event.messageID);
                            } else {
                                api.sendMessage("Wrong! the correct answer is " + games.GuessingWord.word, event.threadID, event.messageID);
                            }
                        }

                        //Commands | Mediafire Downloader
                        else if (input.startsWith("_mediafiredl")) {
                            let data = input.split(" ")
                            if (data.length < 2) {
                                api.sendMessage("⚠️ Invalid Use Of Command!\n💡 Usage: _mediafiredl <link>", event.threadID);
                            } else {
                                data.shift()
                                api.sendMessage("Connecting to Mediafire!", event.threadID, event.messageID)
                                axios.get('https://manhict.tech/api/mediafireDL?url=' + data.join(" ") + '/file&apikey=CcIDaVqu')
                                    .then(response => {
                                        var title = response.data.result.title;
                                        var size = response.data.result.size;
                                        var link = response.data.result.link;

                                        console.log('[DOWNLOADER] ' + link);

                                        request(link).pipe(fs.createWriteStream(__dirname + '/attachments/' + title))

                                            .on('close', () => {
                                                var limit = 50 * 1024 * 1024; // 50MB in bytes
                                                fs.readFile(__dirname + '/attachments/' + title, function (err, data) {
                                                    if (err) console.log(err)
                                                    if (data.length > limit) {
                                                        api.sendMessage("⚠️ [ERR]: File can't be Upload because it's too large", event.threadID, event.messageID)
                                                    } else {
                                                        api.sendMessage({
                                                            body: "Here's your attachment for you!\n\n" + "Filename: " + title + "\nSize: " + size,
                                                            attachment: fs.createReadStream(__dirname + '/attachments/' + title)

                                                                .on('end', async () => {
                                                                    if (fs.existsSync(__dirname + "/attachments/" + title)) {
                                                                        fs.unlink(__dirname + "/attachments/" + title, (err) => {
                                                                            console.log(title + " is Deleted.")
                                                                            if (err) {
                                                                                console.log(err)
                                                                            }
                                                                        })
                                                                    }
                                                                })
                                                        }, event.threadID, event.messgaeID)
                                                    }
                                                })
                                            })
                                    })
                                    .catch(error => {
                                        api.sendMessage("⚠️ [ERR]: Invalid MediaFire Link!", event.threadID, event.messageID);
                                    })
                            }
                        }
                    } //Close Thread

                    //Auto Greet (New w/ Mention Name)
                    /*if (/(goodmorning|good morning|magandang umaga|magandangumaga)/ig.test(input.toLowerCase())) {
                        api.getUserInfo(event.senderID, (err, data) => {
                            api.sendMessage({
                                 body: "Good Morning " + '@' + data[event.senderID]['name'] + "!" + "\nRise up, start fresh see the bright opportunity in each day 💕\n\n~ Secre Bot Auto Greet",
                                 mentions: [{
                                    tag: '@' + data[event.senderID]['name'],
                                    id: event.senderID,
                                    fromIndex: 0
                                 }],
                            }, event.threadID, event.messageID)
                        })
                    }

                    else if (/(goodafternoon|good afternoon|magandang hapon|magandanghapon)/ig.test(input.toLowerCase())) {
                        api.getUserInfo(event.senderID, (err, data) => {
                            api.sendMessage({
                                 body: "Good Afternoon " + '@' + data[event.senderID]['name'] + "!" + "\nThe afternoon is that time in the day when you can fulfill that big dream of yours.\nHave the best afternoon 💕\n\n~ Secre Bot Auto Greet ",
                                 mentions: [{
                                    tag: '@' + data[event.senderID]['name'],
                                    id: event.senderID,
                                    fromIndex: 0
                                 }],
                            }, event.threadID, event.messageID)
                        })
                    }

                    else if (/(goodevening|good evening|magandang gabi|magandanggabi)/ig.test(input.toLowerCase())) {
                        api.getUserInfo(event.senderID, (err, data) => {
                            api.sendMessage({
                                 body: "Good Evening " + '@' + data[event.senderID]['name'] + "!" + "\nEvenings are ways to end the days stress and struggle. I hope you didn't give yourself too much stress.\nHave a great evening 💕\n\n~ Secre Bot AutoGreet",
                                 mentions: [{
                                    tag: '@' + data[event.senderID]['name'],
                                    id: event.senderID,
                                    fromIndex: 0
                                 }],
                            }, event.threadID, event.messageID)
                        })
                    }

                    else if (/(goodnight|good night|gnight|nyt)/ig.test(input.toLowerCase())) {
                        api.getUserInfo(event.senderID, (err, data) => {
                            api.sendMessage({
                                 body: "Good Night " + '@' + data[event.senderID]['name'] + "!" + "\nTonight, It will be your most colorful dream and your sweetest sleep in life. Just let me in when I knock on the door of your heart. Again Good night 💕\n\n~ Secre Bot AutoGreet",
                                 mentions: [{
                                    tag: '@' + data[event.senderID]['name'],
                                    id: event.senderID,
                                    fromIndex: 0
                                 }],
                            }, event.threadID, event.messageID)
                        })
                    }

                    //Thank You / Salamat (New w/ Mention Name)
                    if (/(tenkyou|salamat|thank you|thank you so much)/ig.test(input.toLowerCase())) {
                        api.getUserInfo(event.senderID, (err, data) => {
                            api.sendMessage({
                                 body: "Your'e Welcome " + '@' + data[event.senderID]['name'] + "!" + "\n\n~ Secre Bot Auto Greet",
                                 mentions: [{
                                    tag: '@' + data[event.senderID]['name'],
                                    id: event.senderID,
                                    fromIndex: 0
                                 }],
                            }, event.threadID, event.messageID)
                        })
                    }*/

                    //Auto Greet (Old)
                    /*if (input2.includes("morning") || input2.includes("Morning")) {
                        api.getUserInfo(event.senderID, (err, data) => {
                            if(err){
                                console.log(err)
                            }else{
                                api.sendMessage(("Good Morning din po, " + data[event.senderID]['name']+ "! Don't forget to eat your breakfast, have a good day.\n\nAuto Greet By Axl Chan <3"), event.threadID, event.messageID)
                            }
                        })
                    }

                    if (input2.includes("afternoon") || input2.includes("Afternoon")) {
                        api.getUserInfo(event.senderID, (err, data) => {
                            if(err){
                                console.log(err)
                            }else{
                                api.sendMessage(("Good Afternoon din po, " + data[event.senderID]['name']+ "! \n\nAuto Greet By Axl Chan <3"), event.threadID, event.messageID)
                            }
                        })
                    }

                    if (input2.includes("evening") || input2.includes("Evening")) {
                        api.getUserInfo(event.senderID, (err, data) => {
                            if(err){
                                console.log(err)
                            }else{
                                api.sendMessage(("Good Evening din po, " + data[event.senderID]['name']+ "! How was your day?\n\nAuto Greet By Axl Chan <3"), event.threadID, event.messageID)
                            }
                        })
                    }

                    if (input2.includes("good night") || input2.includes("Good Night")) {
                        api.getUserInfo(event.senderID, (err, data) => {
                            if(err){
                                console.log(err)
                            }else{
                                api.sendMessage(("Good Night din po, " + data[event.senderID]['name']+ "! Sleepwell <3\n\nAuto Greet By Axl Chan <3"), event.threadID, event.messageID)
                            }
                        })
                    }

                    //Tagalog
                    if (input2.includes("umaga") || input2.includes("Umaga")) {
                        api.getUserInfo(event.senderID, (err, data) => {
                            if(err){
                                console.log(err)
                            }else{
                                api.sendMessage(("Magandang Umaga din po, " + data[event.senderID]['name']+ "! Wag mong kalimutan mag almusal.\n\nAuto Greet By Axl Chan <3"), event.threadID, event.messageID)
                            }
                        })
                    }

                    if (input2.includes("tanghali") || input2.includes("Tanghali")) {
                        api.getUserInfo(event.senderID, (err, data) => {
                            if(err){
                                console.log(err)
                            }else{
                                api.sendMessage(("Magandang Tanghali din po, " + data[event.senderID]['name']+ "! \n\nAuto Greet By Axl Chan <3"), event.threadID, event.messageID)
                            }
                        })
                    }

                    if (input2.includes("gabi") || input2.includes("Gabi")) {
                        api.getUserInfo(event.senderID, (err, data) => {
                            if(err){
                                console.log(err)
                            }else{
                                api.sendMessage(("Magandang Gabi din po, " + data[event.senderID]['name']+ "! Kamusta araw mo po?\n\nAuto Greet By Axl Chan <3"), event.threadID, event.messageID)
                            }
                        })
                    }

                    //Thank You / Salamat (Old)
                    if (input2.includes("thank you") || input2.includes("Thank you") || input2.includes("tenkyou") || input2.includes("Tenkyou")) {
                                api.getUserInfo(event.senderID, (err, data) => {
                                    if (err) {
                                        console.log(err)
                                    } else {
                                        api.sendMessage("Welcome, " + data[event.senderID]['name']+ " <3", event.threadID, event.messageID)
                                    }
                                })
                            }

                    if (input2.includes("salamat") || input2.includes("Salamat")) {
                                api.getUserInfo(event.senderID, (err, data) => {
                                    if (err) {
                                        console.log(err)
                                    } else {
                                        api.sendMessage("Wala pong anuman, " + data[event.senderID]['name']+ " <3", event.threadID, event.messageID)
                                    }
                                })
                            }*/

                    //Auto React specific words
                    if (input2.includes("haha")) {
                        api.setMessageReaction("😆", event.messageID, (err) => { }, true)
                    }
                }
                break;

            case "message_unsend":
                if (settings.onUnsend && !threads.includes(event.threadID)) {

                    if (!vips.includes(event.senderID)) {
                        let d = msgs[event.messageID];
                        if (typeof (d) == "object") {
                            api.getUserInfo(event.senderID, (err, data) => {
                                if (err) return console.error(err);
                                else {
                                    if (d[0] == "img") {
                                        var file = fs.createWriteStream(__dirname + '/attachments/photo.jpg');
                                        var gifRequest = http.get(d[1], function (gifResponse) {
                                            gifResponse.pipe(file);
                                            file.on('finish', function () {
                                                console.log('finished downloading photo..')
                                                var message = {
                                                    body: data[event.senderID]['name'] + " unsent this photo: \n",
                                                    attachment: fs.createReadStream(__dirname + '/attachments/photo.jpg')
                                                }
                                                api.sendMessage(message, event.threadID);
                                            });
                                        });
                                    }
                                    else if (d[0] == "gif") {
                                        var file = fs.createWriteStream(__dirname + '/attachments/animated_image.gif');
                                        var gifRequest = http.get(d[1], function (gifResponse) {
                                            gifResponse.pipe(file);
                                            file.on('finish', function () {
                                                console.log('finished downloading gif..')
                                                var message = {
                                                    body: data[event.senderID]['name'] + " unsent this GIF: \n",
                                                    attachment: fs.createReadStream(__dirname + '/attachments/animated_image.gif')
                                                }
                                                api.sendMessage(message, event.threadID);
                                            });
                                        });
                                    }
                                    else if (d[0] == "sticker") {
                                        var file = fs.createWriteStream(__dirname + '/attachments/sticker.png');
                                        var gifRequest = http.get(d[1], function (gifResponse) {
                                            gifResponse.pipe(file);
                                            file.on('finish', function () {
                                                console.log('finished downloading sticker..')
                                                var message = {
                                                    body: data[event.senderID]['name'] + " unsent this Sticker: \n",
                                                    attachment: fs.createReadStream(__dirname + '/attachments/sticker.png')
                                                }
                                                api.sendMessage(message, event.threadID);
                                            });
                                        });
                                    }
                                    else if (d[0] == "vid") {
                                        var file = fs.createWriteStream(__dirname + '/attachments/video.mp4');
                                        var gifRequest = http.get(d[1], function (gifResponse) {
                                            gifResponse.pipe(file);
                                            file.on('finish', function () {
                                                console.log('finished downloading video..')
                                                var message = {
                                                    body: data[event.senderID]['name'] + " unsent this video: \n",
                                                    attachment: fs.createReadStream(__dirname + '/attachments/video.mp4')
                                                }
                                                api.sendMessage(message, event.threadID);
                                            });
                                        });
                                    }
                                    else if (d[0] == "vm") {
                                        var file = fs.createWriteStream(__dirname + '/attachments/vm.mp3');
                                        var gifRequest = http.get(d[1], function (gifResponse) {
                                            gifResponse.pipe(file);
                                            file.on('finish', function () {
                                                console.log('finished downloading audio..')
                                                var message = {
                                                    body: data[event.senderID]['name'] + " unsent this audio: \n",
                                                    attachment: fs.createReadStream(__dirname + '/attachments/vm.mp3')
                                                }
                                                api.sendMessage(message, event.threadID);
                                            });
                                        });
                                    }
                                }
                            });
                        }
                        else {
                            api.getUserInfo(event.senderID, (err, data) => {
                                if (err) return console.error(err);
                                else {
                                    api.sendMessage(data[event.senderID]['name'] + " unsent this message: \n\n" + msgs[event.messageID] + "\n\nAnti Unsent By Secre", event.threadID);
                                }
                            });
                        }
                        break;
                    }
                }

            //Welcome Greetings
            case "event":
                switch (event.logMessageType) {
                    case "log:subscribe":
                        api.getThreadInfo(event.threadID, (err, gc) => {
                            if (gc.isGroup) {
                                let mess = {
                                    body: `Welcome! ${event.logMessageData.addedParticipants[0].fullName}! We are happy to see you join ${gc.threadName}!\nYou are the ${gc.participantIDs.length}th member of this group chat!\n\nTo interact with BOT, please type _commands. Enjoy! :)`,
                                    attachment: fs.createReadStream(__dirname + "/media/welcome-server.gif"),
                                    mentions: [{
                                        tag: event.logMessageData.addedParticipants[0].fullName,
                                        id: event.logMessageData.addedParticipants[0].userFbId
                                    }]
                                }
                                api.sendMessage(mess, event.threadID);
                            }
                        })
                        break;

                    case "log:unsubscribe":
                        var id = event.logMessageData.leftParticipantFbId;
                        api.getThreadInfo(event.threadID, (err, gc) => {
                            if (err) done(err);
                            api.getUserInfo(parseInt(id), (err, data) => {
                                if (err) {
                                    console.log(err)
                                } else {
                                    console.log(data)
                                    for (var prop in data) {
                                        if (data.hasOwnProperty(prop) && data[prop].name) {
                                            var gcn = gc.threadName;
                                            api.sendMessage({
                                                body: "Thank you, " + data[prop].name + ", for joining " + gcn + "!",
                                                mentions: [{
                                                    tag: '@' + data[prop].name,
                                                    id: id,
                                                }],
                                                attachment: fs.createReadStream(__dirname + "/media/goodbye.mp3")
                                            }, event.threadID)
                                        }
                                    }
                                }
                            })
                        })
                        /*await new Promise(resolve => setTimeout(resolve, 7500));
                        api.getThreadInfo(event.threadID, (err, gc) => {
                           if (err) done(err);
                           var gcn = gc.threadName;
                           var arr = gc.participantIDs;
                           var Tmem = arr.length;
                           api.sendMessage("Group Chat Name: " + gcn + "\n\n💠 Total Member(Updated) 💠\n\n => " + Tmem + " Members", event.threadID, event.messageID)
                        })*/
                        break;
                }
                break;
            //End of Welcome Greetings
           };
        })
    });
});
