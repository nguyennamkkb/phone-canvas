# Spec Delta — screen-regions

## MODIFIED Requirements

### Requirement: Nền dải OS nối liền ruột màn hình

Nền `.device` SHALL mang đúng nền gốc dài của `.screen` (chỉ lan được `background-color` và `background-image` dạng longhand), nên dải status bar và home indicator SHALL cùng màu với ruột màn hình khi tính theo điểm ảnh. Màn nền tối SHALL làm home indicator chuyển sang trắng.

Khi `.screen` root có `background-image`, vùng định vị nền của `.device` và `.screen` SHALL trùng nhau, để band nav/tab nằm trong `.viewport` (giữa hai dải OS và thân màn) không tạo seam: nền là **một lớp full-bleed** và các band nổi trong suốt trên nó. Cơ chế bảo đảm bất biến này SHALL do shell sở hữu ở lõi — tác giả SHALL NOT phải khai gì thêm ngoài longhand nền trên `.screen` root. Tầng đo của gate SHALL kiểm bất biến này bằng phép đo render (không chỉ so chuỗi khai báo) và fail khi hai painter không chung một hệ toạ độ.

#### Scenario: Vết trắng ở safe area

- **WHEN** dựng màn có nền khác `--bg` mặc định (ví dụ nền xám Apple `#F2F2F7`) và đo pixel 3 điểm: giữa dải status, giữa ruột màn, giữa dải home indicator
- **THEN** cả 3 điểm trùng màu; `npm run audit:regions` báo `background continuity: ok`

#### Scenario: Token nền đặt sai chỗ

- **WHEN** một project khai báo `--bg` chỉ ở `:root` trong khi `.app-mood` (rule trực tiếp) lại gán `--bg` khác
- **THEN** dải OS lệch màu ruột màn và audit đỏ; quy tắc sửa là khai báo trực tiếp trên scope dùng nó, không qua `:root` kế thừa

#### Scenario: Nền ảnh liền mạch qua band nav

- **WHEN** dựng màn có `background-image` trên `.screen` root **và** một band nav (từ slot `data-slot`), rồi render khung máy
- **THEN** nền ở dải status, band nav và thân màn lấy từ cùng một hệ toạ độ — không có bước nhảy màu tại đáy band nav; với ảnh nguồn khớp khung, điểm ảnh ở các cột không bị nội dung phủ khớp với ảnh gốc

#### Scenario: Hai lớp nền khác hệ toạ độ

- **WHEN** `.screen` root có `background-image` nhưng vùng định vị nền của `.device` và `.screen` khác nhau (ví dụ chỉ một bên neo viewport, hoặc rect hai bên không bằng nhau)
- **THEN** `npm run audit:regions` báo lỗi `background` kèm attachment/rect đo được của hai painter và cách sửa, exit code ≠ 0
