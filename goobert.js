import {Client, IntentsBitField} from "discord.js"
import "dotenv/config"

const pancakeEmoji = "<:pancake:1333523925748945018>"

const bot = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
})

bot.on("ready", (c) => {
    console.log(`${c.user.username} is here`);
})

bot.on("interactionCreate", (interaction) => {
    if (!interaction.isChatInputCommand()) {return};
    switch (interaction.commandName) {
        case "goobert":
            interaction.reply("goobert.");
            break;
        case "miau":
            interaction.reply("https://tenor.com/view/miau-hd-adobe-after-effects-glass-breaking-preset-gif-752576862881430143");
            break;
        case "grrr":
            const grr = [Math.random() > 0.5 ? "G" : "g"];
            const length = Math.floor(Math.random() * (28) + 3);
            for (let i = 0; i < length; i++) {
                grr.push(Math.random() > 0.5 ? "R" : "r");
            }
            interaction.reply(grr.join(""));
            break;
        case "dice":
            interaction.reply(`you rolled a ${Math.floor((Math.random() * 6) + 1)}`);
            break;
        case "work":
            interaction.reply(`you earned 0${pancakeEmoji}. you now have 0${pancakeEmoji}`);
            break;
        case "bal":
            interaction.reply(`you have 0${pancakeEmoji}`)
    }
})

bot.login(process.env.BOT_TOKEN)