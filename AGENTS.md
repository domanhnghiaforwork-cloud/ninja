# AGENTS.md — Hợp đồng tác nghiệp v0.1

1. **Phạm vi lượt làm việc:** yêu cầu trực tiếp của chủ dự án thắng hướng dẫn mặc định. Khi phát triển game, chọn đúng một task `todo` có mọi `depends_on = done`; không tự chạy hết backlog. Tái cấu trúc tài liệu được chủ dự án giao riêng có thể dùng ID `DOCS-REBASE-01`, không tự nghiệm thu task game.
2. **Thứ tự đọc:** `README.md` → `spec/project.config.json` → `docs/01_DECISIONS.md` → `spec/backlog.json` → `docs/07_ROADMAP.md` → `tasks/README.md` và task card/tài liệu được task tham chiếu → kiểm tra code/Git thực tế.
3. **Nguồn chuẩn:** config giữ quyết định/tham số chung; skill roster giữ combat seed; backlog giữ trạng thái/dependency/gate/hướng dẫn task. `tasks/*.md` và roadmap là bản sinh từ backlog. Nếu nguồn chuẩn mâu thuẫn, dừng phần phụ thuộc và hỏi chủ dự án; không chọn theo số phiên bản cũ.
4. **Q01–Q06 LOCKED:** demo cá nhân; solo + AI; combat tầm xa/phản đòn; orthogonal 3/4; PC trước mobile; phòng riêng guest không login. Không hỏi lại hoặc đổi nếu chủ dự án chưa yêu cầu.
5. Trước khi sửa, nêu mục tiêu, phạm vi, file và test. Đọc file hiện có; không ghi đè repo/secrets/asset, đổi major package, mua license hoặc deploy ngoài phạm vi được giao mà chưa kiểm tra và có thẩm quyền phù hợp.
6. **Server authoritative:** chỉ nhận input đã validate; không tin HP/damage/position client. Shared simulation thuần, fixed ticks; collision/LOS/projectile/parry có test biên và deterministic replay. Render không quyết định hit.
7. **Phòng riêng:** CSPRNG code + TTL + rate limit; private room + `joinById`; admission credential ngắn hạn phải được kiểm tại join, kể cả join trực tiếp bằng roomId. Room tối đa hai người; reconnect secret khác invite code và không vào logs/state.
8. **Quyết định bổ sung của chủ dự án:** mất kết nối thì trận tiếp tục, nhân vật đứng yên nhưng vẫn nhận đòn; hết grace thì forfeit. Minimap chỉ che ở UI trong demo, không hứa chống đọc vị trí qua network. Xem D07/D08.
9. **Assets:** Naruto/Sasuke chỉ là tham chiếu demo; không tự tải/rip sprite/OST/voice chính thức. Chỉ dùng asset có nguồn/quyền rõ. Placeholder → sprite atlas; Spine tùy chọn và không chặn P7. Không phát hành công khai khi chưa được phê duyệt phạm vi và quyền.
10. **Test thật:** ghi lệnh, output, máy/browser, PASS/FAIL/NOT RUN. Không tạo bằng chứng giả hoặc coi compile là đủ. Thiếu kiểm tra acceptance bắt buộc thì báo `blocked` cùng cách chạy còn thiếu.
11. **Nghiệm thu:** đủ acceptance evidence + lint/typecheck/test/build phù hợp + cập nhật docs + không secrets. Agent nộp `ready_for_review`; chỉ chủ dự án hoặc CI/reviewer được chỉ định chuyển `done` sau khi kiểm evidence. Test tự chạy không tự cấp quyền duyệt. Task tùy chọn chỉ `skipped` có lý do và review; task bắt buộc không được skip.
12. **Báo cáo:** dùng `TASK_REPORT_TEMPLATE.md`, lưu `reports/<TASK_ID>/summary.md`. Bắt buộc `TASK_ID`, `STATUS`, `FILES_CHANGED`, `TESTS`, `ACCEPTANCE_EVIDENCE`, `RISKS/NOT_RUN`, `NEXT_ALLOWED_TASK`.
13. **Baseline:** toàn bộ tài liệu hiện hành mang v0.1/0.1.0 theo yêu cầu chủ dự án. Không suy diễn đây là quay lại quyết định trước đó. Giữ ID task và trạng thái có bằng chứng; ghi thay đổi tại `docs/12_CHANGELOG.md`.

Task phát triển đầu tiên: **P0-02**. `P0-01` đã được chủ dự án chấp nhận; kiểm trạng thái mới nhất trong backlog trước mỗi lượt.
