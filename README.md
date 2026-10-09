# Adlane for n8n

Build workflows with the [Adlane](https://adlane.app) REST API. This community node sends ordinary HTTP resource requests and returns JSON responses. It does not connect to an MCP server or use JSON-RPC.

## Installation

Install `n8n-nodes-adlane` from **Settings → Community nodes** in your n8n instance. You can also install the npm package in a self-hosted n8n installation.

## Authentication

Create the **Adlane OAuth2 API** credential, select **Connect my account**, sign in to Adlane, and approve the listed permissions. Credentials use dynamic registration, OAuth authorization code flow, PKCE, expiring access tokens, and refresh tokens. The API resource is `https://adlane.app/v1`; REST tokens are separate from MCP tokens.

**Upgrading from 1.x or 2.x:** create a new Adlane OAuth2 API credential and reconnect it before running workflows. Version 3 uses the product REST resource at `https://adlane.app/v1` with its own OAuth audience. Tokens issued for the earlier resource cannot be reused. Inputs retain their names; review the resource JSON and write confirmations before enabling workflows.

## Resources and operations

Choose a **Resource**, then an **Operation**. Only operations and input fields for that resource are shown. Resources: Account, Advertising Account, Workspace.

### Requests

| Operation                   | HTTP request                                 |
| --------------------------- | -------------------------------------------- |
| Read campaign configuration | `GET /v1/ad-accounts/:accountId/campaigns`   |
| Read campaign performance   | `GET /v1/ad-accounts/:accountId/performance` |
| Read your Adlane profile    | `GET /v1/account`                            |
| List connected ad accounts  | `GET /v1/ad-accounts`                        |
| List your Adlane workspaces | `GET /v1/workspaces`                         |

## Workflow behavior

Each input item makes one API request and produces one linked output item. Optional pagination fields can be passed through the node's options; list responses retain their next-page cursor or offset. Write operations require the node's explicit confirmation switch. Failed requests stop the workflow unless **Continue On Fail** is enabled. HTTP errors are summarized without including credentials or raw request headers.

Requests use the fixed product API origin, encode resource identifiers, and do not follow redirects. Use a dedicated account for automation when you want separate access and data. Account ownership, workspace permissions, billing limits, and entitlement checks are enforced by the product API.

## Development and support

Run `npm ci`, `npm run lint`, and `npm test` to build and validate the package with the n8n node CLI. Source and release automation: [adlane-app/n8n-nodes-adlane](https://github.com/adlane-app/n8n-nodes-adlane). Report node issues in [GitHub Issues](https://github.com/adlane-app/n8n-nodes-adlane/issues).

Product: [Adlane](https://adlane.app) · [Privacy](https://adlane.app/privacy/) · [Agent skill](https://github.com/adlane-app/agent-skill)

MIT license.

## REST API contract

The request origin and OAuth resource are the product API shown above. GET reads a resource, POST creates or requests an explicitly confirmed action, PATCH updates, and DELETE removes the selected owned resource. The node does not forward requests to a protocol server. Authentication, permissions and ownership are enforced before the API executes an operation.

## Release checks (3.1.0)

Resource and Operation definitions are explicit in the TypeScript node source. This minor update preserves API endpoints, credential types and operation identifiers. Every publication must pass Prettier, the official n8n node CLI linter with zero warnings, the runtime tests, and the n8n community package scanner against both TypeScript source and compiled JavaScript. GitHub Actions runs these checks before publishing with npm provenance.

Run `npm ci --ignore-scripts`, `npm test`, and `npm run review` before proposing a release.
