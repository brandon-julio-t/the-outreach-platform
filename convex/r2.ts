// convex/example.ts
import { getAuthUserId } from "@convex-dev/auth/server";
import { R2 } from "@convex-dev/r2";
import { ConvexError } from "convex/values";
import { components } from "./_generated/api";

export const r2 = new R2(components.r2);

export const { generateUploadUrl, syncMetadata } = r2.clientApi({
  checkUpload: async (ctx, bucket) => {
    // const user = await userFromAuth(ctx);
    // ...validate that the user can upload to this bucket

    console.log("bucket", bucket);

    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("User not authenticated");
    }
  },
  onUpload: async (ctx, bucket, key) => {
    // ...do something with the key
    // This technically runs in the `syncMetadata` mutation, as the upload
    // is performed from the client side. Will run if using the `useUploadFile`
    // hook, or if `syncMetadata` function is called directly. Runs after the
    // `checkUpload` callback.

    console.log("bucket", bucket);
    console.log("key", key);
  },
});
