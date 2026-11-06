import mongoose from "mongoose";

export const skillRepositoryMock = {
    findAllByUserId: async (_userId: string, _page?: number) => [],
    findAllPublic: async (_page?: number) => [
        {
            _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
            title: "Aprendendo Deno",
            content: "Conteúdo sobre Deno",
            tags: ["deno", "typescript"],
            author: "user123",
            isPublic: true
        } as any
    ],
    findSkillById: async (skillId: mongoose.Types.ObjectId) => ({
        _id: skillId,
        title: "Aprendendo Deno",
        content: "Conteúdo sobre Deno",
        tags: ["deno", "typescript"],
        author: "user123",
        isPublic: true
    } as any),
    create: async (data: any) => data,
    remove: async () => ({
        acknowledged: true,
        deletedCount: 1
    }),
    removeMany: async () => ({
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