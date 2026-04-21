# 🌧️ erin-inbox

> **DIRECTIVE STREAM · Sector 06 · LAPD Record Intake**
>
> *"You showed me a picture of a horse. I showed you a task list. Same thing."*

🟠 **STREAM:** [`OPEN`](https://erin-inbox.pages.dev) · 🔴 **QUEUE:** active · ☔ **RAIN:** 100% forever

---

## 📡 What this is

Every open loop, every follow-up, every "I'll deal with that later" that would otherwise drown in email — **it lives here.**

- 📋 GitHub Issues = tasks
- 🏷️ Labels = contexts: `home` · `homelab` · `kids` · `consulting` · `self`
- 👁️ One view. One inbox. One operator.

No streaks. No gamification. No 14-day trial of productivity-as-a-service. Just the directives that **actually need doing**, and the directives that **got done**, and the line between them.

## 🖥️ Architecture

```
  [operator] 📱
      │
      ↓
  erin-inbox.pages.dev
      │
  [Pages Function] ⚡
      │
      ↓
  🐙 GitHub Issues API
      │
  erin-inbox-data 🔒
```

## 🧰 Stack

- 🔥 Cloudflare Pages + Pages Functions
- 🐙 GitHub Issues (the ledger)
- 🏷️ Labels (the contexts)
- ✅ Closed issues = done, forever, still searchable

## 🤐 Clearance

Directives are private. The terminal is public. That is all you need to know.

## 🌐 Out there

- 🏢 [xconsultingwork.com](https://xconsultingwork.com)
- 🎬 [cf-examples.pages.dev](https://cf-examples.pages.dev)

---

*☔ "All those directives will be lost in time, like tears in rain." — Every task manager ever, before I built this.*
