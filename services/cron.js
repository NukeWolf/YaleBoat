const Discord = require("discord.js");
const schedule = require("node-schedule");
const translate = require("@iamtraction/google-translate");
const zalgo = require("to-zalgo");
const converter = require("number-to-words");
const axios = require("axios").default;

const languages = {
    en: "English",
    fr: "French",
    es: "Spanish",
    ar: "Arabic",
    cn: "Mandarin",
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

        const textTranslated = await translate(whatsLeft, {
            to: Object.keys(languages)[daysLeft - 3],
        });
        const channel = client.channels.cache.find(
            (channel) => channel.name === "happy-campers-chat"
        );
        await channel.send(textTranslated.text);

        const dateFact = await axios.get("http://numbersapi.com/8/8/date");
        const triviaFact = await axios.get("http://numbersapi.com/" + daysLeft);
        const mathFact = await axios.get(
            "http://numbersapi.com/" + daysLeft + "/math"
        );
        const embed = {
            color: 0x0f4d92,
            title: textTranslated.text,
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
        await channel.send({ embed: embed });
        // await channel.send(zalgo(dateFact.data));
        // await channel.send(zalgo(triviaFact.data));
        // await channel.send(zalgo(mathFact.data));
    };
    const job = schedule.scheduleJob(dailyRule, sendMessage);
};
