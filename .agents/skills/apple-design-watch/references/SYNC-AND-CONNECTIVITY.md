# Tương thích, kết nối & đồng bộ iPhone ↔ watchOS

> Đúc kết từ WWDC21 *There and back again: Data transfer on Apple Watch* (Anne Hitchcock),
> WWDC26 *watchOS Group Lab*, WWDC25 *What's new in watchOS 26*, WWDC24 *Bring your Live Activity to Apple Watch*.
> **Nguyên tắc đầu tiên: chọn công cụ theo** *loại dữ liệu → nguồn/đích → có companion hay không →
> khi nào cần tới nơi*.

## 1. Tương thích (compatibility)

| Trục | Trạng thái | Hệ quả thiết kế |
|---|---|---|
| **Có iPhone ghép đôi** | Mặc định | Có thể dùng WatchConnectivity; tối ưu bằng dữ liệu tải sẵn trên phone |
| **Independent Watch App** (watchOS 6+) | Không cần companion | Không được **giả định** có phone; mọi luồng chính phải chạy độc lập |
| **Family Setup** (watchOS 7+) | Watch của trẻ/người không có iPhone | ❌ **Không dùng WatchConnectivity** (không có companion) → dùng iCloud/CloudKit/URLSession |
| **Cellular** | Series 3+ | Có thể tự gọi mạng; thiết kế cho cả Wi-Fi/cellular/offline |
| **Kiến trúc arm64** | Series 9+, Ultra 2 (watchOS 26+) | Bật **Standard Architectures**; chú ý `Float/Int` & pointer math |
| **Không có Watch app** | App iPhone vẫn "có mặt" trên watch | Live Activity (tự động), controls từ iPhone app, notification chuyển tiếp, widget lock screen |
| **API mới hơn OS** | watchOS 26/27 | **Availability check** + fallback (vd. widget configurable phải kiểm tra phiên bản trước khi trả mảng rỗng) |
| **Foundation Models (27)** | Network-only | Kiểm tra availability/entitlement; luôn có fallback |

**Bậc thang trải nghiệm:** complication/widget → notification → Live Activity → control → app đầy đủ.
Đừng ép mọi use case thành "một app"; nhiều use case chỉ cần **system experiences**.

## 2. Chọn công cụ đồng bộ dữ liệu

| Công cụ | Loại dữ liệu | Có companion? | Family Setup | Thời điểm tới | Ghi chú |
|---|---|---|---|---|---|
| **Keychain + iCloud Sync** | nhỏ, nhạy cảm, ít đổi (token, preference) | Không cần | ✓ | Khi mạng/pin cho phép | `synchronizable=true`; có thể bị người dùng tắt; không có ở mọi khu vực |
| **Core Data + CloudKit** | dữ liệu có cấu trúc, DB | Không cần | ✓ | Không tức thời | Dùng **nhiều configuration** để **cắt bớt** dữ liệu cho watch |
| **WatchConnectivity** | dữ liệu **chỉ có trên một thiết bị**, tối ưu trải nghiệm cặp đôi | **Bắt buộc** | ✗ | Background: không tức thời | "Như gửi thư" |
| **URLSession (background)** | gọi server, tải lớn | Không cần | ✓ | Theo điều kiện hệ thống | **Ưu tiên** thay vì foreground |
| **URLSession (foreground)** | việc rất ngắn khi người dùng tương tác | Không cần | ✓ | Ngay | Timeout ~**2.5 phút**; tốn pin |
| **Sockets (HLS/WebSocket)** | streaming audio | Không cần | ✓ | Trong phiên audio | Chỉ trong active streaming audio session |

## 3. WatchConnectivity — chi tiết

### 3.1 Điều kiện & khởi tạo
- Chỉ hoạt động khi hai thiết bị **trong tầm Bluetooth hoặc cùng Wi-Fi**.
- **Activate session sớm nhất có thể** (app/extension delegate lúc finish launching) để nhận dữ liệu ngay.
- Callback của session delegate chạy trên **serial queue không phải main** → mọi cập nhật UI phải **nhảy về main**.

### 3.2 Bốn cơ chế (+ 1 đặc biệt)

| Cơ chế | Bản chất | Reachability? | Dùng khi |
|---|---|---|---|
| **applicationContext** | **một** dictionary, gửi background, cái mới **ghi đè** cái cũ, sẵn sàng khi app thức | Không | Nội dung cập nhật thường xuyên, chỉ cần **giá trị mới nhất** |
| **transferUserInfo** | dictionary **xếp hàng**, gửi **theo thứ tự**, có thể cancel | Không | Chuỗi sự kiện cần đủ, đúng thứ tự |
| **transferFile** | file xếp hàng, gửi khi điều kiện cho phép; vào **document inbox** | Không | Ảnh/asset/file |
| **sendMessage** | tương tác, **có reply**, cần reachable | **Có** | Hỏi–đáp ngay, lệnh tức thời |
| **transferCurrentComplicationUserInfo** | user info **ưu tiên** cho complication, nhanh nhất trong **ngân sách** | Không | Cập nhật complication từ phone |

### 3.3 Chi tiết quan trọng (dễ sai)

- **File inbox bị xoá ngay khi `didReceive file` return** → phải **move/process đồng bộ** trong callback;
  gọi async xử lý file ⇒ **file biến mất**.
- **sendMessage**: giữ message **nhỏ**; **luôn kèm reply handler**; phía nhận phải implement đúng biến thể
  delegate **có reply handler**, nếu không sẽ lỗi.
- **transferCurrentComplicationUserInfo** hết ngân sách ⇒ tự động rơi về hàng `transferUserInfo` thường;
  có API kiểm tra ngân sách còn lại.
- **Reachability không đối xứng:** WatchKit extension chỉ reachable khi **foreground** hoặc background
  ưu tiên cao (phiên dài); iOS app **có thể bị đánh thức trong nền** để nhận message ⇒ **iOS reachable
  nhiều hơn hẳn**. Đừng thiết kế giả định watch luôn reachable.
- **Không dùng WatchConnectivity cho Family Setup** (không có companion).

### 3.4 Đồng bộ widget/complication (mới)
- **APNs push updates** (watchOS 26) — server đẩy cập nhật widget.
- **Watch Connectivity widget updates** (watchOS 27) — đẩy từ iPhone sang watch ⇒ giữ iOS ↔ watch đồng bộ.
- **Live Activity** đồng bộ **tự động** sang watch (không cần token riêng); vẫn tính vào **ngân sách**.

## 4. Background execution & ngân sách

| Mục | Giá trị / quy tắc |
|---|---|
| Background refresh (có complication trên mặt đồng hồ đang dùng) | Tối đa **4 task/giờ** ⇒ đặt cách nhau **≥ 15 phút** |
| Background URLSession | Cấu hình `background(withIdentifier:)`, `sendsLaunchEvents = true`; dữ liệu lớn đặt `isDiscretionary = true` |
| Xử lý task | `WKExtensionDelegate.handle(_ backgroundTasks:)` → **luôn set task completed** ngay khi xong (nếu không, app bị chấm dứt vì vượt giới hạn nền) |
| Foreground URLSession | Timeout ~**2.5 phút**; chỉ cho tác vụ rất ngắn |
| Widget budget | Mặt đồng hồ ~**15–20 phút** khi đang dùng; Smart Stack theo tần suất xem |
| Live Activity | Có budget riêng; high-frequency khi yêu cầu; update trễ khi cổ tay xuống nhưng giơ tay sẽ thấy mới nhất |
| Nguyên tắc | **Luôn hỏi "có thể làm ở background không?"** trước khi dùng foreground |

## 5. Đồng bộ UI/state giữa hai app (thực chiến)

1. **Một nguồn sự thật:** chọn nơi "đúng" cho từng loại dữ liệu (phone, watch, hay cloud) — tránh hai
   nguồn song song gây lệch.
2. **Không tải trùng:** nếu phone đã có dữ liệu mới, đẩy sang watch qua **applicationContext/userInfo**
   để watch **khởi động với dữ liệu sẵn** (cảm giác nhanh, tiết kiệm pin/mạng).
3. **Chỉ đồng bộ thứ watch cần:** dùng Core Data **nhiều configuration** để cắt bớt; watch không phải
   bản sao của phone.
4. **Chọn cơ chế theo ngữ nghĩa dữ liệu:** *mới nhất* → applicationContext; *đủ & đúng thứ tự* → userInfo;
   *file* → transferFile; *hỏi–đáp ngay* → sendMessage.
5. **Xử lý UI trên main queue** (delegate không ở main).
6. **Trạng thái cuối:** widget/complication/Live Activity có **stale/placeholder**; offline vẫn có nội dung.

## 6. Failure modes

| Lỗi | Vì sao sai |
|---|---|
| Giả định watch luôn reachable | Reachability không đối xứng; watch thường không reachable |
| Dùng WatchConnectivity cho Family Setup | Không có companion ⇒ không bao giờ hoạt động |
| Xử lý file inbox bằng async | File bị xoá khi callback return |
| sendMessage không reply handler / thiếu delegate biến thể | Lỗi gửi/nhận |
| Đồng bộ cả DB lớn sang watch | Watch hết chỗ/pin; trải nghiệm tệ |
| Hai nguồn state (phone + watch tự tính) | Lệch dữ liệu, khó debug |
| Dùng foreground URLSession cho việc dài | Timeout 2.5 phút ⇒ thất bại |
| Quên set background task completed | App bị terminate vì vượt giới hạn nền |
| Đặt background refresh sát nhau (< 15 phút) | Bị dời lịch, chậm hơn |
| Update UI trực tiếp trong delegate callback | Sai queue ⇒ crash/không cập nhật |
| Không có fallback khi thiếu API mới/complication | Vỡ trên thiết bị/OS cũ |

## 7. Checklist tương thích & đồng bộ

- [ ] Xác định app có companion / independent / Family Setup; **không** dùng WC cho Family Setup.
- [ ] Chọn công cụ theo bảng §2; ghi rõ nguồn sự thật cho từng loại dữ liệu.
- [ ] Activate WC session sớm; xử lý UI trên main queue.
- [ ] applicationContext cho "mới nhất"; userInfo cho chuỗi; file xử lý **đồng bộ** trong callback.
- [ ] sendMessage nhỏ + reply handler + delegate đúng biến thể.
- [ ] Complication: `transferCurrentComplicationUserInfo` + kiểm ngân sách; fallback khi hết.
- [ ] Widget: chọn đường cập nhật (timeline / APNs 26 / Watch Connectivity 27) + tôn trọng budget.
- [ ] Background: URLSession background + `sendsLaunchEvents`; task completed; refresh ≥ 15 phút & ≤ 4/giờ.
- [ ] Cắt dữ liệu bằng Core Data configurations; watch chỉ nhận phần cần.
- [ ] Availability check + fallback cho API watchOS 26/27; test máy thật + Device Hub; test **không cắm debugger**.
