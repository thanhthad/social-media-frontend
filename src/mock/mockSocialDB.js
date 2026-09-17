// SocialDB Comprehensive Mock Data Engine

export const CURRENT_USER = {
  id: 'usr_me',
  name: 'Alex Vance',
  username: 'alexvance',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80',
  bio: 'Product Designer & Frontend Architect. Obsessed with clean UI, typography, and human-computer interactions ⚡',
  location: 'San Francisco, CA',
  website: 'https://alexvance.design',
  joinedDate: 'Tham gia tháng 01/2024',
  isVerified: true,
  stats: {
    posts: 42,
    friends: 384,
    followers: '14.2k',
    following: 428,
  },
};

export const MOCK_USERS = [
  CURRENT_USER,
  {
    id: 'usr_1',
    name: 'Elena Rostova',
    username: 'elenarostova',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
    bio: 'Photographer & Visual Storyteller. Chasing light across the globe 📷',
    isVerified: true,
    mutualFriends: 18,
    isOnline: true,
    lastSeen: 'Vừa mới truy cập',
  },
  {
    id: 'usr_2',
    name: 'David Chen',
    username: 'davidchen_dev',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    bio: 'Systems engineer, coffee enthusiast, and open-source contributor.',
    isVerified: false,
    mutualFriends: 7,
    isOnline: true,
    lastSeen: 'Đang hoạt động',
  },
  {
    id: 'usr_3',
    name: 'Sophia Williams',
    username: 'sophiaw',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    cover: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&auto=format&fit=crop&q=80',
    bio: 'Architectural minimalism & Interior curator. Tokyo / London 🏛️',
    isVerified: true,
    mutualFriends: 24,
    isOnline: false,
    lastSeen: 'Hoạt động 15 phút trước',
  },
  {
    id: 'usr_4',
    name: 'Marcus Brody',
    username: 'brody_marcus',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    cover: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=80',
    bio: 'Building the future of distributed networks. Trail runner & mountaineer.',
    isVerified: false,
    mutualFriends: 4,
    isOnline: true,
    lastSeen: 'Đang hoạt động',
  },
  {
    id: 'usr_5',
    name: 'Camila Diaz',
    username: 'camiladiaz',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
    cover: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&auto=format&fit=crop&q=80',
    bio: 'Fashion designer & ceramicist. Living simply.',
    isVerified: true,
    mutualFriends: 12,
    isOnline: false,
    lastSeen: 'Hoạt động 1 giờ trước',
  },
];

export const MOCK_POSTS = [
  {
    id: 'post_1',
    author: MOCK_USERS[1], // Elena Rostova
    createdAt: '2 giờ trước',
    privacy: 'public',
    content: 'Buổi sáng tĩnh lặng tại Kyoto. Ánh sáng len lỏi qua từng kẽ lá phong tạo nên một bức tranh hoàn mỹ của thiên nhiên. Bạn thích màu sắc của mùa thu hay mùa xuân hơn? 🍁✨ #Kyoto #Photography #NatureLovers #TravelGram',
    images: [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=1200&auto=format&fit=crop&q=80',
    ],
    likesCount: 248,
    isLiked: false,
    commentsCount: 34,
    sharesCount: 16,
    isSaved: false,
    comments: [
      {
        id: 'c1',
        author: MOCK_USERS[2],
        content: 'Góc chụp và ánh sáng quá tuyệt vời Elena! Dùng lens gì thế?',
        createdAt: '1 giờ trước',
        likesCount: 5,
        isLiked: true,
      },
      {
        id: 'c2',
        author: CURRENT_USER,
        content: 'Màu film ấm áp thật sự! Rất truyền cảm hứng 🤍',
        createdAt: '30 phút trước',
        likesCount: 3,
        isLiked: false,
      },
    ],
  },
  {
    id: 'post_2',
    author: MOCK_USERS[2], // David Chen
    createdAt: '4 giờ trước',
    privacy: 'public',
    content: 'Vừa hoàn thành bản thiết kế kiến trúc vi mô cho SocialDB! Hướng tiếp cận Component-driven kết hợp token màu slate tinh tế giúp trải nghiệm người dùng mượt mà hơn rất nhiều so với các giao diện mạng xã hội truyền thống. 💻🚀 #DesignSystem #FrontendArchitecture #CleanCode #TechDesign',
    images: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
    ],
    likesCount: 412,
    isLiked: true,
    commentsCount: 58,
    sharesCount: 42,
    isSaved: true,
    comments: [
      {
        id: 'c3',
        author: MOCK_USERS[4],
        content: 'Một kiến trúc rất sạch và chuẩn mực. Chúc mừng team!',
        createdAt: '3 giờ trước',
        likesCount: 12,
        isLiked: false,
      },
    ],
  },
  {
    id: 'post_3',
    author: MOCK_USERS[3], // Sophia Williams
    createdAt: '6 giờ trước',
    privacy: 'friends',
    content: 'Không gian sống tối giản không chỉ là thẩm mỹ, mà là phong cách tư duy. Bỏ bớt những chi tiết thừa thãi để tâm trí có chỗ thảnh thơi sáng tạo 🌿 2026 là năm của sự tinh tế và chất lượng thật sự.',
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    ],
    likesCount: 189,
    isLiked: false,
    commentsCount: 19,
    sharesCount: 8,
    isSaved: false,
    comments: [],
  },
  {
    id: 'post_4',
    author: CURRENT_USER,
    createdAt: '1 ngày trước',
    privacy: 'public',
    content: 'Một góc làm việc đầy nắng vào chiều thứ 7. Chuẩn bị release phiên bản giao diện hoàn toàn mới cho SocialDB! Mọi chi tiết từ viền hairline 1px, phông chữ Inter chuẩn xác cho tới hiệu ứng phản hồi đều được chăm chút tỉ mỉ. Rất mong nhận được góp ý của cả nhà! ☕✨ #SocialDB #DesignSystem #Vite #TailwindCSS',
    images: [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80',
    ],
    likesCount: 531,
    isLiked: true,
    commentsCount: 64,
    sharesCount: 29,
    isSaved: true,
    comments: [
      {
        id: 'c4',
        author: MOCK_USERS[1],
        content: 'UI nhìn cao cấp và hiện đại hơn hẳn bản trước đó Alex ơi!',
        createdAt: '18 giờ trước',
        likesCount: 8,
        isLiked: true,
      },
    ],
  },
];

export const MOCK_STORIES = [
  {
    id: 'story_me',
    user: CURRENT_USER,
    hasUnseen: false,
    isMine: true,
    items: [
      {
        id: 's_item_0',
        mediaUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1080&auto=format&fit=crop&q=80',
        caption: 'Team workshop hôm nay! 🚀',
        time: '3 giờ trước',
      },
    ],
  },
  {
    id: 'story_1',
    user: MOCK_USERS[1], // Elena
    hasUnseen: true,
    items: [
      {
        id: 's_item_1',
        mediaUrl: 'https://images.unsplash.com/photo-1509233725247-49e657c54213?w=1080&auto=format&fit=crop&q=80',
        caption: 'Biển chiều muộn tại Okinawa 🌊',
        time: '1 giờ trước',
      },
      {
        id: 's_item_2',
        mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&auto=format&fit=crop&q=80',
        caption: 'Bình yên là đây 🌅',
        time: '45 phút trước',
      },
    ],
  },
  {
    id: 'story_2',
    user: MOCK_USERS[2], // David
    hasUnseen: true,
    items: [
      {
        id: 's_item_3',
        mediaUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1080&auto=format&fit=crop&q=80',
        caption: 'Setup góc code mới cho tuần mới 💻',
        time: '4 giờ trước',
      },
    ],
  },
  {
    id: 'story_3',
    user: MOCK_USERS[3], // Sophia
    hasUnseen: false,
    items: [
      {
        id: 's_item_4',
        mediaUrl: 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=1080&auto=format&fit=crop&q=80',
        caption: 'Triển lãm kiến trúc hôm nay rất ấn tượng 🏛️',
        time: '7 giờ trước',
      },
    ],
  },
  {
    id: 'story_4',
    user: MOCK_USERS[5], // Camila
    hasUnseen: true,
    items: [
      {
        id: 's_item_5',
        mediaUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1080&auto=format&fit=crop&q=80',
        caption: 'Mẫu thiết kế áo khoác linen mới nhất ✨',
        time: '2 giờ trước',
      },
    ],
  },
];

export const MOCK_REELS = [
  {
    id: 'reel_1',
    creator: MOCK_USERS[1],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=720&auto=format&fit=crop&q=80',
    caption: 'Sóng biển vỗ bờ tại vùng vịnh hoang sơ. Âm thanh tự nhiên chữa lành nhất mà bạn từng nghe 🌊✨ #OceanVibes #Relax #NatureReel',
    musicName: 'Original Sound - Elena Rostova (Okinawa Ambience)',
    likesCount: 14200,
    isLiked: false,
    commentsCount: 382,
    sharesCount: 1205,
    isSaved: false,
  },
  {
    id: 'reel_2',
    creator: MOCK_USERS[3],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=720&auto=format&fit=crop&q=80',
    caption: 'Kiến trúc tối giản và sự giao thoa ánh sáng ban mai tại Kyoto House. Một tác phẩm đáng suy ngẫm 🏡🌿 #Architecture #DesignInspiration',
    musicName: 'Lofi Morning Study - Chillhop Beats',
    likesCount: 8940,
    isLiked: true,
    commentsCount: 194,
    sharesCount: 654,
    isSaved: true,
  },
  {
    id: 'reel_3',
    creator: MOCK_USERS[2],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-typing-on-a-laptop-42998-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=720&auto=format&fit=crop&q=80',
    caption: 'Mẹo tối ưu hóa render trong React 19 mà có thể bạn chưa biết! Không cần memo bừa bãi nữa 🔥 #WebDev #ReactJS #CodingTips',
    musicName: 'Synthwave Code Pulse - DevLovers',
    likesCount: 23100,
    isLiked: false,
    commentsCount: 842,
    sharesCount: 3410,
    isSaved: false,
  },
];

export const MOCK_FRIENDS = [
  {
    id: 'usr_1',
    user: MOCK_USERS[1],
    status: 'friends',
    since: 'Bạn bè từ tháng 03/2024',
    mutualCount: 18,
  },
  {
    id: 'usr_2',
    user: MOCK_USERS[2],
    status: 'friends',
    since: 'Bạn bè từ tháng 02/2024',
    mutualCount: 7,
  },
  {
    id: 'usr_3',
    user: MOCK_USERS[3],
    status: 'friends',
    since: 'Bạn bè từ tháng 04/2024',
    mutualCount: 24,
  },
  {
    id: 'usr_4',
    user: MOCK_USERS[4],
    status: 'friends',
    since: 'Bạn bè từ tháng 05/2024',
    mutualCount: 4,
  },
];

export const MOCK_FRIEND_REQUESTS = [
  {
    id: 'req_1',
    user: {
      id: 'usr_6',
      name: 'Liam Neuman',
      username: 'liam_neu',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
      bio: 'Design lead @ Monolith Studio. Type & geometry lover.',
      mutualCount: 14,
    },
    sentAt: '2 giờ trước',
  },
  {
    id: 'req_2',
    user: {
      id: 'usr_7',
      name: 'Aoi Takahashi',
      username: 'aoi_tk',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      bio: 'Digital illustrator & 3D artist. Based in Osaka 🎨',
      mutualCount: 9,
    },
    sentAt: '1 ngày trước',
  },
];

export const MOCK_SUGGESTED_FRIENDS = [
  {
    id: 'sug_1',
    user: {
      id: 'usr_8',
      name: 'Julian Alvarez',
      username: 'julian_alv',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
      bio: 'Tech entrepreneur & angel investor.',
      mutualCount: 11,
    },
    reason: 'Có 11 bạn chung với bạn',
  },
  {
    id: 'sug_2',
    user: {
      id: 'usr_9',
      name: 'Maya Lin',
      username: 'mayalin_art',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      bio: 'Exhibition curator & modern art archivist.',
      mutualCount: 6,
    },
    reason: 'Theo dõi các chủ đề tương tự bạn',
  },
];

export const MOCK_CONVERSATIONS = [
  {
    id: 'convo_1',
    participant: MOCK_USERS[1], // Elena
    isOnline: true,
    lastMessage: 'Chắc chắn rồi Alex! Hẹn gặp bạn ở buổi triển lãm cuối tuần này nhé.',
    lastMessageTime: '14:32',
    unreadCount: 2,
    messages: [
      {
        id: 'm1',
        senderId: 'usr_1',
        text: 'Chào Alex! Bạn đã xem bộ ảnh Kyoto mới của mình chưa?',
        timestamp: '14:20',
      },
      {
        id: 'm2',
        senderId: 'usr_me',
        text: 'Mình vừa xem xong! Màu sắc tuyệt vời lắm Elena, ánh sáng qua kẽ lá nhìn rất có hồn.',
        timestamp: '14:25',
      },
      {
        id: 'm3',
        senderId: 'usr_1',
        text: 'Cảm ơn bạn nhiều! Cuối tuần này mình có trưng bày vài tác phẩm ở gallery trung tâm, bạn ghé nhé?',
        timestamp: '14:30',
      },
      {
        id: 'm4',
        senderId: 'usr_1',
        text: 'Chắc chắn rồi Alex! Hẹn gặp bạn ở buổi triển lãm cuối tuần này nhé.',
        timestamp: '14:32',
      },
    ],
  },
  {
    id: 'convo_2',
    participant: MOCK_USERS[2], // David
    isOnline: true,
    lastMessage: 'File schema Tailwind token hôm qua bạn gửi dùng rất êm!',
    lastMessageTime: 'Hôm qua',
    unreadCount: 0,
    messages: [
      {
        id: 'm5',
        senderId: 'usr_2',
        text: 'File schema Tailwind token hôm qua bạn gửi dùng rất êm!',
        timestamp: 'Hôm qua',
      },
    ],
  },
  {
    id: 'convo_3',
    participant: MOCK_USERS[3], // Sophia
    isOnline: false,
    lastMessage: 'Cảm ơn bạn đã chia sẻ bài viết hay nhé.',
    lastMessageTime: 'Thứ Ba',
    unreadCount: 0,
    messages: [
      {
        id: 'm6',
        senderId: 'usr_3',
        text: 'Cảm ơn bạn đã chia sẻ bài viết hay nhé.',
        timestamp: 'Thứ Ba',
      },
    ],
  },
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 'notif_1',
    type: 'like',
    actor: MOCK_USERS[1],
    content: 'đã thích bài viết của bạn: "Một góc làm việc đầy nắng vào chiều thứ 7..."',
    createdAt: '15 phút trước',
    isRead: false,
    mediaThumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'notif_2',
    type: 'comment',
    actor: MOCK_USERS[2],
    content: 'đã bình luận về bài viết của bạn: "UI nhìn cao cấp và hiện đại hơn hẳn..."',
    createdAt: '1 giờ trước',
    isRead: false,
    mediaThumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'notif_3',
    type: 'friend_request',
    actor: {
      id: 'usr_6',
      name: 'Liam Neuman',
      username: 'liam_neu',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    },
    content: 'đã gửi lời mời kết bạn cho bạn.',
    createdAt: '2 giờ trước',
    isRead: true,
  },
  {
    id: 'notif_4',
    type: 'mention',
    actor: MOCK_USERS[3],
    content: 'đã nhắc đến bạn trong một bình luận: "@alexvance góc nhìn này rất chuẩn"',
    createdAt: '5 giờ trước',
    isRead: true,
  },
  {
    id: 'notif_5',
    type: 'dating_match',
    actor: {
      id: 'date_1',
      name: 'Chloe Laurent',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    },
    content: 'Bạn và Chloe vừa tương hợp trên SocialDB Dating! Hãy gửi lời chào đầu tiên 💕',
    createdAt: 'Hôm qua',
    isRead: true,
  },
];

export const MOCK_DATING_PROFILES = [
  {
    id: 'date_1',
    name: 'Chloe Laurent',
    age: 26,
    distanceKm: 3.5,
    occupation: 'UI Designer & Coffee Roaster',
    verified: true,
    bio: 'Thích những buổi sáng thảnh thơi tại quán cafe yên tĩnh, sách kiến trúc, và đi bộ đường dài ngắm hoàng hôn. Điểm cộng nếu bạn thích nhạc Indie Acoustic! ☕🌿',
    passions: ['Thiết kế UI', 'Cà phê đặc sản', 'Indie Folk', 'Nhiếp ảnh film', 'Leo núi'],
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'date_2',
    name: 'Valeria Gomez',
    age: 25,
    distanceKm: 6.2,
    occupation: 'Contemporary Art Curator',
    verified: true,
    bio: 'Sống giữa các triển lãm nghệ thuật và những cuốn sách cũ. Đang tìm một người bạn đồng hành cùng khám phá những ngóc ngách ẩm thực thú vị của thành phố 🍷✨',
    passions: ['Bảo tàng', 'Rượu vang', 'Ẩm thực Ý', 'Nghệ thuật đương đại', 'Du lịch'],
    photos: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'date_3',
    name: 'Hana Matsuri',
    age: 27,
    distanceKm: 8.0,
    occupation: 'Landscape Architect',
    verified: false,
    bio: 'Yêu thiên nhiên, cây cỏ bonsai và phong cách sống Wabi-Sabi. Cuối tuần thường đạp xe quanh hồ hoặc cắm trại ngoại ô.',
    passions: ['Kiến trúc cảnh quan', 'Cắm trại', 'Trà đạo', 'Đạp xe', 'Thiền'],
    photos: [
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
    ],
  },
];

export const MOCK_TRENDING = [
  { tag: '#SocialDBDesign', postsCount: '28.4k bài viết', category: 'Thiết kế & Công nghệ' },
  { tag: '#MinimalistLiving', postsCount: '19.1k bài viết', category: 'Lối sống' },
  { tag: '#FrontendArchitect', postsCount: '12.8k bài viết', category: 'Lập trình' },
  { tag: '#KyotoAutumn', postsCount: '9.5k bài viết', category: 'Du lịch & Nhiếp ảnh' },
  { tag: '#IndieAcoustic', postsCount: '6.2k bài viết', category: 'Âm nhạc' },
];
