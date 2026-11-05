import mongoose from "mongoose";

export async function connectTestDatabase() {
    const uri = Deno.env.get("mongo_connection_test_url");

    if (!uri) {
        throw new Error("MONGO_URI não configurada");
    }

    await mongoose.connect(uri);

    if (mongoose.connection.name !== "DenoTest") {
        await mongoose.disconnect();

        throw new Error("Você não está utilizando o banco de testes!");
    }
}

export async function clearTestDatabase() {
    const collections = mongoose.connection.collections;

    for (const collection of Object.values(collections)) {
        await collection.deleteMany({});
    }
}

export async function disconnectTestDatabase() {
    await mongoose.disconnect();
}