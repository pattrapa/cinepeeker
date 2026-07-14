import app from "./app";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";

async function startServer(): Promise<void> {
  try {
    console.log("Starting RecipePeeker backend...");

    await connectDatabase();

    const server = app.listen(
      env.port,
      "0.0.0.0",
      () => {
        console.log(
          `RecipePeeker backend is running at http://localhost:${env.port}`,
        );
      },
    );

    server.on("error", (error) => {
      console.error("Backend server error:");
      console.error(error);
    });
  } catch (error) {
    console.error("Unable to start backend:");
    console.error(error);
    process.exit(1);
  }
}

void startServer();