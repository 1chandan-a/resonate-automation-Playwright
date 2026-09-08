# Question 2: Detailed Test Cases

## Selected suite: Functional testing

I selected the Functional Test Suite because it validates the business
workflow from eligible customer data through survey completion and response
availability. Functional tests verify business rules and user-visible
outcomes; integration, performance, and security concerns are covered by their
own suites.

The current repository automates the customer survey UI portion. SFTP,
invitation delivery, portal analytics, and database checks require connected
test-environment services and are therefore documented as integration points,
not simulated by the UI test.

## Common preconditions

1. The test environment and survey service are available.
2. The survey template is active.
3. The customer has a valid survey session.
4. The browser can access the survey URL.
5. The test data is isolated from production.
6. A response API or database is available when persistence is being verified.

## Test cases

### TC-FUNC-001: Eligible customer completes a survey

**Test data:** Active customer, valid score, valid feature, and valid feedback.

**Steps and expected results:**

1. Open the survey URL. The survey loads.
2. Select score `1`, `3`, or `5`. The selected score is checked.
3. Select a valid product feature. The feature is checked.
4. Enter feedback. The entered value is retained.
5. Click `Next` until the final page. Navigation succeeds.
6. Click `Complete`. The completion confirmation is displayed.
7. If an API is configured, query the response by customer ID. Exactly one
   matching response is returned.

**Pass criteria:** All expected results succeed and the response is associated
with the correct customer/session.

**Fail criteria:** A required action fails, confirmation is absent, or the
response is missing or associated with another customer.

### TC-FUNC-002: Suppressed customer does not receive a survey

**Test data:** Active customer with `suppressed = true`.

1. Process the customer trigger data.
2. Check the invitation result.

**Expected result:** No invitation is generated or sent.

**Pass criteria:** The customer is excluded and the exclusion is auditable.

### TC-FUNC-003: Opted-out customer does not receive a survey

**Test data:** Customer with an active opt-out flag.

1. Process the customer trigger data.
2. Check the invitation result.

**Expected result:** No invitation is generated or sent.

**Pass criteria:** Opt-out suppression is applied using the latest data.

### TC-FUNC-004: Mandatory question validation

**Test data:** Valid survey session with one required answer omitted.

1. Open the survey.
2. Leave the required question unanswered.
3. Click `Next` or `Complete`.

**Expected result:** Progression is blocked and validation feedback is shown.
No successful completion message is displayed.

**Pass criteria:** Incomplete data cannot be submitted.

> This case should be enabled in the Playwright project only after the
> controlled survey environment confirms which questions are mandatory. The
> public demo does not provide a stable required-field contract.

### TC-FUNC-005: Invalid survey data is rejected

**Test data:** Invalid score, invalid session/token, malformed input, and
feedback exceeding the documented maximum length.

1. Submit the invalid data.
2. Observe validation and response behavior.

**Expected result:** Invalid data is rejected safely, with a clear validation
message and no persisted response.

### TC-FUNC-006: Duplicate survey submission is prevented

**Test data:** One valid survey session submitted twice.

1. Complete the survey once.
2. Repeat the completion action or reuse the same submission token.
3. Query the response store when available.

**Expected result:** The UI remains completed and no second backend response is
created.

The current project automates the UI state assertion. The backend duplicate
check requires the optional response API verifier.

### TC-FUNC-007: Response is reflected in analytics

**Test data:** A valid response with a known score and customer ID.

1. Submit the response.
2. Wait for the documented processing interval.
3. Query the portal or analytics API.

**Expected result:** The response appears once and contributes the expected
score to the relevant aggregate.

### TC-FUNC-008: Data variations

Execute TC-FUNC-001 with:

| Customer ID | Score | Feature | Feedback |
|---|---:|---|---|
| CUST001 | 1 | Performance | Poor experience |
| CUST002 | 3 | Ease of use | Average experience |
| CUST003 | 5 | Customization options | Excellent experience |

Also cover empty, maximum-length, and special-character feedback, invalid
customer identifiers, duplicate transaction identifiers, opted-out customers,
and suppressed customers.

## Critical failure points and mitigation

| Failure point | Impact | Likely cause | Mitigation |
|---|---|---|---|
| Eligible customer receives no invitation | Lost feedback | Eligibility or ingestion defect | Reconcile input and invitation counts |
| Opted-out customer receives invitation | Privacy/compliance incident | Stale suppression data | Validate suppression immediately before sending |
| Wrong customer receives invitation | Privacy/data-integrity incident | Incorrect field mapping | Validate identifiers and contact mapping |
| Valid response cannot be submitted | Lost feedback | UI, API, or database failure | Retry safe operations and monitor failures |
| Response is lost | Incorrect analytics | Queue, transaction, or persistence failure | Reconciliation and durable retry processing |
| Duplicate response is stored | Incorrect reporting | Non-idempotent retry | Unique submission ID and database constraint |
| Analytics omit the response | Incorrect business decision | ETL/cache/aggregation delay | Reprocessing and freshness monitoring |

## Automation mapping

The executable UI implementation is in `tests/survey.spec.js`, using the Page
Object Model in `pages/SurveyPage.js` and data in
`test-data/surveyData.js`. The GitHub Actions workflow runs the automated
portion. Backend cases require a controlled environment and are not claimed as
passing based only on the public UI demo.
