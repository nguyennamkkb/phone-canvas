# CaloAI - Project Overview

**Document Version**: 1.0
**Last Updated**: 2026-09-28
**Status**: Draft (đồng bộ snapshot với PRD v1.0 / 2026-09-28)

## 0. PRD Reference

- **PRD Source**: `.claude/specs/CaloAI/PRD.md`
- **Reference Policy**: Product strategy, market context, and competitor insights are defined in PRD and are not duplicated here.
- **Snapshot Used**: PRD v1.0 / 2026-09-28 (defaults §14: free 3 scans/ngày, trial 7 ngày, AI Gemini primary, lưu ảnh 90 ngày, min iOS 17.0, Firebase analytics — tất cả ASSUMPTION)

## 1. Introduction

### 1.1 Problem Statement
Người Việt muốn kiểm soát cân nặng bỏ cuộc với nhật ký calo thủ công: nhập tay 10–15 phút/bữa, database món Việt thiếu và sai số lớn, không thấy "cả ngày còn lại bao nhiêu". App ngoại mạnh về đồ Tây nhưng đắt, ma sát cao, AI-photo chưa chuẩn món Việt. Kết quả là activation thấp và rớt retention sau 1–2 tuần.

### 1.2 Solution Overview
CaloAI là app iOS SwiftUI log calo bằng AI: chụp ảnh → calo + protein/carb/fat trong <5s, human-in-the-loop bắt buộc (xác nhận khẩu phần trước khi lưu), diary + macro ring + cân nặng + HealthKit 2 chiều + paywall Pro minh bạch. Backend Supabase (Postgres + Auth + Storage + Edge Functions proxy AI key + verify StoreKit). VN food DB seed 500–800 món có kiểm duyệt là lợi thế cốt lõi.

### 1.3 Business Goals
- Goal 1: Activation ≥60% (onboarding → bữa log đầu trong 24h) ở tháng 6.
- Goal 2: D30 retention ≥9%, trial-to-paid ≥8%, gói năm ≥50% paid subs.
- Goal 3: Rating ≥4.6, crash-free ≥99.5%, scan p95 <5s trên 4G.

## 2. Target Users

### 2.1 Primary User Personas

#### Persona 1: Người giảm cân bận rộn (primary)
- **Demographics**: 22–32 tuổi, văn phòng, iPhone, đã bỏ MyFitnessPal 1–2 lần.
- **Goals**: Giảm 3–8kg; biết calo mỗi bữa <10s; biết cả ngày còn lại bao nhiêu.
- **Pain Points**: Nhập tay mệt; món Việt tra không ra; paywall ngoại đắt mà vẫn phải nhập tay.
- **Usage Context**: Trưa văn phòng (cơm/phở/bánh mì), tối ở nhà; 3–4 sessions/ngày theo bữa.

#### Persona 2: Người tập gym tăng cơ
- **Demographics**: 20–30 tuổi, nam, tập 3–5 buổi/tuần, dùng Apple Watch.
- **Goals**: Đủ 140–180g protein/ngày; track protein mỗi bữa nhanh; trend cân nặng/tuần.
- **Pain Points**: App hiện tại ước lượng protein món Việt chậm; sync HealthKit rời rạc.
- **Usage Context**: Sau mỗi bữa + sau workout; xem macro ring buổi tối.

#### Persona 3: Người theo keto/IF
- **Demographics**: 25–38 tuổi, low-carb / 16:8.
- **Goals**: Giữ carb dưới ngưỡng + đúng cửa sổ fasting.
- **Pain Points**: Ít app gộp fasting timer + carb tracking + AI log giá rẻ.
- **Usage Context**: Sáng check fasting timer, trưa/tối log bữa + cảnh báo carb.

### 2.2 Secondary Users
- Chuyên gia dinh dưỡng (review/approve VN DB seed, P1 moderation crowdsource).
- Admin nội bộ (quản lý food DB, theo dõi cost/scan, refund/billing support).
- UA/ASO (theo dõi activation/retention/revenue dashboards, không can thiệp app).

## 3. High-Level Architecture

### 3.1 Technology Stack

#### Frontend
- **Platform**: iOS (iPhone trước, SwiftUI 100%)
- **Minimum Version**: iOS 17.0
- **Architecture Pattern**: MVVM strict + Repository (View → ViewModel @Observable → UseCase/Service → Repository local/remote)
- **State Management**: Swift Observation (@Observable) + Swift Concurrency (Actor cho Store/Cache)
- **UI Framework**: SwiftUI (NavigationStack, Charts, WidgetKit, TipKit)

#### Backend (if applicable)
- **API**: Supabase (Postgres + PostgREST) + Edge Functions (proxy AI key, StoreKit verify, rate-limit)
- **Authentication**: Sign in with Apple (chính) + Guest (giới hạn); Google ở P1
- **Database**: SwiftData local (source-of-truth offline: MealLog, FoodItem, WeightHistory) + Postgres remote (foods, dishes_vn, meal_logs); pgvector cho food-embedding search (P1)

#### Third-Party Services
- AI vision: Gemini 2.5 Flash (primary) / GPT-4o-mini (fallback); Nutritionix/Edamam fallback barcode/món Tây
- Apple: HealthKit (đọc workouts/weight/steps, ghi dietary), StoreKit 2, APNs, WidgetKit, Vision/VisionKit pre-filter, PHPicker/AVFoundation camera
- Analytics/Crash: Firebase Analytics + Crashlytics; Keychain/UserDefaults/AppStorage local

### 3.2 System Architecture Diagram

```
┌──────────────────────────────────────────────┐
│              iOS App (SwiftUI)               │
│  Views → ViewModels → UseCases/Services      │
│  Repositories: Local(SwiftData) / Remote     │
│  Core: HealthKit, StoreKit2, Push, Analytics │
└──────────────┬───────────────┬───────────────┘
               │               │ (D) image-hash cache
               ▼               ▼
┌──────────────────────┐  ┌────────────────────┐
│ Supabase Edge Func.  │  │ Apple Services     │
│ proxy AI key, verify │  │ HealthKit, StoreKit│
│ StoreKit, rate-limit │  │ APNs, App Store    │
└──────────┬───────────┘  └────────────────────┘
           ▼
┌──────────────────────┐  ┌────────────────────┐
│ AI vision (Gemini /  │  │ Nutritionix/Edamam │
│ GPT-4o-mini) + RAG   │  │ fallback barcode   │
│ VN food DB           │  │                    │
└──────────────────────┘  └────────────────────┘
```

### 3.3 Key Architectural Decisions
- **Decision 1 — SwiftData + offline-first, Supabase là remote**: vì log bữa phải hoạt động không mạng; SwiftData là source-of-truth, sync delta khi online; trade-off là phải tự xử conflict (last-write-wins theo updated_at).
- **Decision 2 — AI hybrid qua Edge Function, không on-device thuần**: vì món Việt hỗn hợp cần multimodal LLM + RAG VN DB; Vision on-device chỉ pre-filter food/non-food; trade-off là phụ thuộc mạng + cost/scan (giảm bằng cache image-hash + free quota).
- **Decision 3 — Human-in-the-loop bắt buộc**: vì calorie error fully-auto có thể 25–50%; không cho lưu khi confidence <60% mà chưa xác nhận tay; trade-off là thêm 1 tap nhưng giữ trust và accuracy ±20% sau confirm.
- **Decision 4 — Supabase thay vì Firebase/CloudKit**: vì cần Postgres relational + RLS + SQL quen thuộc + Edge verify StoreKit; trade-off là realtime yếu hơn Firebase (chấp nhận được vì app không cần realtime).

## 4. Core Features Overview

### 4.1 Must-Have Features (MVP)
1. **Onboarding + goal engine**: quiz 6–8 câu → TDEE + calorie/macro goal (UC-001).
2. **Photo scan + confirm**: chụp → AI items/confidence → sửa khẩu phần → lưu (UC-003, UC-004).
3. **Barcode + text/voice + search VN + custom food**: 4 đường log thay thế/bổ sung (UC-005–UC-008).
4. **Diary + macro ring + food detail/edit/delete/relog**: vòng ngày + quản lý bữa (UC-009–UC-012).
5. **Water + exercise/steps + weight trend + HealthKit sync**: tiến độ + tích hợp Apple (UC-013–UC-016).
6. **Paywall Pro + settings/offline + push/widget cơ bản**: monetization + vận hành tối thiểu (UC-018, UC-021, UC-022).

### 4.2 Should-Have Features (Post-MVP)
1. **History/Stats sâu + VN DB 1500 + moderation** (UC-017 mở rộng).
2. **Fasting timer + streaks nâng cao + AI coach chat** (UC-019, UC-020).
3. **StoreKit hoàn thiện + widget đầy đủ + Apple Watch companion**.

### 4.3 Future Enhancements
- Meal plan AI tuần + grocery list; social/groups (cân nhắc privacy); family plan; CloudKit private sync optional; đa ngôn ngữ ngoài Việt + Anh.

## 5. Development Roadmap

### Phase 1: Foundation (Weeks 1-4)
- Setup project (Swift 6, SwiftUI, SwiftData schema, DI, SwiftLint), Design System + tokens.
- Onboarding + goal engine + Auth Apple + Supabase Auth/sync khung.
- VN DB seed 500 món + camera/scan khung (mock AI trước).
- Analytics/crash tooling + QA checklist device thật.

### Phase 2: Core Features (Weeks 5-8)
- Scan pipeline thật (Edge → Gemini + RAG + confidence + confirm flow) + barcode/text/search/custom.
- Diary + macro ring + weight + HealthKit 2 chiều + offline queue.
- Paywall StoreKit 2 + trial + verify server + push/widget cơ bản.
- Beta nội bộ + fix accuracy/billing theo checklist PRD §9.

### Phase 3: Polish & Launch (Weeks 9-12)
- UI/UX refinement (Dynamic Type, VoiceOver, Dark Mode), performance (cold start <1.5s, scan p95 <5s).
- Beta công khai có analytics + monetization; xử lý refund/cancel guide.
- App Store submission (privacy manifest, usage strings, xóa tài khoản, screenshots VN+EN).

### Phase 4: Post-Launch (Ongoing)
- P1: VN DB 1500 + fasting + streaks + coach + stats sâu (4–6 tuần).
- P2: Meal plan AI + Watch + social/family (theo tín hiệu retention/revenue).
- Vận hành: cost/scan dashboard, moderation DB, ASO/UA iteration.

## 6. Success Metrics

### 6.1 Technical Metrics
- App launch time: <1.5s cold start (iPhone 12)
- Crash-free rate: ≥99.5% sessions
- API response time: scan p95 <5s (4G); search <500ms; API p95 <800ms
- Test coverage: UseCase ≥80%; snapshot test diary/paywall/scan-confirm
- Scan success rate: ≥85% scans có kết quả + được xác nhận lưu; food-ID top-1 ≥85% món phổ biến

### 6.2 Business Metrics
- User acquisition: 20K installs/3 tháng, 80K/6 tháng; activation ≥60%
- User retention: D1 ≥32%, D7 ≥16%, D30 ≥9% (6 tháng)
- User engagement: DAU/MAU ≥32%; ≥2.5 logs/user/ngày
- Monetization: trial-to-paid ≥8%; gói năm ≥50% paid; MRR $12K/6 tháng (ASSUMPTION)
- App Store rating: ≥4.6★ (≥2K ratings)

## 7. Constraints & Assumptions

### 7.1 Constraints
- Budget: cost AI/scan là trần scale — chặn bằng cache + free quota 3/ngày + paywall.
- Timeline: MVP beta 10–12 tuần (ASSUMPTION); không nhồi P1/P2 vào MVP.
- Resources: iOS + BE + AI + QA + design + dinh dưỡng review DB (tối thiểu).
- Technical: iOS 17.0+; portrait iPhone; scan cần mạng (offline chỉ log tay); HealthKit cần device thật để test.

### 7.2 Assumptions
- Users có iPhone iOS 17+ và chụp ảnh món ăn được (camera đủ sáng).
- Gemini/GPT-4o-mini API khả dụng, latency 2–4s, giá chấp nhận được ở scale MVP.
- VN DB seed có nguồn Viện DD/USDA, sai số chấp nhận được sau xác nhận (±20%).
- User chấp nhận xác nhận 1 tap trước khi lưu (đánh đổi tốc độ lấy accuracy).
- Apple duyệt HealthKit/billing khi làm đúng guideline (giá bill rõ, xóa tài khoản, usage strings).

## 8. Risks & Mitigation

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| AI sai món Việt hỗn hợp / portion lệch | High | High | Human confirm bắt buộc; confidence + 3 mức khẩu phần; RAG VN DB; hiển thị khoảng sai số |
| Billing bị reject (bài học Cal AI) | High | Medium | Giá bill to, trial/hủy rõ, checklist paywall, không dark pattern |
| Breach dữ liệu sức khỏe | High | Medium | Key qua Edge, RLS, không upload HealthKit raw, TLS + at-rest, audit rules |
| Cost AI phình | Medium | Medium | Cache image-hash, quota free, rate-limit, dashboard cost/scan |
| Review reject HealthKit/dietary units | Medium | Medium | Usage string rõ, xin quyền đúng lúc, test device thật |
| VN DB sai kcal | High | Medium | Seed có nguồn + version, hiển thị khoảng khi thiếu nguồn, moderation |

## 9. Stakeholders

- **Product Owner**: chốt scope/defaults §14 PRD, milestone, pricing.
- **Development Team**: iOS (SwiftUI/SwiftData/HealthKit/StoreKit) + BE (Supabase/Edge) + AI (vision pipeline/RAG).
- **Designers**: Design System, 22 screens (WF-001–WF-026 roadmap), prototype scan-confirm.
- **QA**: checklist 50 món Việt, paywall/trial/restore, HealthKit accept/deny, offline→sync, billing minh bạch.
- **Data/ASO/UA/Legal**: tracking dashboard, keywords/screenshots VN+EN, privacy policy, xóa/export tài khoản.

## 10. References

- PRD: `.claude/specs/CaloAI/PRD.md` (§1–§3 problem/solution/persona; §4 cạnh tranh — không chép lại ở đây; §7 feature table; §9 constraints; §11 monetization).
- UC: `.claude/specs/CaloAI/Use_Cases.md` (UC-001–UC-022, task flows TF).
- FR: `.claude/specs/CaloAI/Functional_Requirements.md` (FR-001–FR-060+, NFR, BR).
- Wireframes: `.claude/specs/CaloAI/Wireframes.md` (WF-001–WF-026).
- UX Flows: `.claude/specs/CaloAI/UX_Flows.md` (journeys + nav flows).
- Roadmap: `.claude/specs/CaloAI/Project_Implementation_Roadmap.md` (Phase 1–3 + P1/P2).

---

**Document Version**: 1.0
**Last Updated**: 2026-09-28
**Status**: Draft
