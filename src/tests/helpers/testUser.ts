
import request from "npm:supertest";
import app from "../../app.ts";

export const testUser = {
    username: "Test User",
    email: "test@example.com",
    password: "TestPassword123"
};

export async function createTestUser(userData = testUser) {
    const response = await request(app)
        .post("/users")
        .send(userData);

    if (response.status !== 201) {
        throw new Error(
            `Não foi possível criar usuário de teste: ${JSON.stringify(response.body)}`
        );
    }

    return response;
}

export async function getTestToken(userData = testUser) {
    await createTestUser(userData);

    const response = await request(app)
        .post("/login")
        .send({
            email: userData.email,
            password: userData.password
        });

    if (response.status !== 200) {
        throw new Error(
            `Não foi possível realizar login: ${JSON.stringify(response.body)}`
        );
    }

    // Ajuste conforme o formato real da resposta do seu endpoint.
    return response.body.data.token;
}