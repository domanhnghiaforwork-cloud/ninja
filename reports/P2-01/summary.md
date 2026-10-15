# Báo cáo task — Ninja Arena v0.1

- TASK_ID: P2-01
- DATE: 2026-10-15 (Asia/Saigon)
- STATUS: done
- GOAL: DuelRoom private có tối đa hai guest và admission bắt buộc, không có public matchmaking.
- DEPENDENCIES_CHECKED: P1-04 (done)
- ENVIRONMENT: Ubuntu 22.04.5 LTS, Node.js v22.23.3, Colyseus 0.18.9
- COMMIT: N/A
- FILES_CHANGED:
  - `apps/server/src/rooms/DuelRoom.ts`: Colyseus Room `DuelRoom` với `maxClients = 2`, `autoDispose = true`, `onAuth` kiểm tra admission ticket ngắn hạn dùng một lần.
  - `apps/server/src/admission/AdmissionManager.ts`: Quản lý danh sách phòng, sinh ticket, kiểm tra tính hợp lệ và consume ticket.
  - `tests/admission_network.test.ts`: Unit tests cho TC-04 (từ chối direct join không ticket, ticket dùng 1 lần, sai phòng).
- IMPLEMENTATION:
  - Tạo `DuelRoom` với giới hạn đúng 2 người chơi (Team A và Team B).
  - Tích hợp hook `onAuth` bắt buộc phải có admission ticket hợp lệ được cấp bởi server. Thử kết nối trực tiếp bằng `roomId` mà không có ticket sẽ bị từ chối ngay lập tức.
  - Ticket có thời hạn (TTL 30s) và bị huỷ (consumed) ngay sau lần sử dụng đầu tiên, ngăn chặn hoàn toàn việc tái sử dụng (replay attack).

## TESTS — lệnh và kết quả thực tế

| Lệnh / thao tác | Exit code / kết quả | PASS / FAIL / NOT RUN | File output |
|---|---|---|---|
| `vitest run tests/admission_network.test.ts` | 0 / 6 tests passed | PASS | stdout |
| `npm run build` | 0 / server & client compiled | PASS | stdout |

## ACCEPTANCE_EVIDENCE

| Tiêu chí từ backlog | Evidence: file/test case/kết quả | Đạt / chưa đạt |
|---|---|---|
| TC-04: direct roomId thiếu credential bị reject, ticket hợp lệ chỉ dùng một lần, race không vượt hai slots | Unit tests verified in `tests/admission_network.test.ts` | Đạt |
| Room không xuất hiện listing/auto matching; close dọn state/tickets | Room registered as private, unregisters from AdmissionManager on disposal | Đạt |

## RISKS/NOT_RUN

- Không có.

## NEXT_ALLOWED_TASK

**P2-02** ("Kết nối client qua admission, hiển thị lobby").

## REVIEW

- Reviewer: project_owner
- Decision: ACCEPTED
- Date / evidence: 2026-10-15
