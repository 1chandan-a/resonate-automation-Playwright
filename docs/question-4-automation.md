# Question 4: Automation Implementation

## Scenario-to-code mapping

The Gherkin Scenario Outline is in `features/survey-submission.feature`.
Its examples map to `test-data/surveyData.js`.

| Gherkin step | Implementation |
|---|---|
| Customer survey is available | `SurveyPage.openSurvey()` |
| Selects score | `SurveyPage.selectScore()` |
| Selects a valued feature | `SurveyPage.selectRecommendation()` |
| Enters feedback | `SurveyPage.enterFeedback()` |
| Completes the survey | `moveToSubmitSurvey()` and `submitSurvey()` |
| Completion message is displayed | `verifySubmissionSuccess()` |

`tests/survey.spec.js` executes the scenario data-driven for each example row.
`pages/SurveyPage.js` provides the Page Object Model, while
`utils/logger.js` provides execution logging and failure logging.

## Retry strategy

`playwright.config.js` uses no retries locally and two retries in CI when
`CI` is set. Traces are collected on the first retry, screenshots are captured
on failure, and videos are retained on failure.

The optional persistence check polls its API because response processing may be
asynchronous. It retries five times by default and waits two seconds between
attempts. Override these with `RESPONSE_API_ATTEMPTS` and
`RESPONSE_API_DELAY_MS`.

Retries do not replace assertions: the final attempt must still pass.

## Optional response persistence verification

The public SurveyJS demo has no test response API, so UI completion alone
cannot prove backend persistence. For a controlled environment, configure:

```text
RESPONSE_API_URL_TEMPLATE=https://test.example/api/responses/{customerId}
RESPONSE_API_TOKEN=<secret>
```

The endpoint must return a successful response with JSON containing the
matching `customerId`. The implementation is in
`utils/responseVerifier.js`. Store tokens in GitHub Actions Secrets.

## GitHub Actions CI/CD

`.github/workflows/playwright.yml` runs on pushes and pull requests. It checks
out the repository, installs Node dependencies and browsers, runs Playwright,
and uploads the HTML report and test artifacts. Optional API variables are
passed through GitHub Actions variables and secrets.
