import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  INodeProperties,
} from "n8n-workflow";
import { NodeConnectionTypes } from "n8n-workflow";
import { executeOperations, type Operation, type ResourceRoute } from "./transport";
import operations from "./operations.json";
import properties from "./properties.json";
import routes from "./routes.json";

export class Adlane implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Adlane",
    name: "adlane",
    icon: { light: "file:adlane.svg", dark: "file:adlane.svg" },
    group: ["transform"],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: "Automate your Adlane account",
    defaults: { name: "Adlane" },
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    usableAsTool: true,
    credentials: [{ name: "adlaneOAuth2Api", required: true }],
    properties: properties as INodeProperties[],
  };
  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    return executeOperations(
      this,
      "https://mcp.adlane.app",
      "adlaneOAuth2Api",
      operations as unknown as Operation[],
      routes as Record<string,ResourceRoute>,
    );
  }
}
