import { crud } from "convex-helpers/server/crud";
import schema from "../../schema";

export const { create, destroy, paginate, read, update } = crud(
  schema,
  "organizationMembers",
);
