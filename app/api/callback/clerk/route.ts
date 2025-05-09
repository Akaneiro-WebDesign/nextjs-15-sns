import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import prisma from "@/lib/client";

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local");
  }

// Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

	// Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

// Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

// Do something with the payload
// For this guide, you simply log the payload to the console
  const { id } = evt.data;
  const eventType = evt.type;
// console.log(`Webhook with and ID of ${id} and type of ${eventType}`);
// console.log("Webhook body:", body);

// route.ts内のuser.created処理を修正
if(eventType === "user.created"){
  try {
      await prisma.user.create({
          data: {
              clerkId: evt.data.id,  // clerkIdとして設定
              username: JSON.parse(body).data.username, // usernameは必須
              name: JSON.parse(body).data.username,     // nameはオプション
              image: JSON.parse(body).data.image_url,
          }
      })
      return new Response("ユーザーの作成に成功しました", { status: 200 })
  } catch (error) {
      console.log(error)
      return new Response("ユーザーの作成に失敗しました", { status: 500 })
  }
}

// user.updated処理も同様に修正
if(eventType === "user.updated"){
  try {
      await prisma.user.update({
          where:{
              clerkId: evt.data.id,  // clerkIdで検索
          },
          data: {
              username: JSON.parse(body).data.username, // usernameの更新
              name: JSON.parse(body).data.username,     
              image: JSON.parse(body).data.image_url,
          }
      })
      return new Response("ユーザーの更新に成功しました", { status: 200 })
  } catch (error) {
      console.log(error)
      return new Response("ユーザーの更新に失敗しました", { status: 500 })
  }
}

return new Response("Webhooks received", { status: 200 });
}