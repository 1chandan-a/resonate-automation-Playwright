# Resonate Automation Playwright

This project contains a Playwright-based automated test suite for a customer survey workflow. It follows the Page Object Model (POM) pattern and uses structured test data to validate survey completion behavior against a live SurveyJS demo page.

## Overview

The suite covers:
- Opening the survey URL
- Selecting a satisfaction score
- Choosing a product feature
- Entering feedback text
- Navigating through multi-page survey flow
- Completing the survey
- Verifying completion state
- Running validation checks for invalid or missing input
- Optional API response verification when a backend endpoint is configured

## Project structure

- `tests/` - Playwright test specs
- `pages/` - Page Object Model classes
- `test-data/` - Survey datasets and input variations
- `utils/` - Logging and optional response verification helpers
- `docs/` - Test-case documentation and automation notes
- `features/` - Gherkin feature documentation
- `.github/workflows/` - CI workflow for GitHub Actions
- `playwright.config.js` - Playwright configuration

## Tech stack

- Playwright
- JavaScript (CommonJS)
- Node.js
- dotenv for environment-based configuration

## Prerequisites

Install Node.js 18 or later.

Then install dependencies:

```bash
npm install
```

## Running tests

Run the full suite:

```bash
npm test
```

Run headed mode:

```bash
npm run test:headed
```

Run only Chromium:

```bash
npm run test:chromium
```

Run Chromium in headed mode:

```bash
npm run test:chromium:headed
```

## Environment variables

Optional response verification can use the following environment variables:

- `RESPONSE_API_URL_TEMPLATE`
- `RESPONSE_API_TOKEN`
- `RESPONSE_API_ATTEMPTS`
- `RESPONSE_API_DELAY_MS`

If no API URL is configured, the optional persistence validation test is skipped.

## CI/CD

The project includes a GitHub Actions workflow in:

- `.github/workflows/playwright.yml`

This workflow installs dependencies, configures Playwright browsers, runs tests, and stores reports and artifacts.

## Documentation

Relevant documentation is stored in:

- `docs/survey-test-cases.md`
- `docs/question-2-final.md`
- `docs/question-4-automation.md`
- `features/survey-submission.feature`

## Notes

This repository demonstrates UI automation for a public survey form. Some broader enterprise scenarios such as SFTP ingestion, invitation delivery, suppression logic, analytics validation, and backend persistence checks are documented as design/integration cases and require a controlled environment or API access.

## License

ISC
