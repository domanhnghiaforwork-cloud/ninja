# 04 — Phòng riêng và netcode v0.1

## Mô hình tin cậy

Client gửi input; server giữ vị trí, HP, chakra, stamina, cooldown, hit và kết quả. Shared movement dùng cùng fixed timestep/precision. Tick rate, patch rate, interpolation và timeout seed nằm trong [config](../spec/project.config.json). Giao thức dưới đây là contract ứng dụng; tên/cách gọi API SDK phải xác minh ở P0-03 và P3.

## Admission: mã phòng không phải session credential

1. `create`: endpoint bị rate-limit tạo private room có hai slots; cấp credential cho host, mã mời CSPRNG 8 ký tự và expiry. Registry RAM đủ cho một instance.
2. `resolve/join`: chuẩn hóa/validate code, kiểm TTL, room phase, capacity và rate limit; không tạo room khi code sai. TTL dùng clock server, không dùng client.
3. Resolve thành công trả roomId và **join ticket ngắn hạn, ràng buộc room/guest, dùng một lần**. `joinById` phải gửi ticket; server admission kiểm ticket, consume/reserve slot atomically. Tự join bằng roomId không ticket phải thất bại. Chọn cơ chế seat reservation tương đương nếu SDK hỗ trợ, ghi rõ và test cùng ràng buộc.
4. `private` loại room khỏi auto matching/listing; không tự cấp authentication. Không dùng `unlisted` thay `private`, không dùng `joinOrCreate` cho mã người nhập. Full/locked từ chối guest mới nhưng reconnect đúng seat phải hoạt động.
5. Sau admission, cấp ephemeral reconnect credential riêng. Không dùng invite code/join ticket thay reconnect secret, không log secret hoặc đưa vào snapshot.
6. Room/guest/code/ticket có cleanup hữu hạn; code hết TTL không ngắt trận đã vào, nhưng cấm join mới. Không nhận guest thứ ba kể cả hai join đồng thời.

Theo [tài liệu Colyseus về visibility](https://docs.colyseus.io/matchmaker/visibility), private room vẫn cho `joinById`; vì vậy cần kiểm credential tại admission. Threshold create/resolve/input và TTL ticket là seed trong config; rate limit sớm ở P2, P8 kiểm abuse sâu hơn.

## Wire input

```ts
type InputFrame = {
  moveX: number; // integer [-127,127]
  moveY: number; // integer [-127,127]
  aim8: number;  // 0..7, thứ tự N,NE,E,SE,S,SW,W,NW
  buttons: number; // bit 0 light, 1 skill1, 2 skill2, 3 dodge, 4 guard
};
```

Server reject object sai shape/type/range/NaN/Infinity/bitmask, normalize movement và áp trần input/tick. Client không gửi arbitrary dt/tick để chạy nhanh. Sequence/ack dùng cơ chế SDK nếu có; không tự thêm sequence song song trước khi kiểm đúng API. Khi thiếu input dùng neutral sau ngưỡng server; nút skill chỉ kích ở cạnh nhấn. Lock-on là lựa chọn aim phía client, server không tin target/LOS client.

Theo [Colyseus netcode](https://docs.colyseus.io/netcode), shared deterministic step là nền tảng prediction/reconciliation. Fixed input steps độc lập render; không bắn thêm input chỉ vì FPS cao.

## Snapshot / handshake

Handshake: protocol version + gameplay config hash + map hash; mismatch từ chối ready với lỗi dễ hiểu. Snapshot gồm `roundId`, `serverTick`, `phase`, `remainingTicks`, `winnerId/resultReason`, hai player với ID/fighter/position/facing/HP/resources/FSM/timing/CD/disconnect state và projectile/clone cần render.

Không đưa reconnect secret/ticket/registry vào schema. **D08:** cả hai client nhận vị trí cả hai fighter trong demo; UI che icon khi khuất LOS. Người sửa client có thể đọc vị trí. Server filtering/fog-of-war nằm ngoài scope, không gọi UI concealment là anti-wallhack.

Local player prediction chỉ movement; remote interpolation dùng snapshot buffer có giới hạn. Background/resume hoặc correction lớn thì bỏ input quá cũ và sync authoritative state. Combat vẫn server-only; event IDs tránh VFX/hit lặp khi reconcile.

## Events

Mỗi event server có `eventId`, `roundId`, `tick`, loại và actor/target nếu liên quan. Hợp đồng tối thiểu: `round_start`, `skill_started`, `skill_rejected`, `projectile_spawned`, `projectile_blocked`, `hit_confirmed`, `parry_success`, `counter_success`, `player_ko`, `round_end`, `player_disconnected`, `player_reconnected`.

`skill_rejected` có reasonCode và input reference nếu SDK cung cấp. `hit_confirmed` có cast/source/target/damage/HP mới. Client dedupe theo eventId, không tự trừ HP theo sprite hay cộng damage event vào HP snapshot lần hai. Giới hạn và xóa cache dedupe khi đổi round.

## Lifecycle và reconnect — D07

`waiting → countdown → playing → finished → waiting/rematch hoặc closed`. Chọn fighter/ready chỉ trong waiting; countdown đề xuất 3 giây. Trước lúc chơi mà disconnect thì hủy ready/countdown, giữ seat trong grace; không bắt đầu trận với guest thiếu.

Trong trận, disconnect: server neutral input và dừng movement của fighter đó ngay khi phát hiện, không pause timer/projectiles/đối thủ, fighter vẫn nhận damage và có thể KO. Giữ seat, không nhận guest mới thay thế. Trong grace đề xuất 15 giây, reconnect bằng secret trở về cùng entity và snapshot; không replay input mất kết nối. Hết grace thì forfeit một lần nếu trận chưa kết thúc. Reconnect sau KO/finished không reset kết quả. Xử lý cả hai rớt mạng theo [quyết định](01_DECISIONS.md).

Rematch xóa state chiến đấu theo [combat](03_COMBAT_CHARACTERS.md); leave/room timeout dọn mapping, tickets và credentials. Grace đo bằng clock server monotonic; gameplay timers vẫn integer ticks. Expiry task phải idempotent: nếu round chưa terminal, hết grace lúc đối thủ connected thì forfeit; cả hai offline thì chờ cả hai expiry rồi đóng không winner. Reconnect trong grace mà đối thủ đã hết grace sẽ thắng do forfeit, không khôi phục đối thủ hết hạn.

## Security và test

Validate/rate-limit mọi đường create/resolve/direct join/input, Origin allowlist cho HTTP lẫn WebSocket upgrade, HTTPS/WSS tại staging; escape nickname/text UI. CORS không thay authentication. Secret dùng RAM/session storage phù hợp, không persistent login, không gửi URL query/log. Crash/restart một instance làm mất room, UI phải báo rõ.

Test tối thiểu: code sai/expiry/collision retry, rate boundary, join direct bypass, race hai guest tranh slot cuối, ticket replay/wrong-room/expiry, người thứ ba, reconnect wrong-secret/timeout/cast/KO, input giả position/damage/NaN, map hash mismatch và replay deterministic. Network impairment là RTT/jitter/disconnect ở tầng ứng dụng hoặc network proxy được ghi rõ; WebSocket/TCP có retransmission, không gọi mất message ứng dụng là packet loss thật.
