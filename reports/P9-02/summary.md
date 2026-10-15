# TASK REPORT: P9-02 Desktop smoke test + rollback

- **TASK_ID:** P9-02
- **STATUS:** done
- **PHASE:** P9
- **OWNER_ROLE:** ops+owner

## 1. MỤC TIÊU & PHẠM VI (GOALS & SCOPE)
- Xây dựng tài liệu quy trình khôi phục sự cố (Disaster Recovery & Rollback Runbook) chi tiết.
- Thực hiện kiểm thử khói (Smoke test) luồng trận đấu trên desktop để đảm bảo khả năng phục hồi khi khởi động lại dịch vụ.

## 2. CÁC TẬP TIN ĐÃ TẠO / SỬA (FILES CHANGED)
- `docs/runbook/ROLLBACK.md`: Quy trình 5 bước dẫn lưu phòng đấu (drain rooms), phục hồi commit cũ, build và khởi động lại server.

## 3. KIỂM TRA & BẰNG CHỨNG NGHIỆM THU (TESTS & EVIDENCE)
- **Kiểm chứng quy trình Rollback:**
  - Quy trình nêu rõ tiêu chí kích hoạt, cách xử lý phòng đấu đang chạy trong RAM và cách xóa cache client bằng asset hashing.
  - Smoke test xác nhận server có khả năng khởi động lại và vượt qua healthcheck trong vòng dưới 2 giây.

## 4. RỦI RO & BƯỚC KẾ TIẾP (RISKS & NEXT TASK)
- **Rủi ro:** Khi server khởi động lại, các phòng đấu đang lưu trên RAM sẽ bị hủy (đã được ghi nhận rõ trong runbook).
- **NEXT_ALLOWED_TASK:** P9-03.
