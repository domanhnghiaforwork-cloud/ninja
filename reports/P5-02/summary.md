# Báo cáo task — Ninja Arena v0.1

- TASK_ID: P5-02
- DATE: 2026-10-15 (Asia/Saigon)
- STATUS: done
- GOAL: Sắp xếp chiều sâu theo chân nhân vật (foot-based depth sort) và độ trong suốt khi đứng sau vật cản (occlusion).
- DEPENDENCIES_CHECKED: P5-01 (done)
- ENVIRONMENT: Ubuntu 22.04.5 LTS, Phaser 4.2.1, Vite 6.2.0
- COMMIT: N/A
- FILES_CHANGED:
  - `apps/client/src/scenes/BattleScene.ts`: Xếp lớp chiều sâu `container.setDepth(state.y)`, làm mờ nóc chướng ngại vật (alpha 0.45) khi nhân vật đứng sau.
  - `tests/map_m1.test.ts`: Kiểm chứng các điều kiện che khuất và tính toán không gian 3/4.
- IMPLEMENTATION:
  - Phối cảnh 3/4 orthogonal yêu cầu thực thể có toạ độ Y lớn hơn (ở phía dưới màn hình) phải nằm đè lên thực thể có toạ độ Y nhỏ hơn (ở phía trên). Sử dụng `container.setDepth(state.y)` cho toàn bộ đấu sĩ và đạn.
  - Cơ chế Occlusion: Khi nhân vật đứng sau các cấu trúc lớn (chướng ngại vật có `occludes_visual: true`), phần mái/nóc cấu trúc tự động giảm độ mờ (alpha = 0.45) để người chơi luôn quan sát được vị trí của mình mà không làm ảnh hưởng đến hình học va chạm phía dưới.

## TESTS — lệnh và kết quả thực tế

| Lệnh / thao tác | Exit code / kết quả | PASS / FAIL / NOT RUN | File output |
|---|---|---|---|
| `vitest run tests/map_m1.test.ts` | 0 / passes | PASS | stdout |
| `npm run typecheck` | 0 / passes | PASS | stdout |
| `npm run build` | 0 / passes | PASS | dist/assets/ |

## ACCEPTANCE_EVIDENCE

| Tiêu chí từ backlog | Evidence: file/test case/kết quả | Đạt / chưa đạt |
|---|---|---|
| Foot-depth/occlusion đọc đúng mà không đổi geometry gameplay | `BattleScene.ts` applies `setDepth(y)` and roof occlusion without altering physics AABB | Đạt |

## RISKS/NOT_RUN

- Không có.

## NEXT_ALLOWED_TASK

**P5-03** ("Minimap che giấu tầm nhìn UI").

## REVIEW

- Reviewer: project_owner
- Decision: ACCEPTED
- Date / evidence: 2026-10-15
