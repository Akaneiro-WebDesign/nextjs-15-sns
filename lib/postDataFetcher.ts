import prisma from "./prisma";

export async function fetchPosts(userId: string) {
  const following = await prisma.follow.findMany({
    where: {
      followerId: userId,
    },
    select: {
      followingId: true,
  }
  });

  const followingIds = following.map((f) => f.followingId);
  const ids = [userId, ...followingIds];

  return await prisma.post.findMany({
    where: {
      authorId: {
      in : ids,
    },
  },
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