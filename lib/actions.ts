"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import prisma from "./prisma";
import { revalidatePath } from "next/cache";

type State = {
    error?: string | undefined;
    success: boolean;
};

export const likeAction = async (postId: string) => {
    "use server";
    console.log(postId);

    const { userId: clerkUserId } = auth();

    if (!clerkUserId) {
        throw new Error("ユーザーが認証されていません");
    }

    try {
        // まずデータベースでユーザーを検索
        const user = await prisma.user.findUnique({
            where: {
                clerkId: clerkUserId,
            },
        });

        if (!user) {
            throw new Error("ユーザーがデータベースに見つかりません");
        }
        const existingLike = await prisma.like.findFirst({
            where: {
                postId,
                userId: user.id, // PrismaのユーザーIDを使用
            },
        });

        if (existingLike) {
            await prisma.like.delete({
                where: {
                    id: existingLike.id,
                },
            });
            revalidatePath("/");
        } else {
            await prisma.like.create({
                data: {
                    postId,
                    userId: user.id, // PrismaのユーザーIDを使用
                },
            });
            revalidatePath("/");
        }
    } catch (err) {
        console.log(err);
    }
};