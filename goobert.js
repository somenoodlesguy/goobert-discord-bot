import {ApplicationCommandOptionType, Client, EmbedBuilder, IntentsBitField, MessageFlags, REST, Routes} from "discord.js"
import "dotenv/config"
import fs from "fs";

if (!fs.existsSync("db.json"))
    fs.writeFileSync("db.json", "{}");

const db = JSON.parse(fs.readFileSync("db.json").toString())
const shop = JSON.parse(fs.readFileSync("shop.json").toString())

function syncDB() {
    fs.writeFileSync("db.json", JSON.stringify(db))
}

//NOTE - btw i could like put commands in their own files for organization

const commands = [
    {
        name: "goobert",
        description: "goobert"
    },
    {
        name: "miau",
        description: "watch the miau as it explodes"
    },
    {
        name: "grrr",
        description: "grrr"
    },
    {
        name: "dice",
        description: "roll los dice"
    },
    {
        name: "work",
        description: "get pancakes (cooldown of 5 minutes)"
    },
    {
        name: "bal",
        description: "see how many pancakes you have"
    },
    {
        name: "shop",
        description: "see what items you can buy with your pancakes"
    },
    {
        name: "soggyroulette",
        description: "will you be sogged? or will you be dry? (1/2 chance of winning)",
        options: [{name: "bet", type: ApplicationCommandOptionType.Integer, description: "how many pancakes you want to bet", required: true}]
    },
    {
        name: "count",
        description: "count upward",
        options: [{name: "number", type: ApplicationCommandOptionType.Integer, description: "the number", required: true}]
    },
    {
        name: "buy",
        description: "buy items",
        options: [{name: "item", type: ApplicationCommandOptionType.String, description: "what you want to buy", required: true}]
    },
    {
        name: "leaderboard",
        description: "see who to murder at night to become the richest person"
    },
]

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

(async () => {
    try {
        console.log("we gonna slash command")
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            {body: commands}
        )
        console.log("yippee slash commands real")
    } catch (error) {
        console.log("yikes")
        console.error(error)
    }
})();

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
    if (!db[`${interaction.user.id}`]) {
        db[`${interaction.user.id}`] = {
            balance: 0,
            cooldownUntil: 0,
            boughtItems: []
        }
        syncDB();
    }
    if (!db[interaction.user.id].boughtItems) {
        db[interaction.user.id].boughtItems = []
    }
    switch (interaction.commandName) {
        case "goobert":
            interaction.reply("goobert.");
            break;
        case "miau":
            interaction.reply("https://tenor.com/view/miau-hd-adobe-after-effects-glass-breaking-preset-gif-752576862881430143");
            break;
        case "grrr":
            const grr = [Math.random() > 0.5 ? "G" : "g", ...new Array(Math.floor(Math.random() * (28) + 3)).fill(0).map(_ => Math.random() > 0.5 ? "R" : "r")];
            interaction.reply(grr.join(""));
            break;
        case "dice":
            interaction.reply(`you rolled a ${Math.floor((Math.random() * 6) + 1)}`);
            break;
        case "work":
            if ((Date.now() / 1000) < db[`${interaction.user.id}`].cooldownUntil)
                return interaction.reply({"content": `you cant work yet you dingus. try again <t:${Math.floor(db[interaction.user.id].cooldownUntil)}:R>`, "flags": MessageFlags.Ephemeral})
            let bal = db[`${interaction.user.id}`].balance
            const earned = Math.floor(Math.random() * 75) + 25;
            bal += earned + (db[interaction.user.id].boughtItems.includes("slungus pet") ? 50 : 0)
            if (db[interaction.user.id].boughtItems.includes("slungus pet")) {
                interaction.reply(`you earned ${earned}${pancakeEmoji}. (+ 50${pancakeEmoji} thanks to your slungus pet)\nyou now have ${bal}${pancakeEmoji}`);
            } else {
                interaction.reply(`you earned ${earned}${pancakeEmoji}. you now have ${bal}${pancakeEmoji}`);
            }
            db[`${interaction.user.id}`].balance = bal
            db[`${interaction.user.id}`].cooldownUntil = Number(new Date()) / 1000 + (60 * 5); // 5 mins
            syncDB()
            break;
        case "bal":
            interaction.reply(`you have ${db[`${interaction.user.id}`].balance}${pancakeEmoji}`);
            break;
        case "soggyroulette":
            const bet = interaction.options.get("bet").value
            let currentbal = db[interaction.user.id].balance
            if (bet < 100) {
                return interaction.reply(`sorry but your bet is too low, minimum is 100${pancakeEmoji}`)
            }
            if (bet > currentbal) {
                return interaction.reply("you do NOT have that much")
            }
            const win = (Math.random() > 0.5)
            currentbal += (win ? (bet) : (-1 * bet))
            db[interaction.user.id].balance = currentbal
            syncDB()
            if (win) {
                interaction.reply(`<:dry:1342865787135721472> your're dry!!! you got ${bet * 2}${pancakeEmoji}`)
            } else {
                interaction.reply(`<:sog:1342865784602628127> you've been sogged. you lost ${bet}${pancakeEmoji}`)
            }
            break;
        case "count":
            const n = interaction.options.get("number").value
            if (!db.count) {db.count = 0}
            if (n === db.count + 1) {
                db.count = n
                interaction.reply(`the number has been incremented to ${n}`)
            } else {
                db.count = 0
                interaction.reply("you DOOFUS. you DINGUS. you GOOBER. the count has been reset to 0")
            }
            syncDB()
            break;
        case "shop":
            const embed = new EmbedBuilder()
                .setTitle("the goobert shop")
                .setDescription("buy cool items")
                .setColor(0x47ff7e)
                .addFields(...shop.items)
            interaction.reply({ embeds: [embed] })
            break;
        case "buy":
            const item = shop.items.find((x) => x.name === interaction.options.get("item").value)
            if (!item) {
                return interaction.reply("what the heck is that")
            }
            if (item.require && db[interaction.user.id].boughtItems.includes(item.require)) {
                return interaction.reply(`you also need ${item.require} to buy this`)
            }
            if (db[interaction.user.id].balance < item.price) {
                return interaction.reply(`sorry ${interaction.user.displayName}, i cant give credit! come back when you're a little, ***MMM***, richer!`)
            }
            if (db[interaction.user.id].boughtItems.includes(item.name)) {
                return interaction.reply("you already have that")
            }
            db[interaction.user.id].boughtItems.push(item.name)
            db[interaction.user.id].balance -= item.price
            const buyEmbed = new EmbedBuilder()
                .setTitle("success")
                .setColor(0x47ff7e)
                .setDescription(`you got the ${item.name}!`)
            interaction.reply({embeds: [
                buyEmbed
            ]})
            syncDB()
            break;
        case "leaderboard":
            /** @type {Record<string, number>} */
            let money_leaderboard = {}
            for (const key in db) {
                if (Object.hasOwnProperty.call(db, key)) {
                    const element = db[key];
                    money_leaderboard[key] = element.balance
                }
            }
            money_leaderboard = Object.fromEntries(
                Object.entries(money_leaderboard)
                    .sort(([_, a], [__, b]) => b - a)
            )
            let user_place = (Object.keys(money_leaderboard).indexOf(interaction.user.id)) + 1
            money_leaderboard = Object.entries(money_leaderboard)
                .map((p, index) => `<@${p[0]}> - ${p[1]}`);
            money_leaderboard = money_leaderboard.slice(0, 10)
            const lbEmbed = new EmbedBuilder()
                .setTitle('leaderboard')
                .setColor(0x47ff7e)
                .setDescription(money_leaderboard.join("\n"))
                .setFooter({
                    text: `You are №${user_place}`
                })
            interaction.reply({embeds: [lbEmbed]})
            break;
    }
})

bot.login(process.env.BOT_TOKEN)