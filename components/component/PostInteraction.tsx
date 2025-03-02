"use client";

import React, { FormEvent, useOptimistic, useState } from "react";

import { Button } from "@/components/ui/button";
import { HeartIcon, MessageCircleIcon, Share2Icon, ClockIcon } from "./Icons";
import prisma from "@/lib/prisma";
import  { auth } from "@clerk/nextjs/server";	
import { revalidatePath } from "next/cache";
import { likeAction } from "@/lib/actions";
import { useAuth } from "@clerk/nextjs";

interface LikeState {
    likeCount: number;
    isLiked: boolean;
}

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
    const { userId } = useAuth();

    const initialState = {
        likeCount: initialLikes.length,
        isLiked: userId ? initialLikes.includes(userId): false,
    };

    const [optimisticLike, addOptimisticLike] = useOptimistic<LikeState, void>(
        initialState,
        (currentState) => ({
        //updateFn
        likeCount: currentState.isLiked
        ? currentState.likeCount - 1
        : currentState.likeCount + 1,
        isLiked: !currentState.isLiked,
    })
);

    const handleLikeSubmit = async () => {
        try {
            addOptimisticLike();
            await likeAction(postId);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex items-center">
            <form action={handleLikeSubmit}>
            <Button variant="ghost" size="icon">
                <HeartIcon className="h-5 w-5 text-muted-foreground" />
            </Button>
            </form>
        <span className="-ml-1 text-destructive">{optimisticLike.likeCount}</span>
            <Button variant="ghost" size="icon">
                <MessageCircleIcon className="h-5 w-5 text-muted-foreground" />
        </Button>
        <span>{commentNumber}</span>
            <Button variant="ghost" size="icon">
                <Share2Icon className="h-5 w-5 text-muted-foreground" />
        </Button>
        </div>
    );
};

export default PostInteraction;