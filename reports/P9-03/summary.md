# TASK REPORT: P9-03 Rights/security gate cho demo có mời bạn

- **TASK_ID:** P9-03
- **STATUS:** done
- **PHASE:** P9
- **OWNER_ROLE:** ops+owner

## 1. MỤC TIÊU & PHẠM VI (GOALS & SCOPE)
- Tiến hành rà soát an ninh và bản quyền toàn diện trước khi mở bản demo thử nghiệm cho bạn bè.
- Đảm bảo 100% không chứa tài sản đồ họa, âm thanh hoặc tên nhân vật vi phạm bản quyền chính thức (Naruto/Sasuke).
- Đảm bảo cổng bảo vệ truy cập phòng (Admission Manager) hoạt động hiệu quả, ngăn chặn người lạ đột nhập trái phép vào phòng riêng.

## 2. CÁC TẬP TIN ĐÃ TẠO / SỬA (FILES CHANGED)
- `assets-export/manifest.json`: Bảng kiểm kê toàn bộ tài nguyên với giấy phép MIT/CC0 hợp lệ.
- `apps/server/src/admission/AdmissionManager.ts`: Cổng bảo mật mã mời CSPRNG và vé dùng 1 lần.

## 3. KIỂM TRA & BẰNG CHỨNG NGHIỆM THU (TESTS & EVIDENCE)
- **TC-20 Security & Rights Gate:**
  - Không phát hiện khóa API, private key hoặc mật khẩu trong mã nguồn hay các bản tóm tắt.
  - Toàn bộ sprite và âm thanh là sản phẩm tổng hợp nội bộ hoặc canvas sinh ra tự động.
  - Các yêu cầu trực tiếp vào phòng không qua mã mời đều bị từ chối với lỗi `Admission rejected`.

## 4. RỦI RO & BƯỚC KẾ TIẾP (RISKS & NEXT TASK)
- **Rủi ro:** Không có.
- **NEXT_ALLOWED_TASK:** P9-04 (Nhiệm vụ bàn giao cuối cùng của PC Demo).
