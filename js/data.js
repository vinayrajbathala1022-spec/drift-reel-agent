// js/data.js

const feedReels = [
    {
        id: "r1",
        title: "Top 5 Valorant Plays",
        caption: "Insane clutch moments in VCT this week!",
        category: "Gaming",
        tags: ["gaming", "esports", "valorant"],
        tone: "hype"
    },
    // Trap Case Item 1
    {
        id: "r2",
        title: "When you miss a semicolon",
        caption: "Java developers know the pain...",
        category: "Comedy",
        tags: ["java", "meme", "programming"],
        tone: "humor"
    },
    {
        id: "r3",
        title: "Cute Dogs Doing Funny Things",
        caption: "Wait for the golden retriever at the end 😂",
        category: "Entertainment",
        tags: ["animals", "funny", "dogs"],
        tone: "casual"
    },
    // Trap Case Item 2
    {
        id: "r4",
        title: "Day in the life of a Software Engineer",
        caption: "Meetings, coffee, and maybe some coding.",
        category: "Vlog",
        tags: ["software-engineering", "vlog", "career", "tech"],
        tone: "lifestyle"
    },
    {
        id: "r5",
        title: "Best Gym Routine for Beginners",
        caption: "Start your fitness journey today.",
        category: "Fitness",
        tags: ["workout", "health", "gym"],
        tone: "educational"
    },
    // Trap Case Item 3
    {
        id: "r6",
        title: "How to invert a binary tree",
        caption: "Interviewer: We're done here.",
        category: "Comedy",
        tags: ["interview", "coding", "dsa", "joke"],
        tone: "humor"
    },
    {
        id: "r7",
        title: "Making the perfect espresso",
        caption: "Dialing in the beans.",
        category: "Lifestyle",
        tags: ["coffee", "food", "aesthetic"],
        tone: "casual"
    },
    // Trap Case Item 4
    {
        id: "r8",
        title: "M2 Pro vs M3 Max for Developers",
        caption: "Which laptop should you buy for coding?",
        category: "Tech",
        tags: ["hardware", "developer", "review", "apple"],
        tone: "informative"
    }
];

const recommendationCandidates = [
    // Hype candidates (Should be rejected)
    {
        id: "c1",
        title: "10 AI Tools That Will Get You Hired in 2026",
        description: "Just use these tools and you're guaranteed a 500k salary!!!",
        category: "AI",
        tags: ["ai", "tools", "career", "hype"],
        isHype: true,
        technicalDepth: 1,
        educationalValue: 2,
        difficulty: "Beginner"
    },
    {
        id: "c2",
        title: "Learn Python in 5 Minutes!",
        description: "Master programming instantly with this one simple trick.",
        category: "Other",
        tags: ["python", "coding", "clickbait"],
        isHype: true,
        technicalDepth: 1,
        educationalValue: 1,
        difficulty: "Beginner"
    },
    
    // High value candidates
    {
        id: "c3",
        title: "System Design Interviews Explained",
        description: "Breaking down how to approach large-scale architecture problems.",
        category: "HLD",
        tags: ["system-design", "architecture", "interview", "software-engineering"],
        isHype: false,
        technicalDepth: 8,
        educationalValue: 9,
        difficulty: "Advanced",
        goDeeper: { title: "Grokking the System Design Interview - Full Course", duration: "3 hours" }
    },
    {
        id: "c4",
        title: "Understanding Reactivity in Frontend Frameworks",
        description: "How state changes trigger UI updates under the hood.",
        category: "Other",
        tags: ["frontend", "javascript", "react", "architecture"],
        isHype: false,
        technicalDepth: 7,
        educationalValue: 8,
        difficulty: "Intermediate"
    },
    {
        id: "c5",
        title: "Introduction to Big O Notation",
        description: "Time and space complexity made easy for your next coding round.",
        category: "DSA",
        tags: ["dsa", "algorithms", "interview", "computer-science"],
        isHype: false,
        technicalDepth: 5,
        educationalValue: 8,
        difficulty: "Beginner",
        goDeeper: { title: "Data Structures & Algorithms in Java", duration: "45 min" }
    },
    {
        id: "c6",
        title: "Java Memory Management & Garbage Collection",
        description: "Deep dive into the JVM heap and GC algorithms.",
        category: "Java",
        tags: ["java", "jvm", "performance", "backend"],
        isHype: false,
        technicalDepth: 9,
        educationalValue: 9,
        difficulty: "Advanced",
        goDeeper: { title: "JVM Performance Tuning Guide", duration: "1.5 hours" }
    },
    {
        id: "c7",
        title: "OAuth 2.0 and OIDC Security Flows",
        description: "How modern authentication actually works securely.",
        category: "Cybersecurity",
        tags: ["security", "auth", "backend", "architecture"],
        isHype: false,
        technicalDepth: 8,
        educationalValue: 9,
        difficulty: "Advanced"
    },
    {
        id: "c8",
        title: "Docker vs Kubernetes in 60 Seconds",
        description: "When to use containers vs when to use orchestration.",
        category: "Cloud",
        tags: ["devops", "cloud", "docker", "kubernetes"],
        isHype: false,
        technicalDepth: 6,
        educationalValue: 7,
        difficulty: "Intermediate",
        goDeeper: { title: "Kubernetes for Beginners", duration: "2 hours" }
    },
    {
        id: "c9",
        title: "How CPUs execute your code",
        description: "From compiled binaries to instruction pipelines and registers.",
        category: "Hardware",
        tags: ["hardware", "cpu", "computer-science", "low-level"],
        isHype: false,
        technicalDepth: 9,
        educationalValue: 8,
        difficulty: "Advanced"
    },
    {
        id: "c10",
        title: "Navigating Tech Layoffs",
        description: "Actionable advice for junior developers entering the market.",
        category: "Career",
        tags: ["career", "advice", "software-engineering", "industry"],
        isHype: false,
        technicalDepth: 2,
        educationalValue: 7,
        difficulty: "Beginner"
    },
    {
        id: "c11",
        title: "Building RAG applications from scratch",
        description: "Vector databases, embeddings, and LLM orchestration.",
        category: "AI",
        tags: ["ai", "llm", "backend", "architecture"],
        isHype: false,
        technicalDepth: 7,
        educationalValue: 8,
        difficulty: "Intermediate",
        goDeeper: { title: "Applied Generative AI Engineering", duration: "50 min" }
    },
    {
        id: "c12",
        title: "Spring Boot under the hood",
        description: "How auto-configuration and dependency injection work in Spring.",
        category: "Java",
        tags: ["java", "spring", "backend", "framework"],
        isHype: false,
        technicalDepth: 7,
        educationalValue: 8,
        difficulty: "Intermediate"
    }
];
