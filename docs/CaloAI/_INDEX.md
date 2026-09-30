# CaloAI - Docs Index

**Version**: 1.0 · **Date**: 2026-09-28 · **Snapshot**: v1.0 / 2026-09-28 (đồng bộ cả 7 tài liệu)

> Manifest/index for the project documentation set. An agent reads this first to know what
> exists, in what order, the ID conventions, and where each kind of fact lives.

## Files & read order

Generation/read order — each file only references files above it:

| # | File | Role |
|---|------|------|
| 1 | `PRD.md` | Product vision, market research, scope, monetization, KPIs |
| 2 | `Project_Overview.md` | Architecture + planning summary (references PRD) |
| 3 | `Use_Cases.md` | UC stories, UC↔screen mapping, task flows, priorities |
| 4 | `Functional_Requirements.md` | FR/NFR, business/validation/error rules, EARS AC |
| 5 | `Wireframes.md` | Screen inventory + ASCII layouts per archetype |
| 6 | `UX_Flows.md` | Journeys, navigation, error/loading flows |
| 7 | `Project_Implementation_Roadmap.md` | Specs, phases, dependency graph, Scope Decision Record |

## ID conventions

| Prefix | Meaning | Example |
|--------|---------|---------|
| `UC-XXX` | Use case | UC-001 |
| `AC-XXX.Y` | Acceptance criterion (EARS) | AC-001.1 |
| `AF-XXX.Y` | Alternative/error flow | AF-001.1 |
| `FR-XXX` / `NFR-XXX` | Functional / Non-functional requirement | FR-004 |
| `BR/VR/ERR-XXX.Y` | Business / validation / error rule | BR-001.2 |
| `WF-XXX` | Wireframe screen | WF-017 |
| `TF-XXX` / `SF-XXX` | Task flow / sub-flow | TF-002 |

IDs are stable across the set — never renumber; new items get new IDs.

**Set scale**: 22 UC (UC-001–UC-022) · 93 AC · 7 TF + 4 SF · 56 FR (46 P0 + 10 P1) · 8 NFR · 6 BR · 26 screens (WF-001–WF-026) · 30 evidence sources (PRD) · 5 phases (Phase 1–3 MVP 12 tuần + P1 + P2).

## Single source of truth (where each fact lives)

| Kind of fact | Authoritative file |
|--------------|--------------------|
| Scope / MVP definition + priority legend | `Project_Implementation_Roadmap.md` → Scope Decision Record |
| Effort / durations / timeline | `Project_Implementation_Roadmap.md` (Use_Cases carries priority+complexity only) |
| Pricing / monetization | `PRD.md` §11 |
| Open-question defaults (ASSUMPTION) | `PRD.md` §14 |
| Screens & layouts | `Wireframes.md` |
| Requirement behavior / AC | `Functional_Requirements.md` |
| Dependency graph (machine-readable) | `Project_Implementation_Roadmap.md` → Machine-Readable Dependencies |

## For coding agents

Practical read path when implementing: start from `Project_Implementation_Roadmap.md`
(spec + dependency graph via the JSON block), then trace back to the FR/UC/WF listed in each
spec's `Covers` column. All docs share the snapshot version above.
