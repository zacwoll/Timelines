// eslint-disable-next-line import/no-extraneous-dependencies
import supertest from "supertest";
import { Server } from "../src/server";

describe("Server", () => {
  let server: Server;
  let request: supertest.SuperTest<supertest.Test>;

  beforeAll(async () => {
    server = new Server(3000);
    await server.isReady();
    request = supertest(server.getServer());
  });

  describe("setup", () => {
    it("should start the server and return a 200 status code", async () => {
      const res = await request.get("/timelines/john");
      expect(res.status).toBe(200);
    });
  });

  describe("endpoints", () => {
    it("should respond to POST /webhook with a 200 status code", async () => {
      const res = await request.post("/webhook").send({
        code: "test",
        guildId: "test",
      });
      expect(res.status).toBe(200);
    });

    it("should respond to GET /timelines/:user with a message containing the user", async () => {
      const res = await request.get("/timelines/john");
      expect(res.text).toContain("john");
    });
  });

  describe("pause and resume", () => {
    it("should pause the server and return a 200 status code", async () => {
      await server.pause();
      const res = await request.get("/timelines/john");
      expect(res.status).toBe(200);
    });

    it("should resume the server and return a 200 status code", async () => {
      await server.resume();
      const res = await request.get("/timelines/john");
      expect(res.status).toBe(200);
    });
  });
});
