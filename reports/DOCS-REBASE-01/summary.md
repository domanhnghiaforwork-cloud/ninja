# DOCS-REBASE-01 — Tái cấu trúc tài liệu v0.1

- TASK_ID: DOCS-REBASE-01
- DATE: 2026-10-15 (Asia/Saigon)
- STATUS: ready_for_review
- GOAL: Chắt lọc tài liệu và làm rõ bước/task/hợp đồng agent theo yêu cầu chủ dự án.
- COMMIT: N/A — thư mục chưa là Git repository.
- SCOPE: Tài liệu/spec/tooling tài liệu; không triển khai hoặc nghiệm thu task game.
- BACKUP: `C:/Users/Admin/AppData/Local/Temp/ninja_arena_docs_before_restructure_20261015_161604.zip` — 24 file nguyên trạng ngoài repo.

## FILES_CHANGED

- `README.md`, `START_HERE.md`, `AGENTS.md`, `TASK_REPORT_TEMPLATE.md`: entrypoint, source-of-truth, workflow và report rõ ràng.
- `docs/00..12`: hợp nhất từng chủ đề, phân biệt LOCKED/REQUIRED/PROPOSED/OPTIONAL, thống nhất input/map/netcode và gate.
- Bỏ `docs/13_FIRST_TASK_P0-02.md`; checklist đã tích hợp vào `tasks/P0.md#p0-02`.
- `spec/project.config.json`, `spec/backlog.json`, `spec/skill_roster.v0.1.json`, `spec/example_skill.json`: baseline 0.1.0, D07/D08, 47 task contracts và seed nhất quán. Đổi tên roster cũ, không thay version dependency thành version tài liệu.
- `tasks/README.md`, `tasks/P0.md` đến `tasks/P10.md`: task cards sinh từ backlog.
- `scripts/render_tasks.py`, `scripts/validate_docs.py`, `tests/test_docs_validation.py`: sinh/kiểm docs và regression trên bản sao cô lập.
- `.gitignore`: secrets/cache/export bundle; `reports/DOCS-REBASE-01/`: report/log/danh sách file.

Danh sách thay đổi so với backup nằm trong `files-changed.json`. Không sửa `reports/P0-02/setup.md`, không chạy P0-02 hoặc tự tạo Git.

## TESTS — kết quả thực

Máy thực thi: Windows, Python 3.11.6. Tool probe quan sát Node `v24.22.0`, Git `2.55.0.windows.5`; các probe này thuộc audit tài liệu, không tự nghiệm thu môi trường phát triển.

| Lệnh / kiểm tra | Kết quả |
|---|---|
| `python scripts/validate_docs.py` trước sửa | PASS: 47 task / 11 phase theo validator cũ |
| `python scripts/render_tasks.py` | PASS: sinh 14 views (11 phase cards + index + roadmap + example skill) |
| `python scripts/validate_docs.py` sau sửa | PASS, exit 0: 47 task / 11 phase, graph/decisions/gates/skill/generated views, 371 local links tại lượt chạy đã lưu |
| `python scripts/render_tasks.py --check` | PASS, exit 0: 14 views khớp JSON |
| `python -m unittest discover -s tests -p test_docs_validation.py -v` | PASS, exit 0: 23 tests trong 6.212 giây ở lượt đã lưu; có negative mutation cho cycle/dependency/status/version/decision/admission/links/stale views/skill |
| Đối chiếu backup bằng Python stdlib | PASS: IDs, dependencies và statuses của 47 task không đổi |
| Quét common secret patterns bằng Python stdlib | PASS: 38 source text files tại thời điểm quét, không match các mẫu đã liệt kê trong log; không thay full security audit |
| `git status --short` | FAIL: fatal: not a git repository (or any of the parent directories): .git — hiện trạng có sẵn, chưa khởi tạo Git |

Output thực lưu tại [checks.log](checks.log). Các test mutation chỉ thay bản sao temporary; không làm hỏng bản tài liệu chính. Cấu trúc ZIP được kiểm lại sau khi đóng gói; không có code build/gameplay nào được chạy.

## ACCEPTANCE_EVIDENCE

| Yêu cầu chủ dự án | Bằng chứng |
|---|---|
| Chắt lọc nội dung và thống nhất v0.1 | Docs hiện hành không còn addendum/override chồng lớp; JSON document version 0.1.0; skill filename v0.1; validator kiểm baseline |
| Rõ từng bước phát triển | [Roadmap](../../docs/07_ROADMAP.md): P0–P10 với goal/deliverable/required/optional/gate checks |
| Mỗi bước chia rõ task | [Task index](../../tasks/README.md): 47 cards có goal/references/files/steps/outputs/acceptance/verification/non-goals/evidence |
| Agent đọc repo hiểu cách làm | [AGENTS](../../AGENTS.md), [START_HERE](../../START_HERE.md), task selection/dependency/review rules, prompt mẫu và report template |
| Hỏi khi cần chủ dự án quyết định | D07/D08 ghi đúng hai câu trả lời trực tiếp ngày 2026-10-15 trong config và decisions |
| Không báo tiến độ game giả | Giữ `P0-01 = done`, 46 task khác vẫn todo; giữ nguyên setup placeholder chưa chạy; report này chỉ ready_for_review |

## RISKS/NOT_RUN

- Chưa có gameplay/package.json: npm lint/typecheck/test/build là N/A trong lượt này; chưa test browser/thiết bị/latency/FPS. Doc tests không chứng minh game chạy.
- Exact dependencies/API chưa được cài/xác minh tương thích; P0-03 phải làm. Chỉ đối chiếu các trang official được ghi rõ trong tài liệu tham khảo.
- Các chỉ số combat, resource và binding bổ sung là seed PROPOSED, cần unit tests/playtest khi triển khai; không coi là balance đã chấp nhận.
- Không có Git diff/commit vì thư mục không thuộc repo Git. Backup ZIP ngoài repo giữ nguyên 24 file ban đầu.
- Giữ đường dẫn thư mục workspace hiện tại để phiên làm việc không đứt; bản đóng gói `artifacts/ninja_arena_docs_v0_1.zip` có thư mục gốc `ninja_arena_docs_v0_1/`.
- D08 chấp nhận client nhìn được vị trí qua network dù UI che; D07 chấp nhận nguy cơ bị đánh/KO trong grace disconnect.

## NEXT_ALLOWED_TASK

**P0-02**, khi chủ dự án giao bắt đầu phát triển; dependency P0-01 đã done. Không bắt đầu P0-03 trước khi P0-02 được review/chấp nhận. Việc sửa docs không chuyển task game thành done.

## REVIEW

- Reviewer: chủ dự án / reviewer được chỉ định
- Decision: PENDING
- Status: ready_for_review; không tự chuyển done.
