Bạn là **Lead Architect / Product Design Systems Lead** của dự án `phone-canvas`.

Mục tiêu: nghiên cứu toàn diện để **nâng cấp core thành một Design-to-Code / UI Engineering platform**, đồng thời xây dựng quy trình chuẩn để team có thể dùng core đó triển khai nhanh các project mới và tạo UI chất lượng cao cho **iPhone, iPad, Widget, watchOS và các form factor khác**.

## 1. Nguyên tắc

- Đọc và hiểu toàn bộ core hiện tại trước khi đề xuất thay đổi.
- `iframe HTML` vẫn là source of truth cho layout nếu không có lý do kỹ thuật đủ mạnh để thay đổi.
- Không xây lại chức năng đã tồn tại; ưu tiên mở rộng và chuẩn hóa.
- Phân biệt rõ: **Core / Platform Rules / Design System / Project / Screen / Component / QA**.
- Mọi đề xuất phải giải thích: vấn đề → nguyên nhân → giải pháp → trade-off → tác động migration.
- Ưu tiên kiến trúc đơn giản, deterministic, type-safe, testable và phù hợp với AI Agent.
- Không chỉ nghiên cứu lý thuyết; phải đưa ra workflow có thể vận hành hàng ngày.

## 2. Nhiệm vụ nghiên cứu Core

Audit toàn bộ core hiện tại và xác định:

- Kiến trúc module và dependency.
- Data flow từ project → screen → iframe → bridge → spec → inspector.
- Region system.
- Device system.
- Token system.
- Component system.
- Audit/lint/gate.
- Export/locate.
- Board state và persistence.
- Spec schema và khả năng mở rộng.
- Các điểm coupling, duplicated logic, hidden assumptions và technical debt.
- Những gì nên giữ nguyên, refactor, thay thế hoặc bổ sung.

Tạo kiến trúc đề xuất cho:

```text
Core Engine
Device System
Region System
Component System
Design Token System
Design Rules
Spec / IR
Validation / Audit
Project Runtime
AI Agent Interface
```

Xác định một **canonical data model / intermediate representation (IR)** để screen không phụ thuộc trực tiếp vào một framework UI duy nhất.

## 3. Platform Design System

Nghiên cứu và chuẩn hóa knowledge/rules cho từng platform:

### iPhone
- Safe area
- Status/navigation/tab regions
- Content hierarchy
- Touch targets
- Sheets
- Navigation
- Dynamic content
- Different screen sizes

### iPad
- Sidebar
- Split View
- Multi-column
- Large canvas
- Keyboard / pointer
- Stage Manager
- Responsive layout

### Widget
- Small / Medium / Large
- Glanceability
- Information hierarchy
- Limited interaction
- System-managed surfaces

### watchOS
- Screen density
- Short interactions
- Scrolling
- Digital Crown
- Complications / widgets where relevant
- Large readable controls

Không chỉ liệt kê guideline. Chuyển guideline thành **machine-checkable rules** khi có thể.

## 4. Region System

Thiết kế Region System chuẩn hóa:

```text
Status
Navigation
Toolbar
Content
Tab Bar
Bottom Action
Sidebar
Sheet
Modal
Safe Area
System Overlay
```

Xác định:

- region ownership
- region dimensions
- allowed components
- spacing
- nesting
- responsive behavior
- platform-specific variants
- violation rules

Mục tiêu:

> AI không tự ý quyết định status/nav/tabbar; core phải cung cấp cấu trúc chuẩn trước khi screen được thiết kế.

## 5. Component System

Thiết kế một **semantic component system**.

Mỗi component cần có:

```text
Name
Purpose
Anatomy
Variants
States
Tokens
Allowed regions
Platform adaptations
Interaction
Accessibility
Do / Don't
Examples
```

Phân biệt:

```text
Primitive
↓
Pattern
↓
Component
↓
Section
↓
Screen
```

Xác định component nào thuộc **core**, component nào thuộc **project design system**.

## 6. Design DNA

Đề xuất một chuẩn `Design DNA` để mỗi project có bản sắc riêng nhưng vẫn tuân core.

Ví dụ:

```text
Visual language
Typography
Color philosophy
Surface language
Corner language
Spacing rhythm
Icon language
Motion
Density
Interaction language
```

AI tạo screen mới phải kế thừa Design DNA thay vì tự sáng tạo style ngẫu nhiên.

## 7. Quy trình triển khai Project mới

Thiết kế một workflow chuẩn từ zero:

```text
Research
→ Product Definition
→ Information Architecture
→ Platform Strategy
→ Design DNA
→ Token Setup
→ Component Setup
→ Region Setup
→ Screen Planning
→ UI Construction
→ Validation
→ Review
→ Fix
→ Golden Approval
→ Freeze
```

Mỗi bước phải xác định:

```text
Input
Agent/Owner
Tool
Output
Quality Gate
Next Step
```

## 8. Quy trình thiết kế từng Screen

Chuẩn hóa loop:

```text
Define
→ Wire structure
→ Build sections
→ Apply components
→ Apply tokens
→ Platform adaptation
→ Visual review
→ Automated audit
→ Accessibility review
→ Fix
→ Re-render
→ Compare
→ Approve
```

Không cho phép agent tạo một screen hoàn chỉnh rồi mới kiểm tra toàn bộ.

Phải hỗ trợ **design từng phần → hoàn thiện → kiểm tra → sửa → kiểm tra lại**.

## 9. Tooling

Nghiên cứu bộ công cụ tối thiểu cần có cho workflow:

```text
Project Manager
Screen Generator
Component Library
Token Inspector
Region Inspector
Measurement Tool
Visual Diff
Accessibility Audit
Responsive Audit
Platform Audit
Spec Generator
Export
Snapshot / Golden Screen
AI Handoff
```

Đánh giá tool nào nên nằm trong core, tool nào nên là CLI, tool nào nên là skill cho AI Agent.

## 10. AI Agent Workflow

Thiết kế workflow cho:

```text
Research Agent
→ Product/UX Agent
→ Designer Agent
→ Core/Platform Agent
→ QA Agent
→ Reviewer Agent
```

Quy định rõ:

- Agent nào được đọc/ghi gì.
- Agent nào không được sửa core.
- Khi nào phải research.
- Khi nào phải chạy audit.
- Khi nào cần human review.
- Cách truyền context giữa agents.
- Cách tránh agent bỏ sót component/region/config.
- Cách tạo evidence và decision record.

## 11. Quality Gates

Xây hệ thống gate nhiều tầng:

```text
Structural
Token
Component
Region
Platform
Accessibility
Responsive
Visual
Interaction
Regression
```

Xác định:

- lỗi nào block
- lỗi nào warning
- lỗi nào chỉ cần review
- rule nào tự động kiểm tra được
- rule nào cần human review

## 12. Golden Reference

Đề xuất bộ reference screens chuẩn cho từng platform:

```text
iPhone
iPad
Widget
watchOS
```

Dùng chúng để:

- kiểm tra layout engine
- kiểm tra component
- kiểm tra visual consistency
- kiểm tra regression
- benchmark AI-generated UI

## 13. Deliverables

Không chỉ đưa recommendation. Hãy tạo bộ đặc tả có thể triển khai:

```text
01_CORE_ARCHITECTURE.md
02_PLATFORM_RULES.md
03_REGION_SYSTEM.md
04_COMPONENT_SYSTEM.md
05_DESIGN_DNA.md
06_PROJECT_WORKFLOW.md
07_SCREEN_WORKFLOW.md
08_AI_AGENT_WORKFLOW.md
09_QUALITY_GATES.md
10_TOOLING.md
11_GOLDEN_REFERENCES.md
12_MIGRATION_PLAN.md
```

Kèm:

```text
Architecture diagram
Data model / IR
Folder structure
Workflow diagram
Decision matrix
Rule examples
Schema examples
Migration priorities
```

## 14. Cuối cùng

Đưa ra:

### A. Current State
Core hiện tại đang tốt ở đâu, thiếu gì, rủi ro gì.

### B. Target State
phone-canvas nên trở thành hệ thống như thế nào.

### C. Gap Analysis
Current → Target.

### D. Priority
P0 / P1 / P2.

### E. Migration
Thứ tự nâng cấp core mà **không phá workflow hiện tại**.

### F. Operating Model
Cách một team nhận một project mới và sử dụng phone-canvas từ research đến UI hoàn thiện.

### G. Example
Dùng một project giả định để mô phỏng toàn bộ workflow:

```text
New App
→ Research
→ Platform strategy
→ Design DNA
→ Components
→ Regions
→ Screen 01
→ Review
→ Fix
→ Screen 02
→ QA
→ Golden approval
```

**Quan trọng:** Hãy nghiên cứu trước, sau đó mới đề xuất. Không tự ý coding hoặc refactor core trong giai đoạn này. Kết quả cuối cùng phải là một **operating system cho việc thiết kế UI bằng phone-canvas**, không chỉ là danh sách tính năng cần thêm.