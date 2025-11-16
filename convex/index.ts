import { ActionRetrier } from "@convex-dev/action-retrier";
import { WorkflowManager } from "@convex-dev/workflow";
import { components } from "./_generated/api";

export const workflow = new WorkflowManager(components.workflow);

export const retrier = new ActionRetrier(components.actionRetrier);
