// deno-lint-ignore-file
import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { GreetingFunctionDefinition } from "../functions/greeting_function.ts";

var channel_id: string = "D03N76NL9EG"; // devops channel

/**
 * A workflow is a set of steps that are executed in order.
 * Each step in a workflow is a function.
 * https://api.slack.com/automation/workflows
 */
const GreetingWorkflow = DefineWorkflow({
  callback_id: "greeting_workflow",
  title: "Request a cluster",
  description: "Send cluster request to devops channel",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
    },
    required: ["interactivity"],
  },
});

/**
 * For collecting input from users, we recommend the
 * built-in OpenForm function as a first step.
 * https://api.slack.com/automation/functions#open-a-form
 */
const inputForm = GreetingWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Request a cluster",
    interactivity: GreetingWorkflow.inputs.interactivity,
    submit_label: "Request cluster",
    fields: {
      elements: [
        {
          name: "message",
          title: "Message to recipient",
          type: Schema.types.string,
          long: true,
        },
      ],
      required: ["message"],
    },
  },
);

const greetingFunctionStep = GreetingWorkflow.addStep(
  GreetingFunctionDefinition,
  {
    recipient: channel_id,
    message: inputForm.outputs.fields.message,
    sender: GreetingWorkflow.inputs.interactivity.interactor.id,
  },
);

GreetingWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: channel_id,
  message: greetingFunctionStep.outputs.greeting,
});

export default GreetingWorkflow;
