const Discord = require("discord.js");
const schedule = require("node-schedule");

/**
 * @param  {Discord.Client} client
 */
setupCronFunctions = (client) => {
    aug8(client);
};

module.exports = setupCronFunctions;
/**
 * @param  {Discord.Client} client
 */
const aug8 = (client) => {
    const dailyRule = new schedule.RecurrenceRule();
    dailyRule.hour = 0;
    dailyRule.minute = 1;
    dailyRule.tz = "America/New_York";

    const job = schedule.scheduleJob(dailyRule, () => {
        const today = new Date();
        const cmas = new Date(today.getFullYear(), 07, 8);
        if (today.getMonth() === 08 && today.getDate() > 8) {
            cmas.setFullYear(cmas.getFullYear() + 1);
        }
        const one_day = 1000 * 60 * 60 * 24;
        const whatsLeft =
            Math.ceil((cmas.getTime() - today.getTime()) / one_day) +
            " days left u̸̡͙͚̦̳̹͇̭̬̳͍̹͋̒ͅn̸̟̭̲͕͈̞̫̿̃̿́̐̃̇͒̍̊͌̃͜͝t̷̝̠͉̊͠ĭ̴̡̪̮͙̱̩̝̊̉́́̚ĺ̷̠̟̣̆̓̔̕͝ ã̷̧̛̱̌̐̅͒̈́̌̾̿̚̕͝ư̴̛͖̺̟̲̅̾̉̉̾͋̓͌͘̚g̴̡̛̞̺̭̰͚͉͈̪͖̰̾͋̂̍̈́̕͝ͅ ̷̮̥̖̘̜̀̑̈̎̂̈́̇́̑̕͜͠8̷̨̼̬̳͕͇̺̳̝͇͈̮̝͋̐̈́́͒͂̿͝ͅ";

        const channel = client.channels.cache.find(
            (channel) => channel.name === "happy-campers-chat"
        );
        channel.send(whatsLeft);
    });
};
