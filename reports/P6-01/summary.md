# TASK REPORT: P6-01 Art bible tối giản + sổ quyền asset AI

- **TASK_ID:** P6-01
- **STATUS:** done
- **PHASE:** P6
- **OWNER_ROLE:** artist+AI

## 1. MỤC TIÊU & PHẠM VI (GOALS & SCOPE)
- Thiết lập Art Bible tối giản cho hai nhân vật: Fighter A (Phong nhẫn giả / Cam) và Fighter B (Lôi hỏa kiếm sĩ / Tím).
- Ban hành bảng quy chuẩn 8 hướng (N, NE, E, SE, S, SW, W, NW), góc nhìn 3/4 orthogonal, foot anchor `(32, 58)`.
- Xây dựng sổ đăng ký bản quyền và nguồn gốc tài nguyên `assets-export/manifest.json`.

## 2. CÁC TẬP TIN ĐÃ TẠO / SỬA (FILES CHANGED)
- `docs/art/art_bible.md`: Quy chuẩn tạo hình, bảng màu, hướng quay và foot pivot.
- `assets-export/manifest.json`: Bảng kiểm kê quyền hạn, giấy phép MIT/CC0, không dùng sprite/OST anime trích xuất lậu.

## 3. KIỂM TRA & BẰNG CHỨNG NGHIỆM THU (TESTS & EVIDENCE)
- **Quyền sở hữu (Provenance):** 100% assets do codebase nội bộ sinh ra, không chứa tài sản từ bên thứ ba hoặc vi phạm bản quyền.
- **Tính nhất quán hình ảnh:** Phân biệt rõ rệt hai nhân vật theo silhouette và màu sắc chủ đạo; góc nhìn 3/4 đồng bộ.
- **Manifest hợp lệ:** Schema JSON hợp lệ, trường `license` và `license_evidence` đầy đủ.

## 4. RỦI RO & BƯỚC KẾ TIẾP (RISKS & NEXT TASK)
- **Rủi ro:** Không có rủi ro pháp lý do hoàn toàn tự sản xuất.
- **NEXT_ALLOWED_TASK:** P6-02.
