"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleCollectionItem(formData: FormData) {
  const skylanderId = Number(formData.get("skylanderId"));
  const isOwned = formData.get("isOwned") === "true";

  if (!Number.isFinite(skylanderId)) {
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  if (isOwned) {
    await supabase
      .from("user_collection")
      .delete()
      .eq("user_id", user.id)
      .eq("skylander_id", skylanderId)
      .eq("item_condition", "loose");
  } else {
    await supabase.from("user_collection").upsert(
      {
        user_id: user.id,
        skylander_id: skylanderId,
        quantity: 1,
        item_condition: "loose",
      },
      { onConflict: "user_id,skylander_id,item_condition" },
    );
  }

  revalidatePath("/collection");
}
