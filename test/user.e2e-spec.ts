import User from "entities/user.entity";
import { App } from "../src/app";
import request from "supertest";

let app: App;

type UserRequest = {
  firstName: string;
  lastName: string;
  email: string;
  birthday: string;
  location: string;
};

type UserResponseData = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  birthday: string;
  location: string;
  createAt: string;
  updatedAt: string;
};

type Response = {
  message: string;
  data: UserResponseData;
};

type ErrorResponse = {
  message: string;
  data: { field: string; message: string }[];
};

beforeAll(async () => {
  app = new App();
  await app.init();
});

afterAll(async () => {
  if (app.getDataSource().isInitialized) {
    app.getDataSource().destroy();
  }
});

afterEach(async () => {
  if (app.getDataSource().isInitialized) {
    const repository = app.getDataSource().getRepository(User);
    await repository.clear();
  }
});

describe("User API (E2E)", () => {
  it("should return validation error if some fields are missing", async () => {
    const response = await request(app.getApp())
      .post("/api/users")
      .send({ firstName: "John Doe" });

    const responseBody: ErrorResponse = response.body;
    const missingFields = responseBody.data.map(
      (field: { field: string; message: string }) => field.field
    );

    expect(response.status).toBe(400);
    expect(responseBody.message).toBe("Validation Error");
    expect(missingFields.length).toEqual(4);
    expect(missingFields).toContain("email");
    expect(missingFields).toContain("lastName");
    expect(missingFields).toContain("birthday");
    expect(missingFields).toContain("location");
  });

  it("should create a user successfully", async () => {
    const userRequest: UserRequest = {
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@gmail.com",
      birthday: "1990-01-01",
      location: "Asia/Jakarta",
    };
    const response = await request(app.getApp())
      .post("/api/users")
      .send(userRequest);
    const responseBody: Response = response.body;

    expect(response.status).toBe(201);
    expect(responseBody.message).toBe("User created");
    expect(responseBody.data).toHaveProperty("id");
    expect(responseBody.data).toHaveProperty("lastName");
    expect(responseBody.data).toHaveProperty("birthday");
    expect(responseBody.data).toHaveProperty("location");
    expect(responseBody.data).toHaveProperty("email");
  });

  it("should return conflict error if email is already in use", async () => {
    const userRequest: UserRequest = {
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@gmail.com",
      birthday: "1990-01-01",
      location: "Asia/Jakarta",
    };
    const response = await request(app.getApp())
      .post("/api/users")
      .send(userRequest);

    expect(response.status).toBe(201);

    const userRequest2: UserRequest = {
      firstName: "Jane",
      lastName: "Doe",
      email: "johndoe@gmail.com",
      birthday: "1990-01-01",
      location: "Asia/Jakarta",
    };

    const response2 = await request(app.getApp())
      .post("/api/users")
      .send(userRequest2);

    expect(response2.status).toBe(409);
  });

  it("should update a user successfully", async () => {
    const userRequest: UserRequest = {
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@gmail.com",
      birthday: "1990-01-01",
      location: "Asia/Jakarta",
    };
    const response = await request(app.getApp())
      .post("/api/users")
      .send(userRequest);
    const responseBody: Response = response.body;

    userRequest.firstName = "Jane";
    userRequest.email = "janedoe@gmail.com";

    const updatedResponse = await request(app.getApp())
      .put(`/api/users/${response.body.data.id}`)
      .send(userRequest);

    const responseBody2: Response = updatedResponse.body;

    expect(updatedResponse.status).toBe(200);
    expect(responseBody2.message).toBe("User updated");
    expect(responseBody2.data.id).toBe(responseBody.data.id);
    expect(responseBody2.data.firstName).toBe("Jane");
    expect(responseBody2.data.email).toBe("janedoe@gmail.com");
  });

  it("should return conflict error if email is already in use when updating", async () => {
    const userRequest: UserRequest = {
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@gmail.com",
      birthday: "1990-01-01",
      location: "Asia/Jakarta",
    };
    const userRequest2: UserRequest = {
      firstName: "Jane",
      lastName: "Doe",
      email: "janedoe@gmail.com",
      birthday: "1990-01-01",
      location: "Asia/Jakarta",
    };
    const response = await request(app.getApp())
      .post("/api/users")
      .send(userRequest);

    const responseBody: Response = response.body;

    await request(app.getApp()).post("/api/users").send(userRequest2);

    userRequest.email = "janedoe@gmail.com";

    const updatedResponse = await request(app.getApp())
      .put(`/api/users/${responseBody.data.id}`)
      .send(userRequest);

    expect(updatedResponse.status).toBe(409);
  });

  it("should delete a user successfully", async () => {
    const userRequest: UserRequest = {
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@gmail.com",
      birthday: "1990-01-01",
      location: "Asia/Jakarta",
    };
    const response = await request(app.getApp())
      .post("/api/users")
      .send(userRequest);
    const responseBody: Response = response.body;
    const userId = responseBody.data.id;

    const deletedResponse = await request(app.getApp())
      .delete(`/api/users/${userId}`)
      .send();
    expect(deletedResponse.status).toBe(200);

    // check data in database
    const user = await app
      .getDataSource()
      .getRepository(User)
      .findOne({ where: { id: userId } });
    expect(user).toBeNull();
  });

  it("should return not found error if user does not exist", async () => {
    const response = await request(app.getApp()).delete(`/api/users/1`).send();
    expect(response.status).toBe(404);
  });
});
