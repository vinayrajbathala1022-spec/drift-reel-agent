// extension/data.js
// Copied from original data.js — recommendation candidates only (no fictional feedReels needed)
// Extended with multi-cluster candidates so ALL detected interests get varied recommendations

const feedReels = []; // Not used in extension — live YouTube DOM replaces this

const recommendationCandidates = [
    // ============================================================
    // HYPE CANDIDATES (Always rejected by recommender)
    // ============================================================
    {
        id: "c1",
        title: "10 AI Tools That Will Get You Hired in 2026",
        description: "Just use these tools and you are guaranteed a 500k salary!!!",
        category: "AI",
        tags: ["ai", "tools", "career", "hype"],
        isHype: true, technicalDepth: 1, educationalValue: 2, difficulty: "Beginner"
    },
    {
        id: "c2",
        title: "Learn Python in 5 Minutes!",
        description: "Master programming instantly with this one simple trick.",
        category: "Other",
        tags: ["python", "coding", "clickbait"],
        isHype: true, technicalDepth: 1, educationalValue: 1, difficulty: "Beginner"
    },

    // ============================================================
    // SOFTWARE ENGINEERING / TECHNOLOGY CAREER cluster
    // ============================================================
    {
        id: "c3",
        title: "System Design Interviews Explained",
        description: "Breaking down how to approach large-scale architecture problems.",
        category: "HLD",
        tags: ["system-design", "architecture", "interview", "software-engineering"],
        isHype: false, technicalDepth: 8, educationalValue: 9, difficulty: "Advanced",
        goDeeper: { title: "Grokking the System Design Interview - Full Course", duration: "3 hours" }
    },
    {
        id: "c4",
        title: "Understanding Reactivity in Frontend Frameworks",
        description: "How state changes trigger UI updates under the hood.",
        category: "Other",
        tags: ["frontend", "javascript", "react", "architecture"],
        isHype: false, technicalDepth: 7, educationalValue: 8, difficulty: "Intermediate"
    },
    {
        id: "c5",
        title: "Introduction to Big O Notation",
        description: "Time and space complexity made easy for your next coding round.",
        category: "DSA",
        tags: ["dsa", "algorithms", "interview", "computer-science"],
        isHupe: false, isHype: false, technicalDepth: 5, educationalValue: 8, difficulty: "Beginner",
        goDeeper: { title: "Data Structures & Algorithms in Java", duration: "45 min" }
    },
    {
        id: "c6",
        title: "Java Memory Management & Garbage Collection",
        description: "Deep dive into the JVM heap and GC algorithms.",
        category: "Java",
        tags: ["java", "jvm", "performance", "backend"],
        isHype: false, technicalDepth: 9, educationalValue: 9, difficulty: "Advanced",
        goDeeper: { title: "JVM Performance Tuning Guide", duration: "1.5 hours" }
    },
    {
        id: "c7",
        title: "OAuth 2.0 and OIDC Security Flows",
        description: "How modern authentication actually works securely.",
        category: "Cybersecurity",
        tags: ["security", "auth", "backend", "architecture"],
        isHype: false, technicalDepth: 8, educationalValue: 9, difficulty: "Advanced"
    },
    {
        id: "c8",
        title: "Docker vs Kubernetes in 60 Seconds",
        description: "When to use containers vs when to use orchestration.",
        category: "Cloud",
        tags: ["devops", "cloud", "docker", "kubernetes"],
        isHype: false, technicalDepth: 6, educationalValue: 7, difficulty: "Intermediate",
        goDeeper: { title: "Kubernetes for Beginners", duration: "2 hours" }
    },
    {
        id: "c9",
        title: "How CPUs execute your code",
        description: "From compiled binaries to instruction pipelines and registers.",
        category: "Hardware",
        tags: ["hardware", "cpu", "computer-science", "low-level"],
        isHype: false, technicalDepth: 9, educationalValue: 8, difficulty: "Advanced"
    },
    {
        id: "c10",
        title: "Navigating Tech Layoffs — Actionable Advice for Developers",
        description: "Actionable advice for junior developers entering the market.",
        category: "Career",
        tags: ["career", "advice", "software-engineering", "industry"],
        isHype: false, technicalDepth: 2, educationalValue: 7, difficulty: "Beginner"
    },
    {
        id: "c11",
        title: "Building RAG Applications from Scratch",
        description: "Vector databases, embeddings, and LLM orchestration.",
        category: "AI",
        tags: ["ai", "llm", "backend", "architecture"],
        isHype: false, technicalDepth: 7, educationalValue: 8, difficulty: "Intermediate",
        goDeeper: { title: "Applied Generative AI Engineering", duration: "50 min" }
    },
    {
        id: "c12",
        title: "Spring Boot under the Hood",
        description: "How auto-configuration and dependency injection work in Spring.",
        category: "Java",
        tags: ["java", "spring", "backend", "framework"],
        isHype: false, technicalDepth: 7, educationalValue: 8, difficulty: "Intermediate"
    },

    // ============================================================
    // GAMING & ESPORTS cluster
    // ============================================================
    {
        id: "g1",
        title: "How Pro FPS Players Train Their Aim",
        description: "The real techniques behind top esports players reaction times and precision.",
        category: "Gaming",
        tags: ["gaming", "esports", "training"],
        isHype: false, technicalDepth: 5, educationalValue: 7, difficulty: "Intermediate",
        goDeeper: { title: "Cognitive Training for Esports Athletes", duration: "25 min" }
    },
    {
        id: "g2",
        title: "The Science Behind Game Engine Rendering",
        description: "How rendering pipelines work from vertex shaders to pixels on screen.",
        category: "Gaming",
        tags: ["gaming", "computer-science", "graphics"],
        isHype: false, technicalDepth: 8, educationalValue: 9, difficulty: "Advanced",
        goDeeper: { title: "Real-Time Rendering Fundamentals", duration: "1 hour" }
    },
    {
        id: "g3",
        title: "Valorant Network Architecture Explained",
        description: "How Riot built low-latency servers for a 128-tick competitive shooter.",
        category: "Gaming",
        tags: ["valorant", "esports", "system-design"],
        isHype: false, technicalDepth: 7, educationalValue: 8, difficulty: "Intermediate"
    },

    // ============================================================
    // ENTERTAINMENT & COMEDY cluster
    // ============================================================
    {
        id: "e1",
        title: "The Psychology of Viral Videos — What Makes Us Share?",
        description: "Behavioral science behind why some content spreads and others do not.",
        category: "Other",
        tags: ["funny", "psychology", "media"],
        isHype: false, technicalDepth: 4, educationalValue: 7, difficulty: "Beginner",
        goDeeper: { title: "Contagious: Why Things Catch On", duration: "Book summary 12 min" }
    },
    {
        id: "e2",
        title: "How Comedy Writing Actually Works",
        description: "Structure, timing, subversion — the craft behind what makes us laugh.",
        category: "Other",
        tags: ["funny", "meme", "creativity"],
        isHype: false, technicalDepth: 3, educationalValue: 6, difficulty: "Beginner"
    },
    {
        id: "e3",
        title: "How Animals Perceive the World Differently from Humans",
        description: "Vision, smell, and senses science explains what animals actually experience.",
        category: "Other",
        tags: ["animals", "science", "biology"],
        isHype: false, technicalDepth: 5, educationalValue: 8, difficulty: "Beginner",
        goDeeper: { title: "An Immense World — Animal Senses Book", duration: "Summary 15 min" }
    },

    // ============================================================
    // HEALTH & FITNESS cluster
    // ============================================================
    {
        id: "h1",
        title: "The Science of Muscle Growth — Hypertrophy Explained",
        description: "What actually triggers muscle adaptation at the cellular level.",
        category: "Health",
        tags: ["workout", "gym", "science"],
        isHype: false, technicalDepth: 6, educationalValue: 9, difficulty: "Intermediate",
        goDeeper: { title: "Jeff Nippard — Science of Hypertrophy", duration: "45 min" }
    },
    {
        id: "h2",
        title: "Why Sleep is Your Most Important Performance Tool",
        description: "How sleep deprivation degrades cognition, recovery, and hormone balance.",
        category: "Health",
        tags: ["health", "recovery", "science"],
        isHype: false, technicalDepth: 5, educationalValue: 9, difficulty: "Beginner",
        goDeeper: { title: "Why We Sleep — Matthew Walker", duration: "Book summary 20 min" }
    },
    {
        id: "h3",
        title: "How to Build a Sustainable Gym Routine",
        description: "Progressive overload, periodization, and recovery principles for beginners.",
        category: "Fitness",
        tags: ["gym", "workout", "health"],
        isHype: false, technicalDepth: 4, educationalValue: 8, difficulty: "Beginner"
    },

    // ============================================================
    // LIFESTYLE cluster
    // ============================================================
    {
        id: "l1",
        title: "The Chemistry Behind the Perfect Espresso Shot",
        description: "Extraction, grind size, pressure — the actual science of great coffee.",
        category: "Lifestyle",
        tags: ["coffee", "food", "science"],
        isHype: false, technicalDepth: 5, educationalValue: 7, difficulty: "Intermediate",
        goDeeper: { title: "James Hoffmann — The World Atlas of Coffee", duration: "Summary 10 min" }
    },
    {
        id: "l2",
        title: "How Michelin Star Chefs Actually Think About Flavor",
        description: "Flavor pairing theory, umami science, and why great food is chemistry.",
        category: "Lifestyle",
        tags: ["food", "aesthetic", "science"],
        isHype: false, technicalDepth: 5, educationalValue: 7, difficulty: "Beginner"
    },
    {
        id: "l3",
        title: "Intentional Living — Designing Your Environment for Focus",
        description: "How to use your physical and digital space to reduce distraction.",
        category: "Lifestyle",
        tags: ["vlog", "aesthetic", "productivity"],
        isHype: false, technicalDepth: 3, educationalValue: 8, difficulty: "Beginner",
        goDeeper: { title: "Atomic Habits — James Clear", duration: "Summary 15 min" }
    }
];

