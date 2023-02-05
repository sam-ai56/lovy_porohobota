const TelegramBot = require('node-telegram-bot-api');
const db = require('better-sqlite3')('sqlite.db');
const fs = require('fs');
require('dotenv').config();
const env = process.env;

var counter = 0;

db.exec(`
    CREATE TABLE IF NOT EXISTS word_list (
        name TEXT NOT NULL
    );
`);

const bot = new TelegramBot(env.BOT_TOKEN, { polling: true });


try {
    counter = JSON.parse(fs.readFileSync('count.json')).count;
} catch (err) {
    console.error("Error reading count.json");
}
  


bot.on('message', (msg) => {
    if (msg.chat.type == 'private')
        return;
    console.log(msg.from.id);
    const message_text = msg.text.toLowerCase();

    if (msg.from.id != env.TARGET_ID)
        return;

    // Перевірка чи є в базі даних слово, яке було сказано
    // Як що є тоді видалити повідомлення і відправити повідомлення
    // ......
    var word_list = db.prepare('SELECT * FROM word_list').all();

    word_list.forEach(element => {
        if (message_text.includes(element.name)) {
            bot.deleteMessage(msg.chat.id, msg.message_id);
            bot.sendMessage(msg.chat.id, `Діма сказав "${element.name}".`, { reply_to_message_id: msg.message_id }).then(() => {
                bot.sendMessage(msg.chat.id, `Пішов нахуй.`, { reply_to_message_id: msg.message_id });
            });
            counter++;
            fs.writeFileSync('count.json', JSON.stringify({ count: counter }));
            return;
        }
    });
    // ......
});
28
bot.onText(/\/poroholichilnyk/, (msg) => {
    if (msg.chat.type == 'private')
        return;
    bot.sendMessage(msg.chat.id, `Діма сказав щось про порошенко: ${counter} раз(ів).`, { reply_to_message_id: msg.message_id });
});

bot.onText(/\/sareestruvaty_slovo/, (msg) => {
    if (msg.chat.type == 'private')
        return;

    if (msg.from.id == env.TARGET_ID) 
        bot.sendMessage(msg.chat.id, `Діма немає сечі терпіти ці пекельні борошна.`, { reply_to_message_id: msg.message_id });

    var word_list = db.prepare('SELECT * FROM word_list').all();
    var alredy_reg = false;
    word_list.forEach(element => {
        if (element.name == msg.text.split(' ')[1]) {
            alredy_reg = true;
            bot.sendMessage(msg.chat.id, `Слово ${msg.text.split(' ')[1]} вже зареєстровано.`, { reply_to_message_id: msg.message_id });
            return;
        }
    });

    if (!alredy_reg){
        db.prepare('INSERT INTO word_list (name) VALUES (?)').run(msg.text.split(' ')[1]);

        bot.sendMessage(msg.chat.id, `Слово ${msg.text.split(' ')[1]} зареєстровано.`, { reply_to_message_id: msg.message_id });
    }
});

bot.onText(/\/vydality_slovo/, (msg) => {
    if (msg.chat.type == 'private')
        return;

    if (msg.from.id == env.TARGET_ID){
        bot.sendMessage(msg.chat.id, `Діма немає сечі терпіти ці пекельні борошна.`, { reply_to_message_id: msg.message_id });
        return;
    }
    
    if (typeof(msg.text.split(' ')[1]) == 'undefined'){
        bot.sendMessage(msg.chat.id, `Ви не вказали слово`, { reply_to_message_id: msg.message_id });
    }

    var word_list = db.prepare('SELECT * FROM word_list').all();
    var is_word = false;
    word_list.forEach(element => {
        if (element.name == msg.text.split(' ')[1]) {
            is_word = true;
            db.prepare('DELETE FROM word_list WHERE name = ?').run(msg.text.split(' ')[1]);
            bot.sendMessage(msg.chat.id, `Слово ${msg.text.split(' ')[1]} видалено.`, { reply_to_message_id: msg.message_id });
        }
    });
    if (!is_word)
        bot.sendMessage(msg.chat.id, `Слово ${msg.text.split(' ')[1]} не зареєстровано.`, { reply_to_message_id: msg.message_id });
});

bot.onText(/\/slova_u_filtri/, (msg) => {
    if (msg.chat.type == 'private')
        return;

    if (msg.from.id == env.TARGET_ID) 
        bot.sendMessage(msg.chat.id, `Діма немає сечі терпіти ці пекельні борошна.`, { reply_to_message_id: msg.message_id });

    var word_list = db.prepare('SELECT * FROM word_list').all();
    var message = "Зареєстровані слова:\n";
    word_list.forEach(element => {
        message += `\t\t\t\t${element.name}\n`;
    });
    bot.sendMessage(msg.chat.id, message, { reply_to_message_id: msg.message_id });
});