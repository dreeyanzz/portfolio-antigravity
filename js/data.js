/**
 * ADRIAN SETH TABOTABO — PORTFOLIO DATA STORE
 * Pure Vanilla JavaScript Data Architecture
 */

window.PORTFOLIO_DATA = {
  profile: {
    name: "Adrian Seth M. Tabotabo",
    monogram: "AST",
    handle: "dreeyanzz",
    title: "Computer Engineer & Full-Stack Developer",
    location: "Cebu, Philippines",
    email: "adrian.tabotabo225@gmail.com",
    githubUrl: "https://github.com/dreeyanzz",
    linkedinUrl: "https://linkedin.com/in/adrian-seth-tabotabo",
    school: "Cebu Institute of Technology – University (CIT-U)",
    degree: "Bachelor of Science in Computer Engineering",
    gradYear: "Class of 2028",
    typingSpeed: "138 WPM",
    status: "Exploring & Building Systems",
    bio: "Computer Engineering junior at CIT-U building end-to-end applications, real-time IoT hardware, and custom system architectures. Passionate about marrying robust backends with soft, human interfaces."
  },

  credentials: [
    {
      value: "CIT-U '28",
      label: "BS Computer Engineering",
      sub: "Cebu Institute of Technology"
    },
    {
      value: "2nd Place",
      label: "Open C Programming",
      sub: "Outperformed upperclassmen as freshman"
    },
    {
      value: "138 WPM",
      label: "Typing Velocity",
      sub: "Precision keyboard flow"
    },
    {
      value: "Regional Finalist",
      label: "ISEF (2024)",
      sub: "Science & Engineering Fair"
    }
  ],

  outdoor: {
    cycling: {
      title: "Cycling & Cadence",
      stat1: { number: "10+", label: "Iconic Cebu Routes" },
      stat2: { number: "800m+", label: "Transcentral Climbs" },
      stat3: { number: "100%", label: "Fuel at Bakeshops" },
      routes: [
        { name: "Casili Stomping Grounds", highlight: true },
        { name: "Busay Gaslamp & Tops", highlight: true },
        { name: "Temple of Leah", highlight: false },
        { name: "Budlaan Trail", highlight: false },
        { name: "Manipis Sleeping Dinosaur", highlight: true },
        { name: "Danao Sidlak Danao", highlight: false },
        { name: "Tuburan Poblacion", highlight: false },
        { name: "Canagahan San Remegio", highlight: false },
        { name: "San Jose Bakeshop Mandaue", highlight: true } // The legendary pit stop!
      ]
    },
    hiking: {
      title: "Mountain Trails",
      stat1: { number: "2", label: "Signature Trails" },
      stat2: { number: "Scramble", label: "Technical Ridgelines" },
      stat3: { number: "Endurance", label: "Mindset Trained" },
      trails: [
        { name: "Spartan Trail (Cebu City)", highlight: true },
        { name: "Talamban – Budlaan – Kang Irag", highlight: true }
      ]
    }
  },

  hardware: {
    machine: "Acer Nitro V 15 (ANV15-41)",
    os: "Microsoft Windows 11 Pro (64-bit)",
    cpu: "AMD Ryzen 5 6600H (6 Cores, 12 Threads @ 3.3 GHz - 4.5 GHz Boost)",
    gpu: "NVIDIA GeForce RTX 4050 Laptop GPU (6GB GDDR6) + Radeon 660M",
    ram: "16 GB DDR5 High-Speed Memory",
    storage: "1 TB Dual NVMe SSDs (Kingston OM8PGP4 + Apacer AS2280P4)",
    display: "15.6\" Full HD 144Hz IPS Panel"
  },

  tools: {
    groups: [
      {
        id: "languages",
        label: "Languages",
        sub: "// languages i tolerate",
        items: [
          { name: "C", mark: "c" },
          { name: "C++", mark: "cplusplus" },
          { name: "C#", mark: "csharp" },
          { name: "Python", mark: "python" },
          { name: "TypeScript", mark: "typescript" },
          { name: "JavaScript", mark: "javascript" },
          { name: "Java 21", mark: "openjdk" },
          { name: "PHP", mark: "php" },
          { name: "Dart", mark: "dart" },
          { name: "SQL", mark: null },
          { name: "Lua", mark: "lua" },
          { name: "PowerShell", mark: "powershell" },
          { name: "Bash", mark: "gnubash" }
        ]
      },
      {
        id: "frontend",
        label: "Frontend & UI",
        sub: "// abstractions that save me from c++",
        items: [
          { name: "Next.js (15/16)", mark: "nextdotjs" },
          { name: "React 19", mark: "react" },
          { name: "Vite", mark: "vite" },
          { name: "Tailwind CSS v4", mark: "tailwindcss" },
          { name: "shadcn/ui", mark: "shadcnui" },
          { name: "Radix UI", mark: "radixui" },
          { name: "Base UI", mark: null },
          { name: "Framer Motion", mark: "framer" },
          { name: "GSAP", mark: "greensock" },
          { name: "Three.js", mark: "threedotjs" },
          { name: "OGL (WebGL)", mark: "webgl" },
          { name: "TanStack Query", mark: "reactquery" },
          { name: "TanStack Table", mark: "reacttable" },
          { name: "Zustand", mark: null },
          { name: "React Hook Form", mark: "reacthookform" },
          { name: "Zod", mark: "zod" },
          { name: "Recharts", mark: null },
          { name: "Sonner", mark: null },
          { name: "Embla Carousel", mark: null },
          { name: "Flutter", mark: "flutter" },
          { name: "Expo", mark: "expo" }
        ]
      },
      {
        id: "backend",
        label: "Backend & APIs",
        sub: "// server engines & protocols",
        items: [
          { name: "Node.js", mark: "nodedotjs" },
          { name: "Express.js", mark: "express" },
          { name: "FastAPI", mark: "fastapi" },
          { name: "ASP.NET Core", mark: "dotnet" },
          { name: "Laravel", mark: "laravel" },
          { name: "WebSockets", mark: "socketdotio" },
          { name: "REST APIs", mark: null },
          { name: "JWT & Auth", mark: "jsonwebtokens" },
          { name: "Cloudinary", mark: "cloudinary" },
          { name: "Nodemailer", mark: null },
          { name: "Multer", mark: null },
          { name: "Val Town", mark: null }
        ]
      },
      {
        id: "database",
        label: "Data & Storage",
        sub: "// where data goes to die",
        items: [
          { name: "Supabase", mark: "supabase" },
          { name: "Firebase / Firestore", mark: "firebase" },
          { name: "PostgreSQL", mark: "postgresql" },
          { name: "MongoDB & Mongoose", mark: "mongodb" },
          { name: "Redis / Upstash", mark: "redis" },
          { name: "MySQL", mark: "mysql" },
          { name: "MariaDB", mark: "mariadb" },
          { name: "SQLite", mark: "sqlite" },
          { name: "LiteDB", mark: null },
          { name: "Entity Framework", mark: "dotnet" }
        ]
      },
      {
        id: "ai",
        label: "AI & Agentic",
        sub: "// neural models & agentic cli",
        items: [
          { name: "YOLOv8", mark: "ultralytics" },
          { name: "ByteTrack", mark: null },
          { name: "OpenCV", mark: "opencv" },
          { name: "Face Recognition", mark: null },
          { name: "Google Antigravity", mark: null },
          { name: "Claude Code CLI", mark: "claude" },
          { name: "Claude Design", mark: "anthropic" },
          { name: "OpenAI Codex", mark: "openai" },
          { name: "Google Gemini", mark: "googlegemini" },
          { name: "MCP Protocol", mark: "modelcontextprotocol" }
        ]
      },
      {
        id: "hardware",
        label: "Hardware & IoT",
        sub: "// silicon, sensors & 3d",
        items: [
          { name: "ESP32 (ESP-NOW)", mark: "espressif" },
          { name: "ESP8266", mark: "espressif" },
          { name: "Arduino", mark: "arduino" },
          { name: "PlatformIO", mark: "platformio" },
          { name: "INA219 Power Sensors", mark: null },
          { name: "RC522 RFID", mark: null },
          { name: "TFT Displays", mark: null },
          { name: "Unity 3D", mark: "unity" },
          { name: "Blender", mark: "blender" }
        ]
      },
      {
        id: "devops-qa",
        label: "DevOps & QA",
        sub: "// pipelines, shipping & test harnesses",
        items: [
          { name: "Docker & Compose", mark: "docker" },
          { name: "Vercel", mark: "vercel" },
          { name: "Cloudflare Workers", mark: "cloudflareworkers" },
          { name: "GitHub Actions", mark: "githubactions" },
          { name: "Git / GitHub", mark: "git" },
          { name: "Vitest", mark: "vitest" },
          { name: "Playwright", mark: "playwright" },
          { name: "axe-playwright (A11y)", mark: null },
          { name: "Jest & Supertest", mark: "jest" },
          { name: "PyInstaller", mark: null }
        ]
      },
      {
        id: "systems-os",
        label: "Environments & OS",
        sub: "// battle-tested distros & workstations",
        items: [
          { name: "Arch Linux", mark: "archlinux" },
          { name: "CachyOS", mark: null },
          { name: "Ubuntu", mark: "ubuntu" },
          { name: "WSL2", mark: null },
          { name: "Windows 11 Pro", mark: "windows11" },
          { name: "VS Code", mark: "visualstudiocode" },
          { name: "Visual Studio", mark: "visualstudio" }
        ]
      }
    ],
    systems: ["C", "C++", "C#", "Python", "Java 21", "Dart", "Lua", "PowerShell", "Bash"],
    frontend: ["Next.js (15/16)", "React 19", "TypeScript", "Tailwind CSS v4", "shadcn/ui", "Radix UI", "Base UI", "Framer Motion", "TanStack Query", "Zustand", "Zod", "Flutter", "Expo"],
    backend: ["Node.js / Express", "FastAPI", "ASP.NET Core", "Laravel", "Supabase", "Firebase", "MongoDB", "Redis", "WebSockets"],
    hardwareIoT: ["ESP32 (ESP-NOW)", "ESP8266", "Arduino", "INA219", "RFID", "TFT Displays", "Unity 3D", "Docker", "Vitest", "Playwright"]
  },

  /* Showcase deck. `image` points at assets/projects/<id>.(png|jpg); when the
     file is absent the deck renders a deterministic gradient from the id
     instead, so a missing screenshot never shows as a broken card. */
  flagships: [
    {
      id: "veralove",
      title: "VeraLove",
      category: "Desktop & API System",
      image: "assets/projects/veralove.png",
      tagline: "Scam-Safe Windows Desktop Dating Platform & Ecosystem",
      desc: "An enterprise-grade, scam-resilient desktop social ecosystem designed with rigorous verification pipelines, real-time LAN and cloud chat, comprehensive architecture decision records (ADRs), and automated moderation.",
      stack: [".NET / C#", "WPF / XAML", "ASP.NET Core", "Entity Framework", "Real-Time WebSockets", "OTP/SMTP"],
      githubUrl: "https://github.com/dreeyanzz/VeraLove",
      architecture: "Clean Onion Architecture: VeraLove.Core -> VeraLove.Api -> VeraLove.UserApp & AdminApp. Integrates tamper-proof verification hashes, OTP token lifecycle, and local LAN distribution test harnesses.",
      highlights: [
        "Separated UserApp and AdminApp for zero-privilege moderation",
        "Real-time LAN and Cloud chat engine with zero-refresh event dispatch",
        "Automated deployment script suite (PowerShell bundle packager)"
      ]
    },
    {
      id: "wildcat-one",
      title: "Wildcat One",
      category: "Web Suite & Security",
      image: "assets/projects/wildcat-one.png",
      tagline: "All-in-One Academic Suite & Pentest Harness for CIT-U",
      desc: "An all-in-one unofficial student portal and security research suite built for Cebu Institute of Technology – University Wildcats. Features offline schedule caching, grade exploration, and an ethical API pentesting harness.",
      stack: ["React", "TypeScript", "Vite", "Node.js", "wits-crypto", "Tailwind CSS"],
      githubUrl: "https://github.com/dreeyanzz/wildcat-one",
      architecture: "Monorepo workspace architecture (`apps/student-portal`, `apps/catalog`, `apps/pentest`, `tools/wits-crypto`). Implements custom cryptographic payload parsing for university API communication.",
      highlights: [
        "Offline schedule and enrollment catalog with fast search",
        "Dedicated pentesting suite auditing institutional endpoints safely",
        "Companion Windows native desktop integration client"
      ]
    },
    {
      id: "wall-crack-detector",
      title: "Wall Crack Detector + ESP32",
      category: "Computer Vision & IoT",
      image: "assets/projects/wall-crack-detector.png",
      tagline: "Real-Time Civil Infrastructure AI Segmentation & IoT Display",
      desc: "An intelligent civil engineering inspection system using custom-trained YOLOv8 computer vision models to perform real-time crack instance segmentation, streaming annotated video to a React dashboard and an ESP32 TFT hardware display.",
      stack: ["Python", "YOLOv8 Segmentation", "OpenCV", "FastAPI", "React 19", "ESP32 C++"],
      githubUrl: "https://github.com/dreeyanzz/wall-crack-detector",
      architecture: "Python FastAPI backend captures RTSP/webcam video feeds -> YOLOv8 segmentation inference -> JSON telemetry streamed via WebSockets to React UI -> Downscaled telemetry pushed over Serial/Wi-Fi to ESP32 TFT hardware screen.",
      highlights: [
        "Sub-millimeter civil infrastructure crack severity classification",
        "Dual display: modern web dashboard + portable physical ESP32 screen",
        "Packaged as standalone Windows executable with PyInstaller"
      ]
    },
    {
      id: "human-detector-2",
      title: "Human Detector 2",
      category: "Computer Vision",
      image: "assets/projects/human-detector-2.png",
      tagline: "Real-Time Person Tracking with Face Recognition Enrollment",
      desc: "Real-time person detection and tracking powered by YOLOv8 and ByteTrack. Holds persistent IDs across frames, enrolls faces for recognition, and surfaces live stats and snapshot capture, packaged as a standalone Windows executable.",
      stack: ["Python", "YOLOv8", "ByteTrack", "FastAPI", "OpenCV", "React 19", "TypeScript"],
      githubUrl: "https://github.com/dreeyanzz/human-detector-2",
      liveUrl: "https://human-detector-2.vercel.app",
      architecture: "FastAPI inference service runs YOLOv8 detection into ByteTrack for identity association, keeping persistent track IDs across frames. Face embeddings are enrolled on demand and matched per track, while a React 19 + TypeScript dashboard renders the annotated stream, live counts, and captured snapshots.",
      highlights: [
        "Persistent identity tracking that survives occlusion and re-entry",
        "On-demand face enrollment matched against live tracks",
        "Standalone Windows executable alongside a deployed web dashboard"
      ]
    },
    {
      id: "smartplug-system",
      title: "SmartPlug IoT System",
      category: "Embedded & IoT",
      image: "assets/projects/smartplug-system.png",
      tagline: "RFID-Authenticated Smart Outlet with Live Power Metering",
      desc: "An IoT smart outlet system with RFID badge authentication and live power metering. ESP8266 firmware reads INA219 sensors and toggles relays, streaming real-time wattage and telemetry over WebSockets to a live dashboard.",
      stack: ["ESP8266", "C++", "INA219", "WebSockets", "Express", "SQLite", "React", "Recharts"],
      githubUrl: "https://github.com/dreeyanzz/smartplug-system",
      architecture: "ESP8266 firmware samples INA219 current sensors and drives outlet relays, gated by RFID badge authentication. Telemetry streams over WebSockets to an Express and SQLite service, which a React and Recharts dashboard renders as live wattage and historical draw.",
      highlights: [
        "RFID badge authentication gating physical outlet power",
        "Live per-outlet wattage telemetry over WebSockets, no polling",
        "Hardware, server and dashboard built end to end"
      ]
    },
    {
      id: "studyhub",
      title: "Worq — StudyHub",
      category: "Product & Team Build",
      image: "assets/projects/studyhub.png",
      tagline: "Co-Working & Study Spot Discovery and Reservation Platform",
      desc: "A responsive platform solving the seat-finding problem for students and remote learners. A live host-updated seat map, multi-filter search across amenities, and an instant reserve-now seat hold let users secure an exact desk before commuting.",
      stack: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS 4"],
      githubUrl: "https://github.com/dreeyanzz/studyhub",
      architecture: "Next.js 16 App Router with React 19 and Tailwind CSS 4. A live snap-grid seat map is updated by venue hosts, backed by multi-filter discovery across location radius, operating hours, noise level, Wi-Fi tier and power availability, with a reserve-now workflow that holds a specific seat.",
      highlights: [
        "Live host-updated snap-grid seat map down to the individual desk",
        "Multi-filter discovery across verified amenities and noise levels",
        "Built with a four-person team for Software Development 1"
      ]
    },
    {
      id: "banter",
      title: "Banter",
      category: "Terminal & Cloud",
      image: "assets/projects/banter.png",
      tagline: "Cloud-Synced Real-Time Terminal Chat Engine",
      desc: "A nostalgic terminal chat application built with C# and Terminal.Gui, backed by Google Firestore. Messages, chatrooms, pins, and member renames all stream live through reactive Firestore listeners without ever needing a refresh.",
      stack: ["C#", "Terminal.Gui", "Google Firestore", "NoSQL", "Reactive Listeners"],
      githubUrl: "https://github.com/dreeyanzz/Banter",
      architecture: "Console-based Terminal User Interface (TUI) utilizing Terminal.Gui event loops bound to Google Cloud Firestore real-time snapshot listeners. Multi-channel broadcast with local state caching.",
      highlights: [
        "Complete chat lifecycle: channels, pins, message reactions, user presence",
        "Instant live streaming synchronization across concurrent terminal sessions",
        "Final project from 2nd year, 1st sem CpE with immaculate architectural polish"
      ]
    }
  ],


  labArchive: [
    {
      title: "SmartPlug IoT System",
      desc: "IoT smart outlet with RFID badge authentication and live power metering. ESP8266 firmware reads INA219 sensors, streaming real-time wattage over WebSockets.",
      stack: ["ESP8266", "C++", "WebSockets", "React", "SQLite"],
      githubUrl: "https://github.com/dreeyanzz/smartplug-system"
    },
    {
      title: "Human Detector 2",
      desc: "Real-time person detection and tracking powered by YOLOv8 and ByteTrack with persistent IDs and face enrollment, packaged as a standalone Windows executable.",
      stack: ["Python", "YOLOv8", "ByteTrack", "FastAPI", "React 19"],
      githubUrl: "https://github.com/dreeyanzz/human-detector-2"
    },
    {
      title: "POSSystem (in C)",
      desc: "High-performance Point of Sale and inventory terminal written in C for Windows with a custom file-based database engine (CSV table simulation) and real-time search.",
      stack: ["C Language", "CSV Database Engine", "Windows Console API"],
      githubUrl: "https://github.com/dreeyanzz/POSSystem"
    },
    {
      title: "CodeExport",
      desc: "Zero-upload browser canvas utility that converts code snippets into clean, syntax-highlighted images with macOS-style window frames.",
      stack: ["JavaScript", "HTML5 Canvas", "Client-Side Only"],
      githubUrl: "https://github.com/dreeyanzz/CodeExport"
    },
    {
      title: "Desktop Pokédex",
      desc: "Desktop Pokédex for the original 151 Kanto Pokémon built with Java 21 and JavaFX. Includes interactive silhouette guessing mini-game.",
      stack: ["Java 21", "JavaFX", "Jackson JSON", "MVC"],
      githubUrl: "https://github.com/dreeyanzz/pokedex"
    },
    {
      title: "PDFMerger & PhotoToPDF",
      desc: "Private, 100% in-browser document merger with drag-and-drop reordering. Zero telemetry, zero uploads to external servers.",
      stack: ["JavaScript", "pdf-lib", "jsPDF", "Canvas"],
      githubUrl: "https://github.com/dreeyanzz/PDFMerger"
    }
  ],

  musicPlaylists: [
    {
      moodId: "emo-2000s",
      moodLabel: "🎸 2000s Emo & Pop-Punk",
      track: "Helena / Welcome to the Black Parade",
      artist: "My Chemical Romance",
      subtext: "Paramore, Avril Lavigne, FM Static, Hey Monday"
    },
    {
      moodId: "midnight-rnb",
      moodLabel: "☕ Midnight R&B & Bedroom Pop",
      track: "LIMBO / Beside You",
      artist: "keshi",
      subtext: "NIKI, Luke Chiang, Daniel Caesar, RINI, beabadoobee"
    },
    {
      moodId: "jpop-anime",
      moodLabel: "🎧 J-Pop & Anime Anthems",
      track: "Usseewa / Otonablue",
      artist: "Ado & YOASOBI",
      subtext: "Eve (Kaikai Kitan), Silhouette, Anri (City Pop)"
    },
    {
      moodId: "bisaya-rap",
      moodLabel: "🔥 Cebuano & OPM Energy",
      track: "Bacon / Snatcher Rap",
      artist: "Cookie$ & Bisaya Rap",
      subtext: "Hev Abi, Lola Amour, ExB, Bisdako"
    },
    {
      moodId: "kpop-classics",
      moodLabel: "✨ Golden Era K-Pop",
      track: "Me Gustas Tu / Gee",
      artist: "GFriend & Girls' Generation",
      subtext: "2NE1 (I Am The Best), iKON (Love Scenario)"
    }
  ],

  curiosities: {
    whyPink: {
      title: "Why Soft Pink?",
      tagline: "Subverting developer stereotypes with warmth and deliberate taste.",
      text: "Developer portfolios are flooded with cold matrix greens, aggressive dark modes, and stark monochrome terminal windows. Soft pink represents calm intention, empathy for the human using the software, and the confidence to stand out while crafting high-performance systems."
    },
    comfortFoods: [
      { name: "Sinigang na Baboy", type: "Comfort Soup", icon: "🍲", note: "The supreme sour tamarind broth" },
      { name: "Crispy Porkchop", type: "Daily Savor", icon: "🥩", note: "Golden, juicy, perfectly seasoned" },
      { name: "Adobo sa Asin", type: "Classic Heritage", icon: "🥘", note: "Garlic, pork, salt, pure simplicity" },
      { name: "Cebu Lechon Baboy", type: "Celebration Fuel", icon: "🍖", note: "Crunchy skin, lemongrass, garlic" },
      { name: "Isda Tamarong", type: "Coastal Crisp", icon: "🐟", note: "Fried to golden perfection with vinegar" },
      { name: "Steaming Ramen", type: "Late Night Code", icon: "🍜", note: "Rich tonkotsu broth after long debugging" }
    ],
    theListener: {
      title: "The Listener's Mindset",
      text: "I listen almost all the time. To the rhythm of music that keeps me in the zone, to the quiet hum of the laptop fan during a build, to the subtle feedback of code, and most importantly, to the real problems people face before writing a single line of architecture."
    }
  }
};
