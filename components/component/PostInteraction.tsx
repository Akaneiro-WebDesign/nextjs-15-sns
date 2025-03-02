import React from "react";

import { Button } from "@/components/ui/button";
import { HeartIcon, MessageCircleIcon, Share2Icon, ClockIcon } from "./Icons";
import  { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type PostInteractionProps = {
    postId: string;
    initialLikes: string[];
    commentNumber: number;
}

const PostInteraction = ({ 
    postId,
    initialLikes,
    commentNumber,
}: PostInteractionProps) => {
    const likeAction = async () => {
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

    return (
        <div className="flex items-center">
            <form action={likeAction}>
            <Button variant="ghost" size="icon">
                <HeartIcon className="h-5 w-5 text-muted-foreground" />
            </Button>
            </form>
        <span className="-ml-1 text-destructive">{initialLikes.length}</span>
            <Button variant="ghost" size="icon">
                <MessageCircleIcon className="h-5 w-5 text-muted-foreground" />
        </Button>
        <span>{commentNumber}</span>
            <Button variant="ghost" size="icon">
                <Share2Icon className="h-5 w-5 text-muted-foreground" />
        </Button>
        </div>
    )
}

export default PostInteraction;