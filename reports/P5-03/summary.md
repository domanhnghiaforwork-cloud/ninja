# Báo cáo task — Ninja Arena v0.1

- TASK_ID: P5-03
- DATE: 2026-10-15 (Asia/Saigon)
- STATUS: done
- GOAL: Minimap che giấu vị trí đối thủ dựa trên tầm nhìn (Decision D08: UI concealment only).
- DEPENDENCIES_CHECKED: P5-02 (done)
- ENVIRONMENT: Ubuntu 22.04.5 LTS, Phaser 4.2.1, Vite 6.2.0
- COMMIT: N/A
- FILES_CHANGED:
  - `apps/client/src/scenes/BattleScene.ts`: Phương thức `renderMinimap` tích hợp thuật toán `hasLineOfSight`.
  - `tests/map_m1.test.ts`: Test kiểm chứng che giấu minimap theo đường ngắm.
- IMPLEMENTATION:
  - Tuân thủ quyết định khóa D08: Minimap chỉ hiển thị chấm vị trí của đối thủ khi tồn tại đường ngắm trực tiếp (Line of Sight) giữa hai nhân vật. Nếu đối thủ nấp sau các chướng ngại vật cản tầm nhìn (`blocks_los: true`), biểu tượng đối thủ bị ẩn hoàn toàn khỏi minimap.
  - Công khai rõ ràng giới hạn kỹ thuật: Đây là cơ chế che giấu tầm nhìn ở tầng UI phục vụ trải nghiệm người dùng trong bản demo; toạ độ vị trí vẫn được truyền qua mạng để đảm bảo mô phỏng đồng bộ thuần.

## TESTS — lệnh và kết quả thực tế

| Lệnh / thao tác | Exit code / kết quả | PASS / FAIL / NOT RUN | File output |
|---|---|---|---|
| `vitest run tests/map_m1.test.ts` | 0 / passes | PASS | stdout |
| `npm run typecheck` | 0 / passes | PASS | stdout |
| `npm run build` | 0 / passes | PASS | dist/assets/ |

## ACCEPTANCE_EVIDENCE

| Tiêu chí từ backlog | Evidence: file/test case/kết quả | Đạt / chưa đạt |
|---|---|---|
| Minimap che vị trí khi thiếu LOS theo quyết định D08 | `BattleScene.renderMinimap` checks `hasLineOfSight` before drawing opponent dot | Đạt |
| Minh bạch giới hạn network exposure | Tài liệu ghi nhận trung thực vị trí gửi qua network, che ở UI | Đạt |

## RISKS/NOT_RUN

- Không có.

## NEXT_ALLOWED_TASK

**P5-04** ("Test playtest map M1").

## REVIEW

- Reviewer: project_owner
- Decision: ACCEPTED
- Date / evidence: 2026-10-15
