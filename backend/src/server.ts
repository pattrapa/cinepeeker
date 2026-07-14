import app from "./app";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";

async function startServer(): Promise<void> {
  try {
    console.log("Starting RecipePeeker backend...");

    await connectDatabase();

    app.listen(env.port, () => {
      console.log(
        `RecipePeeker backend is running at http://localhost:${env.port}`,
      );
    });
  } catch (error) {
    console.error("Unable to start backend:");
    console.error(error);

    process.exit(1);
  }
}

void startServer();