import prisma from "./prisma";

export async function fetchPosts(userId: string) {
  // 全ユーザーの投稿を取得するように変更
  return await prisma.post.findMany({
    // 全投稿を取得するため、特定ユーザーのフィルタリングを削除
    include: {
      author: true,
      likes: {
        select: {
          userId: true,
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  
}