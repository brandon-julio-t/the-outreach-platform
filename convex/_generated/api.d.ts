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
import type * as domains_contacts_internalCrud from "../domains/contacts/internalCrud.js";
import type * as domains_contacts_internalQueries from "../domains/contacts/internalQueries.js";
import type * as domains_contacts_mutations from "../domains/contacts/mutations.js";
import type * as domains_contacts_queries from "../domains/contacts/queries.js";
import type * as domains_core_ensureUserWithOrgId from "../domains/core/ensureUserWithOrgId.js";
import type * as domains_core_getAuthUserWithOrgId from "../domains/core/getAuthUserWithOrgId.js";
import type * as domains_core_getOrgTwilioSettings from "../domains/core/getOrgTwilioSettings.js";
import type * as domains_core_twilio_types from "../domains/core/twilio/types.js";
import type * as domains_organizationMembers_internalActions from "../domains/organizationMembers/internalActions.js";
import type * as domains_organizationMembers_internalCrud from "../domains/organizationMembers/internalCrud.js";
import type * as domains_organizationMembers_mutations from "../domains/organizationMembers/mutations.js";
import type * as domains_organizationMembers_queries from "../domains/organizationMembers/queries.js";
import type * as domains_organizations_internalCrud from "../domains/organizations/internalCrud.js";
import type * as domains_organizations_mutations from "../domains/organizations/mutations.js";
import type * as domains_organizations_queries from "../domains/organizations/queries.js";
import type * as domains_twilioMessageBroadcasts_mutations from "../domains/twilioMessageBroadcasts/mutations.js";
import type * as domains_twilioMessageBroadcasts_queries from "../domains/twilioMessageBroadcasts/queries.js";
import type * as domains_twilioMessageTemplates_internalActions from "../domains/twilioMessageTemplates/internalActions.js";
import type * as domains_twilioMessageTemplates_internalCrud from "../domains/twilioMessageTemplates/internalCrud.js";
import type * as domains_twilioMessageTemplates_mutations from "../domains/twilioMessageTemplates/mutations.js";
import type * as domains_twilioMessageTemplates_queries from "../domains/twilioMessageTemplates/queries.js";
import type * as domains_twilioMessageTemplates_workflows from "../domains/twilioMessageTemplates/workflows.js";
import type * as domains_twilioMessages_http from "../domains/twilioMessages/http.js";
import type * as domains_twilioMessages_internalActions from "../domains/twilioMessages/internalActions.js";
import type * as domains_twilioMessages_internalCrud from "../domains/twilioMessages/internalCrud.js";
import type * as domains_twilioMessages_internalMutations from "../domains/twilioMessages/internalMutations.js";
import type * as domains_twilioMessages_internalQueries from "../domains/twilioMessages/internalQueries.js";
import type * as domains_twilioMessages_mutations from "../domains/twilioMessages/mutations.js";
import type * as domains_twilioMessages_queries from "../domains/twilioMessages/queries.js";
import type * as domains_twilioMessages_workflows from "../domains/twilioMessages/workflows.js";
import type * as domains_twilioSettings_actions from "../domains/twilioSettings/actions.js";
import type * as domains_twilioSettings_internalQueries from "../domains/twilioSettings/internalQueries.js";
import type * as domains_twilioSettings_mutations from "../domains/twilioSettings/mutations.js";
import type * as domains_twilioSettings_queries from "../domains/twilioSettings/queries.js";
import type * as domains_users_internalCrud from "../domains/users/internalCrud.js";
import type * as http from "../http.js";
import type * as index from "../index.js";
import type * as tables_contacts from "../tables/contacts.js";
import type * as tables_organizations from "../tables/organizations.js";
import type * as tables_twilio from "../tables/twilio.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "admin/console/functions": typeof admin_console_functions;
  auth: typeof auth;
  "domains/contacts/internalCrud": typeof domains_contacts_internalCrud;
  "domains/contacts/internalQueries": typeof domains_contacts_internalQueries;
  "domains/contacts/mutations": typeof domains_contacts_mutations;
  "domains/contacts/queries": typeof domains_contacts_queries;
  "domains/core/ensureUserWithOrgId": typeof domains_core_ensureUserWithOrgId;
  "domains/core/getAuthUserWithOrgId": typeof domains_core_getAuthUserWithOrgId;
  "domains/core/getOrgTwilioSettings": typeof domains_core_getOrgTwilioSettings;
  "domains/core/twilio/types": typeof domains_core_twilio_types;
  "domains/organizationMembers/internalActions": typeof domains_organizationMembers_internalActions;
  "domains/organizationMembers/internalCrud": typeof domains_organizationMembers_internalCrud;
  "domains/organizationMembers/mutations": typeof domains_organizationMembers_mutations;
  "domains/organizationMembers/queries": typeof domains_organizationMembers_queries;
  "domains/organizations/internalCrud": typeof domains_organizations_internalCrud;
  "domains/organizations/mutations": typeof domains_organizations_mutations;
  "domains/organizations/queries": typeof domains_organizations_queries;
  "domains/twilioMessageBroadcasts/mutations": typeof domains_twilioMessageBroadcasts_mutations;
  "domains/twilioMessageBroadcasts/queries": typeof domains_twilioMessageBroadcasts_queries;
  "domains/twilioMessageTemplates/internalActions": typeof domains_twilioMessageTemplates_internalActions;
  "domains/twilioMessageTemplates/internalCrud": typeof domains_twilioMessageTemplates_internalCrud;
  "domains/twilioMessageTemplates/mutations": typeof domains_twilioMessageTemplates_mutations;
  "domains/twilioMessageTemplates/queries": typeof domains_twilioMessageTemplates_queries;
  "domains/twilioMessageTemplates/workflows": typeof domains_twilioMessageTemplates_workflows;
  "domains/twilioMessages/http": typeof domains_twilioMessages_http;
  "domains/twilioMessages/internalActions": typeof domains_twilioMessages_internalActions;
  "domains/twilioMessages/internalCrud": typeof domains_twilioMessages_internalCrud;
  "domains/twilioMessages/internalMutations": typeof domains_twilioMessages_internalMutations;
  "domains/twilioMessages/internalQueries": typeof domains_twilioMessages_internalQueries;
  "domains/twilioMessages/mutations": typeof domains_twilioMessages_mutations;
  "domains/twilioMessages/queries": typeof domains_twilioMessages_queries;
  "domains/twilioMessages/workflows": typeof domains_twilioMessages_workflows;
  "domains/twilioSettings/actions": typeof domains_twilioSettings_actions;
  "domains/twilioSettings/internalQueries": typeof domains_twilioSettings_internalQueries;
  "domains/twilioSettings/mutations": typeof domains_twilioSettings_mutations;
  "domains/twilioSettings/queries": typeof domains_twilioSettings_queries;
  "domains/users/internalCrud": typeof domains_users_internalCrud;
  http: typeof http;
  index: typeof index;
  "tables/contacts": typeof tables_contacts;
  "tables/organizations": typeof tables_organizations;
  "tables/twilio": typeof tables_twilio;
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

export declare const components: {
  workflow: {
    event: {
      create: FunctionReference<
        "mutation",
        "internal",
        { name: string; workflowId: string },
        string
      >;
      send: FunctionReference<
        "mutation",
        "internal",
        {
          eventId?: string;
          name?: string;
          result:
            | { kind: "success"; returnValue: any }
            | { error: string; kind: "failed" }
            | { kind: "canceled" };
          workflowId?: string;
          workpoolOptions?: {
            defaultRetryBehavior?: {
              base: number;
              initialBackoffMs: number;
              maxAttempts: number;
            };
            logLevel?: "DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR";
            maxParallelism?: number;
            retryActionsByDefault?: boolean;
          };
        },
        string
      >;
    };
    journal: {
      load: FunctionReference<
        "query",
        "internal",
        { shortCircuit?: boolean; workflowId: string },
        {
          blocked?: boolean;
          journalEntries: Array<{
            _creationTime: number;
            _id: string;
            step:
              | {
                  args: any;
                  argsSize: number;
                  completedAt?: number;
                  functionType: "query" | "mutation" | "action";
                  handle: string;
                  inProgress: boolean;
                  kind?: "function";
                  name: string;
                  runResult?:
                    | { kind: "success"; returnValue: any }
                    | { error: string; kind: "failed" }
                    | { kind: "canceled" };
                  startedAt: number;
                  workId?: string;
                }
              | {
                  args: any;
                  argsSize: number;
                  completedAt?: number;
                  handle: string;
                  inProgress: boolean;
                  kind: "workflow";
                  name: string;
                  runResult?:
                    | { kind: "success"; returnValue: any }
                    | { error: string; kind: "failed" }
                    | { kind: "canceled" };
                  startedAt: number;
                  workflowId?: string;
                }
              | {
                  args: { eventId?: string };
                  argsSize: number;
                  completedAt?: number;
                  eventId?: string;
                  inProgress: boolean;
                  kind: "event";
                  name: string;
                  runResult?:
                    | { kind: "success"; returnValue: any }
                    | { error: string; kind: "failed" }
                    | { kind: "canceled" };
                  startedAt: number;
                };
            stepNumber: number;
            workflowId: string;
          }>;
          logLevel: "DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR";
          ok: boolean;
          workflow: {
            _creationTime: number;
            _id: string;
            args: any;
            generationNumber: number;
            logLevel?: any;
            name?: string;
            onComplete?: { context?: any; fnHandle: string };
            runResult?:
              | { kind: "success"; returnValue: any }
              | { error: string; kind: "failed" }
              | { kind: "canceled" };
            startedAt?: any;
            state?: any;
            workflowHandle: string;
          };
        }
      >;
      startSteps: FunctionReference<
        "mutation",
        "internal",
        {
          generationNumber: number;
          steps: Array<{
            retry?:
              | boolean
              | { base: number; initialBackoffMs: number; maxAttempts: number };
            schedulerOptions?: { runAt?: number } | { runAfter?: number };
            step:
              | {
                  args: any;
                  argsSize: number;
                  completedAt?: number;
                  functionType: "query" | "mutation" | "action";
                  handle: string;
                  inProgress: boolean;
                  kind?: "function";
                  name: string;
                  runResult?:
                    | { kind: "success"; returnValue: any }
                    | { error: string; kind: "failed" }
                    | { kind: "canceled" };
                  startedAt: number;
                  workId?: string;
                }
              | {
                  args: any;
                  argsSize: number;
                  completedAt?: number;
                  handle: string;
                  inProgress: boolean;
                  kind: "workflow";
                  name: string;
                  runResult?:
                    | { kind: "success"; returnValue: any }
                    | { error: string; kind: "failed" }
                    | { kind: "canceled" };
                  startedAt: number;
                  workflowId?: string;
                }
              | {
                  args: { eventId?: string };
                  argsSize: number;
                  completedAt?: number;
                  eventId?: string;
                  inProgress: boolean;
                  kind: "event";
                  name: string;
                  runResult?:
                    | { kind: "success"; returnValue: any }
                    | { error: string; kind: "failed" }
                    | { kind: "canceled" };
                  startedAt: number;
                };
          }>;
          workflowId: string;
          workpoolOptions?: {
            defaultRetryBehavior?: {
              base: number;
              initialBackoffMs: number;
              maxAttempts: number;
            };
            logLevel?: "DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR";
            maxParallelism?: number;
            retryActionsByDefault?: boolean;
          };
        },
        Array<{
          _creationTime: number;
          _id: string;
          step:
            | {
                args: any;
                argsSize: number;
                completedAt?: number;
                functionType: "query" | "mutation" | "action";
                handle: string;
                inProgress: boolean;
                kind?: "function";
                name: string;
                runResult?:
                  | { kind: "success"; returnValue: any }
                  | { error: string; kind: "failed" }
                  | { kind: "canceled" };
                startedAt: number;
                workId?: string;
              }
            | {
                args: any;
                argsSize: number;
                completedAt?: number;
                handle: string;
                inProgress: boolean;
                kind: "workflow";
                name: string;
                runResult?:
                  | { kind: "success"; returnValue: any }
                  | { error: string; kind: "failed" }
                  | { kind: "canceled" };
                startedAt: number;
                workflowId?: string;
              }
            | {
                args: { eventId?: string };
                argsSize: number;
                completedAt?: number;
                eventId?: string;
                inProgress: boolean;
                kind: "event";
                name: string;
                runResult?:
                  | { kind: "success"; returnValue: any }
                  | { error: string; kind: "failed" }
                  | { kind: "canceled" };
                startedAt: number;
              };
          stepNumber: number;
          workflowId: string;
        }>
      >;
    };
    workflow: {
      cancel: FunctionReference<
        "mutation",
        "internal",
        { workflowId: string },
        null
      >;
      cleanup: FunctionReference<
        "mutation",
        "internal",
        { workflowId: string },
        boolean
      >;
      complete: FunctionReference<
        "mutation",
        "internal",
        {
          generationNumber: number;
          runResult:
            | { kind: "success"; returnValue: any }
            | { error: string; kind: "failed" }
            | { kind: "canceled" };
          workflowId: string;
        },
        null
      >;
      create: FunctionReference<
        "mutation",
        "internal",
        {
          maxParallelism?: number;
          onComplete?: { context?: any; fnHandle: string };
          startAsync?: boolean;
          workflowArgs: any;
          workflowHandle: string;
          workflowName: string;
        },
        string
      >;
      getStatus: FunctionReference<
        "query",
        "internal",
        { workflowId: string },
        {
          inProgress: Array<{
            _creationTime: number;
            _id: string;
            step:
              | {
                  args: any;
                  argsSize: number;
                  completedAt?: number;
                  functionType: "query" | "mutation" | "action";
                  handle: string;
                  inProgress: boolean;
                  kind?: "function";
                  name: string;
                  runResult?:
                    | { kind: "success"; returnValue: any }
                    | { error: string; kind: "failed" }
                    | { kind: "canceled" };
                  startedAt: number;
                  workId?: string;
                }
              | {
                  args: any;
                  argsSize: number;
                  completedAt?: number;
                  handle: string;
                  inProgress: boolean;
                  kind: "workflow";
                  name: string;
                  runResult?:
                    | { kind: "success"; returnValue: any }
                    | { error: string; kind: "failed" }
                    | { kind: "canceled" };
                  startedAt: number;
                  workflowId?: string;
                }
              | {
                  args: { eventId?: string };
                  argsSize: number;
                  completedAt?: number;
                  eventId?: string;
                  inProgress: boolean;
                  kind: "event";
                  name: string;
                  runResult?:
                    | { kind: "success"; returnValue: any }
                    | { error: string; kind: "failed" }
                    | { kind: "canceled" };
                  startedAt: number;
                };
            stepNumber: number;
            workflowId: string;
          }>;
          logLevel: "DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR";
          workflow: {
            _creationTime: number;
            _id: string;
            args: any;
            generationNumber: number;
            logLevel?: any;
            name?: string;
            onComplete?: { context?: any; fnHandle: string };
            runResult?:
              | { kind: "success"; returnValue: any }
              | { error: string; kind: "failed" }
              | { kind: "canceled" };
            startedAt?: any;
            state?: any;
            workflowHandle: string;
          };
        }
      >;
      listSteps: FunctionReference<
        "query",
        "internal",
        {
          order: "asc" | "desc";
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
          workflowId: string;
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            args: any;
            completedAt?: number;
            eventId?: string;
            kind: "function" | "workflow" | "event";
            name: string;
            nestedWorkflowId?: string;
            runResult?:
              | { kind: "success"; returnValue: any }
              | { error: string; kind: "failed" }
              | { kind: "canceled" };
            startedAt: number;
            stepId: string;
            stepNumber: number;
            workId?: string;
            workflowId: string;
          }>;
          pageStatus?: "SplitRecommended" | "SplitRequired" | null;
          splitCursor?: string | null;
        }
      >;
    };
  };
  actionRetrier: {
    public: {
      cancel: FunctionReference<
        "mutation",
        "internal",
        { runId: string },
        boolean
      >;
      cleanup: FunctionReference<
        "mutation",
        "internal",
        { runId: string },
        any
      >;
      start: FunctionReference<
        "mutation",
        "internal",
        {
          functionArgs: any;
          functionHandle: string;
          options: {
            base: number;
            initialBackoffMs: number;
            logLevel: "DEBUG" | "INFO" | "WARN" | "ERROR";
            maxFailures: number;
            onComplete?: string;
            runAfter?: number;
            runAt?: number;
          };
        },
        string
      >;
      status: FunctionReference<
        "query",
        "internal",
        { runId: string },
        | { type: "inProgress" }
        | {
            result:
              | { returnValue: any; type: "success" }
              | { error: string; type: "failed" }
              | { type: "canceled" };
            type: "completed";
          }
      >;
    };
  };
};
