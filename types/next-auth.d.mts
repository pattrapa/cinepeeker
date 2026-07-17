import type {
  DefaultSession,
} from "next-auth";

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken: string;

    user: DefaultSession["user"] & {
      id: string;
      username: string;
    };
  }

  interface User {
    username?: string;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    username?: string;
    accessToken?: string;
  }
}