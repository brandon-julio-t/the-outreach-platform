import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { twilioMessagesHttpRoutes } from "./domains/twilioMessages/http";

const http = httpRouter();

auth.addHttpRoutes(http);

twilioMessagesHttpRoutes(http);

export default http;
