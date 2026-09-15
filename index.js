require('dotenv').config();

const express = require('express');
const { VK, Keyboard } = require('vk-io');

const token = process.env.VK_TOKEN;
const PORT = process.env.PORT || 3000;

if (!token) {
    console.error('❌ Не найден VK_TOKEN в .env');
    process.exit(1);
}

const app = express();

app.get('/', (req, res) => {
    res.status(200).send('FRIDE VPN VK BOT OK');
});

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        bot: 'FRIDE VPN VK BOT',
        uptime: process.uptime()
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 HTTP сервер запущен на порту ${PORT}`);
});

const vk = new VK({
    token,
    apiVersion: '5.199'
});

const telegramKeyboard = Keyboard.builder()
    .urlButton({
        label: '🤖 Открыть Telegram',
        url: 'https://t.me/FRIDEVPNOFFICIALbot'
    })
    .inline();

const mainKeyboard = Keyboard.builder()
    .textButton({
        label: '🤖 Telegram',
        payload: JSON.stringify({ command: 'telegram' }),
        color: Keyboard.POSITIVE
    })
    .textButton({
        label: 'ℹ️ О FRIDE VPN',
        payload: JSON.stringify({ command: 'about' }),
        color: Keyboard.PRIMARY
    })
    .row()
    .textButton({
        label: '🛠 Поддержка',
        payload: JSON.stringify({ command: 'support' }),
        color: Keyboard.SECONDARY
    })
    .inline();

async function sendWelcome(context) {
    const message =
        '👋 Добро пожаловать в FRIDE VPN!\n\n' +
        '⚡️ Стабильные VPN-серверы\n' +
        '🌍 Быстрое соединение\n' +
        '🔐 Надёжная защита\n' +
        '📱 Поддержка мобильных устройств\n\n' +
        '━━━━━━━━━━━━━━━━━━\n\n' +
        '📢 VK-бот FRIDE VPN сейчас находится в разработке.\n\n' +
        'Но основной бот уже доступен в Telegram!\n\n' +
        '👇 Нажмите кнопку ниже, чтобы перейти в Telegram.';

    await context.send(message, {
        keyboard: telegramKeyboard
    });
}

vk.updates.on('message_new', async (context) => {
    try {
        const text = (context.text || '').trim().toLowerCase();

        console.log(
            `[VK] Пользователь ${context.senderId}: ${context.text || '[без текста]'}`
        );

        let payload = {};

        if (context.messagePayload) {
            if (typeof context.messagePayload === 'string') {
                try {
                    payload = JSON.parse(context.messagePayload);
                } catch {
                    payload = {};
                }
            } else {
                payload = context.messagePayload;
            }
        }

        if (
            payload.command === 'telegram' ||
            text === 'telegram' ||
            text === 'телеграм'
        ) {
            await context.send(
                '🤖 FRIDE VPN уже доступен в Telegram!\n\n' +
                'Основной бот проекта находится здесь.\n\n' +
                '👇 Нажмите кнопку ниже.',
                {
                    keyboard: telegramKeyboard
                }
            );
            return;
        }

        if (
            payload.command === 'about' ||
            text === 'о проекте' ||
            text === 'о fride vpn' ||
            text === 'о fride'
        ) {
            await context.send(
                '⚡️ FRIDE VPN\n\n' +
                'Сервис для стабильного и быстрого VPN-соединения.\n\n' +
                '🌍 Стабильные серверы\n' +
                '⚡️ Быстрое соединение\n' +
                '🔐 Защита соединения\n' +
                '📱 Поддержка мобильных устройств\n\n' +
                '📢 VK-бот пока находится в разработке.\n\n' +
                '🤖 Основной бот уже доступен в Telegram.',
                {
                    keyboard: telegramKeyboard
                }
            );
            return;
        }

        if (
            payload.command === 'support' ||
            text === 'поддержка'
        ) {
            await context.send(
                '🛠 Поддержка FRIDE VPN\n\n' +
                'На данный момент основная поддержка доступна через Telegram.\n\n' +
                '👇 Перейдите в Telegram.',
                {
                    keyboard: telegramKeyboard
                }
            );
            return;
        }

        if (
            text === 'начать' ||
            text === 'старт' ||
            text === '/start' ||
            text === 'привет' ||
            text === 'здравствуйте' ||
            text === 'hello' ||
            text === 'hi' ||
            text === ''
        ) {
            await sendWelcome(context);
            return;
        }

        await context.send(
            '👋 Добро пожаловать в FRIDE VPN!\n\n' +
            '📢 VK-бот пока находится в разработке.\n\n' +
            '🤖 Основной бот уже доступен в Telegram.\n\n' +
            '👇 Нажмите кнопку ниже.',
            {
                keyboard: mainKeyboard
            }
        );

    } catch (error) {
        console.error('❌ Ошибка обработки сообщения:', error);
    }
});

async function startBot() {
    try {
        console.log('====================================');
        console.log('🚀 FRIDE VPN VK BOT');
        console.log('====================================');
        console.log('⏳ Подключение к VK...');
        console.log('');

        await vk.updates.start();

        console.log('✅ VK Long Poll подключён');
        console.log('🤖 Бот работает');
        console.log('🌐 HTTP сервер работает');
        console.log('');

    } catch (error) {
        console.error('❌ Ошибка запуска VK:', error);
        console.log('🔄 Повтор через 5 секунд...');
        setTimeout(startBot, 5000);
    }
}

process.on('SIGINT', async () => {
    console.log('\n🛑 Остановка...');
    try {
        await vk.updates.stop();
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    try {
        await vk.updates.stop();
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
});

startBot();