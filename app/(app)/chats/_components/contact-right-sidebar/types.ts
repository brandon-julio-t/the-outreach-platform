import { api } from "@/convex/_generated/api";
import { FunctionReturnType } from "convex/server";

export type RightSidebarContactData = NonNullable<
  FunctionReturnType<typeof api.domains.contacts.queries.getContactById>
>;
