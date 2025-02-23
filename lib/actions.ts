"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import prisma from "./prisma";

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
        return;
      }
   
      // ポストを作成
      await prisma.post.create({
        data: {
          content: validatedPostText,
          authorId: user.id,
        },
      });

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