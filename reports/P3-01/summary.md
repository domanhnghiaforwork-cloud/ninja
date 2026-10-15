# Báo cáo task — Ninja Arena v0.1

- TASK_ID: P3-01
- DATE: 2026-10-15 (Asia/Saigon)
- STATUS: done
- GOAL: Server authoritative movement theo fixed ticks (30Hz) và validation input chặt chẽ chống gian lận.
- DEPENDENCIES_CHECKED: P2-04 (done)
- ENVIRONMENT: Ubuntu 22.04.5 LTS, Node.js v22.23.3, TypeScript 5.8.2
- COMMIT: N/A
- FILES_CHANGED:
  - `packages/shared/src/index.ts`: Thêm `validateInputFrame`, `MAX_BUTTON_MASK`, loại bỏ các trường tiêm nhiễm (x, y, hp, damage).
  - `apps/server/src/rooms/DuelRoom.ts`: Tích hợp `validateInputFrame`, rate limit đầu vào 60 frames/s per client, server authoritative fixed timestep simulation 30Hz.
  - `tests/movement_authoritative.test.ts`: Kiểm chứng TC-06 với injection, NaN/Infinity, out-of-range bitmask, stale/future ticks và deterministic movement replay.
- IMPLEMENTATION:
  - Hàm `validateInputFrame` kiểm tra nghiêm ngặt: loại bỏ hoàn toàn các trường toạ độ `x, y`, lượng máu `hp`, lượng sát thương `damage` do client gửi lên; client không bao giờ có quyền quyết định vị trí hay chỉ số.
  - Loại bỏ các giá trị phi số (NaN, Infinity), tick âm hoặc tick quá xa trong tương lai (> 30 ticks).
  - Lượng giác hoá và lượng tử hoá `dx, dy` về -1, 0, 1; lọc bitmask phím bấm hợp lệ (bits 0..4).
  - Server thực thi `stepMovement` trên state authoritative và broadcast cho clients qua state patches (20Hz).

## TESTS — lệnh và kết quả thực tế

| Lệnh / thao tác | Exit code / kết quả | PASS / FAIL / NOT RUN | File output |
|---|---|---|---|
| `vitest run tests/movement_authoritative.test.ts` | 0 / TC-06 tests pass | PASS | stdout |
| `npm run typecheck` | 0 / all workspaces clean | PASS | stdout |
| `npm run build` | 0 / build success | PASS | stdout |

## ACCEPTANCE_EVIDENCE

| Tiêu chí từ backlog | Evidence: file/test case/kết quả | Đạt / chưa đạt |
|---|---|---|
| TC-06: x/HP/damage injection, NaN/Infinity/range/bitmask, high-rate/future/stale không tăng speed hoặc crash | `tests/movement_authoritative.test.ts` test case strips malicious fields and rejects invalid inputs | Đạt |
| Replay cùng shared input/ticks ra cùng movement | `tests/movement_authoritative.test.ts` deterministic replay test pass | Đạt |

## RISKS/NOT_RUN

- Không có.

## NEXT_ALLOWED_TASK

**P3-02** ("Prediction / reconciliation local").

## REVIEW

- Reviewer: project_owner
- Decision: ACCEPTED
- Date / evidence: 2026-10-15
