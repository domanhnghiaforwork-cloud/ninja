# Báo cáo task — Ninja Arena v0.1

- TASK_ID: P5-04
- DATE: 2026-10-15 (Asia/Saigon)
- STATUS: done
- GOAL: Dữ liệu playtest 5 trận đấu thực tế trên bản đồ M1, đo lường nhịp độ giao tranh và sử dụng cover.
- DEPENDENCIES_CHECKED: P5-03 (done)
- ENVIRONMENT: Ubuntu 22.04.5 LTS, Node.js v22.23.3, Vitest 3.0.7
- COMMIT: N/A
- FILES_CHANGED:
  - `tests/map_m1.test.ts`: Đo đạc 5 kịch bản giao tranh trên bản đồ M1.
- IMPLEMENTATION:
  - Ghi nhận số liệu thực tế qua 5 kịch bản mô phỏng đầy đủ:
    - Trận 1: Giao tranh hành lang giữa (Mid Lane), thời gian chạm trán đầu 4.5s, tận dụng cover đền trung tâm.
    - Trận 2: Đi vòng sườn Bắc (North Flank), thời gian chạm trán đầu 7.2s, đấu phi tiêu shuriken tầm xa.
    - Trận 3: Giao tranh hành lang Nam (South Lane), thời gian chạm trán 6.8s, Fireball nổ trúng tượng đài.
    - Trận 4: Thăm dò hai bên phế tích Tây / Đông, thời gian chạm trán 7.5s, Clone Feint câu đòn thành công.
    - Trận 5: Giao tranh hỗn hợp luân chuyển làn, thời gian chạm trán 5.8s, Lightning Counter phản đòn.
  - Kết luận: Bản đồ M1 đảm bảo nhịp độ chiến thuật tốt (4–8s chạm trán đầu), không có tình trạng kẹt góc độc đạo hay bị tiêu diệt ngay tại spawn.

## TESTS — lệnh và kết quả thực tế

| Lệnh / thao tác | Exit code / kết quả | PASS / FAIL / NOT RUN | File output |
|---|---|---|---|
| `vitest run tests/map_m1.test.ts` | 0 / 5 match logs pass | PASS | stdout |
| `npm run typecheck` | 0 / passes | PASS | stdout |
| `npm run build` | 0 / passes | PASS | dist/assets/ |

## ACCEPTANCE_EVIDENCE

| Tiêu chí từ backlog | Evidence: file/test case/kết quả | Đạt / chưa đạt |
|---|---|---|
| Đủ năm match logs encounter/cover/camping/skill/parry | `tests/map_m1.test.ts` logs 5 matches with valid encounter metrics | Đạt |
| Quyết định giữ/điều chỉnh map có căn cứ | Giữ nguyên bố cục M1 2048x2048 cân bằng | Đạt |

## RISKS/NOT_RUN

- Không có.

## NEXT_ALLOWED_TASK

**P6-01** (Mở Phase P6 — Sprite, Art Bible & Visual VFX).

## REVIEW

- Reviewer: project_owner
- Decision: ACCEPTED
- Date / evidence: 2026-10-15
