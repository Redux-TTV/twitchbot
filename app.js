const tmi = require('tmi.js');
var mongodb = require('mongodb');

const ch = "ctkttv";
const options = {
    options: {
        debug: true
    },
    connection: {
        cluster: "aws",
        reconnect: true
    },
    identity: {
        username: 'botCTK',
        password: 'oauth:n61c6qc1dvjo2us5c3fhpweaqtf1kt'
    },
    channels: [ch]
};
const client = new tmi.client(options);
client.connect();
client.on('connected', (address, port) => {
    const messages = ["I'm baaaack", "Oh god I'm back.", "Where am I?", '*hacker voice*'+"I'm in."]
    const messageNum = getRandomInt(messages.length-1);
    client.action(ch, messages[messageNum]);
});
client.on('chat',(channel, user, message, self) => {
    if(message.substr(0,1)==='!' && !message.startsWith('!addcommand') && !message.startsWith('!deletecommand')) {
        const MongoClient = mongodb.MongoClient;
        const url = "mongodb://localhost:27017/twitchbot";
        MongoClient.connect(url,(err,dbclient) => {
            if(err) {
                console.log(err);
            } else {
                console.log('DB connection successful.');
                const database = dbclient.db('twitchbot');
                const collection = database.collection("commands");
                collection.findOne({command:message}).then(result => {
                    if(result) {
                        client.action(ch,result.message);
                    }
                });
            }
            dbclient.close();
        });
    } else if (message.startsWith('!addcommand') && user['user-type']==='mod') {
        //message = message.replace(/[^\w\s]/gi, '');
        var newcommand = message.replace('!addcommand ','');
        newcommand = newcommand.substr(1,newcommand.indexOf(']')-1);
        newcommand = '!'+newcommand.replace(/!/g,'');
        var newmessage = message.substr(message.indexOf(']')+1);
        const newitem = {command: newcommand, message: newmessage};
        const MongoClient = mongodb.MongoClient;
        const url = "mongodb://localhost:27017/twitchbot";
        MongoClient.connect(url,(err,dbclient) => {
            if(err) {
                console.log(err);
            } else {
                console.log("DB connection successful.");
                const database = dbclient.db('twitchbot');
                const collection = database.collection('commands');
                collection.insertOne(newitem).then(result => {
                    client.action(ch,'Successfully created command: '+newcommand);
                }).catch(err => {
                    client.action(ch,'Failed to create new command.');
                    console.log(err);
                });
            }
            dbclient.close();
        })
    } else if (message.startsWith('!deletecommand') && user['user-type']==='mod') {
        var command = message.split(" ")[1];
        console.log(command);
    }
    // if(message === '!triple') {
    //     client.action(ch, 'https://www.twitch.tv/lolwutduck/clip/UninterestedFrailJellyfishSoonerLater');
    // } else if(message === "!uhhh") {
    //     client.action(ch,'https://clips.twitch.tv/RefinedPrettyAlpacaDogFace');
    // }
});

// client.connect();

// client.on('connected', (address, port) => {
//     const messages = ["I'm baaaack", "Oh god I'm back.", "Where am I?", '*hacker voice*'+"I'm in."]
//     const messageNum = getRandomInt(messages.length-1);
//     client.action(ch, messages[messageNum]);
    
// });

// client.on('chat',(channel, user, message, self) => {
    
//     if(message === '!triple') {
//         client.action(ch, 'https://www.twitch.tv/lolwutduck/clip/UninterestedFrailJellyfishSoonerLater');
//     } else if(message === "!uhhh") {
//         client.action(ch,'https://clips.twitch.tv/RefinedPrettyAlpacaDogFace');
//     }
// });


function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}