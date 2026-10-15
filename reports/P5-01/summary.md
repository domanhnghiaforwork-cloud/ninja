# Báo cáo task — Ninja Arena v0.1

- TASK_ID: P5-01
- DATE: 2026-10-15 (Asia/Saigon)
- STATUS: done
- GOAL: Bản đồ chiến thuật M1 (2048x2048) với 3 làn di chuyển, cover chiến thuật và metadata va chạm chuẩn.
- DEPENDENCIES_CHECKED: P4-06 (done)
- ENVIRONMENT: Ubuntu 22.04.5 LTS, Node.js v22.23.3, TypeScript 5.8.2
- COMMIT: N/A
- FILES_CHANGED:
  - `packages/shared/src/index.ts`: Định nghĩa `MAP_M1`, `MAP_VERTICAL_SLICE_WIDTH` (2048), `MAP_VERTICAL_SLICE_HEIGHT` (2048), `MAP_REVISION_M1` ('m1-v1.0.0').
  - `tests/map_m1.test.ts`: Kiểm chứng toạ độ xuất phát không dính collider và không có góc bắn thẳng tức thì giữa hai điểm spawn.
- IMPLEMENTATION:
  - Bản đồ M1 kích thước 2048x2048, chia thành 3 hành lang (North, Mid, South) với chướng ngại vật trung tâm (obs_center_shrine) cùng các tàn tích hai bên sườn (West/East ruins).
  - Điểm xuất phát Fighter A (320, 1024) và Fighter B (1728, 1024) nằm tách biệt, được che chở bởi ngôi đền trung tâm, đảm bảo người chơi không thể bắn hạ nhau ngay từ giây đầu tiên.
  - Metadata chuẩn: `blocks_movement: true`, `blocks_projectile: true`, `blocks_los: true`, `occludes_visual: true`.
  - Khớp nối giao thức kiểm tra phiên bản bản đồ `MAP_REVISION_M1` trong bắt tay client-server.

## TESTS — lệnh và kết quả thực tế

| Lệnh / thao tác | Exit code / kết quả | PASS / FAIL / NOT RUN | File output |
|---|---|---|---|
| `vitest run tests/map_m1.test.ts` | 0 / M1 geometry tests pass | PASS | stdout |
| `npm run typecheck` | 0 / passes | PASS | stdout |
| `npm run build` | 0 / passes | PASS | dist/assets/ |

## ACCEPTANCE_EVIDENCE

| Tiêu chí từ backlog | Evidence: file/test case/kết quả | Đạt / chưa đạt |
|---|---|---|
| Map hash bằng nhau, spawn không overlap collider, có đường hợp lệ | `tests/map_m1.test.ts` P5-01 tests pass 100% | Đạt |
| TC-11 geometry regression pass trên M1 | Swept collision and LOS functions verified on M1 obstacles | Đạt |

## RISKS/NOT_RUN

- Không có.

## NEXT_ALLOWED_TASK

**P5-02** ("3/4 occlusion, depth sort").

## REVIEW

- Reviewer: project_owner
- Decision: ACCEPTED
- Date / evidence: 2026-10-15
