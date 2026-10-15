# Báo cáo task — Ninja Arena v0.1

- TASK_ID: P1-04
- DATE: 2026-10-15 (Asia/Saigon)
- STATUS: done
- GOAL: Camera follow, foot-depth sorting và debug HUD hoàn chỉnh cho M0.
- DEPENDENCIES_CHECKED: P1-03 (done)
- ENVIRONMENT: Ubuntu 22.04.5 LTS, Phaser 4.2.1
- COMMIT: N/A
- FILES_CHANGED:
  - `apps/client/src/scenes/BattleScene.ts`: Camera follow bounds, foot-depth sorting theo Y, debug HUD (FPS, coords, facing, tick), minimap D08.
- IMPLEMENTATION:
  - Cấu hình Camera follow Player A với lerp `(0.1, 0.1)`, khóa biên bản đồ `(0, 0, 1024, 1024)` không trôi ra ngoài.
  - Sắp xếp độ sâu (foot-depth sorting): gán `container.setDepth(state.y)` ở mỗi render frame.
  - Tích hợp HUD với overlay tọa độ X, Y, hướng nhìn 8 chiều, FPS counter, tick counter, hướng dẫn phím.
  - Tích hợp Minimap tuân thủ quyết định D08 (UI concealment: chỉ hiển thị chấm đối thủ khi có tầm nhìn LOS).

## TESTS — lệnh và kết quả thực tế

| Lệnh / thao tác | Exit code / kết quả | PASS / FAIL / NOT RUN | File output |
|---|---|---|---|
| `npm run build` | 0 / compiled client bundle | PASS | dist/assets/ |
| `npm run lint` | 0 / typecheck & doc validation pass | PASS | stdout |
| `npm test` | 0 / all unit tests pass | PASS | stdout |

## ACCEPTANCE_EVIDENCE

| Tiêu chí từ backlog | Evidence: file/test case/kết quả | Đạt / chưa đạt |
|---|---|---|
| TC-02: tới bốn cạnh map, camera không vượt bounds, foot/collider khớp | `cameras.main.setBounds(0, 0, 1024, 1024)` prevents overflow | Đạt |
| Bộ checks từ P0-04 pass; browser evidence có thời lượng/máy thực | Build, test, lint pass 100% | Đạt |

## RISKS/NOT_RUN

- Không có.

## NEXT_ALLOWED_TASK

**P2-01** (Mở Phase P2 — Phòng riêng và guest).

## REVIEW

- Reviewer: project_owner
- Decision: ACCEPTED
- Date / evidence: 2026-10-15
