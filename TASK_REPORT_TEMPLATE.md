# Báo cáo task — Ninja Arena v0.1

- TASK_ID:
- DATE: YYYY-MM-DD (Asia/Saigon)
- STATUS: todo | in_progress | ready_for_review | blocked | done | skipped
- GOAL:
- DEPENDENCIES_CHECKED: ID + trạng thái + nguồn kiểm tra
- ENVIRONMENT: OS, máy, browser, network/region nếu liên quan
- COMMIT: SHA hoặc N/A (chưa có Git)
- FILES_CHANGED: file + mục đích
- IMPLEMENTATION: kết quả, lựa chọn kỹ thuật, giả định
- TRACK / FINDING_IDS / TEST_CASE_IDS: active track, Fxx và ST-* được task xử lý
- CONTENT_HASHES / SEED / ROUND: gameplay/map/presentation hashes, replay seed/round khi liên quan

## TESTS — lệnh và kết quả thực tế

| Lệnh / thao tác | Exit code / kết quả | PASS / FAIL / NOT RUN | File output |
|---|---|---|---|
| | | | |

Ghi nguyên output quan trọng trong file log, bỏ secret trước khi lưu. Phân biệt test tài liệu, unit/integration, browser, thiết bị và đo hiệu năng. Nếu chưa có script npm trong task, ghi N/A có lý do; không bịa lệnh đã chạy.

## ACCEPTANCE_EVIDENCE

| Tiêu chí từ backlog | Evidence: file/test case/kết quả | Đạt / chưa đạt |
|---|---|---|
| | | |

Với bug fix: đính kèm before-fail/after-pass trên implementation thật và replay/fixture tái hiện. Không coi tests tự gán HP/phase rồi expect là test hệ thống. Planned seed/schema pass chỉ chứng minh dữ liệu, không chứng minh runtime đã load. Evidence cũ phải có audit/revalidation trước dùng lại; known-fail diagnostic không gọi là gameplay PASS.

## RISKS/NOT_RUN

Lỗi còn tồn tại; test chưa chạy và lý do; lệnh/các bước để chủ dự án chạy; ảnh hưởng tới gate. Kiểm asset/secrets khi task có liên quan.

## NEXT_ALLOWED_TASK

Task nào chỉ được mở sau khi task này được chấp nhận; không tự bắt đầu task kế tiếp. `done` cần người duyệt và bằng chứng chấp nhận, `skipped` chỉ dùng với task optional.

## REVIEW

- Reviewer:
- Decision: PENDING | ACCEPTED | CHANGES_REQUESTED | SKIP_ACCEPTED
- Date / evidence:
