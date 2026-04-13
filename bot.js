const TelegramBot = require('node-telegram-bot-api');

const token = '8664449888:AAFh_QEzGrqYLRbZESRWPG9Twwx60KmmgQk';
const bot = new TelegramBot(token, {polling: true});

const ADMIN_ID = 8448862547;
const COURIER_ID = 7312694067;

// Buyurtmalar sonini saqlash (oddiy hisoblagich)
let orderCounter = 120; // Xohlagan raqamdan boshlang

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, `Assalomu alaykum ${msg.from.first_name}! Shokh Food botiga xush kelibsiz.`, {
        reply_markup: {
            keyboard: [[{ text: "🛒 Menyu / Buyurtma", web_app: { url: "https://SIZNING_GITHUB_URL" } }]],
            resize_keyboard: true
        }
    });
});

bot.on('web_app_data', async (msg) => {
    try {
        const data = JSON.parse(msg.web_app_data.data);
        const chatId = msg.chat.id;

        if (data.type === 'ORDER') {
            orderCounter++; // Har bir buyurtmada raqam bittaga oshadi
            
            let itemsText = data.items.map(i => `• ${i.name}`).join('\n');
            
            const report = `📦 BUYURTMA #${orderCounter}\n` +
                `👤 Mijoz: ${msg.from.first_name}\n` +
                `📞 Tel: ${data.phone}\n` +
                `📍 Manzil: ${data.address}\n\n` +
                `🍱 Taomlar:\n${itemsText}\n\n` +
                `💰 Jami: ${data.total.toLocaleString()} so'm\n` +
                `💳 To'lov: ${data.payMethod}`;

            // 1. Adminga va Kuryerga hisobot
            await bot.sendMessage(ADMIN_ID, report);
            await bot.sendMessage(COURIER_ID, report);

            // 2. Mijozga tasdiqlash xabari (belgisiz, matnli)
            let clientMessage = `Buyurtmangiz qabul qilindi!\n\n` +
                `Buyurtma raqami: #${orderCounter}\n` +
                `Jami summa: ${data.total.toLocaleString()} so'm\n\n`;

            if (data.payMethod.includes('Karta')) {
                clientMessage += `⚠️ To'lov qilganingizdan keyin adminga (@shakhriyarr) to'lov cheki va buyurtma raqamini (#${orderCounter}) yuboring!`;
            } else {
                clientMessage += `Kuryerimiz tez orada siz bilan bog'lanadi.`;
            }

            await bot.sendMessage(chatId, clientMessage);
        }

        if (data.type === 'ADMIN_ADD') {
            await bot.sendMessage(ADMIN_ID, `✅ Yangi taom qo'shildi:\n${data.name} - ${data.price} so'm`);
        }

    } catch (e) {
        bot.sendMessage(ADMIN_ID, "Xatolik yuz berdi: " + e.message);
    }
});

console.log("Shokh Food Bot ishga tushdi...");
