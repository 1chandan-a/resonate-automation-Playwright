require('dotenv').config();

const { test, expect } = require('@playwright/test');
const { SurveyPage } = require('../pages/SurveyPage');
const { surveyTestData } = require('../test-data/surveyData');
const { Logger } = require('../utils/logger');
const { verifyResponsePersistence } = require('../utils/responseVerifier');

const SURVEY_URL = process.env.SURVEY_URL || 'https://surveyjs.io/form-library/examples/save-and-restore-user-responses-to-complete-survey/reactjs';

async function completeSurvey(surveyPage, data) {
    await surveyPage.openSurvey(SURVEY_URL);
    await surveyPage.selectScore(data.score);
    await surveyPage.selectRecommendation(data.recommendation);
    await surveyPage.enterFeedback(data.feedback);
    await surveyPage.moveToSubmitSurvey();
    await surveyPage.submitSurvey();
    await surveyPage.verifySubmissionSuccess();
}

for (const data of surveyTestData) {
    test(`Submit survey - Score ${data.score} - ${data.recommendation}`, async({ page }) => {

        const surveyPage = new SurveyPage(page);

        Logger.info(`Starting test with score: ${data.score}`);

        try {

            Logger.info('Opening SurveyJS survey');

            Logger.info(`Selecting score: ${data.score}`);

            await completeSurvey(surveyPage, data);

            Logger.info('Checking confirmation message');

            Logger.pass(`Survey submitted successfully - Score ${data.score}`);

        } catch (error) {

            Logger.error(`Survey test failed - Score ${data.score}`, error);

            throw error;
        }
    });
}

test('Rejects a missing survey URL', async({ page }) => {
    const surveyPage = new SurveyPage(page);

    await expect(surveyPage.openSurvey('')).rejects.toThrow('Survey URL is missing');
});

test('Submits feedback containing special characters', async({ page }) => {
    const surveyPage = new SurveyPage(page);
    const specialCharacterData = {
        score: '3',
        recommendation: 'Ease of use',
        feedback: 'Great value & easy to use. "Excellent" <quality> & support.'
    };

    await completeSurvey(surveyPage, specialCharacterData);
    await surveyPage.verifyCompletionIsFinal();
});

test('Prevents completing the same survey twice in the UI', async({ page }) => {
    const surveyPage = new SurveyPage(page);
    const data = surveyTestData[0];

    await completeSurvey(surveyPage, data);
    await surveyPage.verifyCompletionIsFinal();
});

test('Verifies response persistence when an API is configured', async({ page, request }) => {
    test.skip(!process.env.RESPONSE_API_URL_TEMPLATE,
        'Configure RESPONSE_API_URL_TEMPLATE to enable API persistence verification'
    );

    const surveyPage = new SurveyPage(page);
    const data = surveyTestData[0];

    await completeSurvey(surveyPage, data);
    await verifyResponsePersistence(request, data.customerId);
});