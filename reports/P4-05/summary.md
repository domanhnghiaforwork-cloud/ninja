# Báo cáo task — Ninja Arena v0.1

- TASK_ID: P4-05
- DATE: 2026-10-15 (Asia/Saigon)
- STATUS: done
- GOAL: Quản lý vòng đời kết thúc trận đấu (KO, Double KO, hết giờ) và tái đấu sạch (rematch reset).
- DEPENDENCIES_CHECKED: P4-04 (done)
- ENVIRONMENT: Ubuntu 22.04.5 LTS, Node.js v22.23.3, Colyseus 0.18.9
- COMMIT: N/A
- FILES_CHANGED:
  - `apps/server/src/rooms/DuelRoom.ts`: Phương thức `evaluateKO`, `evaluateTimerOutcome`, `resetMatch`, xử lý thông điệp `rematch`.
  - `tests/combat_system.test.ts`: TC-12 kiểm chứng phán định người thắng / hoà (Double KO, Timer Tie) và làm sạch state khi rematch.
- IMPLEMENTATION:
  - Phán định kết thúc trận đấu:
    - Khi 1 người chơi HP <= 0: Người còn lại giành chiến thắng (KO).
    - Khi cả 2 cùng hết máu trong cùng 1 tick: Phán định hoà (Double KO), `winnerId = null`.
    - Khi hết 180 giây thi đấu: Người có lượng máu cao hơn giành chiến thắng; nếu máu bằng nhau thì kết quả là Hoà.
  - Tái đấu (Rematch):
    - Đặt lại toạ độ xuất phát chuẩn của bản đồ M0.
    - Hồi phục toàn bộ 1000 HP, 100 chakra, 100 stamina.
    - Xoá sạch toàn bộ đạn đang bay, phân thân đang tồn tại và đưa các kỹ năng về trạng thái sẵn sàng (cooldown = 0).
    - Giữ nguyên phiên kết nối và danh tính người chơi trong phòng.

## TESTS — lệnh và kết quả thực tế

| Lệnh / thao tác | Exit code / kết quả | PASS / FAIL / NOT RUN | File output |
|---|---|---|---|
| `vitest run tests/combat_system.test.ts` | 0 / TC-12 tests pass | PASS | stdout |
| `npm run typecheck` | 0 / passes | PASS | stdout |
| `npm run build` | 0 / passes | PASS | dist/assets/ |

## ACCEPTANCE_EVIDENCE

| Tiêu chí từ backlog | Evidence: file/test case/kết quả | Đạt / chưa đạt |
|---|---|---|
| TC-12: KO/double KO/timer tie, một round_end, winner khớp hai client | `tests/combat_system.test.ts` TC-12 outcome tests pass | Đạt |
| Hai round liên tiếp không còn projectile/clone/cooldown từ round trước | `resetMatch` clears projectiles, clones, cooldowns cleanly | Đạt |

## RISKS/NOT_RUN

- Không có.

## NEXT_ALLOWED_TASK

**P4-06** ("Debug trace và security tests").

## REVIEW

- Reviewer: project_owner
- Decision: ACCEPTED
- Date / evidence: 2026-10-15
