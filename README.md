# 🌐 Social Media & Dating Platform — Frontend (React 19 + Vite)

[![React Version](https://img.shields.io/badge/React-19.2+-blue.svg?style=flat-square&logo=react)](https://react.dev/)
[![Vite Version](https://img.shields.io/badge/Vite-8.2+-646CFF.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4+-38B2AC.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-13.0+-EA4C89.svg?style=flat-square&logo=framer)](https://www.framer.com/motion/)
[![STOMP WebSocket](https://img.shields.io/badge/STOMP.js-7.3+-00ADD8.svg?style=flat-square&logo=websocket)](https://stomp-js.github.io/)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg?style=flat-square)]()

A modern, high-performance user interface for a full-featured social networking and dating platform, built with **React 19**, **Vite**, **Tailwind CSS**, and **Framer Motion**. Seamlessly fuses immersive visual experiences inspired by **Instagram, TikTok & Tinder**, powered by **100% authentic Backend REST APIs** (zero mock data) and real-time synchronization via **STOMP WebSockets**.

---

## 📑 Table of Contents

- [✨ Key Features](#-key-features)
  - [1. TikTok-Style Vertical Snap Reels](#1-tiktok-style-vertical-snap-reels)
  - [2. Comprehensive CRUD & In-Place Updates](#2-comprehensive-crud--in-place-updates)
  - [3. Public Guest Mode](#3-public-guest-mode)
  - [4. Feed & Multi-Tier Reaction System](#4-feed--multi-tier-reaction-system)
  - [5. 24h Stories (Instagram Stories)](#5-24h-stories-instagram-stories)
  - [6. Real-Time Messaging & Group Chat](#6-real-time-messaging--group-chat)
  - [7. Tinder-Style Dating Swipe Deck](#7-tinder-style-dating-swipe-deck)
  - [8. User Profiles & Admin Management Dashboard](#8-user-profiles--admin-management-dashboard)
- [🛠️ Tech Stack & Dependencies](#️-tech-stack--dependencies)
- [📂 Project Directory Structure](#-project-directory-structure)
- [⚙️ Environment Configuration](#️-environment-configuration)
- [🚀 Getting Started & Installation](#-getting-started--installation)

---

## ✨ Key Features

### 1. TikTok-Style Vertical Snap Reels
* **9:16 Vertical Snap-Scroll Viewport**: Smooth, native-like vertical container driven by `snap-y snap-mandatory`.
* **Multi-Modal Navigation**:
  * **Mouse Wheel**: Debounced auto-snapping to the next or previous video clip.
  * **Touch Gestures**: Intuitive vertical swipe up/down for mobile and touchscreen devices.
  * **Keyboard Navigation**: Dedicated shortcuts using `ArrowDown` / `ArrowUp` or vim-style `j` / `k`.
  * **Floating Chevron Overlay**: Quick leap controls displaying current reel index position (`1/5`, `2/5`, etc.).
* **Smart Video & Audio Lifecycle**: Only the reel currently in viewport focus (`isActive`) plays; background and inactive reels are automatically paused to conserve bandwidth and CPU/GPU resources.
* **Rich Micro-Interactions**: Double-tap burst heart animation, one-click global mute/unmute toggle, and non-intrusive sliding drawer for comments without pausing playback.
* **HD Fallback Reels**: Built-in 9:16 high-definition curated fallback content with audio tracks and captions for unauthenticated guest visitors.

### 2. Comprehensive CRUD & In-Place Updates
* **In-Line Comment Editing**:
  * "Edit" action beside "Delete" for comment owners (`isCommentOwner`).
  * Direct inline editing inside the comment bubble with `Enter` to commit, `Escape` or "Cancel" to dismiss, dispatching `PATCH /api/comments/{id}`.
* **Full-Featured Post Editing**:
  * Real-time content editing (`PATCH /api/posts/{id}`).
  * Dynamic privacy selector: Public (`PUBLIC`), Friends (`FRIEND`), Only Me (`PRIVATE`).
  * **Attached Media Management**: Grid preview of existing images/videos with granular trash can actions to selectively remove media files (`DELETE /api/posts/media/{id}`).
  * **New Media Append**: Add new images/videos to existing posts on the fly (`POST /api/posts/{id}/media`) with immediate thumbnail preview and cancel options.
* **Story Privacy Control**:
  * Instant privacy adjustment dropdown (🌐 Public, 👥 Friends, 🔒 Only Me) right from the 24h story viewer (`PATCH /api/stories/{id}/visibility`).
* **Reel Metadata Updating**:
  * Dedicated modal to edit reel caption, description, and privacy visibility (`PATCH /api/reels/{id}`).
* **Profile & Group Chat Management**:
  * Comprehensive `/profile/edit` suite: Basic information, contact details, occupation, social links, username, password, and profile privacy toggles.
  * Dynamic Chat Information Drawer (`ChatInfoSidebar`) enabling group chat renaming (`PUT`) and group avatar customization (`PUT`).

### 3. Public Guest Mode
* Unauthenticated visitors can seamlessly browse:
  * Public post feeds (`/api/posts/public/feed`)
  * Public vertical Reels feed (`/api/reels/public/feed`)
  * Public comments, replies, and community discussions
  * Trending hashtags and explore feeds
* Engaging with interactive actions (liking, commenting, sharing, bookmarking) triggers a sleek `LoginPromptModal` dialog without disrupting the browsing flow.

### 4. Feed & Multi-Tier Reaction System
* Modern card layouts inspired by Facebook & Instagram with adaptive multi-image masonry/grid displays (1 to 10+ items).
* Expressive 6-emotion 3D reaction bar (`LIKE`, `LOVE`, `HAHA`, `WOW`, `SAD`, `ANGRY`) with animated popover burst effects.
* Detailed reaction breakdown modal (`ReactedUsersModal`) categorized by reaction types.
* Multi-level nested replies, timestamp formatting, and community content reporting system.

### 5. 24h Stories (Instagram Stories)
* Gradient ring avatar bar indicating active and unread stories.
* Fullscreen immersive story player with automatic progress bar timer, tap/hold to pause, viewer analytics list, and direct heart reactions.

### 6. Real-Time Messaging & Group Chat
* Direct 1-on-1 and multi-user group chat powered by STOMP over WebSocket.
* Rich media attachment uploads (images, clips), per-message emoji reactions, live read receipts, and complete group member administration.

### 7. Tinder-Style Dating Swipe Deck
* Fluid physics-based card swiping: Swipe Right (Like) or Swipe Left (Pass), fully controllable via arrow keys.
* Automatic mutual match detection with celebratory congratulation modals and dedicated direct dating chat channels.
* Customizable discovery filters: GPS proximity radius, age range, gender preferences, and shared interests.

### 8. User Profiles & Admin Management Dashboard
* Multi-tab profile hub: Posts, Reels, Friends & Connections, and About Info.
* Comprehensive friendship workflow: Send request, accept, decline, unfriend, mutual friend count, and user blocking.
* Executive Admin Portal (`/admin`): Complete user management, account suspension/activation, content report moderation, and dating profile verification.

---

## 🛠️ Tech Stack & Dependencies

| Technology | Role & Architecture Application |
| :--- | :--- |
| **React 19** | Core UI library leveraging concurrent rendering and high-performance transitions |
| **Vite 8** | Next-generation frontend build tooling with instantaneous Hot Module Replacement (HMR) |
| **Tailwind CSS 3** | Utility-first CSS framework with dark mode support and custom glassmorphism utilities |
| **Framer Motion 13** | Physics-based animations for modals, sliding drawers, and interactive swipe cards |
| **STOMP.js & SockJS** | Bi-directional WebSocket transport protocol for instant messaging and push notifications |
| **Axios** | HTTP client configured with automated JWT Bearer authorization interceptors and error handling |
| **Lucide React** | Consistent, lightweight vector iconography |
| **React Hot Toast** | Elegant, non-blocking toast notifications for user action feedback |
| **React Router DOM 7** | Client-side SPA routing with role-based protected access controls |

---

## 📂 Project Directory Structure

```
social-fe/
├── src/
│   ├── api/                    # Axios client configuration and JWT interceptors
│   ├── components/
│   │   ├── common/             # LoginPromptModal, generic dialogs, and reusable alerts
│   │   ├── chat/               # ChatInfoSidebar, MessageReactionUsersModal, ChatWindow
│   │   ├── dating/             # SwipeCard, MatchModal, EditDatingProfileModal
│   │   ├── layout/             # AppHeader, Sidebar, RightSidebar, MobileNav
│   │   ├── post/               # PostCard, CommentSection, CreatePostModal, ReactionPicker
│   │   ├── profile/            # EditProfileModal, EditFieldModal
│   │   ├── reel/               # ReelPlayer, EditReelModal, CreateReelModal, ReelCommentDrawer
│   │   ├── story/              # StoryViewerModal, CreateStoryModal, StorySection
│   │   └── ui/                 # Button, Input, Modal, Tabs, Badge, Card primitives
│   ├── contexts/               # AuthContext, UserContext, RealSocialContext
│   ├── pages/                  # HomePage, ReelsPage, MessagesPage, DatingPage, ProfilePage, SettingsPage, AdminPage
│   ├── services/               # 20+ service modules connecting 100% to Backend APIs (post, reel, chat, dating, user, admin...)
│   ├── stores/                 # useWebSocketStore (Zustand STOMP WebSocket client)
│   ├── App.jsx                 # Central application routing and route guards
│   ├── main.jsx                # Application bootstrapping entry point
│   └── index.css               # Tailwind CSS declarations, design tokens & animation utilities
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the project root (`social-fe/social-fe/`):

```env
# Spring Boot Backend API Base URL
VITE_API_BASE_URL=http://localhost:8080/api

# STOMP WebSocket Endpoint
VITE_WS_URL=http://localhost:8080/ws
```

---

## 🚀 Getting Started & Installation

### 1. Install Dependencies
```bash
cd social-fe/social-fe
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
The application will launch locally at `http://localhost:5173`.

### 3. Production Build
```bash
npm run build
```
The optimized production bundle will be generated in the `dist/` directory, ready to be deployed to Vercel, Netlify, Nginx, or Docker.
