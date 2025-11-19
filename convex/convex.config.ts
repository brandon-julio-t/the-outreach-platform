import actionRetrier from "@convex-dev/action-retrier/convex.config.js";
import r2 from "@convex-dev/r2/convex.config.js";
import workflow from "@convex-dev/workflow/convex.config.js";
import { defineApp } from "convex/server";

const app = defineApp();

app.use(workflow);
app.use(actionRetrier);
app.use(r2);

export default app;
