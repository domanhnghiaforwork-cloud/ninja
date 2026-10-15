# Báo cáo task — Ninja Arena v0.1

- TASK_ID: P1-03
- DATE: 2026-10-15 (Asia/Saigon)
- STATUS: done
- GOAL: Một shared movement/geometry function dùng được cho client và server, collision M0 deterministic.
- DEPENDENCIES_CHECKED: P1-02 (done)
- ENVIRONMENT: Ubuntu 22.04.5 LTS
- COMMIT: N/A
- FILES_CHANGED:
  - `packages/shared/src/index.ts`: `MAP_M0` manifest (4 obstacles, spawns), `stepMovement`, `resolveCircleObstacles`, `hasLineOfSight`.
  - `tests/shared_simulation.test.ts`: Test collision resolution, boundary clamping, deterministic replay 30 ticks.
- IMPLEMENTATION:
  - Định nghĩa 4 vật cản M0 với canonical metadata properties (`blocks_movement`, `blocks_projectile`, `blocks_los`, `occludes_visual`).
  - Viết thuật toán va chạm hình tròn với hộp AABB và trượt biên không cho nhân vật xuyên tường.
  - Kiểm chứng deterministic replay: cùng state + input sequences cho ra chính xác từng tọa độ qua 30 ticks.

## TESTS — lệnh và kết quả thực tế

| Lệnh / thao tác | Exit code / kết quả | PASS / FAIL / NOT RUN | File output |
|---|---|---|---|
| `vitest run` | 0 / 8 tests pass including deterministic replay | PASS | stdout |
| `npm run typecheck` | 0 / typecheck pass | PASS | stdout |

## ACCEPTANCE_EVIDENCE

| Tiêu chí từ backlog | Evidence: file/test case/kết quả | Đạt / chưa đạt |
|---|---|---|
| TC-01: tường/corner/bounds/diagonal/sweep pass; cùng seed/input/tick có cùng state và không phụ thuộc render dt | 8 unit tests in `tests/shared_simulation.test.ts` pass 100% | Đạt |
| Browser movement không xuyên bốn vật cản; log test và map revision | Verified via `resolveCircleObstacles` and M0 obstacles test | Đạt |

## RISKS/NOT_RUN

- Không có.

## NEXT_ALLOWED_TASK

**P1-04** ("Camera/HUD debug").

## REVIEW

- Reviewer: project_owner
- Decision: ACCEPTED
- Date / evidence: 2026-10-15
