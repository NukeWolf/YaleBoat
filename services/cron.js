const Discord = require("discord.js");
const schedule = require("node-schedule");
const translate = require("@iamtraction/google-translate");
const zalgo = require("to-zalgo");
const converter = require("number-to-words");
const axios = require("axios").default;
const _ = require("lodash");

const fs = require("fs");
const rawImages = fs.readFileSync("src/liminalspaces.txt").toString("utf-8");
const liminalImages = rawImages.split("\n");
const languages = {
    en: "English",
    fr: "French",
    es: "Spanish",
    ar: "Arabic",
    ru: "Russian",
    pt: "Portuguese",
    de: "German",
    ja: "Japanese",
    hi: "Hindi",
    ms: "Malay",
    fa: "Persian",
    sw: "Swahili",
    ta: "Tamil",
    it: "Italian",
    nl: "Dutch",
    bn: "Bengali",
    tr: "Turkish",
    vi: "Vietnamese",
    pl: "Polish",
    pa: "Punjabi",
    th: "Thai",
    ko: "Korean",
    "zh-CN": "Chinese",
};

/**
 * @param  {Discord.Client} client
 */
setupCronFunctions = (client) => {
    aug8(client);

    const channel = client.channels.cache.find(
        (channel) => channel.name === "happy-campers-chat"
    );
    /*  //For random messages and trivia
    const collector = channel.createMessageCollector((m) => {
        return !m.author.bot;
    });
    collector.on("collect", () => {
        const random = Math.random() * 100;
        if (random < 1) {
            const url = _.sample(liminalImages);
            channel.send({
                files: [url],
            });
        }
    }); */
    console.log(liminalImages);
};
//" days left u̸̡͙͚̦̳̹͇̭̬̳͍̹͋̒ͅn̸̟̭̲͕͈̞̫̿̃̿́̐̃̇͒̍̊͌̃͜͝t̷̝̠͉̊͠ĭ̴̡̪̮͙̱̩̝̊̉́́̚ĺ̷̠̟̣̆̓̔̕͝ ã̷̧̛̱̌̐̅͒̈́̌̾̿̚̕͝ư̴̛͖̺̟̲̅̾̉̉̾͋̓͌͘̚g̴̡̛̞̺̭̰͚͉͈̪͖̰̾͋̂̍̈́̕͝ͅ ̷̮̥̖̘̜̀̑̈̎̂̈́̇́̑̕͜͠8̷̨̼̬̳͕͇̺̳̝͇͈̮̝͋̐̈́́͒͂̿͝ͅ";
module.exports = setupCronFunctions;
/**
 * @param  {Discord.Client} client
 */
const aug8 = (client) => {
    const dailyRule = new schedule.RecurrenceRule();
    dailyRule.hour = 0;
    dailyRule.minute = 1;
    dailyRule.tz = "America/New_York";
    const sendMessage = async () => {
        const channel = client.channels.cache.find(
            (channel) => channel.name === "happy-campers-chat"
        );
        const today = new Date();
        const cmas = new Date(today.getFullYear(), 07, 8);
        if (today.getMonth() === 08 && today.getDate() > 8) {
            cmas.setFullYear(cmas.getFullYear() + 1);
        }
        const one_day = 1000 * 60 * 60 * 24;
        const daysLeft = Math.ceil(
            (cmas.getTime() - today.getTime()) / one_day
        );
        const whatsLeft =
            converter.toWords(daysLeft) + " days left until august eighth";

        if (daysLeft - 4 >= 0) {
            const textTranslated = await translate(whatsLeft, {
                to: Object.keys(languages)[daysLeft - 4],
            });

            await channel.send(textTranslated.text);
        }

        if (daysLeft - 4 == -1) {
            return channel.send({ files: ["https://i.imgur.com/HUQhy4E.gif"] });
        }
        if (daysLeft - 4 == -2) {
            return channel.send({
                files: [
                    "https://thumbs.gfycat.com/InnocentCraftyEquine-size_restricted.gif",
                ],
            });
        }
        if (daysLeft - 4 == -3) {
            return channel.send({
                files: [
                    "https://media1.tenor.com/images/2bd6ba581d518dd759a4de86df7dccce/tenor.gif?itemid=9607331",
                ],
            });
        }
        if (daysLeft - 4 == -4) {
            const message = await channel.send(
                "Y̸o̵u̸'̸v̵e̴ ̷M̶e̸t̵ ̴W̸i̵t̴h̵ ̶A̶ ̶T̴e̸r̴r̴i̶b̸l̸e̸ ̵F̴a̴t̷e̷ ̸H̷a̶v̴e̵n̷'̴t̵ ̷Y̸o̷u̷"
            );
            const reactions = ["⬆️", "⬇️", "⬅️", "➡️", "🅰️", "🅱️"];
            const songOfTime = ["➡️", "🅰️", "⬇️", "➡️", "🅰️", "⬇️"];
            let playedNotes = [];
            for (let i = 0; i < reactions.length; i++) {
                await message.react(reactions[i]);
            }
            const reactionCollector = message.createReactionCollector(
                (reaction, user) => {
                    return reactions.includes(reaction.emoji.name);
                }
            );
            reactionCollector.on("collect", async (reaction, user) => {
                playedNotes.push(reaction.emoji.name);
                if (playedNotes.length > 6) {
                    playedNotes.shift();
                }
                reaction.users.remove(user);
                //If Song is played
                if (playedNotes.toString() === songOfTime.toString()) {
                    await channel.send({ files: ["src/songoftime.mp3"] });
                    await new Promise((r) => setTimeout(r, 20000));
                    await channel.send({
                        files: ["https://i.imgur.com/HUQhy4E.gif"],
                    });
                    await channel.send({
                        files: [
                            "src/1.wav",
                            "src/2.Do-you-hear-the-people-sing.mp3",
                        ],
                    });
                }
            });
        }

        const dateFact = await axios.get("http://numbersapi.com/8/8/date");
        const triviaFact = await axios.get("http://numbersapi.com/" + daysLeft);
        const mathFact = await axios.get(
            "http://numbersapi.com/" + daysLeft + "/math"
        );
        const embed = {
            color: 0x0f4d92,
            title: whatsLeft,
            fields: [
                {
                    name: "a̴̧̡̧̨̨̡͇̯͓̺̻͇̼̻̯͖̤̺͖̜͈͓̣̤͎͔̣͔̜͍͍͓̪̻͉͓̬̤͎͇̻̯̾͗̓̌́͜͝ư̵̛͕̤͕͎̠͇̗̯̜̬̰̬͖͑̎̀̈́̓̇͑̑̓̽́́̉̋͋̔͘͜͠g̴̡̢̨̛̦͍̺̙͍͕͈̞͉͓̻̙͉̫̮̳̙͇͔͈̜̮͎̳̗̼̪̼̜̺̝̺͎̗̘̑̓̈́̒͑͌̅͐̀͗̎̈́͂͛͑́̐̐̈͛̔̈́͆̔͑̓̈́̂̀͌̉̿͑̅͗͐̚̚͘͘͜͝͝ ̷̡̡̨̗̯͓̼͖͇̗̗̯̗̣̯͕͓̘̭̘̥̰͙̝̣̉ͅ8̵̡̡̨̨̛̛̛̤͙̺̘͉̘̩̦̠̙̯͍͉̻͆̒̿̑̐̐͋̍̾̈́́́͑͂̀́̈̅̇̀̾͑̾̈́̔͐̒̂̋̚͘͘͝͠͝͠͠ͅ",
                    value: zalgo(dateFact.data),
                },
                {
                    name: "a̴̧̡̧̨̨̡͇̯͓̺̻͇̼̻̯͖̤̺͖̜͈͓̣̤͎͔̣͔̜͍͍͓̪̻͉͓̬̤͎͇̻̯̾͗̓̌́͜͝ư̵̛͕̤͕͎̠͇̗̯̜̬̰̬͖͑̎̀̈́̓̇͑̑̓̽́́̉̋͋̔͘͜͠g̴̡̢̨̛̦͍̺̙͍͕͈̞͉͓̻̙͉̫̮̳̙͇͔͈̜̮͎̳̗̼̪̼̜̺̝̺͎̗̘̑̓̈́̒͑͌̅͐̀͗̎̈́͂͛͑́̐̐̈͛̔̈́͆̔͑̓̈́̂̀͌̉̿͑̅͗͐̚̚͘͘͜͝͝ ̷̡̡̨̗̯͓̼͖͇̗̗̯̗̣̯͕͓̘̭̘̥̰͙̝̣̉ͅ8̵̡̡̨̨̛̛̛̤͙̺̘͉̘̩̦̠̙̯͍͉̻͆̒̿̑̐̐͋̍̾̈́́́͑͂̀́̈̅̇̀̾͑̾̈́̔͐̒̂̋̚͘͘͝͠͝͠͠ͅ",
                    value: zalgo(triviaFact.data),
                },
                {
                    name: "a̴̧̡̧̨̨̡͇̯͓̺̻͇̼̻̯͖̤̺͖̜͈͓̣̤͎͔̣͔̜͍͍͓̪̻͉͓̬̤͎͇̻̯̾͗̓̌́͜͝ư̵̛͕̤͕͎̠͇̗̯̜̬̰̬͖͑̎̀̈́̓̇͑̑̓̽́́̉̋͋̔͘͜͠g̴̡̢̨̛̦͍̺̙͍͕͈̞͉͓̻̙͉̫̮̳̙͇͔͈̜̮͎̳̗̼̪̼̜̺̝̺͎̗̘̑̓̈́̒͑͌̅͐̀͗̎̈́͂͛͑́̐̐̈͛̔̈́͆̔͑̓̈́̂̀͌̉̿͑̅͗͐̚̚͘͘͜͝͝ ̷̡̡̨̗̯͓̼͖͇̗̗̯̗̣̯͕͓̘̭̘̥̰͙̝̣̉ͅ8̵̡̡̨̨̛̛̛̤͙̺̘͉̘̩̦̠̙̯͍͉̻͆̒̿̑̐̐͋̍̾̈́́́͑͂̀́̈̅̇̀̾͑̾̈́̔͐̒̂̋̚͘͘͝͠͝͠͠ͅ",
                    value: zalgo(mathFact.data),
                },
            ],
            timestamp: new Date(),
        };
        //await channel.send({ embed: embed });
        // await channel.send(zalgo(dateFact.data));
        // await channel.send(zalgo(triviaFact.data));
        // await channel.send(zalgo(mathFact.data));
    };

    const job = schedule.scheduleJob(dailyRule, sendMessage);
};
