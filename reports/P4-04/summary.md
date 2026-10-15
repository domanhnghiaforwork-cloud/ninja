# Báo cáo task — Ninja Arena v0.1

- TASK_ID: P4-04
- DATE: 2026-10-15 (Asia/Saigon)
- STATUS: done
- GOAL: Thuật toán quét đạn Earliest-TOI (Time of Impact), tầm nhìn LOS, vụ nổ AoE và tích hợp hệ thống phòng thủ.
- DEPENDENCIES_CHECKED: P4-03 (done)
- ENVIRONMENT: Ubuntu 22.04.5 LTS, Node.js v22.23.3, TypeScript 5.8.2
- COMMIT: N/A
- FILES_CHANGED:
  - `packages/shared/src/combat.ts`: Hàm `findEarliestTOI`, `rayCircleIntersection`, `rayAABBIntersection`.
  - `apps/server/src/rooms/DuelRoom.ts`: Tích hợp quét va chạm TOI giữa đạn, tường M0, người chơi và phân thân; xử lý nổ lan AoE của Fireball với kiểm tra LOS.
  - `tests/combat_system.test.ts`: TC-11 kiểm chứng đạn bị tường chặn khi đứng sau tường, đạn trúng người khi đứng trước tường, ngăn chặn hiện tượng xuyên vật cản ở tốc độ cao (anti-tunneling).
- IMPLEMENTATION:
  - Thuật toán quét TOI: Mỗi projectile di chuyển từ toạ độ cũ `(oldX, oldY)` đến toạ độ mới `(x, y)`. Thuật toán tham số hoá đường đi `P(t)` và giải phương trình giao điểm với tất cả các hộp AABB chướng ngại vật và hình tròn người chơi / phân thân.
  - Sắp xếp thứ tự thời điểm va chạm `t` tăng dần: nếu va chạm tường xảy ra trước (`t_wall < t_target`), đạn dừng lại tại mặt tường, đối thủ nấp phía sau không phải nhận bất kỳ sát thương nào.
  - Vụ nổ lan AoE của Fireball: khi va chạm, thực hiện kiểm tra bán kính 80 units kết hợp thuật toán Liang-Barsky `hasLineOfSight` để đảm bảo sóng xung kích không xuyên qua các bức tường che chắn.

## TESTS — lệnh và kết quả thực tế

| Lệnh / thao tác | Exit code / kết quả | PASS / FAIL / NOT RUN | File output |
|---|---|---|---|
| `vitest run tests/combat_system.test.ts` | 0 / TC-11 tests pass | PASS | stdout |
| `npm run typecheck` | 0 / passes | PASS | stdout |
| `npm run build` | 0 / passes | PASS | dist/assets/ |

## ACCEPTANCE_EVIDENCE

| Tiêu chí từ backlog | Evidence: file/test case/kết quả | Đạt / chưa đạt |
|---|---|---|
| TC-11: actor trước wall bị hit, wall trước actor chặn, equal-TOI deterministic, high-speed không tunnel | `tests/combat_system.test.ts` TC-11 test cases pass | Đạt |
| Counter/AoE không damage xuyên cover | Fireball AoE checks `hasLineOfSight` before applying damage | Đạt |

## RISKS/NOT_RUN

- Không có.

## NEXT_ALLOWED_TASK

**P4-05** ("Round end, timer, rematch").

## REVIEW

- Reviewer: project_owner
- Decision: ACCEPTED
- Date / evidence: 2026-10-15
