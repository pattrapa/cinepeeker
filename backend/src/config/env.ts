import "dotenv/config";

const port = Number(process.env.PORT ?? 5000);

if (Number.isNaN(port)) {
  throw new Error("PORT must be a valid number.");
}

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error(
    "MONGODB_URI is missing. Please add it to backend/.env.",
  );
}

export const env = {
  port,
  mongoUri,
  frontendUrl:
    process.env.FRONTEND_URL ?? "http://localhost:3000",
} as const;