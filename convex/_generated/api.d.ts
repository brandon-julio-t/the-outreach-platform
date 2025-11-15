/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin_console_functions from "../admin/console/functions.js";
import type * as auth from "../auth.js";
import type * as domains_contacts_mutations from "../domains/contacts/mutations.js";
import type * as domains_contacts_queries from "../domains/contacts/queries.js";
import type * as domains_core_ensureUserWithOrgId from "../domains/core/ensureUserWithOrgId.js";
import type * as domains_organizationMembers_internalCrud from "../domains/organizationMembers/internalCrud.js";
import type * as domains_organizations_internalCrud from "../domains/organizations/internalCrud.js";
import type * as domains_organizations_mutations from "../domains/organizations/mutations.js";
import type * as domains_organizations_queries from "../domains/organizations/queries.js";
import type * as domains_twilioSettings_mutations from "../domains/twilioSettings/mutations.js";
import type * as domains_twilioSettings_queries from "../domains/twilioSettings/queries.js";
import type * as domains_users_internalCrud from "../domains/users/internalCrud.js";
import type * as http from "../http.js";
import type * as tables_contacts from "../tables/contacts.js";
import type * as tables_organizations from "../tables/organizations.js";
import type * as tables_twilioSettings from "../tables/twilioSettings.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "admin/console/functions": typeof admin_console_functions;
  auth: typeof auth;
  "domains/contacts/mutations": typeof domains_contacts_mutations;
  "domains/contacts/queries": typeof domains_contacts_queries;
  "domains/core/ensureUserWithOrgId": typeof domains_core_ensureUserWithOrgId;
  "domains/organizationMembers/internalCrud": typeof domains_organizationMembers_internalCrud;
  "domains/organizations/internalCrud": typeof domains_organizations_internalCrud;
  "domains/organizations/mutations": typeof domains_organizations_mutations;
  "domains/organizations/queries": typeof domains_organizations_queries;
  "domains/twilioSettings/mutations": typeof domains_twilioSettings_mutations;
  "domains/twilioSettings/queries": typeof domains_twilioSettings_queries;
  "domains/users/internalCrud": typeof domains_users_internalCrud;
  http: typeof http;
  "tables/contacts": typeof tables_contacts;
  "tables/organizations": typeof tables_organizations;
  "tables/twilioSettings": typeof tables_twilioSettings;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
