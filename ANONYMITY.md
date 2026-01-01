# Anonymity & Privacy Model

**We See You** is built on a foundation of complete reporter anonymity. This document explains how your privacy is protected.

## Our Promise

> **Your identity is NEVER revealed to anyone—not to the reported account, not to other users, and not even to our moderators.**

---

## How It Works

### What We Store

| Data              | Purpose                              | Who Can See It                                |
| ----------------- | ------------------------------------ | --------------------------------------------- |
| Your email        | Authentication only                  | Only you                                      |
| Your display name | Personalizing your experience        | Only you                                      |
| Your user ID      | Linking your reports to your account | Only you                                      |
| Report content    | Moderator review                     | Moderators (without knowing who submitted it) |

### What Happens When You Submit a Report

1. **You submit a report** → Your `reporter_id` is stored in our database
2. **Moderators review** → They see ONLY: platform, handle, abuse category, description, and evidence
3. **Decisions are made** → Account status is updated based on community reports
4. **You're notified** → Only YOU can see updates on reports YOU submitted

---

## Technical Safeguards

### Database-Level Protection

- **Row Level Security (RLS)**: PostgreSQL policies ensure only YOU can query your own `reporter_id`
- **Anonymous Views**: Moderators access reports through a sanitized view that excludes reporter identity
- **No Backdoors**: There is no admin override to reveal reporter identity

### What Moderators See

```
┌─────────────────────────────────────────────────────┐
│ Report #a3f8c...                                    │
├─────────────────────────────────────────────────────┤
│ Platform:     Instagram                             │
│ Handle:       @abusive_account                      │
│ Category:     Sexual harassment                     │
│ Description:  [User's description]                  │
│ Evidence:     [Screenshot links]                    │
│ Submitted:    2026-01-01 08:30 UTC                  │
│ Reporter:     ████████████  ← REDACTED              │
└─────────────────────────────────────────────────────┘
```

---

## Frequently Asked Questions

### Can the reported person find out who reported them?

**No.** They only see that their account has been flagged. They never see who flagged them, how many people flagged them, or any report details.

### Can moderators see who I am?

**No.** Moderators review reports through a system that completely hides reporter identity. They make decisions based on the evidence and abuse category, not on who submitted the report.

### What if law enforcement requests my identity?

We cannot provide what we cannot access. Moderator-level access (which handles all report review) has no visibility into reporter identity. Only you can see your own reports through your authenticated session.

### Why do you need my email to sign up?

Email is used solely for:

- Preventing spam/bot abuse
- Allowing you to track YOUR report history
- Notifying you about accounts you've flagged

Your email is never shared with anyone else.

### Is my IP address logged?

We use Supabase for authentication. Standard server logs may contain IP addresses for security purposes, but these are not linked to individual reports and are not accessible to moderators.

---

## Data Retention

- **Your account data**: Retained while your account is active
- **Reports**: Retained indefinitely for community safety
- **Evidence uploads**: Retained for the lifetime of the report

To delete your account and associated data, contact support.

---

## Contact

Questions about privacy? Reach out at [support email].

---

_Last updated: January 2026_
