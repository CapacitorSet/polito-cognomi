"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const yaml = require("js-yaml");
const { token, gruppi: _gruppi } = yaml.load(fs.readFileSync("./config.yaml", "utf8"));
// Convert from friendly "FROM-TO: links" syntax to {from: FROM, to: TO, links: links}
let gruppi = [];
for (const key in _gruppi) {
    const [from, to] = key.split("-");
    const links = _gruppi[key];
    gruppi.push({ from, to, links });
}
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(token, { polling: true });
bot.onText(/^\/cognome(@[^ ]+)?$/, msg => {
    bot.sendMessage(msg.chat.id, "Usa `/cognome tuocognome` (per esempio `/cognome Rossi`).", {
        parse_mode: "Markdown",
        reply_to_message_id: msg.message_id
    }).then(sentMessage => {
        setTimeout(() => {
            bot.deleteMessage(sentMessage.chat.id, sentMessage.message_id + "");
            bot.deleteMessage(msg.chat.id, msg.message_id + "");
        }, 1000 * 60 * 2);
    });
});
bot.onText(/^\/cognome(@[^ ]+)? (.+)/, (msg, matches) => {
    const cognome = matches.splice(1).join("").toUpperCase();
    const pair = gruppi.find(it => cognome >= it.from && cognome <= it.to);
    let response;
    if (pair == undefined)
        response = "Non ho trovato nessuno scaglione per il tuo cognome. WTF?";
    else
        response = `Sei nello scaglione ${pair.from}-${pair.to}.\n\nGruppi: ${pair.links.join(", ")}`;
    bot.sendMessage(msg.chat.id, response, {
        reply_to_message_id: msg.message_id
    }).then(sentMessage => {
        setTimeout(() => {
            bot.deleteMessage(sentMessage.chat.id, sentMessage.message_id + "");
            bot.deleteMessage(msg.chat.id, msg.message_id + "");
        }, 1000 * 60 * 2);
    });
});
