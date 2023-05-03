import request from "supertest";
import { app } from "../src/server";

describe("Test the Express app", () => {
  test("GET /timelines/:user", async () => {
    const response = await request(app).get("/timelines/testuser");
    expect(response.status).toBe(200);
    expect(response.text).toContain("Timeline data for user testuser");
  });

  test("POST /webhook", async () => {
    const response = await request(app).post("/webhook").send({
      code: "123456",
      guildId: "testguildid",
    });
    expect(response.status).toBe(200);
  });

  test("Server starts up and listens on the correct port", async () => {
    const server = app.listen(3000);
    expect(server.listening).toBe(true);
    server.close();
  });
});
