import {
  TaskManager,
  orkesConductorClient,
  WorkflowExecutor,
} from "@io-orkes/conductor-javascript";
import { v4 as uuid } from "uuid";
import { updatePatientWorker, findPatientWorker } from "./workers";
import express from "express";
import bodyParser from "body-parser";

const WORKFLOW_NAME = "PatientWorkflowJs";
const WORKFLOW_VERSION = 1;

const serverSettings = {
  keyId: process.env.KEY,
  keySecret: process.env.SECRET,
  serverUrl: process.env.CONDUCTOR_SERVER_URL,
};

const clientPromise = orkesConductorClient(serverSettings);

async function createTaskManager() {
  const client = await clientPromise;
  new TaskManager(client, [updatePatientWorker(), findPatientWorker()], {
    logger: console,
    options: { concurrency: 5, pollInterval: 100 },
  }).startPolling();
}

// Creates the task manager and starts polling for tasks
createTaskManager();

async function executeWorkflowSync(input: Record<string, unknown>) {
  const client = await clientPromise;
  const workflowExecutor = new WorkflowExecutor(client);
  return await workflowExecutor.executeWorkflow(
    {
      name: WORKFLOW_NAME,
      version: WORKFLOW_VERSION,
      input,
    },
    WORKFLOW_NAME,
    WORKFLOW_VERSION,
    uuid()
  );
}
const app = express();

app.use(bodyParser.json()); // Parse JSON data

app.post("", async (req, res) => {
  const inputParams = req.body;
  const result = await executeWorkflowSync(inputParams);
  res.send(result);
});

app.listen(3000, () => console.log("Listening on port 3000"));
