"use client";

import React, { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { HeartIcon, MessageCircleIcon, Share2Icon, ClockIcon } from "./Icons";
import prisma from "@/lib/prisma";
import  { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { useAuth } from "@clerk/nextjs";
import { likeAction } from "@/lib/actions";

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
    const { userId } = useAuth()

    const [likeState, setLikeState] = useState({
        likeCount: initialLikes.length,
         isLiked: userId ? initialLikes.includes(userId): false,
        });

    const handleLikeSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            setLikeState((prev) => ({
                likeCount: prev.isLiked ? prev.likeCount - 1 :prev.likeCount + 1,
                isLiked: !prev.isLiked,
            }));
            await likeAction(postId);
        } catch (err) {
            setLikeState((prev) => ({
                likeCount: prev.isLiked ? prev.likeCount + 1 :prev.likeCount - 1,
                isLiked: !prev.isLiked,
            }));
            console.error(err);
        }
    };

    return (
        <div className="flex items-center">
            <form onSubmit={handleLikeSubmit}>
            <Button variant="ghost" size="icon">
                <HeartIcon className="h-5 w-5 text-muted-foreground" />
            </Button>
            </form>
        <span className="-ml-1 text-destructive">{likeState.likeCount}</span>
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