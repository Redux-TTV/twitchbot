require('dotenv').config();
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
        password: process.env.BOT_PASS
    },
    channels: [ch]
};
const client = new tmi.client(options);
client.connect();
client.on('connected', (address, port) => {
    const messages = ["I'm baaaack", "Oh god I'm back.", "Where am I?", '*hacker voice*'+"I'm in."]
    const messageNum = getRandomInt(messages.length);
    client.action(ch, messages[messageNum]);
});
client.on('chat',(channel, user, message, self) => {
    if(message.substr(0,1)==='!' && !message.startsWith('!addcommand') && !message.startsWith('!deletecommand') && !message.startsWith('!commands')) {
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
    } else if (message.startsWith('!addcommand') && (user['user-type']==='mod' || user['display-name'].toLowerCase()==='ctkttv')) {
        const newcommand = '!'+message.split(" ")[1].replace(/[^\w\s]/gi,'')
        const newmessage = message.split(" ").slice(2).join(" ");
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
                    console.log(result);
                }).catch(err => {
                    client.action(ch,'Failed to create new command.');
                    console.log(err);
                });
            }
            dbclient.close();
        })
    } else if (message.startsWith('!deletecommand') && (user['user-type']==='mod' || user['display-name'].toLowerCase()==='ctkttv')) {
        var delcommand = "!" + message.split(" ")[1].replace(/!/g,'');
        const MongoClient = mongodb.MongoClient;
        const url = "mongodb://localhost:27017/twitchbot";
        MongoClient.connect(url,(err,dbclient) => {
            if(err) {
                console.log(err);
            } else {
                const database = dbclient.db('twitchbot');
                const collection = database.collection('commands');
                collection.deleteOne({command:delcommand}).then(result => {
                    client.action(ch,'Successfully deleted command: '+delcommand);
                    console.log(result);
                }).catch(err => {
                    client.action(ch,'Failed to delete command');
                    console.log(err);
                })
            }
            dbclient.close();
        });
    } else if (message.startsWith('!commands')) {
        const MongoClient = mongodb.MongoClient;
        const url = "mongodb://localhost:27017/twitchbot";
        MongoClient.connect(url,(err,dbclient) => {
            if(err) {
                console.log(err);
            } else {
                const database = dbclient.db('twitchbot');
                const collection = database.collection('commands');
                let command_array = []
                collection.find({}).toArray().then(results => {
                    results.forEach(result => {
                        command_array.push(result.command);
                    });
                    let output = command_array.join(', ');
                    client.action(ch,'Available commands: '+output);
                }).catch(err => {
                    console.log(err);
                })
            }
        })
    }
});


function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}