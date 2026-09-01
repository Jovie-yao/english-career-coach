# English Career Coach — Version History

## V1.2.0 — Recovery Stable

Status: Stable

Main Features:
- Vocabulary
- Expressions
- Listen & Shadow
- Recording
- 90-second Interview
- Attempt History

Snapshot:
versions/v1.2.0-recovery.html

Commit:
e8ce7ff6cd5c262a42ad3b46a41779069cfb49b2

## V1.2.1 — Speaking Feedback

Status: Stable

Main Changes:
- Overall Speaking Score
- Speech Accuracy
- Completeness
- Basic Fluency Estimate
- Pace / WPM
- Model vs Transcript
- Actionable Feedback
- Try Again Score Comparison

Snapshot:
versions/v1.2.1-speaking-feedback.html

Commit:
786df01223c876c38a1e2af8e1b42c3f3bf483cf

## V1.2.2 — Speaking Feedback Calibration

Status:
Stable — User Accepted / Frozen

User Acceptance:
Passed

Frozen:
2026-09-02

Acceptance Notes:
- Listen & Shadow completed real user experience verification.
- Speaking Feedback meets the requirements for the current phase.
- This version is the official stable recovery point for Phase 1.2.
- Future development must not overwrite the V1.2.2 snapshot.
- New features must continue under a new version number.

Main Changes:
- Active Speaking Duration
- Pace calibration
- Fluency calibration
- Content-word weighting
- Function-word weighting
- Recognition uncertainty handling
- Improved feedback priority
- Next Attempt coaching
- Collapsed scoring explanation

Snapshot:
versions/v1.2.2-feedback-calibration.html

Commit:
15f9dcb49718c8f4371d262315acdff5b85178fd

## Phase Status

Phase 1.2:
Completed

Final Stable Version for Phase 1.2:
V1.2.2 — Speaking Feedback Calibration

Stable Snapshot:
versions/v1.2.2-feedback-calibration.html

Production Base Commit:
58db04951845c35824b28b3a730115cd803772a2

## Recovery Rule

If a future version fails or needs to be restored, recover this version first:

V1.2.2 — Speaking Feedback Calibration

Snapshot:
versions/v1.2.2-feedback-calibration.html

Production Base Commit:
58db04951845c35824b28b3a730115cd803772a2

Do not modify this historical snapshot.

## V1.3.0 — Daily Session Foundation

Status: Stable

Phase:
Phase 1.3 — Daily Learning System

Main Changes:
- Today entry with Not Started, In Progress, and Completed states
- Standard Daily Plan and weighted session progress
- Guided Review, Learn, Shadow, Speak, and Wrap-up session
- Review Foundation with Got it / Needs Practice (no scheduling engine)
- Existing Vocabulary and Expressions integrated into Day 1 data
- V1.2.2 calibrated Shadowing logic reused in the daily context
- 90-second free-speaking challenge, verified transcript fallback, and self review
- Real-time versioned localStorage persistence, Save & Exit, and precise resume
- Day Complete state and reusable Day 1 content architecture

Snapshot:
versions/v1.3.0-daily-session-foundation.html

Not Included Yet:
- Review Engine
- Mastery System
- Active Vocabulary
- Adaptive Load
- Quick / Focus modes
- Full Progress system

Test Notes:
- Critical Day 1 flow, refresh/resume, 390px layout, independent library regression, recording/playback, and unavailable-transcript fallback passed locally.
- Real human SpeechRecognition scoring was not completed in the execution environment.
