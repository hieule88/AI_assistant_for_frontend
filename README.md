# AI Assistant for Frontend

Trợ lý giúp dựng nhanh giao diện web tĩnh từ mô tả bằng ngôn ngữ tự nhiên. Bạn gõ mô tả trang cần làm (tiếng
Việt hoặc Anh), hệ thống sinh ra HTML/CSS/JS, hiển thị bản xem trước ngay trong trình duyệt, rồi cho chỉnh sửa
tiếp bằng cách nhắn yêu cầu.

## Về dự án

Ý tưởng xuất phát từ một vấn đề khi để mô hình ngôn ngữ tự sinh giao diện: kết quả thường **thiếu nhất quán** —
mỗi lần sinh lại ra một phong cách khác, và nhiều trang của cùng một website trông như của các site khác nhau.
Với web cho một thương hiệu thì phần khó nhất lại chính là giữ cho nhận diện đồng nhất, chứ không chỉ là sinh
đúng nội dung.

Dự án giải quyết việc đó bằng hai hướng chính:

- **Code RAG.** Thay vì để mô hình tự bịa giao diện, hệ thống truy xuất các component có sẵn trong một kho
  "design system" rồi đưa vào prompt, đồng thời áp một bộ CSS chuẩn cố định cho các component đó. Nhờ vậy các
  trang sinh ra đều bám cùng một nhận diện và ổn định qua nhiều lần chạy.
- **Hai tác tử Coder / Critic (Reflection).** Coder sinh mã; Critic tự phản biện trang vừa sinh (đã đúng yêu cầu
  chưa, HTML/CSS có sạch không, có theo đúng design system không) rồi Coder sửa lại theo góp ý. Vòng phản biện –
  chỉnh sửa này lặp vài lần cho tới khi đạt, thay vì chỉ sinh một lượt rồi thôi.

Đầu ra là một file `index.html` (CSS và JS nằm luôn trong đó), nên xem trước bằng iframe được ngay. Backend viết bằng Node/Express, frontend bằng React; phần gọi mô hình đi qua
một lớp trung giang linh hoạt nên đổi nhà cung cấp LLM chỉ cần sửa cấu hình qua file .env.

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

## Cấu trúc
- `server/` — API (Express), pipeline đa tác tử, Code RAG (embedding + vector store), lớp gọi model.
- `web/` — giao diện React: chat, preview bằng iframe, editor code.

## So sánh nhiều model (tùy chọn)
Thêm API key vào `server/.env` rồi:
```bash
cd server
npm run eval:models
```
