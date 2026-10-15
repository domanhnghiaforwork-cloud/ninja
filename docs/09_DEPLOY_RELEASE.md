# 09 — Local và demo kín v0.1

## Môi trường

Local đề xuất client `http://localhost:5173`, Node/WebSocket `localhost:2567`; chỉ có sau task bootstrap. Staging là static client qua HTTPS và Node server persistent WebSocket qua WSS, một instance gần người test. Public release ngoài Q01, chưa được cho phép.

P9-01 chọn provider/region/ngân sách, cách cấp secrets và healthcheck **trước** tạo tài nguyên trả phí. Không áp đặt Vercel hoặc nhà cung cấp cụ thể. Server WebSocket phải phù hợp runtime được chọn, không giả định mọi static/serverless host giữ connection được.

## Gate trước upload

Build tái lập và automated checks pass; asset ledger được review; không `.env`/tokens/source art vào bundle; cấu hình web access cho cả HTML, static assets và WSS/HTTP admission; origin allowlist và TLS hợp lệ. Code phòng không bảo vệ URL asset hoặc server admin. Audit trước upload ở P9-01, P9-03 kiểm lại trên host thật.

Giữ local config mẫu không có secret. Credentials do môi trường cấp; redact logs. Startup kiểm version/map/config hash. Hạn chế truy cập bằng access gateway/VPN/cơ chế đã chọn phải áp dụng đủ mọi path, kể cả WebSocket upgrade; kiểm cả trường hợp truy cập sai quyền.

## Vận hành

Healthcheck và metrics tối thiểu: room count, tick drift, errors, disconnect/reconnect; không in invite/reconnect secret hay IP không cần thiết. Một process restart làm mất registry/room: UI báo mất phòng; chưa cam kết durable sessions/multi-instance.

Rollback giữ deployment/build trước, config tương thích và cách khôi phục. Drain/không nhận phòng mới trước restart; log ảnh hưởng active rooms. P9-02 chạy rollback local/staging an toàn, ghi chính xác phần nào chưa chạy và rủi ro chấp nhận. Không gọi rollback đã kiểm nếu mới viết hướng dẫn.

## PC demo go/no-go

- HTTPS/WSS và access test pass, không có asset thiếu quyền/secrets.
- Hai PC khác mạng: create/code/join/ready/trận/kết quả/rematch cùng state.
- Windows Chrome có evidence; Edge ghi trạng thái thực. Mobile không chặn PC.
- Reconnect/timeout/admission/rate limits có test, D08 limitation được công bố trong known limitations.
- Blocker chưa giải quyết → no-go. Chủ dự án chấp nhận báo cáo `P9-04` mới có mốc PC demo hoàn tất; không tự publish public.

P10 chỉ mở sau khi `P9-04 = done`. Bản thân việc mở task P9 không phải quyền mua dịch vụ, phát hành công khai hoặc bỏ access restrictions.
