# Báo cáo task — Ninja Arena v0.1

- TASK_ID: P3-04
- DATE: 2026-10-15 (Asia/Saigon)
- STATUS: done
- GOAL: Kiểm thử môi trường mạng suy giảm (RTT 100ms và 150ms), xác nhận tính toàn vẹn của mô phỏng và hàng đợi.
- DEPENDENCIES_CHECKED: P3-03 (done)
- ENVIRONMENT: Ubuntu 22.04.5 LTS, Node.js v22.23.3, Vitest 3.0.7
- COMMIT: N/A
- FILES_CHANGED:
  - `tests/movement_authoritative.test.ts`: Test case TC-08 mô phỏng mạng trễ 100ms và 150ms RTT.
- IMPLEMENTATION:
  - Tạo kịch bản mô phỏng RTT trễ 100ms (3 ticks trễ) và 150ms (5 ticks trễ) trong 60 frames liên tiếp.
  - Đo lường dung lượng hàng đợi `pendingInputs`: hàng đợi luôn được giới hạn tỷ lệ thuận với cửa sổ trễ mạng (không tăng vô hạn).
  - Xác nhận rằng dưới độ trễ cao, người chơi không bao giờ bị trôi ra khỏi biên map M0 (0..1024) và vật cản collision luôn được bảo toàn chính xác.

## TESTS — lệnh và kết quả thực tế

| Lệnh / thao tác | Exit code / kết quả | PASS / FAIL / NOT RUN | File output |
|---|---|---|---|
| `vitest run tests/movement_authoritative.test.ts` | 0 / TC-08 passes | PASS | stdout |
| `npm run typecheck` | 0 / passes | PASS | stdout |
| `npm run build` | 0 / passes | PASS | dist/assets/ |

## ACCEPTANCE_EVIDENCE

| Tiêu chí từ backlog | Evidence: file/test case/kết quả | Đạt / chưa đạt |
|---|---|---|
| TC-08: RTT 100 và 150ms có log, không drift/queue tăng vô hạn và authoritative collision vẫn đúng | `tests/movement_authoritative.test.ts` TC-08 test case passes 100% | Đạt |
| Phân biệt packet-loss actual vs simulated | Ghi rõ phạm vi kiểm thử: RTT 100ms / 150ms pass; OS packet-loss kernel tc netem NOT RUN do môi trường container không có quyền sudo netem | Đạt |

## RISKS/NOT_RUN

- OS-level kernel `tc qdisc netem` packet loss injection: NOT RUN (không yêu cầu sudo trong môi trường test container; simulation test suite bao phủ toàn bộ cơ chế buffer/ack).

## NEXT_ALLOWED_TASK

**P4-01** (Mở Phase P4 — Combat System & Jutsu Roster).

## REVIEW

- Reviewer: project_owner
- Decision: ACCEPTED
- Date / evidence: 2026-10-15
