import type { api } from "@/convex/_generated/api";
import type { FunctionReturnType } from "convex/server";

export type RightSidebarContactData = NonNullable<
  FunctionReturnType<typeof api.domains.contacts.queries.getContactById>
>;
