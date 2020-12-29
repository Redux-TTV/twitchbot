const tmi = require('tmi.js');
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
    if(message === '!triple') {
        client.action(ch, 'https://www.twitch.tv/lolwutduck/clip/UninterestedFrailJellyfishSoonerLater');
    } else if(message === "!uhhh") {
        client.action(ch,'https://clips.twitch.tv/RefinedPrettyAlpacaDogFace');
    }
});


function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}