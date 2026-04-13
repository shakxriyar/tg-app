const TelegramBot = require('node-telegram-bot-api');

// MA'LUMOTLAR
const token = '8664449888:AAFh_QEzGrqYLRbZESRWPG9Twwx60KmmgQk'; // BotFather'dan olingan token
const bot = new TelegramBot(token, {polling: true});

const ADMIN_ID = 8448862547;
const COURIER_ID = 7312694067;

// START BUYRUG'I
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Assalomu alaykum, ${msg.from.first_name}!\nShokh Food botiga xush kelibsiz!`, {
        reply_markup: {
            keyboard: [
                [{ text: "🛒 Menyu / Buyurtma berish", web_app: { url: "YOUR_GITHUB_PAGES_URL" } }]
            ],
            resize_keyboard: true
        }
    });
});

// WEB APP'DAN KELADIGAN MA'LUMOTLARNI TUTISH
bot.on('web_app_data', async (msg) => {
    const chatId = msg.chat.id;
    const rawData = msg.web_app_data.data;
    const data = JSON.parse(rawData);

    // 1. AGAR YANGI BUYURTMA BO'LSA
    if (data.action === 'NEW_ORDER') {
        let itemsString = data.items.map(i => `• ${i.name} - ${i.price.toLocaleString()} so'm`).join('\n');
        
        const report = `🔔 YANGI BUYURTMA!\n\n` +
                       `👤 Mijoz: ${data.user.first_name} (@${data.user.username || 'yoq'})\n` +
                       `🆔 ID: ${data.user.id}\n\n` +
                       `📦 Taomlar:\n${itemsString}\n\n` +
                       `💰 Jami summa: ${data.total.toLocaleString()} so'm\n` +
                       `💳 To'lov turi: ${data.method}`;

        // Mijozga xabar
        await bot.sendMessage(chatId, `✅ Buyurtmangiz qabul qilindi!\nID: #${Math.floor(Math.random()*1000)}\n\nAdmin tez orada bog'lanadi.`);

        // Adminga (Sizga) xabar
        await bot.sendMessage(ADMIN_ID, report);

        // Kuryerga xabar
        await bot.sendMessage(COURIER_ID, report + `\n\n📍 Iltimos, mijoz bilan bog'lanib manzilni aniqlang!`);
    }

    // 2. AGAR ADMIN TAOM QO'SHSA
    if (data.action === 'ADD_FOOD') {
        const adminMsg = `🍱 YANGI TAOM QO'SHILDI:\n\n` +
                         `Nomi: ${data.foodName}\n` +
                         `Narxi: ${data.foodPrice} so'm\n` +
                         `Kategoriya: ${data.foodCategory}`;
        
        await bot.sendMessage(ADMIN_ID, adminMsg);
    }
});

// XATOLIKLARNI TEKSHIRISH
bot.on('polling_error', (error) => {
    console.error("Botda xatolik:", error);
});

console.log("Bot muvaffaqiyatli ishlamoqda...");
