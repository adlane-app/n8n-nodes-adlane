# Ad library search by Adlane for n8n

Search competitor ads on Meta, TikTok, LinkedIn and Google from your n8n workflows with the [Adlane](https://adlane.app) REST API: one search covers all four ad libraries, then save the ads you like to boards and track competitors. This community node sends ordinary HTTP resource requests and returns JSON responses. It does not connect to an MCP server or use JSON-RPC.

## Installation

Install `n8n-nodes-adlane` from **Settings → Community nodes** in your n8n instance. You can also install the npm package in a self-hosted n8n installation.

## Authentication

Create the **Adlane OAuth2 API** credential, select **Connect my account**, sign in to Adlane, and approve the connection. Credentials use dynamic registration, OAuth authorization code flow, PKCE, expiring access tokens, and refresh tokens. The API resource is `https://adlane.app/v1`; REST tokens are separate from MCP tokens. Disconnect at any time from `https://adlane.app/oauth/n8n/connections`.

Any Adlane plan can connect, including the free account (5 searches to try it, no card). Searches, boards, saved ads and tracked competitors count toward your plan exactly as in the app.

### Upgrading from 3.x

Version 4 is a new node for the current Adlane product. The 3.x operations (account, workspaces, ad accounts and campaign reports) belonged to an advertising-reporting product that has been retired, and their API routes are no longer served. Install 4.0.0, create a new Adlane OAuth2 API credential, and rebuild those workflows with the operations below.

## Resources and operations

Choose a **Resource**, then an **Operation**. Only operations and input fields for that resource are shown. Resources: Account, Ad, Board, Competitor.

| Operation             | HTTP request                   | What it does                                                                                                                                        |
| --------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ad → Search           | `GET /v1/search`               | Searches the Meta, TikTok, LinkedIn and Google ad libraries at once by keyword, advertiser or domain. Returns a `search_id` and each ad's `ad_key`. |
| Account → Get Usage   | `GET /v1/usage`                | Your plan, searches used and left, and board, saved-ad and competitor limits.                                                                       |
| Board → Get Many      | `GET /v1/boards`               | Your boards with ad counts.                                                                                                                         |
| Board → Get           | `GET /v1/boards/:boardId`      | The ads saved on one board, with your notes.                                                                                                        |
| Board → Create        | `POST /v1/boards`              | Creates a board for saved ads.                                                                                                                      |
| Board → Save Ad       | `POST /v1/boards/:boardId/ads` | Saves one ad from a search to a board, with an optional note.                                                                                       |
| Competitor → Get Many | `GET /v1/competitors`          | Tracked competitors with total and new ad counts.                                                                                                   |
| Competitor → Track    | `POST /v1/competitors`         | Starts tracking a competitor; Adlane checks their ads now and paid plans recheck every 24 hours.                                                    |

Ad → Search uses one search from your plan; repeating the same search within 12 hours is served from cache. The other operations do not use searches.

## Example

Find a competitor's ads and save one to a board in two steps.

1. Add the Adlane node and choose **Ad → Search**. Set **Query** to `allbirds.com`, and under **Options** set **Mode** to `Domain` and **Platforms** to `Meta`, `TikTok` and `Google`. Run the step. The output has a `search_id` and, per platform, the ads with their `ad_key` (trimmed):

   ```json
   {
   	"search_id": "5a3d1e70-0000-4000-8000-00000000ad01",
   	"query": { "q": "allbirds.com", "mode": "domain", "country": "ALL" },
   	"results": [
   		{
   			"platform": "meta",
   			"status": "ok",
   			"total": 1,
   			"ads": [
   				{
   					"ad_key": "meta:1335285412043498",
   					"advertiser": "Allbirds ME",
   					"headline": "Explore New Arrivals",
   					"cta": "Learn more",
   					"started": "2026-04-17",
   					"placements": ["facebook", "instagram", "audience network", "whatsapp", "threads"],
   					"library_url": "https://www.facebook.com/ads/library/?id=1335285412043498"
   				}
   			]
   		}
   	],
   	"app_url": "https://adlane.app/app/search/?q=allbirds.com&mode=domain"
   }
   ```

2. Add a second Adlane node and choose **Board → Save Ad**. Set **Board ID** to one of your boards (from **Board → Get Many** or **Board → Create**), **Search ID** to `{{ $json.search_id }}` and **Ad Key** to `{{ $json.results[0].ads[0].ad_key }}`, and add a **Note** such as `Strong lifestyle angle`. The output confirms the save:

   ```json
   {
   	"board": { "id": "5a3d1e70-0000-4000-8000-00000000b001", "name": "Swipe file" },
   	"saved": true
   }
   ```

The package ships this flow as a ready workflow in [`examples/competitor-ads-to-board.json`](examples/competitor-ads-to-board.json): Manual Trigger → Ad → Search → Board → Get Many → Board → Save Ad (it saves the most recently started ad to your first board). To use it, download the file, open a new workflow in n8n, choose **Import from File** in the workflow menu (or paste the JSON onto the canvas), select your Adlane credential in the three Adlane nodes, and run it. Replace the Manual Trigger with a Schedule Trigger to check a competitor every week.

## Workflow behavior

Each input item produces one linked output item with the original response. Plan limits and unknown boards or ads fail the item with a readable message; enable **Continue On Fail** to keep going. HTTP errors omit credentials and raw request headers. Requests use the fixed product API origin, encode resource identifiers, and do not follow redirects.

## Development and support

Run `npm ci --ignore-scripts`, `npm test`, and `npm run review` to build and validate the package with the n8n node CLI and community package scanner. Source and release automation: [adlane-app/n8n-nodes-adlane](https://github.com/adlane-app/n8n-nodes-adlane). Report node issues in [GitHub Issues](https://github.com/adlane-app/n8n-nodes-adlane/issues).

Product: [Adlane](https://adlane.app) · [API and connector docs](https://adlane.app/mcp/) · [Privacy](https://adlane.app/privacy/)

MIT license.
