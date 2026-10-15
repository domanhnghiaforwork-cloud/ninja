# 01 — Quyết định và giả định v0.1

## Q01–Q06 đã LOCKED

Giữ nguyên xác nhận chủ dự án được ghi trong bộ tài liệu đầu vào, ngày 2026-10-15. Việc đổi tên baseline thành v0.1 không mở lại sáu quyết định này.

| ID | Quyết định | Hệ quả bắt buộc |
|---|---|---|
| Q01 | Demo Naruto/Sasuke cá nhân, chưa public | Dùng placeholder/original/licensed; demo kín; không đưa asset thiếu quyền lên host |
| Q02 | Solo developer + AI + asset có quyền | Sprite atlas trước; không mua/license nếu chưa được chủ dự án cho phép |
| Q03 | Chiến thuật, nhẫn thuật tầm xa và phản đòn | Projectile/LOS/cover/parry/resource là trọng tâm, không đổi sang melee-centric |
| Q04 | Orthogonal top-down 3/4, movement 8 hướng | Tọa độ X/Y thường, không dùng di chuyển isometric diamond |
| Q05 | PC Windows trước, mobile sau | P9 là demo PC; P10 không chặn các gate PC |
| Q06 | Phòng riêng bằng mã mời, guest không login | Không account/matchmaking/rank; CSPRNG code + TTL + rate limit + reconnect secret riêng |

## Quyết định bổ sung trong lần tái cấu trúc

| ID | Trạng thái / nguồn | Hành vi |
|---|---|---|
| D07 | LOCKED — chủ dự án trả lời trực tiếp 2026-10-15 | Disconnect: trận và timer tiếp tục; nhân vật mất kết nối không nhận input, đứng yên nhưng vẫn bị đánh. Hết grace thì forfeit nếu trận chưa kết thúc; reconnect không hồi sinh/đảo kết quả |
| D08 | LOCKED — chủ dự án trả lời trực tiếp 2026-10-15 | Chỉ che vị trí trên minimap/indicator UI theo LOS. Client vẫn có state vị trí cả hai người; không có server fog-of-war và không bảo đảm chống đọc vị trí từ network |

Grace 15 giây là seed, không nằm trong phần hành vi LOCKED của D07. Mặc định cho trường hợp biên: nếu người kia còn kết nối, một người hết grace thì forfeit một lần. Nếu cả hai offline, chờ cả hai grace; không nhận người mới thay slot, hết cả hai thì đóng trận không có winner. Người reconnect còn trong grace trở lại trận; nếu grace của đối thủ đã hết thì xử lý forfeit đối thủ, còn credential của chính mình đã hết thì không được trở lại. KO/timer đã kết thúc trận luôn được giữ nguyên. Các chi tiết này là mặc định triển khai có test.

## Mức độ ràng buộc

| Nhãn | Cách agent xử lý |
|---|---|
| LOCKED | Chỉ chủ dự án được đổi; cập nhật decision/config/task liên quan |
| REQUIRED | Ràng buộc kỹ thuật/nghiệm thu trong task, ví dụ authoritative HP; không được bỏ để hoàn tất nhanh |
| PROPOSED | Seed có thể điều chỉnh trong task liên quan bằng test/playtest và ghi lý do; không biến thành quyết định đã duyệt |
| DEFERRED / OPTIONAL | Chưa tự triển khai; chỉ chọn khi dependency và điều kiện kích hoạt được thỏa mãn |

`spec/project.config.json` giữ thông số chung; `spec/skill_roster.v0.1.json` giữ combat seed. Không nhân bản con số vào nhiều config runtime. Task P0-03 phải xác minh package/API tương thích và pin exact; tên phiên bản trong tài liệu không chứng minh package đã được cài hay chạy.

## Điều còn mở và thời điểm cần chốt

| ID | Chủ đề | Mặc định an toàn / khi hỏi |
|---|---|---|
| O01 | Máy benchmark và profile tối thiểu | Ghi máy thực ở P7-04; chưa cam kết FPS trên mọi PC |
| O02 | Nhà cung cấp, region và ngân sách staging | Một Node instance gần người test; P9-01 phải chốt chi phí trước tài nguyên trả tiền |
| O03 | Cân bằng: damage, tốc độ, timer, grace | Dùng seed, đo tại P4/P5; hỏi nếu đổi ý đồ sản phẩm |
| O04 | Spine | Không bật mặc định; P6-05 chỉ khi được yêu cầu và có quyền/license |
| O05 | M2 / cơ chế vòng bo | Không triển khai trong demo; chỉ đề xuất khi playtest chứng minh cần |

Mọi thay đổi LOCKED cần nguồn chấp nhận, ngày, tác động, cập nhật config/backlog và [changelog](12_CHANGELOG.md). Xung đột giữa nguồn chuẩn chưa giải quyết phải được nêu rõ; không dùng lịch sử phiên bản để tự đổi yêu cầu.
