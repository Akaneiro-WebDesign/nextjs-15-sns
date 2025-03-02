"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import prisma from "./prisma";
import { revalidatePath } from "next/cache";

type State = {
    error? : string | undefined;
    success: boolean;
}

export async function addPostAction(
    prevState: State,
    formData: FormData
    ): Promise<State>{   
    try {
      const { userId } = auth();

      if (!userId) {
        // console.log("No userId found");
        return{error: "ユーザーが存在しません。", success: false};
      }
      const postText = formData.get("post") as string;
      const postTextSchema = z
      .string()
      .min(1,"ポスト内容を入力して下さい")
      .max(140,"140字以内で入力して下さい。");
     
      const validatedPostText = postTextSchema.parse(postText);

    //   await new Promise((resolve) => setTimeout(resolve, 3000));

      // まず、ユーザーが存在するか確認
      const user = await prisma.user.findUnique({
        where: {
          clerkId: userId
        }
      });
   
      if (!user) {
        console.log("User not found in database");
        // ユーザーを作成するか、エラーを返す
        return { error: "ユーザーが存在しません。", success: false };
      }
   
      // ポストを作成
      await prisma.post.create({
        data: {
          content: validatedPostText,
          authorId: user.id,
        },
      });

      revalidatePath("/");

      return {
        error: undefined,
        success: true,
      };

    } catch (error) {
      if(error instanceof z.ZodError){
        return {
        error: error.errors.map((e) => e.message).join(", "),
        success: false,
      };
    } else if (error instanceof Error) {
      return {
        error: error.message,
        success: false,
      };
    } else {
      return {
        error: "予期せぬエラーが発生しました。",
        success: false,
      };
    }
  }
}

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