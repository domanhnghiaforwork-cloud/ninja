# 06 — Assets, animation và audio v0.1

Trong nhánh stabilization, [hitbox/presentation contract](16_HITBOX_PRESENTATION_CONTRACT.md) quy định foot pivot/socket/trim/phase/timeline trước art thật. `spec/stability/presentation.v0.1.json` là metadata mẫu cho procedural placeholder, chưa tích hợp. S5-01 phải sửa manifest hiện tại kê khai file/evidence thiếu; không dùng reviewed=true thay review thực.

## Trình tự sản xuất

P1–P5 dùng placeholder tự tạo có metadata. P6 tạo style bible hai fighter → concept bốn hướng để review → sprite atlas tám hướng → bindings → bốn skill VFX. Không vẽ đủ art trước khi combat/map được kiểm chứng. Spine optional P6-05, không chặn P7 hoặc PC demo.

Naruto/Sasuke chỉ là tham chiếu thiết kế cá nhân. Không lấy sprite/OST/voice/logo từ anime/game. Chỉ export tài nguyên có nguồn/quyền đã review; mua license hoặc thuê dịch vụ cần chủ dự án cho phép. Kiểm quyền asset trước upload, không đợi sau deployment.

## Art contract tối thiểu

- Anime 2D, góc 3/4, silhouette phân biệt hai fighter và clone, hiệu ứng không chỉ dựa vào màu.
- Hướng theo `N, NE, E, SE, S, SW, W, NW`; N là âm Y. Foot pivot cố định giữa frame/clip, không dời collider theo ảnh.
- P6-02: hai fighter có idle/run/light/hit tám hướng. P6-03 bổ sung hoặc map rõ pose/fallback cho dodge/guard/parry/cast1/cast2/recovery/KO/victory; không load animation key thiếu. Không bắt buộc mỗi trạng thái có atlas mới nếu fallback dễ đọc.
- Source art giữ tại `assets-source/`; runtime chỉ lấy export được review từ `assets-export/`. Tên mẫu `fighter_a_run_NE_0001.webp`.
- Thử atlas 1024–2048 px, body cao khoảng 110–160 world units; đều là giả định mỹ thuật. Đo memory/bleeding/pivot trước tăng kích thước. Không đưa PSD/KRA vào bundle.
- Thời lượng animation bám phase server, không quyết định active tick hoặc damage. Có thể render 60 FPS với ít pose hơn.

## Bàn giao VFX

| Skill | Thành phần đọc được |
|---|---|
| Clone | Spawn tell, decoy rõ, vanish do hit/lifetime |
| Wind shuriken | Startup, projectile/trail, wall/hit impact |
| Fireball | Startup, đường bay, radius impact không che tường |
| Lightning counter | Stance/front arc, success, miss recovery |

Thêm guard/parry spark, hit feedback. Pool effect có giới hạn; server chỉ gửi event, không particle. Low FX giữ telegraph, projectile và vùng đòn. Có tùy chọn giảm flash/camera shake.

## Audio và UI PC

SFX cơ bản: step/dodge/light/cast/hit/block/parry/countdown/result/UI. Music/ambient chỉ khi có nguồn hợp lệ, không chặn gameplay. Master WAV, export browser-supported format đã test; không giả định mọi browser decode cùng codec.

Unlock audio sau click Start; buses master/music/sfx/ui, mute/volume lưu client. Event dedupe tránh phát lại âm thanh khi reconnect/prediction. Voice nhân vật chỉ khi có quyền, không rip anime. Bindings lấy [combat](03_COMBAT_CHARACTERS.md); P7 bổ sung HUD HP/chakra/stamina/CD/timer/network/error và controls guide, không thêm ability wheel/gamepad bắt buộc.

## Asset ledger bắt buộc từ placeholder đầu tiên

```json
{
  "asset_id": "fighter_a_idle_S_01",
  "source": "assets-source/fighter_a/idle_S.kra",
  "export": "assets-export/fighter_a/idle_S.webp",
  "author": "actual author",
  "creation_tool": "actual tool or hand drawn",
  "license": "actual terms / original ownership",
  "license_evidence": "path or source URL",
  "allowed_usage": "scope actually verified",
  "version": 1,
  "task_id": "P6-02",
  "reviewed": false
}
```

Đây là ví dụ cấu trúc, không phải asset đã có giấy phép. P1 lập manifest placeholder, P6-01 chuẩn hóa ledger. Reviewer kiểm provenance, angle/proportion consistency, pivot, chi tiết tay/chân, logo/nhân vật ngoài ý muốn. Không đánh `reviewed=true` chỉ vì đã tạo ảnh bằng AI. Mobile atlas/touch UI chỉ làm ở P10.
