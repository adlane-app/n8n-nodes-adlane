import type { ICredentialType, INodeProperties } from "n8n-workflow";

export class AdlaneOAuth2Api implements ICredentialType {
  name = "adlaneOAuth2Api";
  displayName = "Adlane OAuth2 API";
  documentationUrl =
    "https://github.com/adlane-app/n8n-nodes-adlane#authentication";
  icon = { light: "file:adlane.svg", dark: "file:adlane.svg" } as const;
  extends = ["oAuth2Api"];
  properties: INodeProperties[] = [
    {
      displayName: "Use Dynamic Client Registration",
      name: "useDynamicClientRegistration",
      type: "hidden",
      default: true,
    },
    {
      displayName: "Server URL",
      name: "serverUrl",
      type: "hidden",
      default: "https://adlane.app/v1",
    },
    {
      displayName: "Resource URL",
      name: "resourceUrl",
      type: "hidden",
      default: "https://adlane.app/v1",
    },
  ];
}
