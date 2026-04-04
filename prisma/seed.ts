import "dotenv/config"
import { prisma } from "../lib/db"

// ============================================================================
// 50 MAJOR REAL-WORLD SERVICES — 10 categories
// ============================================================================

const SERVICES = [
  // ── STREAMING (8) ──────────────────────────────────────────────────────────
  {
    name: "Netflix",
    slug: "netflix",
    category: "streaming",
    color: "#E50914",
    monthlyPrice: 649,
    yearlyPrice: 6490,
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
    iconKey: null,
    description: "Movies, TV shows & award-winning originals",
  },
  {
    name: "Disney+",
    slug: "disney-plus",
    category: "streaming",
    color: "#113CCF",
    monthlyPrice: 299,
    yearlyPrice: 2990,
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg",
    iconKey: null,
    description: "Disney, Marvel, Star Wars, Pixar & National Geographic",
  },
  {
    name: "Amazon Prime Video",
    slug: "prime-video",
    category: "streaming",
    color: "#00A8E0",
    monthlyPrice: 299,
    yearlyPrice: 1499,
    logoUrl: null,
    iconKey: "IconBrandAmazon",
    description: "Movies, series & Amazon Originals",
  },
  {
    name: "Apple TV+",
    slug: "apple-tv",
    category: "streaming",
    color: "#555555",
    monthlyPrice: 99,
    yearlyPrice: 999,
    logoUrl: null,
    iconKey: "IconBrandApple",
    description: "Apple originals & award-winning shows",
  },
  {
    name: "Hotstar",
    slug: "hotstar",
    category: "streaming",
    color: "#1F80E0",
    monthlyPrice: 299,
    yearlyPrice: 899,
    logoUrl: null,
    iconKey: "IconPlayerPlay",
    description: "Sports, movies & Disney content",
  },
  {
    name: "SonyLIV",
    slug: "sony-liv",
    category: "streaming",
    color: "#003087",
    monthlyPrice: 299,
    yearlyPrice: 999,
    logoUrl: null,
    iconKey: "IconDeviceTv",
    description: "Sports, entertainment & premium shows",
  },
  {
    name: "ZEE5",
    slug: "zee5",
    category: "streaming",
    color: "#6B2D90",
    monthlyPrice: 99,
    yearlyPrice: 999,
    logoUrl: null,
    iconKey: "IconDeviceTv",
    description: "Indian content, movies & originals",
  },
  {
    name: "YouTube Premium",
    slug: "youtube-premium",
    category: "streaming",
    color: "#FF0000",
    monthlyPrice: 139,
    yearlyPrice: 1390,
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg",
    iconKey: null,
    description: "Ad-free YouTube + YouTube Music",
  },

  // ── MUSIC (5) ──────────────────────────────────────────────────────────────
  {
    name: "Spotify",
    slug: "spotify",
    category: "music",
    color: "#1DB954",
    monthlyPrice: 119,
    yearlyPrice: 1189,
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
    iconKey: null,
    description: "Music, podcasts & audiobooks",
  },
  {
    name: "Apple Music",
    slug: "apple-music",
    category: "music",
    color: "#FC3C44",
    monthlyPrice: 99,
    yearlyPrice: 999,
    logoUrl: null,
    iconKey: "IconBrandApple",
    description: "100M+ songs, radio & curated playlists",
  },
  {
    name: "Amazon Music",
    slug: "amazon-music",
    category: "music",
    color: "#00A8E0",
    monthlyPrice: 99,
    yearlyPrice: 899,
    logoUrl: null,
    iconKey: "IconMusic",
    description: "Unlimited music streaming with HD audio",
  },
  {
    name: "Gaana",
    slug: "gaana",
    category: "music",
    color: "#E72429",
    monthlyPrice: 39,
    yearlyPrice: 399,
    logoUrl: null,
    iconKey: "IconMusic",
    description: "India's largest music streaming platform",
  },
  {
    name: "JioSaavn",
    slug: "jio-saavn",
    category: "music",
    color: "#00A7E1",
    monthlyPrice: 99,
    yearlyPrice: 699,
    logoUrl: null,
    iconKey: "IconMusic",
    description: "Indian & international music streaming",
  },

  // ── AI (7) ─────────────────────────────────────────────────────────────────
  {
    name: "ChatGPT Plus",
    slug: "chatgpt-plus",
    category: "ai",
    color: "#10A37F",
    monthlyPrice: 1650,
    yearlyPrice: 16500,
    logoUrl: null,
    iconKey: "IconRobot",
    description: "GPT-4o, DALL·E 3 & Advanced Voice Mode",
  },
  {
    name: "Claude Pro",
    slug: "claude-pro",
    category: "ai",
    color: "#D97757",
    monthlyPrice: 1650,
    yearlyPrice: 16500,
    logoUrl: null,
    iconKey: "IconRobot",
    description: "Anthropic's most capable AI assistant",
  },
  {
    name: "Gemini Advanced",
    slug: "gemini-advanced",
    category: "ai",
    color: "#4285F4",
    monthlyPrice: 1950,
    yearlyPrice: 19500,
    logoUrl: null,
    iconKey: "IconStars",
    description: "Google's most capable AI with 1M context",
  },
  {
    name: "GitHub Copilot",
    slug: "github-copilot",
    category: "ai",
    color: "#24292E",
    monthlyPrice: 830,
    yearlyPrice: 8300,
    logoUrl: null,
    iconKey: "IconBrandGithub",
    description: "AI pair programmer for developers",
  },
  {
    name: "Midjourney",
    slug: "midjourney",
    category: "ai",
    color: "#000000",
    monthlyPrice: 830,
    yearlyPrice: 8300,
    logoUrl: null,
    iconKey: "IconPhoto",
    description: "State-of-the-art AI image generation",
  },
  {
    name: "Perplexity Pro",
    slug: "perplexity-pro",
    category: "ai",
    color: "#20808D",
    monthlyPrice: 1650,
    yearlyPrice: 16500,
    logoUrl: null,
    iconKey: "IconSearch",
    description: "AI-powered search & deep research",
  },
  {
    name: "Notion AI",
    slug: "notion-ai",
    category: "ai",
    color: "#000000",
    monthlyPrice: 830,
    yearlyPrice: 8300,
    logoUrl: null,
    iconKey: "IconBrandNotion",
    description: "AI writing & productivity inside Notion",
  },

  // ── PRODUCTIVITY (7) ───────────────────────────────────────────────────────
  {
    name: "Microsoft 365",
    slug: "microsoft-365",
    category: "productivity",
    color: "#D83B01",
    monthlyPrice: 499,
    yearlyPrice: 4999,
    logoUrl: null,
    iconKey: "IconBrandWindows",
    description: "Word, Excel, PowerPoint, Teams & 1TB OneDrive",
  },
  {
    name: "Google Workspace",
    slug: "google-workspace",
    category: "productivity",
    color: "#4285F4",
    monthlyPrice: 730,
    yearlyPrice: 7300,
    logoUrl: null,
    iconKey: "IconBrandGoogle",
    description: "Gmail, Drive, Docs, Sheets, Slides & Meet",
  },
  {
    name: "Notion",
    slug: "notion",
    category: "productivity",
    color: "#000000",
    monthlyPrice: 660,
    yearlyPrice: 6600,
    logoUrl: null,
    iconKey: "IconBrandNotion",
    description: "All-in-one workspace, notes & database",
  },
  {
    name: "Slack Pro",
    slug: "slack-pro",
    category: "productivity",
    color: "#4A154B",
    monthlyPrice: 540,
    yearlyPrice: 5400,
    logoUrl: null,
    iconKey: "IconBrandSlack",
    description: "Team messaging & collaboration platform",
  },
  {
    name: "Trello",
    slug: "trello",
    category: "productivity",
    color: "#0052CC",
    monthlyPrice: 415,
    yearlyPrice: 4150,
    logoUrl: null,
    iconKey: "IconLayoutKanban",
    description: "Visual boards for project management",
  },
  {
    name: "Figma Professional",
    slug: "figma-pro",
    category: "productivity",
    color: "#F24E1E",
    monthlyPrice: 1245,
    yearlyPrice: 12450,
    logoUrl: null,
    iconKey: "IconBrandFigma",
    description: "Collaborative UI design & prototyping",
  },
  {
    name: "Linear",
    slug: "linear",
    category: "productivity",
    color: "#5E6AD2",
    monthlyPrice: 830,
    yearlyPrice: 8300,
    logoUrl: null,
    iconKey: "IconTimeline",
    description: "Modern issue tracking & project management",
  },

  // ── CLOUD (5) ──────────────────────────────────────────────────────────────
  {
    name: "Dropbox Plus",
    slug: "dropbox-plus",
    category: "cloud",
    color: "#0061FF",
    monthlyPrice: 1245,
    yearlyPrice: 12450,
    logoUrl: null,
    iconKey: "IconBrandDropbox",
    description: "2TB cloud storage with Smart Sync",
  },
  {
    name: "Google One 2TB",
    slug: "google-one-2tb",
    category: "cloud",
    color: "#4285F4",
    monthlyPrice: 650,
    yearlyPrice: 6500,
    logoUrl: null,
    iconKey: "IconBrandGoogle",
    description: "2TB Google storage + AI features & perks",
  },
  {
    name: "iCloud+ 2TB",
    slug: "icloud-2tb",
    category: "cloud",
    color: "#3693F3",
    monthlyPrice: 219,
    yearlyPrice: 2190,
    logoUrl: null,
    iconKey: "IconBrandApple",
    description: "2TB iCloud storage + Private Relay & Hide My Email",
  },
  {
    name: "OneDrive 1TB",
    slug: "onedrive-1tb",
    category: "cloud",
    color: "#0078D4",
    monthlyPrice: 140,
    yearlyPrice: 1400,
    logoUrl: null,
    iconKey: "IconCloud",
    description: "Microsoft cloud storage with Office integration",
  },
  {
    name: "pCloud Premium",
    slug: "pcloud-premium",
    category: "cloud",
    color: "#17A1FA",
    monthlyPrice: 415,
    yearlyPrice: 4150,
    logoUrl: null,
    iconKey: "IconCloud",
    description: "Secure European cloud storage with TLS encryption",
  },

  // ── GAMING (5) ─────────────────────────────────────────────────────────────
  {
    name: "Xbox Game Pass",
    slug: "xbox-game-pass",
    category: "gaming",
    color: "#107C10",
    monthlyPrice: 699,
    yearlyPrice: 6990,
    logoUrl: null,
    iconKey: "IconDeviceGamepad",
    description: "100+ games on console, PC & cloud streaming",
  },
  {
    name: "PlayStation Plus",
    slug: "playstation-plus",
    category: "gaming",
    color: "#003087",
    monthlyPrice: 499,
    yearlyPrice: 2999,
    logoUrl: null,
    iconKey: "IconDeviceGamepad2",
    description: "Online play, monthly free games & exclusive discounts",
  },
  {
    name: "Nintendo Switch Online",
    slug: "nintendo-online",
    category: "gaming",
    color: "#E60012",
    monthlyPrice: 150,
    yearlyPrice: 1499,
    logoUrl: null,
    iconKey: "IconDeviceGamepad",
    description: "Online play + NES, SNES & N64 game library",
  },
  {
    name: "EA Play Pro",
    slug: "ea-play-pro",
    category: "gaming",
    color: "#FF4747",
    monthlyPrice: 499,
    yearlyPrice: 2499,
    logoUrl: null,
    iconKey: "IconTrophy",
    description: "EA's full game catalog with early access",
  },
  {
    name: "Ubisoft+",
    slug: "ubisoft-plus",
    category: "gaming",
    color: "#0070D1",
    monthlyPrice: 1245,
    yearlyPrice: 12450,
    logoUrl: null,
    iconKey: "IconTrophy",
    description: "100+ Ubisoft games including new releases",
  },

  // ── CREATIVE (4) ───────────────────────────────────────────────────────────
  {
    name: "Adobe Creative Cloud",
    slug: "adobe-cc",
    category: "creative",
    color: "#FF0000",
    monthlyPrice: 4557,
    yearlyPrice: null,
    logoUrl: null,
    iconKey: "IconBrush",
    description: "Photoshop, Illustrator, Premiere & 20+ apps",
  },
  {
    name: "Canva Pro",
    slug: "canva-pro",
    category: "creative",
    color: "#00C4CC",
    monthlyPrice: 499,
    yearlyPrice: 3999,
    logoUrl: null,
    iconKey: "IconPalette",
    description: "Premium design templates, brand kit & AI tools",
  },
  {
    name: "Envato Elements",
    slug: "envato-elements",
    category: "creative",
    color: "#81B441",
    monthlyPrice: 1245,
    yearlyPrice: 14940,
    logoUrl: null,
    iconKey: "IconPhoto",
    description: "Unlimited creative assets, templates & fonts",
  },
  {
    name: "Skillshare",
    slug: "skillshare",
    category: "creative",
    color: "#00FF84",
    monthlyPrice: 830,
    yearlyPrice: 9960,
    logoUrl: null,
    iconKey: "IconSchool",
    description: "Creative, design & business classes",
  },

  // ── COMMUNICATION (3) ──────────────────────────────────────────────────────
  {
    name: "Zoom Pro",
    slug: "zoom-pro",
    category: "communication",
    color: "#2D8CFF",
    monthlyPrice: 1325,
    yearlyPrice: 13250,
    logoUrl: null,
    iconKey: "IconVideo",
    description: "Video meetings for up to 100 participants",
  },
  {
    name: "Loom Business",
    slug: "loom-business",
    category: "communication",
    color: "#625DF5",
    monthlyPrice: 1245,
    yearlyPrice: 12450,
    logoUrl: null,
    iconKey: "IconVideoPlus",
    description: "Async video messaging for remote teams",
  },
  {
    name: "Grammarly Premium",
    slug: "grammarly-premium",
    category: "communication",
    color: "#15C39A",
    monthlyPrice: 996,
    yearlyPrice: 7776,
    logoUrl: null,
    iconKey: "IconPencilCheck",
    description: "AI writing assistant & advanced grammar check",
  },

  // ── SECURITY (4) ───────────────────────────────────────────────────────────
  {
    name: "1Password",
    slug: "1password",
    category: "security",
    color: "#1A8CFE",
    monthlyPrice: 248,
    yearlyPrice: 2480,
    logoUrl: null,
    iconKey: "IconLock",
    description: "Password manager & secure digital vault",
  },
  {
    name: "NordVPN",
    slug: "nordvpn",
    category: "security",
    color: "#4687FF",
    monthlyPrice: 830,
    yearlyPrice: 2988,
    logoUrl: null,
    iconKey: "IconShield",
    description: "Fast & secure VPN with 5400+ servers",
  },
  {
    name: "Bitdefender Total Security",
    slug: "bitdefender",
    category: "security",
    color: "#ED1C24",
    monthlyPrice: 166,
    yearlyPrice: 1995,
    logoUrl: null,
    iconKey: "IconShieldCheck",
    description: "Advanced antivirus & cyber protection",
  },
  {
    name: "Malwarebytes Premium",
    slug: "malwarebytes",
    category: "security",
    color: "#2A6DBB",
    monthlyPrice: 332,
    yearlyPrice: 2490,
    logoUrl: null,
    iconKey: "IconBug",
    description: "Real-time malware & ransomware protection",
  },

  // ── FITNESS (2) ────────────────────────────────────────────────────────────
  {
    name: "Headspace",
    slug: "headspace",
    category: "fitness",
    color: "#F47D31",
    monthlyPrice: 499,
    yearlyPrice: 2999,
    logoUrl: null,
    iconKey: "IconBrain",
    description: "Guided meditation & mindfulness exercises",
  },
  {
    name: "Cult.fit Pro",
    slug: "cult-fit-pro",
    category: "fitness",
    color: "#FF6B00",
    monthlyPrice: 999,
    yearlyPrice: 8999,
    logoUrl: null,
    iconKey: "IconRun",
    description: "Live fitness classes & gym access across India",
  },

  // ── ODOO FINANCE ──────────────────────────────────────────────────────────
  {
    name: "Accounting",
    slug: "accounting",
    category: "finance",
    color: "#875A7B",
    monthlyPrice: 499,
    yearlyPrice: 4990,
    logoUrl: null,
    iconKey: "IconReceipt",
    description: "Manage your finances effortlessly",
  },
  {
    name: "Invoicing",
    slug: "invoicing",
    category: "finance",
    color: "#875A7B",
    monthlyPrice: 299,
    yearlyPrice: 2990,
    logoUrl: null,
    iconKey: "IconFileInvoice",
    description: "Create and send invoices",
  },
  {
    name: "Expenses",
    slug: "expenses",
    category: "finance",
    color: "#875A7B",
    monthlyPrice: 199,
    yearlyPrice: 1990,
    logoUrl: null,
    iconKey: "IconReceipt2",
    description: "Streamline expense reporting",
  },
  {
    name: "Spreadsheet (BI)",
    slug: "spreadsheet-bi",
    category: "finance",
    color: "#875A7B",
    monthlyPrice: 399,
    yearlyPrice: 3990,
    logoUrl: null,
    iconKey: "IconChartBar",
    description: "Business Intelligence and analysis",
  },
  {
    name: "Documents",
    slug: "documents",
    category: "finance",
    color: "#875A7B",
    monthlyPrice: 199,
    yearlyPrice: 1990,
    logoUrl: null,
    iconKey: "IconFolders",
    description: "Paperless document management",
  },
  {
    name: "Sign",
    slug: "sign",
    category: "finance",
    color: "#875A7B",
    monthlyPrice: 249,
    yearlyPrice: 2490,
    logoUrl: null,
    iconKey: "IconSignature",
    description: "Send and sign documents online",
  },

  // ── ODOO SALES ────────────────────────────────────────────────────────────
  {
    name: "CRM",
    slug: "crm",
    category: "sales",
    color: "#E05A65",
    monthlyPrice: 350,
    yearlyPrice: 3500,
    logoUrl: null,
    iconKey: "IconUsers",
    description: "Track leads and close opportunities",
  },
  {
    name: "Sales",
    slug: "sales",
    category: "sales",
    color: "#E05A65",
    monthlyPrice: 250,
    yearlyPrice: 2500,
    logoUrl: null,
    iconKey: "IconCash",
    description: "From quotes to sales orders",
  },
  {
    name: "POS Shop",
    slug: "pos-shop",
    category: "sales",
    color: "#E05A65",
    monthlyPrice: 450,
    yearlyPrice: 4500,
    logoUrl: null,
    iconKey: "IconBuildingStore",
    description: "Point of Sale for Retail",
  },
  {
    name: "POS Restaurant",
    slug: "pos-restaurant",
    category: "sales",
    color: "#E05A65",
    monthlyPrice: 450,
    yearlyPrice: 4500,
    logoUrl: null,
    iconKey: "IconSoup",
    description: "Point of Sale for Restaurants",
  },
  {
    name: "Subscriptions",
    slug: "subscriptions",
    category: "sales",
    color: "#E05A65",
    monthlyPrice: 350,
    yearlyPrice: 3500,
    logoUrl: null,
    iconKey: "IconRepeat",
    description: "Manage recurring billing",
  },
  {
    name: "Rental",
    slug: "rental",
    category: "sales",
    color: "#E05A65",
    monthlyPrice: 250,
    yearlyPrice: 2500,
    logoUrl: null,
    iconKey: "IconKey",
    description: "Manage rental contracts",
  },

  // ── ODOO WEBSITES ─────────────────────────────────────────────────────────
  {
    name: "Website Builder",
    slug: "website-builder",
    category: "websites",
    color: "#1D9AA6",
    monthlyPrice: 300,
    yearlyPrice: 3000,
    logoUrl: null,
    iconKey: "IconBrowser",
    description: "Build stunning websites",
  },
  {
    name: "eCommerce",
    slug: "ecommerce",
    category: "websites",
    color: "#1D9AA6",
    monthlyPrice: 400,
    yearlyPrice: 4000,
    logoUrl: null,
    iconKey: "IconShoppingCart",
    description: "Sell your products online",
  },
  {
    name: "Blog",
    slug: "blog",
    category: "websites",
    color: "#1D9AA6",
    monthlyPrice: 150,
    yearlyPrice: 1500,
    logoUrl: null,
    iconKey: "IconArticle",
    description: "Publish blog posts",
  },
  {
    name: "Forum",
    slug: "forum",
    category: "websites",
    color: "#1D9AA6",
    monthlyPrice: 150,
    yearlyPrice: 1500,
    logoUrl: null,
    iconKey: "IconMessageCircle",
    description: "Manage discussion forums",
  },
  {
    name: "Live Chat",
    slug: "live-chat",
    category: "websites",
    color: "#1D9AA6",
    monthlyPrice: 200,
    yearlyPrice: 2000,
    logoUrl: null,
    iconKey: "IconMessageDots",
    description: "Chat with visitors in real-time",
  },
  {
    name: "eLearning",
    slug: "elearning",
    category: "websites",
    color: "#1D9AA6",
    monthlyPrice: 350,
    yearlyPrice: 3500,
    logoUrl: null,
    iconKey: "IconSchool",
    description: "Manage online courses",
  },

  // ── ODOO SUPPLY CHAIN ─────────────────────────────────────────────────────
  {
    name: "Inventory",
    slug: "inventory",
    category: "supply_chain",
    color: "#544D6C",
    monthlyPrice: 500,
    yearlyPrice: 5000,
    logoUrl: null,
    iconKey: "IconBoxSeam",
    description: "Warehouse management",
  },
  {
    name: "Manufacturing",
    slug: "manufacturing",
    category: "supply_chain",
    color: "#544D6C",
    monthlyPrice: 600,
    yearlyPrice: 6000,
    logoUrl: null,
    iconKey: "IconTool",
    description: "MRP and work center management",
  },
  {
    name: "PLM",
    slug: "plm",
    category: "supply_chain",
    color: "#544D6C",
    monthlyPrice: 450,
    yearlyPrice: 4500,
    logoUrl: null,
    iconKey: "IconEngine",
    description: "Product Lifecycle Management",
  },
  {
    name: "Purchase",
    slug: "purchase",
    category: "supply_chain",
    color: "#544D6C",
    monthlyPrice: 250,
    yearlyPrice: 2500,
    logoUrl: null,
    iconKey: "IconShoppingBag",
    description: "Manage purchase orders",
  },
  {
    name: "Maintenance",
    slug: "maintenance",
    category: "supply_chain",
    color: "#544D6C",
    monthlyPrice: 300,
    yearlyPrice: 3000,
    logoUrl: null,
    iconKey: "IconWrench",
    description: "Equipment maintenance",
  },
  {
    name: "Quality",
    slug: "quality",
    category: "supply_chain",
    color: "#544D6C",
    monthlyPrice: 350,
    yearlyPrice: 3500,
    logoUrl: null,
    iconKey: "IconCheckupList",
    description: "Quality control management",
  },

  // ── ODOO HUMAN RESOURCES ──────────────────────────────────────────────────
  {
    name: "Employees",
    slug: "employees",
    category: "human_resources",
    color: "#6A4A76",
    monthlyPrice: 200,
    yearlyPrice: 2000,
    logoUrl: null,
    iconKey: "IconUsersGroup",
    description: "Employee directory",
  },
  {
    name: "Recruitment",
    slug: "recruitment",
    category: "human_resources",
    color: "#6A4A76",
    monthlyPrice: 300,
    yearlyPrice: 3000,
    logoUrl: null,
    iconKey: "IconUserPlus",
    description: "Applicant tracking system",
  },
  {
    name: "Time Off",
    slug: "time-off",
    category: "human_resources",
    color: "#6A4A76",
    monthlyPrice: 150,
    yearlyPrice: 1500,
    logoUrl: null,
    iconKey: "IconPlaneDeparture",
    description: "Manage leaves and absence",
  },
  {
    name: "Appraisals",
    slug: "appraisals",
    category: "human_resources",
    color: "#6A4A76",
    monthlyPrice: 250,
    yearlyPrice: 2500,
    logoUrl: null,
    iconKey: "IconStar",
    description: "Employee performance reviews",
  },
  {
    name: "Referrals",
    slug: "referrals",
    category: "human_resources",
    color: "#6A4A76",
    monthlyPrice: 100,
    yearlyPrice: 1000,
    logoUrl: null,
    iconKey: "IconHeartHandshake",
    description: "Employee referral program",
  },
  {
    name: "Fleet",
    slug: "fleet",
    category: "human_resources",
    color: "#6A4A76",
    monthlyPrice: 250,
    yearlyPrice: 2500,
    logoUrl: null,
    iconKey: "IconCar",
    description: "Vehicle tracking and management",
  },

  // ── ODOO MARKETING ────────────────────────────────────────────────────────
  {
    name: "Social Marketing",
    slug: "social-marketing",
    category: "marketing",
    color: "#EE7158",
    monthlyPrice: 300,
    yearlyPrice: 3000,
    logoUrl: null,
    iconKey: "IconSpeakerphone",
    description: "Manage social media posts",
  },
  {
    name: "Email Marketing",
    slug: "email-marketing",
    category: "marketing",
    color: "#EE7158",
    monthlyPrice: 250,
    yearlyPrice: 2500,
    logoUrl: null,
    iconKey: "IconMail",
    description: "Design and send email campaigns",
  },
  {
    name: "SMS Marketing",
    slug: "sms-marketing",
    category: "marketing",
    color: "#EE7158",
    monthlyPrice: 200,
    yearlyPrice: 2000,
    logoUrl: null,
    iconKey: "IconDeviceMobileMessage",
    description: "Send bulk SMS campaigns",
  },
  {
    name: "Events",
    slug: "events",
    category: "marketing",
    color: "#EE7158",
    monthlyPrice: 350,
    yearlyPrice: 3500,
    logoUrl: null,
    iconKey: "IconCalendarStats",
    description: "Organize and promote events",
  },
  {
    name: "Marketing Automation",
    slug: "marketing-automation",
    category: "marketing",
    color: "#EE7158",
    monthlyPrice: 400,
    yearlyPrice: 4000,
    logoUrl: null,
    iconKey: "IconRobot",
    description: "Automated marketing workflows",
  },
  {
    name: "Surveys",
    slug: "surveys",
    category: "marketing",
    color: "#EE7158",
    monthlyPrice: 150,
    yearlyPrice: 1500,
    logoUrl: null,
    iconKey: "IconClipboardList",
    description: "Create and share surveys",
  },

  // ── ODOO SERVICES ─────────────────────────────────────────────────────────
  {
    name: "Project",
    slug: "project",
    category: "services",
    color: "#EFA643",
    monthlyPrice: 350,
    yearlyPrice: 3500,
    logoUrl: null,
    iconKey: "IconBriefcase",
    description: "Organize tasks and track progress",
  },
  {
    name: "Timesheets",
    slug: "timesheets",
    category: "services",
    color: "#EFA643",
    monthlyPrice: 200,
    yearlyPrice: 2000,
    logoUrl: null,
    iconKey: "IconClock",
    description: "Track time spent on tasks",
  },
  {
    name: "Field Service",
    slug: "field-service",
    category: "services",
    color: "#EFA643",
    monthlyPrice: 400,
    yearlyPrice: 4000,
    logoUrl: null,
    iconKey: "IconMapPin",
    description: "Manage field workers and schedules",
  },
  {
    name: "Helpdesk",
    slug: "helpdesk",
    category: "services",
    color: "#EFA643",
    monthlyPrice: 300,
    yearlyPrice: 3000,
    logoUrl: null,
    iconKey: "IconLifebuoy",
    description: "Customer support ticketing",
  },
  {
    name: "Planning",
    slug: "planning",
    category: "services",
    color: "#EFA643",
    monthlyPrice: 250,
    yearlyPrice: 2500,
    logoUrl: null,
    iconKey: "IconCalendarCheck",
    description: "Schedule resources and tasks",
  },
  {
    name: "Appointments",
    slug: "appointments",
    category: "services",
    color: "#EFA643",
    monthlyPrice: 150,
    yearlyPrice: 1500,
    logoUrl: null,
    iconKey: "IconCalendarTime",
    description: "Manage online bookings",
  },

  // ── ODOO PRODUCTIVITY ─────────────────────────────────────────────────────
  {
    name: "Discuss",
    slug: "discuss",
    category: "productivity",
    color: "#7B658C",
    monthlyPrice: 150,
    yearlyPrice: 1500,
    logoUrl: null,
    iconKey: "IconMessages",
    description: "Internal communication",
  },
  {
    name: "Approvals",
    slug: "approvals",
    category: "productivity",
    color: "#7B658C",
    monthlyPrice: 200,
    yearlyPrice: 2000,
    logoUrl: null,
    iconKey: "IconThumbUp",
    description: "Manage approval workflows",
  },
  {
    name: "IoT",
    slug: "iot",
    category: "productivity",
    color: "#7B658C",
    monthlyPrice: 450,
    yearlyPrice: 4500,
    logoUrl: null,
    iconKey: "IconDeviceAccessTv",
    description: "Internet of Things integration",
  },
  {
    name: "VoIP",
    slug: "voip",
    category: "productivity",
    color: "#7B658C",
    monthlyPrice: 350,
    yearlyPrice: 3500,
    logoUrl: null,
    iconKey: "IconPhoneCall",
    description: "Voice over IP integration",
  },
  {
    name: "Knowledge",
    slug: "knowledge",
    category: "productivity",
    color: "#7B658C",
    monthlyPrice: 250,
    yearlyPrice: 2500,
    logoUrl: null,
    iconKey: "IconBook",
    description: "Internal knowledge base",
  },
  {
    name: "WhatsApp",
    slug: "whatsapp",
    category: "productivity",
    color: "#7B658C",
    monthlyPrice: 300,
    yearlyPrice: 3000,
    logoUrl: null,
    iconKey: "IconBrandWhatsapp",
    description: "WhatsApp business integration",
  },
] as const

// ============================================================================
// 7 BUNDLES (4 predefined + 3 suggested)
// ============================================================================

const BUNDLES = [
  {
    name: "Entertainment Mega Pack",
    slug: "entertainment-mega-pack",
    description: "All your streaming & music in one killer bundle",
    type: "predefined",
    discountType: "percentage",
    discountValue: 25,
    isFeatured: true,
    serviceSlugs: ["netflix", "spotify", "disney-plus", "youtube-premium"],
  },
  {
    name: "Creator Studio Bundle",
    slug: "creator-studio-bundle",
    description: "Everything a content creator and designer needs",
    type: "predefined",
    discountType: "percentage",
    discountValue: 20,
    isFeatured: true,
    serviceSlugs: ["canva-pro", "figma-pro", "grammarly-premium", "notion"],
  },
  {
    name: "Developer Power Stack",
    slug: "developer-power-stack",
    description: "AI tools + productivity for serious developers",
    type: "predefined",
    discountType: "percentage",
    discountValue: 30,
    isFeatured: true,
    serviceSlugs: [
      "github-copilot",
      "chatgpt-plus",
      "notion",
      "linear",
      "slack-pro",
    ],
  },
  {
    name: "Privacy & Security Pro",
    slug: "privacy-security-pro",
    description: "Complete digital protection suite",
    type: "predefined",
    discountType: "percentage",
    discountValue: 35,
    isFeatured: false,
    serviceSlugs: ["nordvpn", "1password", "bitdefender"],
  },
  {
    name: "AI Power User",
    slug: "ai-power-user",
    description: "Best AI tools for power users and researchers",
    type: "suggested",
    discountType: "percentage",
    discountValue: 20,
    isFeatured: true,
    serviceSlugs: [
      "chatgpt-plus",
      "claude-pro",
      "midjourney",
      "perplexity-pro",
    ],
  },
  {
    name: "Gaming Essentials",
    slug: "gaming-essentials",
    description: "Multi-platform gaming subscription pack",
    type: "suggested",
    discountType: "fixed",
    discountValue: 500,
    isFeatured: false,
    serviceSlugs: ["xbox-game-pass", "ea-play-pro", "playstation-plus"],
  },
  {
    name: "Remote Work Pro",
    slug: "remote-work-pro",
    description: "Everything you need to work from anywhere, seamlessly",
    type: "suggested",
    discountType: "percentage",
    discountValue: 15,
    isFeatured: true,
    serviceSlugs: [
      "google-workspace",
      "zoom-pro",
      "slack-pro",
      "dropbox-plus",
      "grammarly-premium",
    ],
  },
] as const

const FEATURED_SLUGS = new Set([
  "netflix",
  "spotify",
  "chatgpt-plus",
  "canva-pro",
  "github-copilot",
  "disney-plus",
])

async function main() {
  console.log("🌱 Seeding 50 services...")

  for (const s of SERVICES) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        name: s.name,
        slug: s.slug,
        category: s.category,
        color: s.color,
        monthlyPrice: s.monthlyPrice,
        yearlyPrice: s.yearlyPrice ?? null,
        logoUrl: s.logoUrl ?? null,
        iconKey: s.iconKey ?? null,
        description: s.description,
        isActive: true,
        isFeatured: FEATURED_SLUGS.has(s.slug),
      },
    })
    process.stdout.write(".")
  }

  console.log(`\n✅ ${SERVICES.length} services seeded`)
  console.log("🌱 Seeding 7 bundles...")

  for (const b of BUNDLES) {
    // Resolve service IDs from slugs — skip any not found (guard against typos)
    const serviceRecords = await prisma.service.findMany({
      where: { slug: { in: [...b.serviceSlugs] } },
      select: { id: true, slug: true },
    })

    const validServices = b.serviceSlugs
      .map((slug) => serviceRecords.find((s) => s.slug === slug))
      .filter((s): s is { id: string; slug: string } => s !== undefined)

    await prisma.bundle.upsert({
      where: { slug: b.slug },
      update: {},
      create: {
        name: b.name,
        slug: b.slug,
        description: b.description,
        type: b.type,
        discountType: b.discountType,
        discountValue: b.discountValue,
        isFeatured: b.isFeatured,
        isActive: true,
        services: {
          create: validServices.map(({ id: serviceId }, order) => ({
            serviceId,
            order,
          })),
        },
      },
    })
    process.stdout.write(".")
  }

  console.log(`\n✅ ${BUNDLES.length} bundles seeded`)

  // ============================================================================
  // ADMIN SYSTEM SEED DATA (Products, Taxes, Plans, PaymentTerms)
  // ============================================================================
  console.log("🌱 Seeding Admin system data (Taxes, Plans, Terms, Products)...")

  // 1. Taxes
  const taxes = [
    { name: "GST 18%", rate: 18.0, type: "percentage" },
    { name: "VAT 20%", rate: 20.0, type: "percentage" },
    { name: "Zero Tax", rate: 0.0, type: "percentage" },
  ]

  for (const t of taxes) {
    if (!(await prisma.tax.findFirst({ where: { name: t.name } }))) {
      await prisma.tax.create({ data: t })
    }
  }

  // 2. Payment Terms
  const terms = [
    { name: "Due on Receipt", dueDays: 0 },
    { name: "Net 15", dueDays: 15 },
    { name: "Net 30", dueDays: 30 },
  ]

  for (const pt of terms) {
    if (!(await prisma.paymentTerms.findFirst({ where: { name: pt.name } }))) {
      await prisma.paymentTerms.create({ data: pt })
    }
  }

  // 3. Recurring Plans
  const plans = [
    {
      name: "Monthly Standard",
      billingPeriod: "monthly",
      price: 0,
      minQuantity: 1,
    },
    {
      name: "Yearly Premium",
      billingPeriod: "yearly",
      price: 0,
      minQuantity: 1,
    },
    { name: "Weekly Flex", billingPeriod: "weekly", price: 0, minQuantity: 1 },
  ]

  for (const plan of plans) {
    if (
      !(await prisma.recurringPlan.findFirst({ where: { name: plan.name } }))
    ) {
      await prisma.recurringPlan.create({ data: plan })
    }
  }

  // 4. Products
  const products = [
    {
      name: "Consulting Hour",
      type: "service",
      salesPrice: 5000,
      costPrice: 0,
      description: "One hour of professional consulting",
    },
    {
      name: "Hardware Server",
      type: "goods",
      salesPrice: 150000,
      costPrice: 100000,
      description: "Enterprise grade server hardware",
    },
    {
      name: "Software License",
      type: "service",
      salesPrice: 12000,
      costPrice: 0,
      description: "Annual software usage license",
    },
  ]

  const dbProducts = []
  for (const p of products) {
    let dbProd = await prisma.product.findFirst({ where: { name: p.name } })
    if (!dbProd) {
      dbProd = await prisma.product.create({ data: p })
    }
    dbProducts.push(dbProd)
  }

  // 4.5 Link Products to Plans
  console.log("🔗 Linking Products to Recurring Plans...")
  const monthlyPlan = await prisma.recurringPlan.findFirst({
    where: { name: "Monthly Standard" },
  })
  const yearlyPlan = await prisma.recurringPlan.findFirst({
    where: { name: "Yearly Premium" },
  })

  if (monthlyPlan && yearlyPlan) {
    for (const prod of dbProducts) {
      // Monthly recurrence
      await prisma.recurringPrice.upsert({
        where: {
          productId_recurringPlanId: {
            productId: prod.id,
            recurringPlanId: monthlyPlan.id,
          },
        },
        update: {},
        create: {
          productId: prod.id,
          recurringPlanId: monthlyPlan.id,
          price: prod.salesPrice,
        },
      })
      // Yearly recurrence
      await prisma.recurringPrice.upsert({
        where: {
          productId_recurringPlanId: {
            productId: prod.id,
            recurringPlanId: yearlyPlan.id,
          },
        },
        update: {},
        create: {
          productId: prod.id,
          recurringPlanId: yearlyPlan.id,
          price: prod.salesPrice * 10,
        },
      })
    }
  }

  // 5. Contacts
  const contacts = [
    {
      firstName: "Demo",
      lastName: "User",
      company: "Acme Corp",
      phone: "+1 555-0199",
      email: "demo@acme.com",
    },
  ]

  for (const c of contacts) {
    const { email, ...contactData } = c
    const userForContact = await prisma.user.findFirst({ where: { email } })

    // Create user if not exists
    if (!userForContact) {
      const newUser = await prisma.user.create({
        data: {
          name: `${c.firstName} ${c.lastName}`,
          email: c.email,
          role: "portal",
          password: "hashedpassword123", // dummy password for seed
        },
      })
      await prisma.contact.create({
        data: {
          userId: newUser.id,
          ...contactData,
        },
      })
    }
  }

  console.log(`\n✅ Admin system data seeded`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
