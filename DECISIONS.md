# Decisions

## What I built

A small customer-facing financial health snapshot tool. It helps a customer understand their monthly disposable position, explains whether a repayment may be manageable, and lets them compare snapshots over time.

## Why this scope

Mental model has been to focus on this as a feature as much as possible rather than a full scoped project. Meaning that items such as user auth, encrypted data, databases, etc. has been left out, as it would add additional scope not relevant to what I felt is the core task.

## Customer tone

Avoids bold red danger statements, and uses non-threatening language.

## What I left out

Authentication, production persistence, PDF export, secure sharing, complex categorisation.

## What I would do next

Align the UI with a slightly more themed and friendly environment. It is quite basic right now. Also, perform aggregated analysis across statements and highlight the change on the dashboard.

## AI usage

Initially I ran through the spec alongside AI to understand what the expected outcome should look like, what the tech stack should be, and how might I break it down. I then used cursor to build the project and define the steps for each of the features I laid out - the first being defining User data and onboarding flow. Each step required tests to be written which I analysed, followed by manual testing in the browser. I added some E2E tests upon feature slices being ready, then commited and pushed.

## Time spent

Approx 2 hours 15 minutes. I did run out of time, so started to rush a little at the end and did not write E2E tests for the form and dashboard flows.
