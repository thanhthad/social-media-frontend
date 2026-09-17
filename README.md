# 🌐 Social Media & Dating Platform — Frontend (React 19 + Vite)

[![React Version](https://img.shields.io/badge/React-19.2+-blue.svg?style=flat-square&logo=react)](https://react.dev/)
[![Vite Version](https://img.shields.io/badge/Vite-8.2+-646CFF.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4+-38B2AC.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-13.0+-EA4C89.svg?style=flat-square&logo=framer)](https://www.framer.com/motion/)
[![STOMP WebSocket](https://img.shields.io/badge/STOMP.js-7.3+-00ADD8.svg?style=flat-square&logo=websocket)](https://stomp-js.github.io/)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg?style=flat-square)]()

Giao diện người dùng hiện đại cho nền tảng mạng xã hội và ứng dụng hẹn hò đa tính năng, phát triển bằng **React 19**, **Vite**, **Tailwind CSS**, và **Framer Motion**. Kết hợp trải nghiệm thị giác mượt mà phong cách **Instagram, TikTok & Tinder**, kết nối **100% Backend API thật** (loại bỏ hoàn toàn mock data), đồng bộ thời gian thực qua **STOMP WebSocket**.

---

## 📑 Mục Lục

- [✨ Tính Năng Nổi Bật](#-tính-năng-nổi-bật)
  - [1. Reels Video Chuẩn TikTok Lướt Lên / Xuống](#1-reels-video-chuẩn-tiktok-lướt-lên--xuống)
  - [2. Đầy Đủ Chức Năng Cập Nhật (Update) Toàn Diện](#2-đầy-đủ-chức-năng-cập-nhật-update-toàn-diện)
  - [3. Chế Độ Khách Công Khai (Guest Mode)](#3-chế-độ-khách-công-khai-guest-mode)
  - [4. Bảng Tin & Tương Tác Cảm Xúc Đa Tầng](#4-bảng-tin--tương-tác-cảm-xúc-đa-tầng)
  - [5. Tin 24h (Instagram Stories)](#5-tin-24h-instagram-stories)
  - [6. Nhắn Tin Thời Gian Thực & Chat Nhóm](#6-nhắn-tin-thời-gian-thực--chat-nhóm)
  - [7. Hẹn Hò Tinder-Style Swipe Deck](#7-hẹn-hò-tinder-style-swipe-deck)
  - [8. Hồ Sơ Cá Nhân & Bảng Quản Trị (Admin)](#8-hồ-sơ-cá-nhân--bảng-quản-trị-admin)
- [🛠️ Công Nghệ & Thư Viện Sử Dụng](#️-công-nghệ--thư-viện-sử-dụng)
- [📂 Cấu Trúc Thư Mục Dự Án](#-cấu-trúc-thư-mục-dự-án)
- [⚙️ Cấu Hình Biến Môi Trường](#️-cấu-hình-biến-môi-trường)
- [🚀 Hướng Dẫn Cài Đặt & Khởi Chạy](#-hướng-dẫn-cài-đặt--khởi-chạy)

---

## ✨ Tính Năng Nổi Bật

### 1. Reels Video Chuẩn TikTok Lướt Lên / Xuống
* **Khung cuộn Snap-Scroll 9:16 dọc**: Cơ chế `snap-y snap-mandatory` mượt mà chuẩn phong cách video ngắn.
* **Đa phương thức cuộn lướt**:
  * **Con lăn chuột (Wheel)**: Tự động chuyển video kế tiếp/trước đó có chống giật (debounce).
  * **Cử chỉ vuốt chạm (Touch Swipe)**: Vuốt lên / vuốt xuống tiện lợi trên điện thoại hoặc màn hình cảm ứng.
  * **Phím điều hướng**: Phím mũi tên `ArrowDown` / `ArrowUp` hoặc `j` / `k`.
  * **Nút bấm Chevron nổi**: Điều hướng nhanh kèm số thứ tự video hiện tại (`1/5`, `2/5`, ...).
* **Phát video & âm thanh thông minh**: Chỉ phát video đang nằm trong tiêu điểm màn hình (`isActive`), tự động tạm dừng các video còn lại để tối ưu hóa tài nguyên.
* **Tương tác**: Nhấp đúp thả tim bung nở, nút bật/tắt âm thanh nhanh, xem bình luận dạng ngăn kéo trượt (drawer) mà không ngắt quãng video.
* **Fallback Reels HD**: Cung cấp sẵn video mẫu 9:16 chất lượng cao kèm âm thanh và caption sinh động cho khách chưa đăng nhập.

### 2. Đầy Đủ Chức Năng Cập Nhật (Update) Toàn Diện
* **Chỉnh sửa bình luận (Comment Update)**:
  * Nút "Chỉnh sửa" cạnh nút "Xóa" cho chủ bình luận (`isCommentOwner`).
  * Sửa trực tiếp inline trong bubble bình luận, hỗ trợ phím `Enter` để lưu ngay, `Escape` hoặc nút "Hủy", gọi trực tiếp `PATCH /api/comments/{id}`.
* **Chỉnh sửa bài viết toàn diện (Post Update)**:
  * Sửa nội dung văn bản (`PATCH /api/posts/{id}`).
  * Đổi quyền riêng tư: Công khai (`PUBLIC`), Bạn bè (`FRIEND`), Chỉ mình tôi (`PRIVATE`).
  * **Quản lý ảnh/video đã đính kèm**: Hiển thị lưới ảnh hiện có, mỗi ảnh có nút thùng rác để xóa tệp cụ thể khỏi bài viết (`DELETE /api/posts/media/{id}`).
  * **Tải thêm ảnh/video mới**: Tải thêm tệp bổ sung vào bài viết đã đăng (`POST /api/posts/{id}/media`) kèm xem trước và nút hủy chọn.
* **Cập nhật quyền riêng tư Story (Story Update)**:
  * Dropdown chọn quyền riêng tư: 🌐 Công khai, 👥 Bạn bè, 🔒 Chỉ mình tôi ngay trên thanh xem tin 24h (`PATCH /api/stories/{id}/visibility`).
* **Chỉnh sửa video Reel (Reel Update)**:
  * Modal chỉnh sửa mô tả/caption và quyền riêng tư video Reel (`PATCH /api/reels/{id}`).
* **Cập nhật trang cá nhân & Nhóm chat**:
  * Trang `/profile/edit` cập nhật đầy đủ: Thông tin cơ bản, liên hệ, nghề nghiệp, mạng xã hội, username, mật khẩu, quyền riêng tư hồ sơ.
  * Bảng thông tin chat (`ChatInfoSidebar`) cho phép đổi tên nhóm chat (`PUT`) và đổi ảnh đại diện nhóm (`PUT`).

### 3. Chế Độ Khách Công Khai (Guest Mode)
* Người dùng chưa đăng nhập có thể thoải mái xem:
  * Bảng tin bài viết công khai (`/api/posts/public/feed`)
  * Bảng tin video Reels công khai (`/api/reels/public/feed`)
  * Đọc bình luận và câu trả lời công khai
  * Khám phá hashtag thịnh hành
* Khi khách thực hiện thao tác tương tác (thả tim, bình luận, chia sẻ, lưu), hệ thống hiển thị popup `LoginPromptModal` đẹp mắt, không ngắt mạch duyệt trang.

### 4. Bảng Tin & Tương Tác Cảm Xúc Đa Tầng
* Bố cục thẻ bài viết Facebook & Instagram hiện đại, hỗ trợ lưới ảnh động từ 1 đến nhiều ảnh.
* Thanh cảm xúc 6 loại biểu cảm 3D (`LIKE`, `LOVE`, `HAHA`, `WOW`, `SAD`, `ANGRY`) với hoạt ảnh bung nở mượt mà.
* Xem danh sách người thả cảm xúc phân loại theo từng biểu tượng (`ReactedUsersModal`).
* Bình luận phân nhánh đa cấp (nested replies), báo cáo vi phạm bài viết.

### 5. Tin 24h (Instagram Stories)
* Thanh tròn avatar gradient thông báo tin mới.
* Trình xem tin toàn màn hình với thanh thời gian tự chạy, tạm dừng khi giữ chuột/chạm, xem danh sách người đã xem tin, thả tim vào tin.

### 6. Nhắn Tin Thời Gian Thực & Chat Nhóm
* Giao diện trò chuyện cá nhân và nhóm chat thời gian thực qua STOMP WebSocket.
* Gửi ảnh/video đính kèm, thả cảm xúc trên từng tin nhắn, xem con trỏ đã đọc (read receipts), quản lý thành viên nhóm.

### 7. Hẹn Hò Tinder-Style Swipe Deck
* Giao diện quẹt thẻ đối tượng hẹn hò: Quẹt phải (Thích) hoặc Quẹt trái (Bỏ qua), hỗ trợ phím mũi tên bàn phím.
* Tự động phát hiện tương hợp (Match) với popup chúc mừng và mở kênh chat hẹn hò riêng biệt.
* Cài đặt bộ lọc cự ly GPS, khoảng tuổi, giới tính và danh mục sở thích.

### 8. Hồ Sơ Cá Nhân & Bảng Quản Trị (Admin)
* Trang cá nhân tích hợp 4 tab: Bài viết, Reels, Bạn bè, Giới thiệu.
* Thao tác kết bạn: Gửi lời mời, chấp nhận, từ chối, hủy kết bạn, xem bạn chung, chặn người dùng.
* Trang Admin (`/admin`): Quản lý người dùng, khóa/kích hoạt tài khoản, kiểm duyệt báo cáo bài viết và hồ sơ hẹn hò.

---

## 🛠️ Công Nghệ & Thư Viện Sử Dụng

| Công Nghệ | Vai Trò & Ứng Dụng |
| :--- | :--- |
| **React 19** | Thư viện UI nền tảng với concurrent rendering hiệu năng cao |
| **Vite 8** | Công cụ build cực nhanh với Hot Module Replacement (HMR) |
| **Tailwind CSS 3** | Framework CSS utility-first, hỗ trợ dark mode & glassmorphism |
| **Framer Motion 13** | Xử lý hoạt ảnh mượt mà cho modal, drawer, swipe card |
| **STOMP.js & SockJS** | Giao thức WebSocket 2 chiều nhận thông báo & tin nhắn tức thì |
| **Axios** | HTTP Client xử lý tự động gắn JWT Bearer token và interceptor |
| **Lucide React** | Bộ icon vector sắc nét, đồng bộ phong cách |
| **React Hot Toast** | Hiển thị thông báo trạng thái thao tác đẹp mắt |
| **React Router DOM 7** | Điều hướng SPA với bảo vệ quyền truy cập theo role |

---

## 📂 Cấu Trúc Thư Mục Dự Án

```
social-fe/
├── src/
│   ├── api/                    # Cấu hình axiosClient và interceptor token
│   ├── components/
│   │   ├── common/             # LoginPromptModal, các modal thông báo chung
│   │   ├── chat/               # ChatInfoSidebar, MessageReactionUsersModal
│   │   ├── dating/             # SwipeCard, MatchModal, EditDatingProfileModal
│   │   ├── layout/             # AppHeader, Sidebar, RightSidebar, MobileNav
│   │   ├── post/               # PostCard, CommentSection, CreatePostModal, ReactionPicker
│   │   ├── profile/            # EditProfileModal, EditFieldModal
│   │   ├── reel/               # ReelPlayer, EditReelModal, CreateReelModal, ReelCommentDrawer
│   │   ├── story/              # StoryViewerModal, CreateStoryModal, StorySection
│   │   └── ui/                 # Button, Input, Modal, Tabs, Badge, Card
│   ├── contexts/               # AuthContext, UserContext, RealSocialContext
│   ├── pages/                  # HomePage, ReelsPage, MessagesPage, DatingPage, ProfilePage, SettingsPage, AdminPage
│   ├── services/               # 20+ services kết nối 100% Backend API (post, reel, chat, dating, user, admin...)
│   ├── stores/                 # useWebSocketStore (Zustand STOMP client)
│   ├── App.jsx                 # Cấu hình định tuyến Route ứng dụng
│   ├── main.jsx                # Entry point ứng dụng
│   └── index.css               # Tailwind CSS imports & animations
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## ⚙️ Cấu Hình Biến Môi Trường

Tạo file `.env` tại thư mục gốc `social-fe/social-fe/`:

```env
# Địa chỉ Backend API Spring Boot
VITE_API_BASE_URL=http://localhost:8080/api

# Địa chỉ STOMP WebSocket
VITE_WS_URL=http://localhost:8080/ws
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Cài đặt các gói phụ thuộc
```bash
cd social-fe/social-fe
npm install
```

### 2. Khởi chạy môi trường phát triển (Development)
```bash
npm run dev
```
Ứng dụng sẽ chạy tại địa chỉ: `http://localhost:5173`.

### 3. Đóng gói cho môi trường thực tế (Production Build)
```bash
npm run build
```
Thư mục xuất bản `dist/` đã sẵn sàng để triển khai lên Vercel, Netlify, Nginx hoặc Docker.
