# CyberLex Lab — Game Edition

**Interactive Cyber Law, Security & Digital Evidence Simulator**

**Copyright (C) 2026 Mohammad Amir Khusru Akhtar**

Created for student hands-on learning by **Dr. Mohammad Amir Khusru Akhtar, Faculty of Computing & Information Technology, Usha Martin University**.

## Experience

`LEARN → EXPERIENCE → DECIDE → INVESTIGATE → DISCOVER LAW → TEST → SCORE → UNLOCK`

CyberLex Lab is a browser-native Progressive Web App designed to be deployed directly through GitHub Pages. Students open one link on a phone or laptop. No account, API key, Python server or database is required.

The simulator contains **33 sequential missions** organized into **6 investigation zones plus a final capstone zone**. A mission unlocks only after the previous mission is cleared. Each standard mission requires a mastery score of **at least 67%**; the final assessment requires **70%**.

## Student experience

- Mobile-first game interface
- Synthetic seeded incidents
- Five-dimensional scoring: Evidence, Privacy, Judgment, Response, Investigation
- Locked progression
- Badges and ranks
- Browser/privacy lab
- Authentication vs authorization
- OTP and social-engineering decisions
- Phishing detective
- URL X-Ray
- HTTPS trust lab
- Fake-login simulation (never accepts real credentials)
- Deepfake legal-risk simulator
- Fake social-media incident
- Cyberbullying response
- Copyright/open-source/plagiarism decisions
- Evidence desk
- Metadata lab
- Real in-browser SHA-256 experiment
- NAT/IP attribution challenge
- Deletion/data-lifecycle simulation
- UPI fraud simulation
- Timed ₹10,000 incident
- 1930 reporting drill
- Fact / inference / allegation complaint builder
- Incident-response room
- Cyber Law Courtroom
- Red Team vs Law Team authorization lab
- Final multi-stage Cyber Mystery
- Final mastery assessment
- Downloadable local report and completion certificate view

## Instructor mode

Open:

`?mode=instructor`

Select a mission and scenario seed. **Create class link** produces a student URL such as:

`?mode=student&mission=6&seed=4821`

Students using the same seed receive the same synthetic scenario. GitHub Pages is static, so instructor mode does not centrally synchronize students in real time.

## GitHub Pages deployment

1. Create a new GitHub repository.
2. Upload all files in this package to the repository root.
3. Push to the `main` branch.
4. Open **Settings → Pages**.
5. Under **Build and deployment**, select **GitHub Actions**.
6. The included workflow publishes the app automatically.

No secrets are required.

## Local preview

```bash
python -m http.server 8000
```

Open `http://localhost:8000`.

Do not open `index.html` directly with `file://` because browser module loading and the service worker require HTTP/HTTPS.

## Safe-by-design boundary

Everything is synthetic and isolated. The project does **not** include real credential capture, password cracking, exploit execution, malware, DDoS, wireless attacks, external scanning, real account takeover, real payment APIs, real deepfake generation, or collection of student personal data beyond what a student voluntarily stores locally in their own browser.

Documentation/test IP ranges and `.example` domains are used for simulation.

## Local progress

Student progress is stored in browser `localStorage` on that device. No central backend receives it. Students can export a JSON result report.

## Legal-content note

CyberLex Lab teaches principles and careful reasoning rather than assigning automatic criminal guilt from short scenarios. Exact legal outcomes depend on facts, current law, jurisdiction and competent authorities. Official reporting references should be periodically verified against Government of India sources.

## License

Apache License 2.0.

Copyright (C) 2026 Mohammad Amir Khusru Akhtar
