# Architecture and trust boundaries

## Current prototype

The application uses Expo Router and a local React context. A floating simulator emits mock food, weight, battery, and connection states. Screens consume those states to demonstrate measurement, nutrition, and trend interactions. AsyncStorage is used only for local prototype preferences and records.

```text
Floating simulator
       |
       v
Local app state ---> measurement UI ---> meal history/trends
       |
       +-----------> device-status presentation
```

There is no camera model, device transport, cloud backend, or production nutrition service in this release.

## Planned adapter boundary

Future hardware work should enter through replaceable, typed adapters rather than directly updating UI state:

- `RecognitionAdapter`: candidate food, confidence, and recognition lifecycle
- `ScaleAdapter`: raw weight, stable weight, tare acknowledgement, and unit-independent grams
- `DeviceAdapter`: connection, battery, firmware version, and error states
- `NutritionAdapter`: attributed food records and per-100g nutrient data

Public fixtures should exercise these contracts without requiring a vendor device. Proprietary protocols, calibration values, credentials, and model weights must remain outside this repository.

## Data and safety

- Nutrition values in the prototype are illustrative and not clinically validated.
- Do not commit real user dietary histories or identifiable images.
- Human review is required for AI-generated changes.
- Production integrations should add explicit consent, retention, threat-model, and failure-state requirements.
