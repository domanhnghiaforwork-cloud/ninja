# 05 — Map, collision và hiển thị v0.1

## Tọa độ

Orthogonal X ngang/Y dọc, art nhìn 3/4. `(x,y)` là foot anchor; direction N hướng âm Y. Sprite pivot và camera theo chân, không theo góc texture. Viewport tham chiếu 960×540, tile seed 64 world units. Camera scale/zoom không đổi collider.

Kích thước seed do config giữ: M0 1024² để movement/netcode/combat, M1 2048² để cover/đường vòng. M2 4096² là ý tưởng sau demo, không tạo năm biome, A*, nước làm chậm hay ring nếu task chưa yêu cầu.

## Một bộ metadata cho cả client/server

| Property chuẩn | Tác dụng |
|---|---|
| `blocks_movement` | Cản bước/dodge |
| `blocks_projectile` | Cản sweep projectile và light/counter nếu hình học liên quan |
| `blocks_los` | Cản nhắm thẳng/LOS; hard cover demo đặt true cùng blocks_projectile |
| `occludes_visual` | Che sprite, không tự cản damage |
| `soft_cover` | Giảm/che chỉ báo UI theo rule; không tự sinh collider |
| `spawn_team` | Spawn A/B hợp lệ |

Chỉ dùng đúng tên trên trong exporter và shared types. Không tiếp tục các alias `solid_movement`, `blocks_line_of_sight`, `blocks_projectiles` từ tài liệu chồng lớp. P1 dùng manifest M0 JSON tối thiểu; P5 bổ sung Tiled exporter cùng schema. M0 có biên map và bốn vật cản kiểm va chạm.

Tiled layers: `Ground`, `Details`, `ObstacleBack`, `Foreground`, `Collision`, `Zones`. Object IDs ổn định, shapes AABB/circle đầu tiên; không tự thêm polygon phức tạp nếu chưa cần. Export collision manifest + map revision/hash để server load cùng dữ liệu client. Hash mismatch chặn countdown; client không upload map làm nguồn tin cậy.

## Hard cover và soft cover

Hard cover chặn movement/projectile/LOS theo metadata; thân cây có thể là hard cover. Tán lá có thể chỉ occlude visual. Fireball AoE phải kiểm LOS từng target từ điểm impact; không gây damage xuyên tường chỉ vì center gần.

Đường projectile chọn TOI sớm nhất; wall chỉ thắng tie cùng thời điểm. Actor đứng trước tường vẫn có thể bị hit. Các edge/corner cần test sweep thay vì nhìn ảnh.

## M1 và camera

Có ít nhất ba tuyến nối và đường flank, hai cụm cover, khu giữa dễ đọc, spawn không nằm trong collision và không bị bắn tức thì. Không có góc kẹt hoặc đường độc đạo khiến một người không thể rời spawn. Camera bound đúng, Y-sort dùng foot Y rồi stable ID trong cùng render layer; tán và thân lớn có thể tách sprite.

## Minimap và hướng đối thủ — D08

Hiện self và map tĩnh. Khi đối thủ có LOS: có thể hiện icon; khi không có LOS/ở soft cover thì bỏ icon chính xác. Offscreen cue chỉ cho hướng lượng tử hóa, không distance/chấm tọa độ chính xác; lock-on không cho xuyên hard cover. Các rule UI dùng shared LOS geometry để nhất quán.

Client vẫn nhận tọa độ đối thủ. Đây là UX che thông tin trong demo, không bảo vệ trước client sửa đổi. Không thêm server visibility filtering trong P5.

## Nghiệm thu

Test spawn/reachability không kẹt, map hash, sweep/corner, hard-vs-soft cover, foot depth và minimap scale. P5-04 ghi **5 trận thực**: thời gian chạm trán đầu, khoảng không gặp nhau dài, sử dụng cover, tỷ lệ skill trúng, camping và phản đòn. Báo kết quả/đề xuất thu gọn; chưa đủ dữ liệu thì giữ map, không tự mở M2 hoặc tuyên bố cân bằng.
