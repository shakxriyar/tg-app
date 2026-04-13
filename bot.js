const TelegramBot = require('node-telegram-bot-api');

// KONFIGURATSIYA
const token = '8664449888:AAFh_QEzGrqYLRbZESRWPG9Twwx60KmmgQk';
const bot = new TelegramBot(token, {polling: true});

const ADMIN_ID = 8448862547;
const COURIER_ID = 7312694067;

// START
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, `Xush kelibsiz Shahriyor! Shokh Food botiga marhamat.`, {
        reply_markup: {
            keyboard: [
                [{ text: "🛒 Menyu / Buyurtma", web_app: { url: "https://SizningGitHubManzilingiz.github.io/" } }]
            ],
            resize_keyboard: true
        }
    });
});

// WEB APP'DAN MA'LUMOT QABUL QILISH
bot.on('web_app_data', async (msg) => {
    try {
        const data = JSON.parse(msg.web_app_data.data);
        const chatId = msg.chat.id;

        // 1. YANGI BUYURTMA
        if (data.type === 'NEW_ORDER') {
            let list = data.items.map(i => `• ${i.name}`).join('\n');
            
            const adminText = `🔔 YANGI BUYURTMA!\n\n` +
                `👤 Mijoz: ${data.user.first_name}\n` +
                `📞 Tel: ${data.phone}\n` +
                `📍 Manzil: ${data.address}\n\n` +
                `🍱 Taomlar:\n${list}\n\n` +
                `💰 Summa: ${data.total.toLocaleString()} so'm\n` +
                `💳 To'lov: ${data.method}`;

            // Adminga
            await bot.sendMessage(ADMIN_ID, adminText);
            // Kuryerga
            await bot.sendMessage(COURIER_ID, adminText);
            // Mijozga
            await bot.sendMessage(chatId, `✅ Rahmat! Buyurtmangiz qabul qilindi.\n\nTez orada kuryer bog'lanadi.`);
        }

        // 2. TAOM QO'SHISH (ADMIN)
        if (data.type === 'ADD_FOOD') {
            await bot.sendMessage(ADMIN_ID, `🍱 BAZAGA QO'SHILDI:\n\nNomi: ${data.name}\nNarxi: ${data.price} so'm`);
        }

    } catch (e) {
        console.log("Xatolik:", e);
        bot.sendMessage(ADMIN_ID, "Web App'dan xato ma'lumot keldi.");
    }
});

console.log("Bot ishga tushdi...");
