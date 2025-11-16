import actionRetrier from "@convex-dev/action-retrier/convex.config.js";
import workflow from "@convex-dev/workflow/convex.config.js";
import { defineApp } from "convex/server";

const app = defineApp();

app.use(workflow);
app.use(actionRetrier);

export default app;
