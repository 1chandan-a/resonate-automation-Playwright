const { expect } = require('@playwright/test');
const { Logger } = require('../utils/logger');

class SurveyPage {
    constructor(page) {
        this.page = page;

        this.surveyJSLogo = page.locator('[aria-label="SurveyJS"]').first();

        this.satisfactionOptions = page.locator('input[name="satisfaction-score_sq_1"]');

        this.feedbackField = page.locator('div.sd-comment textarea#sq_3i');

        this.nextButton = page.getByRole('button', { name: 'Next', exact: true });
        this.completeButton = page.getByRole('button', { name: 'Complete', exact: true });

        this.confirmationMessage = page.getByText('Thank you for completing the survey');

        this.acceptCookiesLink = page.getByRole('link', { name: 'Accept All' });
    }

    async openSurvey(url) {
        if (!url) {
            throw new Error('Survey URL is missing');
        }

        Logger.info(`Opening survey: ${url}`);
        await this.page.goto(url, { waitUntil: 'domcontentloaded' });
        Logger.info(`Current URL: ${this.page.url()}`);

        if (await this.acceptCookiesLink.isVisible()) {
            Logger.info('Accepting cookie settings');
            await this.page.evaluate(() => {
                if (typeof window.hideCookieInfo === 'function') {
                    window.hideCookieInfo();
                }
            });
        }

        await expect(this.surveyJSLogo).toBeVisible();
        await expect(this.satisfactionOptions.first()).toBeVisible({ timeout: 15000 });
        Logger.info('Survey loaded successfully');
    }


    async selectScore(score) {
        const option = this.page.locator(
            `input[name="satisfaction-score_sq_1"][value="${score}"]`
        );

        await expect(option).toBeAttached();
        await this.page.evaluate((selectedScore) => {
            const input = document.querySelector(
                `input[name="satisfaction-score_sq_1"][value="${selectedScore}"]`
            );

            if (!input) {
                throw new Error(`Score option "${selectedScore}" is missing`);
            }

            input.click();
        }, String(score));
        await expect(option).toBeChecked();
    }

    async selectRecommendation(recommendation) {
        const option = this.page
            .locator(`//input[@value="${recommendation}"]/following-sibling::span[contains(@class, "sd-checkbox__decorator")]`)
        await option.check();
        await expect(option).toBeChecked();

    }

    async enterFeedback(feedback) {
        await this.feedbackField.scrollIntoViewIfNeeded();
        await expect(this.feedbackField).toBeVisible();
        await this.feedbackField.click();
        await this.feedbackField.fill(feedback);
        await expect(this.feedbackField).toHaveValue(feedback);
    }

    async moveToSubmitSurvey() {
        for (let i = 0; i < 5; i++) {
            if (await this.completeButton.isVisible().catch(() => false)) {
                return;
            }

            await expect(this.nextButton).toBeVisible();
            await this.nextButton.click({ force: true });
        }

        throw new Error('Could not reach final survey page');
    }
    async submitSurvey() {
        await expect(this.completeButton).toBeVisible();
        await this.completeButton.click({ force: true });
    }

    async verifySubmissionSuccess() {
        await expect(this.confirmationMessage).toBeVisible();
    }

    async verifyCompletionIsFinal() {
        await expect(this.confirmationMessage).toBeVisible();
        await expect(this.completeButton).toBeHidden();
    }
}

module.exports = { SurveyPage };