import mongoose from "mongoose";

export const skillRepositoryMock = {
    findAllByUserId: async () => [],

   findAllPublic: async (page?: number) => {
      return [
        {
            _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
            title: "Aprendendo Deno",
            content: "Conteúdo sobre Deno",
            tags: ["deno", "typescript"],
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];
},

    create: async (data: any) => data,

    remove: async () => ({
        acknowledged: true,
        deletedCount: 1
    }),

    update: async () => ({
        acknowledged: true,
        matchedCount: 1,
        modifiedCount: 1,
        upsertedCount: 0,
        upsertedId: null
    })
};