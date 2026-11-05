import connectToDatabase from "./src/config/database.ts"
import app from "./src/app.ts"

async function startServer() {
    try {
         await connectToDatabase()

         app.listen(7999, () => {
            console.log("Servidor rodando!")
         })

    } catch (err) {
        console.log("Erro ao iniciar o servidor: ", err)
        process.exit(1)
    }
}

startServer()
