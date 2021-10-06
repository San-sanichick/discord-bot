import { Client, Intents } from "discord.js";
import { commandList }     from "./commands";
import { config }          from "./config/config";
import os                  from "os";

const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
bot.login(config.token);

bot.on("ready", () => {
    if (bot.user) {
        bot.user.setActivity(os.type(), { type: "PLAYING" });
        console.log(`Logged in as ${bot.user.tag}`);
    }
});

bot.on("messageCreate", (msg) => {
    if (bot.user) {
        if ((msg.author.username != bot.user.username) 
            && msg.author.discriminator != bot.user.discriminator) {
            const 
                command          = msg.content.trim() + " ",
                commandName      = command.slice(0, command.indexOf(" ")),
                messArr          = command.split(" "),
                commandToExecute = commandList.find(comm => comm.name === commandName);

            if (commandToExecute) {
                msg.channel.sendTyping();
                commandToExecute.out(bot, msg, messArr);
            }
        }
    }
});
