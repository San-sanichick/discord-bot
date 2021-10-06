import { config }                        from "./config/config";
import { Client, Message, MessageEmbed } from "discord.js";
import { inlineCode }                    from "@discordjs/builders";
import axios                             from "axios";
import moment                            from "moment";
import os                                from "os";

function test(robot: Client, msg: Message, args: Array<string>) {
    msg.channel.send("https://store.steampowered.com/app/489830/The_Elder_Scrolls_V_Skyrim_Special_Edition/");
}

function getOS(robot: Client, msg: Message, args: Array<string>) {
    msg.channel.send(`${os.type()}, ${os.platform()}, ${os.release()}`);
}

function ping(robot: Client, msg: Message, args: Array<string>) {
    const toSend = `${msg.author} said ${msg.content}, to that I say POG 🤔`;
    msg.channel.send(toSend);
}

async function getCurrentWeather(robot: Client, msg: Message, args: Array<string>): Promise<void> {
    if (args.length === 2) {
        msg.channel.send(`${msg.author}, you did not provide a city`);
        return;
    }

    const city = args.slice(1, args.length - 1).join(" ");

    try {
        const res = await axios(`http://api.weatherapi.com/v1/current.json`, { params: {
                key: config.API_KEY,
                q:   city
            } 
        });
        const 
            data                  = res.data,
            { location, current } = data;

        const embed = new MessageEmbed()
            .setTitle(`Weather in ${location.name}`)
            .setColor("#128717")
            .setThumbnail(`http:${current.condition.icon}`)
            .setDescription(`In ${location.region} in ${location.country}`)
            .addFields(
                { name: "Latitude",         value: `${location.lat}`,                                    inline: true },
                { name: "Longitude",        value: `${location.lon}`,                                    inline: true },
                { name: "Time & Date",      value: moment(location.localtime, "YYYY-MM-DD HH:mm").format("HH:mm, DD.MM.YY"), inline: true },
                { name: "Condition",        value: current.condition.text,                               inline: true },
                { name: '\u200B',           value: '\u200B' },
                { name: "Temperature",      value: `${current.temp_c}℃`,                                inline: true },
                { name: "Temperature feel", value: `${current.feelslike_c}℃`,                           inline: true },
                { name: "Wind",             value: `${current.wind_kph} (km/h)` },
            )
            .setFooter("Buy Skyrim: https://bit.ly/3uc9JXB");
        
        msg.channel.send({ embeds: [embed] });
        
    } catch(err) {
        (await msg.channel.send(inlineCode(`${err}`))).react("🤔");
    }
}

async function getForecast(robot: Client, msg: Message, args: Array<string>): Promise<void> {
    if (args.length === 2) {
        msg.channel.send(`${msg.author}, you did not provide a city`);
        return;
    }

    const city = (args as Array<string>).slice(1, args.length - 1).join(" ");

    try {
        const res = await axios(`http://api.weatherapi.com/v1/forecast.json`, { params: {
                key:  config.API_KEY,
                q:    city,
                days: 1
            } 
        });
        const data = res.data, 
            { location, forecast } = data,
            [ forecastDay ] = forecast.forecastday,
            day = forecastDay.day;

        const embed = new MessageEmbed()
            .setTitle(`Weather forecast for ${location.name}`)
            .setColor("#c28400")
            .setThumbnail(`http:${day.condition.icon}`)
            .setDescription(`In ${location.region} in ${location.country}`)
            .addFields(
                { name: "Latitude",         value: `${location.lat}`,                                inline: true },
                { name: "Longitude",        value: `${location.lon}`,                                inline: true },
                { name: "Time & Date",      value: moment(location.localtime, "YYYY-MM-DD HH:mm").format("HH:mm, DD.MM.YY"), inline: true },
                { name: "Condition",        value: day.condition.text,                               inline: true },
                { name: '\u200B',           value: '\u200B' },
                { name: "Max temp",         value: `${day.maxtemp_c}℃`,                             inline: true },
                { name: "Min temp",         value: `${day.mintemp_c}℃`,                             inline: true },
                { name: "Average temp",     value: `${day.avgtemp_c}℃`,                             inline: true },
                { name: "Wind",             value: `${day.maxwind_kph} (km/h)` },
            )
            .setFooter(`Buy Skyrim: https://bit.ly/3uc9JXB`);
        
        msg.channel.send({ embeds: [embed] });
    } catch(err) {
        (await msg.channel.send(inlineCode(`${err}`))).react("🤔");
    }
}

async function setUsername(robot: Client, msg: Message, args: Array<string>) {
    const name = args.slice(1, args.length - 1).join(" ");
    try {
        if (robot.user?.username === name) throw new Error("But that is already my name!");

        await robot.user?.setUsername(name);
        (await msg.channel.send(`My new name is ${robot.user?.username}`)).react("👍");
    } catch (err) {
        (await msg.channel.send(inlineCode(`${err}`))).react("🤔");
    }
}

const commandList = [
    {
        name:  `${config.prefix}test`,
        out:   test,
        about: "Test command"
    },
    {
        name:  `${config.prefix}ping`,
        out:   ping,
        about: "Ping command"
    },
    {
        name: `${config.prefix}weather`,
        out:  getCurrentWeather,
        about: "Command to get current weather"
    },
    {
        name: `${config.prefix}forecast`,
        out:  getForecast,
        about: "Command to get weather forecast"
    },
    {
        name: `${config.prefix}setname`,
        out:  setUsername,
        about: "Sets the name of the bot"
    },
    {
        name: `${config.prefix}os`,
        out:  getOS,
        about: "Returns the OS on which the bot's server is hosted"
    }
];

export { commandList };