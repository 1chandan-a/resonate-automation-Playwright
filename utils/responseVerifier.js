const { expect } = require('@playwright/test');
const { Logger } = require('./logger');

async function verifyResponsePersistence(request, customerId) {
    const template = process.env.RESPONSE_API_URL_TEMPLATE;

    if (!template) {
        throw new Error(
            'RESPONSE_API_URL_TEMPLATE must be configured for response persistence verification'
        );
    }

    const url = template.replace(
        '{customerId}',
        encodeURIComponent(customerId)
    );
    const attempts = Number(process.env.RESPONSE_API_ATTEMPTS || 5);
    const delayMs = Number(process.env.RESPONSE_API_DELAY_MS || 2000);

    for (let attempt = 1; attempt <= attempts; attempt++) {
        const response = await request.get(url, {
            headers: process.env.RESPONSE_API_TOKEN
                ? { Authorization: `Bearer ${process.env.RESPONSE_API_TOKEN}` }
                : undefined
        });

        if (response.ok()) {
            const body = await response.json();
            expect(body.customerId).toBe(customerId);
            Logger.pass(`Response persisted for ${customerId}`);
            return body;
        }

        if (attempt < attempts) {
            Logger.warn(
                `Response not available for ${customerId}; retry ${attempt}/${attempts - 1}`
            );
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }

    throw new Error(
        `Response persistence was not confirmed for ${customerId} after ${attempts} attempts`
    );
}

module.exports = { verifyResponsePersistence };
