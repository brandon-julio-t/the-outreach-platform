import { api } from "@/convex/_generated/api";
import { FunctionReturnType } from "convex/server";

export type RowData = FunctionReturnType<
  typeof api.domains.organizationMembers.queries.getOrganizationMembers
>["page"][number];
