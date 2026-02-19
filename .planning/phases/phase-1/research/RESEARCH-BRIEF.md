# Research Brief

## Goal
Build a story-driven web simulator that lets users experience how reservation/affirmative action policies affect socio-economic outcomes across fictional social classes, using absurd invented traits (satirizing caste system's arbitrary basis) in a sci-fi setting.

## In Scope
- Responsive Next.js/TypeScript web app
- "Galaxy far far away" narrative intro with procedural world/class generation
- Pre-generated pool of 100-200 absurd differentiating traits (no runtime LLM costs)
- Interactive time-jump simulation (default 20-year increments)
- Time machine dial UI for manual time control
- Narrative text showing biggest metric improvement at each checkpoint
- Full charts view (all metrics with timeline progression)
- Core metrics: education access, employment, wealth, poverty, life expectancy
- Mathematical models from existing whitepapers (adapted for storytelling)

## Out of Scope (Non-Goals)
- Real-time LLM content generation
- Real Indian caste names (SC/ST/OBC/General) - use fictional classes only
- Agent-based individual simulation (use cohort-level calculations)
- Multiplayer or social features
- Data persistence / user accounts
- Mobile native apps

## Constraints
- Must work without API keys (pre-generated content)
- Mobile-responsive design required
- Mathematical models must produce believable/educational results
- Satirical tone but not offensive to marginalized communities
- Single-page app feel with smooth transitions

## Success Criteria
- User can complete full simulation (0 → 100+ years) in under 5 minutes
- Charts clearly show reservation policy impact over time
- Absurd traits are memorable and shareable
- Works on mobile browsers
- No external API dependencies at runtime

## Open Decisions
- Exact number of social classes (3-5?) - **Owner: JD**
- Animation/transition library choice - **Owner: NalaN**
- Chart library (Recharts vs Chart.js vs D3) - **Owner: NalaN**
- Hosting platform (Vercel assumed) - **Owner: JD**
