# AI Assistant for Frontend

Trợ lý sinh giao diện web từ mô tả bằng tiếng Việt/Anh: nhập mô tả → sinh HTML/CSS/JS → xem trước ngay trong
trình duyệt → chỉnh sửa qua chat. Điểm chính là **Code RAG** (truy xuất component để giữ giao diện nhất quán)
kết hợp hai tác tử **Coder / Critic** tự phản biện và sửa lại.

## Cài đặt
```bash
git clone https://github.com/hieule88/AI_assistant_for_frontend
cd AI_assistant_for_frontend
cd server && npm install
cd ../web && npm install
```

## Cấu hình
Tạo file `.env` cho server từ mẫu rồi điền API key:
```bash
cd server
cp .env.example .env
```
Các biến chính: `QWEN_BASE_URL`, `QWEN_API_KEY`, `QWEN_MODEL`. Nếu chỉ muốn chạy thử giao diện mà chưa có key,
đặt `MOCK_MODE=1` (server trả về một trang mẫu).

## Chạy
Backend (terminal 1):
```bash
cd server
npm run build:rag     # tạo index cho RAG, chạy 1 lần
npm run dev           # http://localhost:8787
```
Frontend (terminal 2):
```bash
cd web
npm run dev           # http://localhost:5173
```
Mở trình duyệt tại http://localhost:5173.

## So sánh nhiều model (tùy chọn)
Thêm API key vào `server/.env` rồi:
```bash
cd server
npm run eval:models
```
