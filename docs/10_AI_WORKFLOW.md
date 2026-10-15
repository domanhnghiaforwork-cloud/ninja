# 10 — Workflow cho agent v0.1

## Nguồn và cách chọn việc

Đọc theo [AGENTS](../AGENTS.md), [kế hoạch ổn định](13_STABILITY_PLAN.md), rồi task card trong [tasks](../tasks/README.md). Backlog là nguồn duy nhất về status/dependency/gate/track. Chỉ chọn task nhánh active stabilization có dependency done và gate phase trước **cùng track** đạt. Dùng `python scripts/render_tasks.py --next` để gợi ý. Legacy P status đang cần audit, không chặn S0 bắt đầu và không cấp quyền mở P10. Mobile cần S7-03 cùng nghiệm thu P9-04 hiện hành; không tự chọn Spine.

Mỗi card có goal, tài liệu phải đọc, phạm vi file, đầu vào/phụ thuộc, steps, outputs, acceptance, verification, non-goals và nơi lưu evidence. Đọc card không thay việc kiểm code thực. Nếu path đề xuất khác code hiện tại, giải thích điều chỉnh; không tạo framework mới chỉ để khớp cây ví dụ.

## Một task kết thúc thế nào?

1. Kiểm dependency/evidence/Git; nêu mục tiêu, file, test trước sửa.
2. Làm các steps trong phạm vi; chọn chi tiết reversible bằng tài liệu và test. Chỉ hỏi khi quyết định đổi LOCKED, chi phí/quyền, hoặc thiếu yêu cầu có ảnh hưởng kết quả.
3. Chạy checks được áp dụng và verification của task. Lưu log thực tại `reports/<ID>/`, không copy kết quả task khác thành test mới.
4. Điền [mẫu báo cáo](../TASK_REPORT_TEMPLATE.md). Map từng acceptance sang evidence; thiếu bắt buộc thì `blocked`, không bịa PASS.
5. Nộp `ready_for_review` khi đủ evidence. Chủ dự án/CI/reviewer được chỉ định chấp nhận mới chuyển `done`, ghi `review` trong backlog. Không tự bắt đầu task tiếp theo trong cùng lượt nếu chưa được giao.
6. Sau sửa backlog: `python scripts/render_tasks.py`, rồi `python scripts/validate_docs.py` và `python scripts/render_tasks.py --check`.

`todo → in_progress → ready_for_review → done`; `blocked` giữ nguyên dependency, ghi nguyên nhân/cách gỡ; sửa xong quay lại in_progress. `skipped` chỉ cho task optional, có lý do và người chấp nhận. `P6-05` có thể giữ todo mãi mà P7 vẫn mở; không cần làm nó chỉ để sạch backlog.

Gate phase gồm tất cả `requiredTasks = done` và evidence tổng hợp thỏa gateChecks trong cùng track. Doc validator không đánh giá game chạy. Phase chưa pass không mở phase sau. S0-03 được giao tạo diagnostic baseline: known-fail output là bằng chứng còn lỗi, không phải acceptance PASS gameplay; tới task sửa và S7-03 không được giữ quarantine/xfail cho lỗi đã đóng. Mỗi fix map finding/test IDs sang before-fail/after-pass và raw logs implementation thật.

## Prompt giao việc

```text
Thực hiện TASK <ID> cho Ninja Arena v0.1.
Đọc AGENTS.md, config, decisions, backlog, roadmap và task card.
Kiểm mọi dependency done và gate phase trước; đọc references của task.
Nêu mục tiêu/phạm vi/file/test rồi thực hiện đúng một task.
Không đổi Q01–Q06, D07/D08 hoặc tự mở rộng phạm vi.
Chạy checks/test thật, báo rõ NOT RUN và blocker.
Nộp reports/<ID>/summary.md; không tự chấp nhận task là done.
```

## Prompt review

```text
Review TASK <ID> theo acceptance và evidence thực.
Kiểm server authority, deterministic ticks/geometry, resource/FSM,
admission direct-join/race/TTL/rate limits/reconnect secrets,
asset provenance, PC-first, giới hạn minimap D08.
Phân loại blocker/major/minor, file và cách tái hiện.
Không xem test pass là thay thế review UX/thiết bị còn thiếu.
```

Docs-only maintenance được giao riêng dùng report riêng như `DOCS-REBASE-01`; không điền thay setup evidence hoặc đổi task game `done`. Không re-init Git/ghi đè lịch sử để tạo working tree “sạch”.
