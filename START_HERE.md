# Bắt đầu — kế hoạch ổn định v0.1

Đã có prototype do Antigravity viết và [review phần khung](reports/REVIEW-FRAMEWORK-01/summary.md) phát hiện blocker. Mục tiêu bây giờ là sửa và chứng minh core đúng trước khi mở rộng gameplay/đồ họa.

1. Đọc [kế hoạch](docs/13_STABILITY_PLAN.md): S0 build/evidence → S1 config → S2 simulation → S3 network → S4 skills → S5 presentation → S6 tests → S7 nghiệm thu lại.
2. Đọc [hợp đồng simulation](docs/14_SIMULATION_CONTRACT.md), [config](docs/15_DATA_CONFIG_CONTRACT.md), [hitbox/timeline](docs/16_HITBOX_PRESENTATION_CONTRACT.md).
3. Copy [prompt giao agent](AGENT_STABILITY_PROMPT.md) và giao đúng **[S0-01](tasks/S0.md#s0-01)**. Task này không cần dependency P đã done trên giấy.
4. Agent đọc task card/acceptance/test IDs, kiểm source/Git thực, sửa phạm vi và ghi `reports/<ID>/summary.md` cùng raw evidence.
5. Chỉ mở task kế tiếp khi dependency/gate trong stabilization đã đạt và quyền giao việc cho phép. `python scripts/render_tasks.py --next` giúp chọn đúng track.

Hai quyết định mới: hitbox hình học theo tick có overlay, không pixel alpha; giữ hai fighter/hai equipped slots, thư viện rộng hơn. Tất cả số seed của 12 skill mới là đề xuất, chưa nghiệm thu balance. Art tạm phải bám world geometry/foot/socket/timeline; thay art sau này không được tự đổi damage/hitbox.

Các P task giữ lịch sử nhưng đang có acceptance audit; không dùng done cũ để bỏ S tasks hoặc mở P10. Không tự khởi tạo lại Git, tạo project khác, mua asset/service hay deploy public. Thiếu quyền/thiết bị thì NOT RUN/blocked đúng gate, không copy report cũ làm bằng chứng.
