# DOCS-STABILITY-PLAN-01 — Kế hoạch củng cố khung logic v0.1

- TASK_ID: DOCS-STABILITY-PLAN-01
- DATE: 2026-10-16 (Asia/Saigon); lượt bắt đầu 2026-10-15
- STATUS: ready_for_review
- GOAL: Kế hoạch agent sửa findings hiện có, xây config-driven character/skill core và visual calibration/timing có acceptance thực.
- BASELINE: cbb779f; thư mục review trước đó được giữ nguyên.
- ENVIRONMENT: Windows; Python 3.11.6; jsonschema 4.26.0 đã có sẵn, không cài/đổi runtime package.
- BACKUP: `C:/Users/Admin/AppData/Local/Temp/ninja_before_stability_plan_20261015_235512.zip` — 103 file docs/spec/task/test/report trước sửa, ngoài repo.
- SCOPE: Docs/spec/backlog/generated views/doc tooling/tests; không sửa gameplay hoặc tuyên bố bug đã hết.

## Kết quả

Đã viết kế hoạch 30 task S0–S7 để sửa 12 findings, xây pure shared simulation/config-driven skills và geometry/presentation calibration. Backlog hiện 77 task/19 phase: giữ nguyên 47 P IDs/status/dependency/reviewer/evidence để audit, thêm 30 S task todo, không tự nghiệm thu code.

Chủ dự án chọn D09 hình học theo tick/overlay và D10 hai fighter/hai equipped slots từ thư viện rộng hơn. Đã ghi quyết định trong config/decision record; 12 skill/10 behavior families chỉ là proposed seed, chưa tích hợp runtime. Mỗi fighter có pool sáu skill, default hai slots.

## FILES_CHANGED

- Entry/workflow: `README.md`, `START_HERE.md`, `AGENTS.md`, `AGENT_STABILITY_PROMPT.md`, `TASK_REPORT_TEMPLATE.md`.
- Hợp đồng mới: `docs/13_STABILITY_PLAN.md`, `14_SIMULATION_CONTRACT.md`, `15_DATA_CONFIG_CONTRACT.md`, `16_HITBOX_PRESENTATION_CONTRACT.md`, `17_STABILITY_TEST_MATRIX.md`; bổ sung links/context vào tài liệu nền và changelog.
- Backlog/config: active track, legacy acceptance audit/holds, F01–F12 coverage, test completion ownership; 30 task có goal/files/steps/acceptance/verification/evidence. `tasks/S0..S7.md`/task index/roadmap/matrix được sinh lại, P cards ghi track hold.
- `spec/stability/`: simulation/defense/budgets contract, character configs, 12 skill configs, presentation foot/socket/clip metadata, 33 planned test contracts và bốn JSON Schemas.
- Doc tooling: `scripts/plan_model.py`, `render_tasks.py`, `validate_docs.py`, `validate_stability_plan.py`, `requirements-docs.txt`; `tests/test_docs_validation.py` nâng lên 39 cases.
- Report/logs ở thư mục này. `reports/REVIEW-FRAMEWORK-01/` đã có trước lượt này, được giữ nguyên.

Không sửa `apps/`, `packages/`, runtime package.json/package-lock.json, TypeScript gameplay tests hoặc CI trong lượt lập kế hoạch. Việc sửa những file đó thuộc các S task sau.

## TESTS — actual commands/result

| Lệnh / kiểm tra | Kết quả thực |
|---|---|
| `python scripts/render_tasks.py` | PASS: sinh 23 views, không viết đè source game |
| `python scripts/validate_docs.py` | PASS: 77 tasks/19 phases; graph, decisions, gates, source refs, generated views và local links |
| `python scripts/render_tasks.py --check` | PASS: 23 views khớp JSON |
| `python scripts/render_tasks.py --next` | PASS: chỉ trả `[NEXT] S0-01` |
| `python scripts/validate_stability_plan.py --schemas` | PASS: bốn JSON Schemas + semantic checks; hai fighter/12 skills/33 planned cases |
| `python -m unittest discover -s tests -p test_docs_validation.py -v` | PASS: **39 tests**, 27.780s ở lượt lưu; negative mutations về phase/holds/coverage/config/socket/animation authority/early damage |
| `git diff --check` | PASS: không whitespace errors ở lượt kiểm |
| Python đối chiếu backup và Git diff theo scope | PASS: P task IDs/status/dependencies/reviews/evidence được giữ; app/runtime dependencies không đổi |

Output: [checks.log](checks.log), [unit-tests.log](unit-tests.log), [scope-check.json](scope-check.json).

Hai lượt regression ban đầu phát hiện fixture test không copy đủ prompt và source files mà report review link tới; đã sửa fixture để copy đủ source references, loại node_modules/dist/cache. Không tắt link checks để làm test xanh. Lượt cuối 39/39 PASS như log.

## ACCEPTANCE_EVIDENCE

| Yêu cầu | Evidence |
|---|---|
| Kế hoạch agent sửa lỗi hiện có tới nơi | [Plan](../../docs/13_STABILITY_PLAN.md), findingCoverage F01–F12, task S0–S7 và completionTask cho full test |
| Core ổn định/chặt chẽ | [Simulation contract](../../docs/14_SIMULATION_CONTRACT.md): fixed tick/input ack/IDs/budgets/CCD/TOI/batch damage/FSM/replay |
| Mỗi fighter/skill config rõ và đa dạng | [Data contract](../../docs/15_DATA_CONFIG_CONTRACT.md), character/skill JSON, typed behavior params schemas, defense profile, two-slot loadouts |
| Frame/art sau này dựa thông số và không làm hit sai | [Presentation contract](../../docs/16_HITBOX_PRESENTATION_CONTRACT.md), source dimensions/foot/socket/clip sampling/geometry fit metadata, calibration scene task |
| Tránh hit ảo/đạn chưa tới đã damage | ST-GEO/ST-DMG/ST-FSM/ST-VIS cases; world contact + combatPresentationTick/HP/event buffering, explicit late-event correction |
| Kiểm chứng thật thay báo cáo tự ghi PASS | [Matrix](../../docs/17_STABILITY_TEST_MATRIX.md): component/full-case ownership, actual room/socket/browser/two-PC/1800s soak required |
| Có thể giao agent ngay | [Prompt](../../AGENT_STABILITY_PROMPT.md), active task selection, S0-01 card và source-of-truth rules cập nhật |

## RISKS/NOT_RUN

- Các lỗi code trong review **chưa được sửa** trong lượt này. Không chạy lại gameplay regressions/npm build/browser/latency/FPS/soak để tuyên bố ổn định. Scope là kế hoạch/docs/config examples.
- 33 ST case đều planned NOT_RUN; 39 tests pass chỉ kiểm bộ tài liệu/kế hoạch/schema/semantic rules, không chứng minh skill hoặc game runtime đúng.
- Fixed-point/tolerance/budgets/accuracy-mode buffer và thông số 12 skill là target PROPOSED, cần implementation tests/playtest; không hứa tuyệt đối không có bug hoặc pixel-perfect trên mọi mạng.
- Target seed chưa runtime-integrated; S1-02 phải migration loader/data duy nhất, compatibility/replay/activation rõ. Expanded behavior chỉ bật sau core bốn chiêu được kiểm.
- Historical P acceptance vẫn requires_revalidation; giữ status không có nghĩa chấp nhận các claim benchmark/staging cũ. S0-02 audit và S7-03 closure cần evidence mới.
- Exact SDK compatibility/audit fixes thuộc S0/S3, chi phí/hosting/rights/thiết bị thuộc gate tương ứng. Không mua/deploy hay tự mở public/mobile.

## NEXT_ALLOWED_TASK

**S0-01** — sửa clean build/CI, không P0-02 hoặc P10. Mọi S task hiện todo, không implementation task nào được chuyển done bởi lượt viết kế hoạch. Agent được giao đọc [prompt](../../AGENT_STABILITY_PROMPT.md), plan, config/backlog và task card trước sửa.

## REVIEW

- Reviewer: chủ dự án/reviewer được chỉ định
- Decision: PENDING
- STATUS: ready_for_review; không tự nghiệm thu task game
