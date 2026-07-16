import NextAuth, {
  type User,
} from "next-auth";

import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

type BackendUser = {
  id: string;
  username: string;
  name: string;
  email: string;
  image: string;
};

type BackendAuthData = {
  user: BackendUser;
  accessToken: string;
  migratedRecipeCount?: number;
};

type BackendAuthResponse = {
  success: boolean;
  message?: string;
  errors?: string[];
  data?: BackendAuthData;
};

type SessionUser = User & {
  username?: string;
  accessToken?: string;
};

const BACKEND_API_URL =
  process.env.BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000";

async function readBackendResponse(
  response: Response,
): Promise<BackendAuthResponse> {
  const responseText =
    await response.text();

  let result: BackendAuthResponse;

  try {
    result = JSON.parse(
      responseText,
    ) as BackendAuthResponse;
  } catch {
    throw new Error(
      responseText ||
        "The backend returned an invalid response.",
    );
  }

  if (
    !response.ok ||
    !result.success ||
    !result.data
  ) {
    const validationErrors =
      result.errors?.join(" ") ?? "";

    throw new Error(
      `${
        result.message ||
        "Authentication failed."
      } ${validationErrors}`.trim(),
    );
  }

  return result;
}

async function loginWithCredentials(
  email: string,
  password: string,
): Promise<BackendAuthData> {
  const response = await fetch(
    `${BACKEND_API_URL}/api/auth/login`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        email,
        password,
      }),

      cache: "no-store",
    },
  );

  const result =
    await readBackendResponse(
      response,
    );

  return result.data!;
}

async function syncGoogleUser(
  user: User,
): Promise<BackendAuthData> {
  const internalApiSecret =
    process.env.INTERNAL_API_SECRET;

  if (!internalApiSecret) {
    throw new Error(
      "INTERNAL_API_SECRET is missing from .env.local.",
    );
  }

  if (!user.email) {
    throw new Error(
      "Google did not return an email address.",
    );
  }

  const response = await fetch(
    `${BACKEND_API_URL}/api/auth/google`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        "x-internal-api-secret":
          internalApiSecret,
      },

      body: JSON.stringify({
        name:
          user.name || "",

        email:
          user.email,

        image:
          user.image || "",
      }),

      cache: "no-store",
    },
  );

  const result =
    await readBackendResponse(
      response,
    );

  return result.data!;
}

export const {
  handlers,
  signIn,
  signOut,
  auth,
} = NextAuth({
  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        const email =
          typeof credentials.email ===
          "string"
            ? credentials.email
                .trim()
                .toLowerCase()
            : "";

        const password =
          typeof credentials.password ===
          "string"
            ? credentials.password
            : "";

        if (!email || !password) {
          return null;
        }

        const data =
          await loginWithCredentials(
            email,
            password,
          );

        return {
          id: data.user.id,
          name:
            data.user.username,
          username:
            data.user.username,
          email:
            data.user.email,
          image:
            data.user.image || null,
          accessToken:
            data.accessToken,
        };
      },
    }),

    Google({
      clientId:
        process.env.AUTH_GOOGLE_ID,

      clientSecret:
        process.env.AUTH_GOOGLE_SECRET,
    }),
  ],

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({
      token,
      user,
      account,
    }) {
      if (!user) {
        return token;
      }

      /*
       * Login ด้วย Google
       * Sync User เข้า MongoDB ก่อน
       */
      if (
        account?.provider ===
        "google"
      ) {
        const data =
          await syncGoogleUser(
            user,
          );

        token.userId =
          data.user.id;

        token.username =
          data.user.username;

        token.name =
          data.user.username;

        token.email =
          data.user.email;

        token.picture =
          data.user.image || null;

        token.accessToken =
          data.accessToken;

        return token;
      }

      /*
       * Login ด้วย Credentials
       */
      const credentialsUser =
        user as SessionUser;

      token.userId =
        credentialsUser.id;

      token.username =
        credentialsUser.username ||
        credentialsUser.name ||
        "RecipePeeker User";

      token.name =
        token.username;

      token.email =
        credentialsUser.email;

      token.picture =
        credentialsUser.image;

      token.accessToken =
        credentialsUser.accessToken;

      return token;
    },

    async session({
      session,
      token,
    }) {
      if (session.user) {
        session.user.id =
          typeof token.userId ===
          "string"
            ? token.userId
            : token.sub || "";

        session.user.username =
          typeof token.username ===
          "string"
            ? token.username
            : session.user.name ||
              "RecipePeeker User";

        session.user.name =
          session.user.username;

        session.user.email =
          typeof token.email ===
          "string"
            ? token.email
            : session.user.email;

        session.user.image =
          typeof token.picture ===
          "string"
            ? token.picture
            : session.user.image;
      }

      session.accessToken =
        typeof token.accessToken ===
        "string"
          ? token.accessToken
          : "";

      return session;
    },
  },
});