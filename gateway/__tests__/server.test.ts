// // eslint-disable-next-line import/no-extraneous-dependencies
// import supertest from "supertest";
// import { Server } from "../src/old_gateway";

// describe("Server", () => {
//   let server: Server;
//   let request: supertest.SuperTest<supertest.Test>;

//   beforeAll(async () => {
//     server = new Server(3000);
//     await server.isReady();
//     request = supertest(server.getServer());

//     // // Create a spy on console.log
//     // consoleLogSpy = jest.spyOn(console, "log");
//   });

//   describe("setup", () => {
//     it("should start the server and return a 200 status code", async () => {
//       const res = await request.get("/timelines/john");
//       expect(res.status).toBe(200);
//     });
//   });

//   describe("endpoints", () => {
//     it("should respond to POST /webhook with a 200 status code", async () => {
//       const [code, guildId] = ["testCode", "testId"];
//       const res = await request.post("/webhook").send({
//         code,
//         guildId,
//       });

//       expect(res.status).toBe(200);
//     });

//     // it("should return the message sent to the rabbitmq auth exchange", async () => {

//     // })

//     it("should respond to GET /timelines/:user with a message containing the user", async () => {
//       const res = await request.get("/timelines/john");
//       expect(res.text).toContain("john");
//     });
//   });

//   describe("pause and resume", () => {
//     it("should pause the server and return a 200 status code", async () => {
//       await server.pause();
//       const res = await request.get("/timelines/john");
//       expect(res.status).toBe(200);
//     });

//     it("should resume the server and return a 200 status code", async () => {
//       await server.resume();
//       const res = await request.get("/timelines/john");
//       expect(res.status).toBe(200);
//     });
//   });

//   afterAll(async () => {
//     // Perform any cleanup or teardown operations here
//     await server.close(); // Assuming there is a method to gracefully close the server
//     // consoleLogSpy.mockRestore();
//   });
// });
