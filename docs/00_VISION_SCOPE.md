# 00 — Sản phẩm và phạm vi v0.1

## Mục tiêu

Hai người trên PC Windows vào phòng riêng bằng mã mời, chọn một trong hai fighter, đánh một trận chiến thuật có kết quả chung và chơi lại. Game 2D góc nhìn orthogonal 3/4, di chuyển tự do 8 hướng. Nhẫn thuật tầm xa, cover, đọc đòn và phản công tạo chiều sâu; không phát triển theo hướng combo cận chiến làm trọng tâm.

Solo developer + AI, art placeholder trước. Naruto/Sasuke là tham chiếu thiết kế demo cá nhân; code dùng `fighter_a`/`fighter_b`, runtime chỉ chứa tài nguyên có quyền sử dụng. Chưa làm sản phẩm phát hành công khai.

## Vòng lặp

`Menu → Tạo phòng → Chia sẻ mã → Vào phòng → Chọn fighter/Ready → Countdown → Trận đấu → Kết quả → Rematch/Thoát`.

Trong trận: tìm góc bắn → ép đối thủ rời cover → bait guard/parry → đánh vào recovery → quản lý chakra/stamina. Đạn có telegraph và thời gian bay; tường có tác dụng thực trong simulation.

## Demo PC phải có

- Hai fighter, mỗi fighter hai skill: clone feint + wind shuriken; fireball + lightning counter.
- Movement, dash/dodge, light attack, guard, perfect parry, HP/chakra/stamina/cooldown.
- Map M0 để kiểm logic, sau đó M1 có cover và đường vòng. Không cần M2 để nghiệm thu.
- Phòng private tối đa hai guest, mã mời khó đoán, TTL/rate limit, ready/countdown.
- Server quyết định vị trí, đòn trúng và kết quả; prediction/interpolation chỉ hỗ trợ hiển thị.
- KO/timer/rematch; reconnect đúng nhân vật, không nhân đôi đạn/hit. Trận vẫn tiếp tục khi một người disconnect.
- HUD/input/audio PC, minimap che đối thủ trên UI theo LOS, performance report thực.
- Demo kín HTTPS/WSS: hai PC khác mạng hoàn thành trận và rematch; quyền asset và quyền truy cập được kiểm tra trước upload.

## Chưa làm

P10 mới làm mobile/touch/crossplay sau PC demo. Spine là nhánh optional. Public matchmaking, login/account, rank/shop, 2v2, open world, parkour, map phá hủy, cinematic ultimate, 10+ fighter và server fog-of-war nằm ngoài demo PC.

## Các mốc kiểm chứng

| Mốc | Giá trị nhận được |
|---|---|
| P0 | Môi trường và kiểm tra tự động dùng được |
| P1 | Offline di chuyển/va chạm đúng với placeholder |
| P2–P3 | Hai guest cùng phòng và movement authoritative |
| P4 | Một trận combat hoàn chỉnh bằng placeholder |
| P5–P7 | Map, sprite/VFX, UI/audio/performance PC |
| P8–P9 | QA, demo kín và nghiệm thu trên hai PC |
| P10 | Mobile sau PC, không chặn mốc trước |

Gate cụ thể và task nằm trong [roadmap](07_ROADMAP.md). Thông số HP/tick rate/map size là seed để đo, không phải bằng chứng game đã đạt chất lượng.
