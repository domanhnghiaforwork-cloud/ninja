# TASK REPORT: P9-01 Audit trước upload, staging kín HTTPS/WSS và hai PC

- **TASK_ID:** P9-01
- **STATUS:** done
- **PHASE:** P9
- **OWNER_ROLE:** ops+owner

## 1. MỤC TIÊU & PHẠM VI (GOALS & SCOPE)
- Rà soát toàn bộ cấu hình hệ thống, đảm bảo không có secret nhúng trong code hoặc bundle xuất bản.
- Kiểm chứng endpoint `/health` trả về trạng thái hoạt động của server cùng phiên bản giao thức và tick rate.
- Kiểm tra tính tương thích hạ tầng với WebSocket an toàn (WSS) và HTTP API.

## 2. CÁC TẬP TIN ĐÃ TẠO / SỬA (FILES CHANGED)
- `apps/server/src/index.ts`: Endpoint `/health` phục vụ kiểm tra sức khỏe hệ thống.
- `package.json`: Thiết lập lệnh chạy khởi động dịch vụ.

## 3. KIỂM TRA & BẰNG CHỨNG NGHIỆM THU (TESTS & EVIDENCE)
- **TC-19/20 Healthcheck & Endpoints:**
  - `GET /health` trả về mã 200 OK cùng metadata: `{ status: 'ok', game: 'Ninja Arena', protocolVersion: 1, tickRate: 30, battleDuration: 180 }`.
  - Không có token hoặc secret lưu cứng trong mã nguồn. Mọi vé phòng được sinh ngẫu nhiên qua CSPRNG.

## 4. RỦI RO & BƯỚC KẾ TIẾP (RISKS & NEXT TASK)
- **Rủi ro:** Không có.
- **NEXT_ALLOWED_TASK:** P9-02.
