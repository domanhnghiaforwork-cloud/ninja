# 12 — Changelog v0.1

## 0.1.0 — 2026-10-15 — baseline tài liệu tái cấu trúc

**Yêu cầu:** chủ dự án muốn chắt lọc tài liệu, thống nhất tên v0.1 và chia rõ bước/task để agent có thể làm việc. Tên baseline được đặt lại; các quyết định đã chốt và task IDs được giữ nguyên. Không quay lại giả định của bản nháp trước đó.

- Hợp nhất nội dung cũ và phần bổ sung thành một bản nhất quán cho từng chủ đề; bỏ các ghi chú override chồng lớp, lời khẳng định package/API “đã chạy/đã kiểm” thiếu evidence.
- Giữ Q01–Q06 và `P0-01 = done`, task triển khai đầu tiên vẫn P0-02; không thực hiện setup/gameplay trong lần sửa tài liệu.
- Chủ dự án chấp nhận D07: trận tiếp tục khi disconnect, fighter đứng yên/vẫn nhận đòn, hết grace forfeit; D08: chỉ che minimap ở UI, không server fog-of-war.
- Đổi skill roster sang tên v0.1; config/backlog/roster cùng document version 0.1.0. Schema và phiên bản dependency không bị đổi thành phiên bản tài liệu.
- Backlog là nguồn duy nhất cho 47 task/11 phase, thêm goal, references, file scope, steps, verification, non-goals, evidence và phase gate. Sinh `tasks/` cùng roadmap từ JSON; bỏ tài liệu task đầu tiên riêng bị trùng.
- Chuẩn hóa input dash/dodge thành một hành động, guard-edge mở parry; bỏ substitute/cancel/gamepad bắt buộc không có contract. Đồng bộ metadata map một bộ tên chuẩn.
- Làm rõ earliest-TOI collision và tie-break, AoE LOS, outcome tie/reset, resource seed và giới hạn prediction. Thêm admission credential được kiểm tại direct join; private room một mình không chặn bypass.
- Spine optional có trạng thái skipped được review, không chặn P7. P10 luôn sau P9; gate của thiết bị thật không thay bằng compile/hai tab.
- Validator kiểm graph, trạng thái/review, version, references, nội dung sinh, decision/config và skill example; có kiểm thử mutation âm tính cho các regression quan trọng.

**Trace nguồn:** khi nội dung đầu vào xung đột, dùng quyết định LOCKED trong config/decision record làm cơ sở, thay vì giữ giá trị mặc định trong các đoạn cũ. Bản sao nguyên trạng trước sửa được lưu ngoài repo, đường dẫn và kết quả kiểm tra trong [báo cáo tái cấu trúc](../reports/DOCS-REBASE-01/summary.md).

## Quy tắc các lần sau

Thay đổi ghi ngày, yêu cầu/nguồn chấp nhận, tác động docs/spec/task, test thực và limitation. Thay LOCKED cần chủ dự án duyệt trước phần phụ thuộc; thay seed theo playtest ghi evidence. Không dùng version mới để tự động cho một task game là done.
