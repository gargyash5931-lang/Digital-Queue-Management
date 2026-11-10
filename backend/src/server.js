
// ================================
// CORS CONFIGURATION
// ================================

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5176",
    "https://digital-queue-frontend.vercel.app"
];

const corsOptions = {
    origin: (origin, callback) => {
        const isVercelPreview =
            /^https:\/\/digital-queue-frontend-[a-z0-9-]+-yash-gargs-projects-50b73d09\.vercel\.app$/i.test(origin || "");

        if (
            !origin ||
            allowedOrigins.includes(origin) ||
            isVercelPreview
        ) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true
};

// ================================
// SOCKET.IO CONFIGURATION
// ================================

const io = new Server(server, {
    cors: corsOptions
});

// ================================
// MIDDLEWARE
// ================================

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
