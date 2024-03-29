const schedule = require("node-schedule");
const Discord = require("discord.js");
const { bddAnouncements, bddReminders } = require("../config");

const eventData = [];
for (let x = 1; x <= 7; x++) {
    const eventFile = require(`../src/eventData/event${x}.json`).events;
    eventData.push(...eventFile);
}

module.exports = class bulldogDaysManager {
    /**
     * Creates the
     * @param  {import('discord.js').Client} client
     */
    constructor(client) {
        this.client = client;
        const events = eventData.map((event) => {
            return {
                ...event.eventData,
                id: event.id,
                eventType: event.eventType.name,
            };
        });
        this.events = events;
        this.init();
        this.setupDaily(events);
    }
    async init() {
        await this.fetchMessage();
        this.setupReactions();
        this.setupEvents();
    }
    async setupDaily(events) {
        const dailyRule = new schedule.RecurrenceRule();
        dailyRule.hour = 9;
        dailyRule.minute = 0;
        dailyRule.tz = "America/New_York";
        const job = schedule.scheduleJob(dailyRule, () => {
            this.dailyMessage(events);
        });
    }
    async setupEvents() {
        const guild = await this.client.getMainGuild();
        const role = guild.roles.cache.find(
            (role) => role.name === "bddRemind"
        );
        this.events[4].startDate = "2021-04-09T01:05:15+0000";
        this.events.forEach((event) => {
            const date = new Date(event.startDate);
            const oneHourBefore = new Date(event.startDate);
            oneHourBefore.setHours(oneHourBefore.getHours() - 1);
            const job = schedule.scheduleJob(date, () => {
                this.remindChannel.send(
                    `${role.toString()}\n**__${
                        event.headline
                    }__** is starting right now!\nGo to https://crosscampus.yale.edu/hub/asn/events-v2/${
                        event.id
                    } or ${this.announceChannel.toString()} for more info.`
                );
            });
            const job2 = schedule.scheduleJob(oneHourBefore, () => {
                this.remindChannel.send(
                    `${role.toString()}\n**__${
                        event.headline
                    }__** starts in **one hour**!\nGo to https://crosscampus.yale.edu/hub/asn/events-v2/${
                        event.id
                    } or ${this.announceChannel.toString()} for more info.`
                );
            });
        });
    }
    async dailyMessage(events) {
        if (!events) events = this.events;
        const guild = await this.client.getMainGuild();
        const channel = await guild.channels.resolve(bddAnouncements);
        const currentDate = new Date().getDate();
        const scheduleImg = new Discord.MessageAttachment(
            "./src/bddschedule.jpg"
        );
        const studentEmbed = {
            title: `**Student Events**`,
            description:
                "This is the huge list of student organizations that will be on display today.",
            image: {
                url:
                    "https://d1ctk4ronrg3qz.cloudfront.net/event-photos%2FwgZpA491SnOIKMGLdZ9L_StudentGroupEvents_image.png",
            },
            fields: [],
            color: 0x0a47b8,
            timestamp: new Date(),
            footer: {
                text: `Posted at`,
            },
        };
        const studentEmbeds = [];
        const checkFull = () => {
            if (studentEmbed.fields.length === 25) {
                studentEmbeds.push({ ...studentEmbed });
                studentEmbed.fields = [];
            }
        };
        const filtered = events.filter((event) => {
            if (currentDate !== new Date(event.startDate).getDate())
                return false;
            if (event.eventType === "Student Groups") {
                checkFull();
                const description = event.description
                    .replace(/<br>/g, "")
                    .replace(/&nbsp;/g, "")
                    .replace(/[\u2018\u2019]/g, "'")
                    .replace(/[\u201C]/g, '"');
                studentEmbed.fields.push({
                    name: `${event.headline} | Starts ${new Date(
                        event.startDate
                    ).toLocaleTimeString()}`,
                    value: `[More info here](https://crosscampus.yale.edu/hub/asn/events-v2/${event.id})\n[Zoom Link](${event.locationText})`,
                });
                return false;
            }
            return true;
        });
        if (studentEmbed.fields.length > 0)
            studentEmbeds.push({ ...studentEmbed });

        const none = {
            title: `**No events for April ${new Date().getDate()}**`,
            description:
                "Welcome to Bulldog Days of April!\nAll Events here: https://crosscampus.yale.edu/hub/asn/events-v2",
            image: { url: "attachment://bddschedule.jpg" },
            color: 0x0a47b8,
        };

        if (filtered.length == 0)
            return channel.send({ files: [scheduleImg], embed: none });
        const embeds = filtered.map((event) => {
            const description = event.description
                .replace(/<br>/g, "")
                .replace(/&nbsp;/g, "")
                .replace(/[\u2018\u2019]/g, "'")
                .replace(/[\u201C]/g, '"');
            return {
                title: `**${event.headline}**`,
                description:
                    description.length > 2047
                        ? description.substr(0, 2047)
                        : description,
                image: { url: event.coverPhoto },
                fields: [
                    {
                        name: "Yale Cross Campus Link | Registration",
                        value: `https://crosscampus.yale.edu/hub/asn/events-v2/${event.id}`,
                    },
                    {
                        name: "Zoom Link",
                        value: event.locationText,
                    },
                    {
                        name: "Start Time | EST",
                        value: new Date(event.startDate).toLocaleTimeString(),
                        inline: true,
                    },
                    {
                        name: "End Time | EST",
                        value: new Date(event.endDate).toLocaleTimeString(),
                        inline: true,
                    },
                    {
                        name: "Event Category",
                        value: event.eventType,
                        inline: true,
                    },
                ],
                color: 0x0a47b8,
                timestamp: new Date(),
                footer: {
                    text: `Posted at`,
                },
            };
        });

        const embed = {
            title: `**UPCOMING EVENTS for April ${new Date().getDate()}**`,
            description:
                "Welcome to Bulldog Days of April! These are todays events.\nAll Events here: https://crosscampus.yale.edu/hub/asn/events-v2",
            image: { url: "attachment://bddschedule.jpg" },
            color: 0x0a47b8,
        };
        const optionEmbed = {
            title: `**UPCOMING EVENTS for April ${new Date().getDate()}**`,
            description:
                "If you want to opt into being reminded when these events start, react to :white_check_mark:.\nIf you want to opt out of reminders, react to :x:",
            color: 0x0a47b8,
        };

        await channel.send(
            "~~---------------------------------------------------------------------------------------------------------~~\n\n\n~~---------------------------------------------------------------------------------------------------------~~"
        );
        await channel.send({ files: [scheduleImg], embed });
        try {
            for (const eventEmbed of studentEmbeds) {
                await channel.send({ embed: eventEmbed });
            }
            for (const eventEmbed of embeds) {
                await channel.send({ embed: eventEmbed });
            }
        } catch (e) {
            //TODO: Client LOGS are now Guild based
            this.client.log("error", "Issue with posting an event", true);
            console.log(e);
        }
        this.reactMessage = await channel.send({ embed: optionEmbed });
        this.setupReactions();
    }

    async setupReactions() {
        const guild = await this.client.getMainGuild();
        const channel = await guild.channels.resolve(bddAnouncements);
        const message = this.reactMessage;
        await message.react("✅");
        await message.react("❌");
        const reactionCollector = message.createReactionCollector(
            (reaction, user) => {
                return (
                    reaction.emoji.name == "✅" || reaction.emoji.name == "❌"
                );
            }
        );
        const role = guild.roles.cache.find(
            (role) => role.name === "bddRemind"
        );
        reactionCollector.on("collect", async (reaction, user) => {
            if (reaction.emoji.name == "✅") guild.member(user).roles.add(role);
            else {
                try {
                    guild.member(user).roles.remove(role);
                } catch (e) {}
            }
            if (!user.bot) reaction.users.remove(user);
        });
    }
    fetchMessage = async () => {
        const guild = await this.client.getMainGuild();
        const channel = await guild.channels.resolve(bddAnouncements);
        this.remindChannel = guild.channels.resolve(bddReminders);
        this.announceChannel = channel;
        const messages = await channel.messages.fetch({ limit: 100 });

        const message = messages.find((message) => {
            if (message.embeds.length == 0) return false;
            const title = message.embeds[0].title;
            return title.includes("UPCOMING EVENTS");
        });
        this.reactMessage = message;
    };
};
