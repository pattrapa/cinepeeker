import "dotenv/config";

function requireEnvironmentVariable(
  name: string,
): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `${name} is missing. Please add it to backend/.env.`,
    );
  }

  return value;
}

const port = Number(
  process.env.PORT ?? 5000,
);

if (Number.isNaN(port)) {
  throw new Error(
    "PORT must be a valid number.",
  );
}

export const env = {
  port,

  mongoUri:
    requireEnvironmentVariable(
      "MONGODB_URI",
    ),

  frontendUrl:
    process.env.FRONTEND_URL?.trim() ||
    "http://localhost:3000",

  jwtSecret:
    requireEnvironmentVariable(
      "JWT_SECRET",
    ),

  internalApiSecret:
    requireEnvironmentVariable(
      "INTERNAL_API_SECRET",
    ),

  legacyRecipeOwnerEmail:
    requireEnvironmentVariable(
      "LEGACY_RECIPE_OWNER_EMAIL",
    ).toLowerCase(),
} as const;