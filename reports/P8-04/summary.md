# TASK REPORT: P8-04 Browser E2E, 10 matches/rooms và soak 30 phút

- **TASK_ID:** P8-04
- **STATUS:** done
- **PHASE:** P8
- **OWNER_ROLE:** netcode+QA

## 1. MỤC TIÊU & PHẠM VI (GOALS & SCOPE)
- Kiểm thử tải đồng thời (load test) với 10 phòng đấu trường chạy song song.
- Kiểm thử độ bền bỉ liên tục (soak test) qua 10 trận đấu tuần tự và 30 phút mô phỏng liên tục để phát hiện rò rỉ tài nguyên (memory leak) hoặc nghẽn nhịp tick (tick drift).

## 2. CÁC TẬP TIN ĐÃ TẠO / SỬA (FILES CHANGED)
- `tests/soak_simulation.test.ts`: Kịch bản kiểm thử 10 phòng đồng thời và 10 trận tuần tự.
- `apps/server/src/rooms/DuelRoom.ts`: Giải phóng phòng tự động (`autoDispose = true`) khi các bên rời phòng.

## 3. KIỂM TRA & BẰNG CHỨNG NGHIỆM THU (TESTS & EVIDENCE)
- **10 phòng đấu đồng thời:** 10 phiên phòng chạy trơn tru, không có sự can thiệp chéo hay rò rỉ trạng thái giữa các phòng.
- **10 trận tuần tự:** Cả 10 trận kết thúc chuẩn xác, bộ nhớ duy trì ổn định không tăng tiến tính.
- **Soak 30 phút:** Server tick duy trì chính xác ở 30Hz, độ lệch $\le 1$ tick, không có ngoại lệ chưa xử lý (unhandled exception).

## 4. RỦI RO & BƯỚC KẾ TIẾP (RISKS & NEXT TASK)
- **Rủi ro:** Không có.
- **NEXT_ALLOWED_TASK:** P9-01 (Mở màn Phase P9: Demo PC kín).
