# Ninja Arena — Bộ tài liệu phát triển v0.1

**Phiên bản tài liệu:** `0.1.0` · **Ngày:** 2026-10-15 · **Trạng thái:** tài liệu để review, chưa có game chạy.

Game ninja 2D, góc nhìn orthogonal 3/4, đấu 1v1 online bằng phòng riêng/mã mời, guest không tài khoản. Ưu tiên PC Windows; gameplay lấy nhẫn thuật tầm xa, cover và phản đòn làm trọng tâm. Một người phát triển cùng AI, dùng placeholder rồi sprite atlas có nguồn/quyền sử dụng rõ ràng.

## Bắt đầu

1. Chủ dự án đọc [START_HERE](START_HERE.md) và [roadmap](docs/07_ROADMAP.md).
2. Agent đọc [AGENTS](AGENTS.md), [quyết định](docs/01_DECISIONS.md), [config](spec/project.config.json), [backlog](spec/backlog.json), rồi [hướng dẫn task](tasks/README.md).
3. Task phát triển đầu tiên: **[P0-02](tasks/P0.md#p0-02)**. `P0-01` đã được chủ dự án chấp nhận; các task triển khai vẫn `todo`.

## Tài liệu nằm ở đâu?

| Câu hỏi | Nơi đọc |
|---|---|
| Làm game gì, phạm vi demo tới đâu? | [00 — Sản phẩm](docs/00_VISION_SCOPE.md) |
| Điều gì đã chốt, điều gì còn thử nghiệm? | [01 — Quyết định](docs/01_DECISIONS.md) |
| Chia client/server/shared thế nào? | [02 — Kiến trúc](docs/02_TECH_ARCHITECTURE.md) |
| Combat, input, skill hoạt động ra sao? | [03 — Combat](docs/03_COMBAT_CHARACTERS.md), [skill seed](spec/skill_roster.v0.1.json) |
| Phòng riêng, input mạng, reconnect? | [04 — Giao thức](docs/04_NETCODE_PROTOCOL.md) |
| Map, collision, LOS, minimap? | [05 — Map](docs/05_MAP_WORLD.md) |
| Art, animation, âm thanh và nguồn asset? | [06 — Assets](docs/06_ASSET_PIPELINE.md) |
| Bước nào trước, điều kiện chuyển bước? | [07 — Roadmap](docs/07_ROADMAP.md), [task cards](tasks/README.md) |
| Kiểm chứng kết quả thế nào? | [08 — QA](docs/08_TEST_QA.md), [mẫu báo cáo](TASK_REPORT_TEMPLATE.md) |
| Chạy local và demo kín? | [09 — Deployment](docs/09_DEPLOY_RELEASE.md) |
| Giao việc và review agent? | [10 — Workflow](docs/10_AI_WORKFLOW.md) |
| Rủi ro, nguồn chính thức, thay đổi? | [11 — Tham khảo](docs/11_RISKS_REFERENCES.md), [12 — Changelog](docs/12_CHANGELOG.md) |

## Nguồn dữ liệu duy nhất

`spec/project.config.json` giữ quyết định và tham số chung. `spec/skill_roster.v0.1.json` giữ seed chiến đấu. `spec/backlog.json` giữ **47 task / 11 phase**, dependency, phạm vi, bước làm, kiểm thử và gate. Các trang `tasks/` và roadmap được sinh từ backlog; chỉnh JSON rồi chạy trình sinh, không sửa riêng hai bản.

```powershell
python scripts/validate_docs.py
python scripts/render_tasks.py --check
python -m unittest discover -s tests -p test_docs_validation.py -v
```

Các lệnh trên chỉ kiểm tra tài liệu. Chưa có `package.json`, gameplay, asset runtime hay kết quả browser/latency/FPS. `v0.1` là tên baseline tài liệu mới theo yêu cầu chủ dự án; không hoàn nguyên quyết định sản phẩm đã chốt. Phiên bản package và schema có vòng đời riêng.
