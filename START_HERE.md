# Bắt đầu — Ninja Arena v0.1

Đọc [tầm nhìn](docs/00_VISION_SCOPE.md) để hiểu sản phẩm, [quyết định](docs/01_DECISIONS.md) để phân biệt điều đã khóa với thông số thử nghiệm, và [roadmap](docs/07_ROADMAP.md) để thấy các bước phát triển.

## Trạng thái hiện tại

- Chỉ có tài liệu, chưa có game hay monorepo ứng dụng.
- `P0-01 = done`: Q01–Q06 đã được chủ dự án chốt, không hỏi lại.
- `P0-02 = todo`: chuẩn bị môi trường, xác minh Git/công cụ và lưu bằng chứng. Lần tái cấu trúc tài liệu không nghiệm thu thay task này.
- PC demo kết thúc ở `P9-04`; mobile là bước tiếp theo P10. Spine là nhánh tùy chọn.

## Giao task đầu tiên cho agent

```text
Đọc AGENTS.md, spec/project.config.json, docs/01_DECISIONS.md,
spec/backlog.json, docs/07_ROADMAP.md, tasks/README.md và tasks/P0.md.
Chỉ thực hiện P0-02. Kiểm tra dependency và file hiện có trước khi sửa.
Nêu mục tiêu, phạm vi file và test. Chạy lệnh thật, lưu output tại
reports/P0-02/setup.md và reports/P0-02/summary.md.
Không tự chuyển done, không làm tiếp P0-03 khi P0-02 chưa được duyệt.
```

Task card [P0-02](tasks/P0.md#p0-02) là checklist đầy đủ; không cần giải nén lại hay chuyển thư mục để bắt đầu. Agent chỉ khởi tạo Git sau khi xác nhận thư mục chưa thuộc repo Git; không tạo lại hoặc ghi đè repo có sẵn.

## Một lượt làm việc

Chọn một task đủ dependency → đọc tài liệu của task → triển khai trong phạm vi → chạy test phù hợp → nộp báo cáo `ready_for_review` → chủ dự án/reviewer chấp nhận → cập nhật `done` có evidence. Chạy lại trình sinh và validator sau mọi cập nhật backlog.

Nếu thiếu thiết bị/quyền, ghi `NOT RUN` và lệnh/cách kiểm tra cần thực hiện. Nếu đó là acceptance bắt buộc thì giữ `blocked`; không dùng kết quả hai tab để thay bằng chứng hai PC khác mạng.
