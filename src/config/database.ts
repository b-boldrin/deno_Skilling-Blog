import mongoose from "mongoose"

export default async function connectToDatabase() : Promise<void> {
    try {
        const uri = Deno.env.get("mongo_connection_url");

        if (!uri) {

        throw new Error("Variável mongo_connection_url não encontrada!");
        }

        await mongoose.connect(uri);

        console.log("Banco Conectado!")
    } catch (err) {
        console.log("Erro ao conectar com o banco: ", err )
        process.exit(1)
    }
}