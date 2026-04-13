const TelegramBot = require('node-telegram-bot-api');

// SIZNING MA'LUMOTLARINGIZ
const token = '8664449888:AAFh_QEzGrqYLRbZESRWPG9Twwx60KmmgQk';
const bot = new TelegramBot(token, {polling: true});

const ADMIN_ID = 8448862547;
const COURIER_ID = 7312694067;

// Buyurtma raqami uchun (server o'chib yonsa ham saqlanishi uchun faylga yozish tavsiya etiladi, lekin hozir o'zgaruvchida)
let orderNumber = 1000; 

// /start buyrug'i
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, `Assalomu alaykum, ${msg.from.first_name}!\nShokh Food botiga xush kelibsiz!`, {
        reply_markup: {
            keyboard: [
                [{ text: "🛒 Menyu va Buyurtma", web_app: { url: "https://SIZNING_GITHUB_URL" } }]
            ],
            resize_keyboard: true
        }
    });
});

// WEB APP'DAN KELGAN DATA
bot.on('web_app_data', async (msg) => {
    try {
        const data = JSON.parse(msg.web_app_data.data);
        const chatId = msg.chat.id;

        if (data.action === 'ORDER') {
            orderNumber++;
            
            let foodList = data.items.map(i => `• ${i.name}`).join('\n');
            
            const report = `📦 BUYURTMA #${orderNumber}\n` +
                           `👤 Mijoz: ${msg.from.first_name} ${msg.from.last_name || ''}\n` +
                           `📞 Tel: ${data.phone}\n` +
                           `📍 Manzil: ${data.address}\n\n` +
                           `🍱 Taomlar:\n${foodList}\n\n` +
                           `💰 Jami: ${data.total.toLocaleString()} so'm\n` +
                           `💳 To'lov turi: ${data.method}`;

            // Adminga va Kuryerga yuborish
            await bot.sendMessage(ADMIN_ID, report);
            await bot.sendMessage(COURIER_ID, report);

            // Mijozga yuboriladigan xabar
            let responseMsg = `Buyurtmangiz qabul qilindi!\n\n` +
                              `Buyurtma raqami: #${orderNumber}\n` +
                              `Jami summa: ${data.total.toLocaleString()} so'm\n\n`;

            if (data.method.includes('Karta')) {
                responseMsg += `⚠️ To'lov qilganingizdan keyin adminga (@shakhriyarr) to'lov cheki va buyurtma raqamini (#${orderNumber}) yuboring!`;
            } else {
                responseMsg += `Kuryer tez orada bog'lanadi.`;
            }

            await bot.sendMessage(chatId, responseMsg);
        }

        if (data.action === 'ADMIN_ADD') {
            await bot.sendMessage(ADMIN_ID, `🍱 YANGI TAOM QO'SHILDI:\n\nNomi: ${data.name}\nNarxi: ${data.price} so'm`);
        }

    } catch (err) {
        bot.sendMessage(ADMIN_ID, "Xatolik: " + err.message);
    }
});

console.log("Bot 8664449888 tokeni bilan ishga tushdi!");
