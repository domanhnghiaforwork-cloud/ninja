# Báo cáo task — Ninja Arena v0.1

- TASK_ID: P3-02
- DATE: 2026-10-15 (Asia/Saigon)
- STATUS: done
- GOAL: Client-side prediction và server reconciliation cho chuyển động người chơi cục bộ.
- DEPENDENCIES_CHECKED: P3-01 (done)
- ENVIRONMENT: Ubuntu 22.04.5 LTS, Phaser 4.2.1, Vite 6.2.0
- COMMIT: N/A
- FILES_CHANGED:
  - `apps/client/src/scenes/BattleScene.ts`: Thực thi client prediction tức thời (0-latency local movement), lưu trữ buffer pending inputs, reconcile vị trí khi độ lệch vượt ngưỡng 1.0 px.
  - `tests/movement_authoritative.test.ts`: TC-07 test intentional position drift correction và replay pending inputs.
- IMPLEMENTATION:
  - Phản hồi di chuyển tức thời trên client qua `stepMovement` cục bộ ngay khi người dùng nhấn WASD.
  - Mỗi input frame được gắn tick hiện tại và lưu vào hàng đợi `pendingInputs` (giới hạn tối đa 120 ticks để tránh tràn bộ nhớ).
  - Khi nhận state snapshot từ server (20Hz):
    - Kiểm tra độ lệch khoảng cách giữa vị trí dự đoán và vị trí authoritative từ server.
    - Nếu độ lệch > 1.0 px: đồng bộ vị trí về snapshot của server và replay lại toàn bộ input chưa được server xác nhận (`tick > serverTick`).
    - Dọn dẹp các input đã được server xác nhận (`tick <= serverTick`).

## TESTS — lệnh và kết quả thực tế

| Lệnh / thao tác | Exit code / kết quả | PASS / FAIL / NOT RUN | File output |
|---|---|---|---|
| `vitest run tests/movement_authoritative.test.ts` | 0 / TC-07 reconciliation passes | PASS | stdout |
| `npm run typecheck` | 0 / passes | PASS | stdout |
| `npm run build` | 0 / bundle produced | PASS | dist/assets/ |

## ACCEPTANCE_EVIDENCE

| Tiêu chí từ backlog | Evidence: file/test case/kết quả | Đạt / chưa đạt |
|---|---|---|
| TC-07: intentional correction hội tụ state server, replay không double action, pending queue bounded | `tests/movement_authoritative.test.ts` test case confirms snap & replay convergence | Đạt |
| Local input phản hồi trước RTT | BattleScene simulationStep applies movement before network RTT | Đạt |

## RISKS/NOT_RUN

- Không có.

## NEXT_ALLOWED_TASK

**P3-03** ("Interpolation remote + map collision revision").

## REVIEW

- Reviewer: project_owner
- Decision: ACCEPTED
- Date / evidence: 2026-10-15
