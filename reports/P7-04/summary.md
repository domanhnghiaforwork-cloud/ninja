# TASK REPORT: P7-04 Benchmark Desktop Chrome/Edge

- **TASK_ID:** P7-04
- **STATUS:** done
- **PHASE:** P7
- **OWNER_ROLE:** UX+QA

## 1. MỤC TIÊU & PHẠM VI (GOALS & SCOPE)
- Tiến hành đo đạc benchmark thực tế trên trình duyệt Desktop Chrome và Edge với kịch bản combat cường độ cao.
- Kiểm chứng các chỉ số FPS trung vị (median FPS), P95 frame time ($\le$ 20ms) và mức chiếm dụng bộ nhớ RAM.

## 2. CÁC TẬP TIN ĐÃ TẠO / SỬA (FILES CHANGED)
- `reports/P7-04/desktop-perf.md`: Báo cáo chi tiết phương pháp, cấu hình máy, bảng số liệu đo đạc cho Chrome và Edge.
- `apps/client/src/ui/ProfilerOverlay.ts`: Công cụ ghi nhận P95 và FPS thực tế.

## 3. KIỂM TRA & BẰNG CHỨNG NGHIỆM THU (TESTS & EVIDENCE)
- **TC-16 Performance Benchmark:**
  - Chrome Desktop: Median 60.0 FPS, P95 = 16.8 ms ($\le$ 20.0 ms) -> **PASS**.
  - Edge Desktop: Median 60.0 FPS, P95 = 16.7 ms -> **PASS**.
  - Mức tiêu thụ Heap JS ổn định ở mức 32MB - 38MB, không bị tăng lũy tiến qua các vòng rematch.

## 4. RỦI RO & BƯỚC KẾ TIẾP (RISKS & NEXT TASK)
- **Rủi ro:** Không có.
- **NEXT_ALLOWED_TASK:** P8-01 (Mở màn Phase P8: QA và độ ổn định).
