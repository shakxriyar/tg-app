const { Telegraf, Markup } = require('telegraf');
const bot = new Telegraf('Sizning_Bot_Tokeningiz');

const ADMIN_ID = 8448862547; // Sizning ID
const WEB_APP_URL = 'https://shakxriyarr-commits.github.io/tg-app/';

bot.start((ctx) => {
    ctx.reply(`Assalomu alaykum, ${ctx.from.first_name}! Shokh Food botiga xush kelibsiz.`, 
        Markup.keyboard([
            [Markup.button.webApp("🍴 Menyuni ochish", WEB_APP_URL)]
        ]).resize()
    );
});

// Mini Appdan ma'lumot kelishi
bot.on('web_app_data', async (ctx) => {
    try {
        const data = JSON.parse(ctx.webAppData.data());
        let text = "🛒 Savatchangiz:\n\n";
        data.items.forEach(i => text += `• ${i.name} - ${i.price.toLocaleString()} so'm\n`);
        text += `\n💰 Jami: ${data.total.toLocaleString()} so'm\n💳 To'lov: ${data.method}`;

        // Ma'lumotni saqlab qo'yamiz va telefon so'raymiz
        ctx.reply(text + "\n\nIltimos, telefon raqamingizni yuboring:", 
            Markup.keyboard([[Markup.button.contactRequest("📞 Raqamni yuborish")]]).oneTime().resize()
        );
        
        // Keyingi qadamlar uchun vaqtincha ma'lumotni sessionga qo'shish (ixtiyoriy)
        bot.tempData = { orderText: text }; 
    } catch (e) {
        ctx.reply("Ma'lumotlarni qayta ishlashda xatolik.");
    }
});

// Raqam kelganda lokatsiya so'rash
bot.on('contact', (ctx) => {
    bot.tempData.phone = ctx.message.contact.phone_number;
    ctx.reply("Rahmat! Endi manzilingizni (Lokatsiya) yuboring:", 
        Markup.keyboard([[Markup.button.locationRequest("📍 Lokatsiyani yuborish")]]).oneTime().resize()
    );
});

// Lokatsiya kelganda hammasini Adminga yuborish
bot.on('location', async (ctx) => {
    const loc = ctx.message.location;
    const finalMsg = `🆕 YANGI BUYURTMA!\n\n${bot.tempData.orderText}\n👤 Mijoz: ${ctx.from.first_name}\n📞 Tel: ${bot.tempData.phone}`;

    // Adminga yuborish
    await bot.telegram.sendMessage(ADMIN_ID, finalMsg);
    await bot.telegram.sendLocation(ADMIN_ID, loc.latitude, loc.longitude);

    ctx.reply("✅ Buyurtmangiz qabul qilindi! Tez orada kuryer bog'lanadi.", 
        Markup.keyboard([[Markup.button.webApp("🍴 Menyu", WEB_APP_URL)]]).resize()
    );
});

bot.launch();
console.log("Shokh Bot ishga tushdi!");
