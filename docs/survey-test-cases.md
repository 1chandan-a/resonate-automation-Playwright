# Survey Test Cases

## Scope

This suite validates the customer survey flow implemented by the Playwright
tests in `tests/survey.spec.js`. It covers loading the survey, entering valid
responses, navigating across survey pages, completing the survey, and
verifying the completion message.

## Preconditions

1. Playwright dependencies and browser binaries are installed.
2. The configured SurveyJS URL is reachable.
3. The survey contains:
   - Satisfaction score options 1 through 5.
   - Product feature options.
   - A feedback field.
   - `Next` and `Complete` controls.
4. The test environment has network access to the survey site.
5. A cookie consent banner may be displayed and must not prevent survey use.
6. Each test starts with a new browser page and independent survey state.

## Test Data

| Customer ID | Score | Feature | Feedback |
|---|---:|---|---|
| CUST001 | 1 | Performance | Poor experience |
| CUST002 | 3 | Ease of use | Average experience |
| CUST003 | 5 | Customization options | Excellent experience |

The data variations cover low, medium, and high satisfaction scores and
different product feature selections.

## Positive Test Cases

### TC-SURVEY-001: Submit a survey with valid data

**Data:** Execute once for each row in the test-data table.

**Steps:**

1. Open the survey URL.
2. Dismiss the cookie consent banner if it is displayed.
3. Select the data row's satisfaction score.
4. Select the data row's product feature.
5. Enter the data row's feedback.
6. Click `Next` until the final survey page is displayed.
7. Click `Complete`.

**Expected results:**

1. The survey page loads successfully.
2. The selected score is checked.
3. The selected product feature is checked.
4. The feedback text is present in the feedback field.
5. The survey advances to the final page.
6. The survey is completed successfully.
7. `Thank you for completing the survey` is displayed.

**Pass criteria:** Every expected result is achieved and no error is raised.

**Fail criteria:** Any required control is missing, any value cannot be
selected or entered, navigation fails, or the completion message is absent.

### TC-SURVEY-002: Submit surveys for score boundary values

**Data:** Score `1` and score `5`, using valid feature and feedback values.

**Steps:**

1. Open a new survey session.
2. Select score `1` and complete the survey.
3. Open another new survey session.
4. Select score `5` and complete the survey.

**Expected results:**

- Both boundary scores can be selected.
- Each submission completes independently.
- Each submission displays the completion message.

**Pass criteria:** Both boundary-value submissions succeed without changing
the selected score.

### TC-SURVEY-003: Submit a survey with special-character feedback

**Data:**

```text
The product is useful: great value & easy to use.
Quotes: "excellent"; symbols: < > ' "
```

**Steps:**

1. Open the survey.
2. Select a valid score and feature.
3. Enter the special-character feedback.
4. Complete the survey.

**Expected results:**

- The text is accepted without UI corruption.
- Special characters are treated as text, not executable markup.
- The survey completes successfully.

## Negative Test Cases

### TC-SURVEY-004: Open the survey with a missing URL

**Steps:**

1. Call the page object's survey-opening method with an empty URL.

**Expected result:** The test fails immediately with `Survey URL is missing`.

**Pass criteria:** Invalid input is rejected with the expected error.

### TC-SURVEY-005: Attempt completion without required answers

**Steps:**

1. Open a new survey session.
2. Do not select required survey options.
3. Attempt to navigate or complete the survey.

**Expected result:** The survey prevents progression or displays validation
feedback, and no successful completion message is shown.

**Pass criteria:** Incomplete data cannot be submitted as a successful response.

### TC-SURVEY-006: Prevent duplicate completion

**Steps:**

1. Complete a valid survey.
2. Attempt to click `Complete` again or refresh the completion page.

**Expected result:** A duplicate response is not created and the application
maintains a completed state.

**Pass criteria:** Only one response is recorded for the survey session.

## Critical Failure Points

| Failure point | Impact | Possible cause | Mitigation |
|---|---|---|---|
| Survey URL unavailable | Customers cannot respond | Network or service outage | Health checks, retry policy, alerting |
| Cookie banner blocks the form | Test or customer cannot interact | Consent overlay timing | Handle consent explicitly and verify it is dismissed |
| Score is not saved | Incorrect analytics | UI state or event-handling defect | Assert the selected option before continuing |
| Feature selection is lost | Incomplete or incorrect response | Dynamic page re-render | Assert the selected feature before navigation |
| Feedback is truncated or altered | Customer comments lose meaning | Length or encoding defect | Test boundary length and special characters |
| Next navigation fails | Survey cannot be completed | Page transition or validation defect | Verify each transition and capture screenshots |
| Complete action fails | Response is not submitted | API or browser interaction failure | Retry safe actions and validate confirmation |
| Duplicate response is created | Analytics become inaccurate | Double click or retry without idempotency | Disable duplicate submission and test repeated actions |
| Wrong survey/customer context | Privacy and reporting risk | Invalid or reused survey token | Validate survey-session identity server-side |

## Automation Mapping

| Test activity | Current implementation |
|---|---|
| Open survey | `SurveyPage.openSurvey()` |
| Select score | `SurveyPage.selectScore()` |
| Select feature | `SurveyPage.selectRecommendation()` |
| Enter feedback | `SurveyPage.enterFeedback()` |
| Navigate to final page | `SurveyPage.moveToSubmitSurvey()` |
| Complete survey | `SurveyPage.submitSurvey()` |
| Verify success | `SurveyPage.verifySubmissionSuccess()` |
| Data variation | `test-data/surveyData.js` |

## Automated Test Coverage

The following cases are automated in `tests/survey.spec.js`:

| Test case | Automated coverage |
|---|---|
| TC-SURVEY-001 | Three data-driven valid submissions |
| TC-SURVEY-002 | Scores `1`, `3`, and `5`, including both boundaries |
| TC-SURVEY-003 | Special-character feedback submission |
| TC-SURVEY-004 | Missing URL validation |
| TC-SURVEY-006 | Completion state prevents a second UI completion |

TC-SURVEY-005 requires a confirmed required-field rule in the live survey.
The current public demo does not expose a stable required-field contract for
all questions, so this case should be automated against a controlled test
environment or API contract. TC-SURVEY-006 also verifies the UI state only;
proving that no duplicate backend record exists requires an API or database
assertion.

## Overall Suite Pass Criteria

The suite passes when all valid data variations complete successfully, all
required controls behave as expected, invalid input is rejected appropriately,
and no duplicate or incorrect response is accepted.

The suite fails when a required workflow step cannot be completed, invalid
data is accepted incorrectly, the completion state is not shown, or a
critical failure causes data loss, duplication, or incorrect customer
association.
