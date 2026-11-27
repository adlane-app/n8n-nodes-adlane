import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { executeOperations, type Operation, type ResourceRoute } from './transport';
import operations from './operations.json';
import routes from './routes.json';

const platformOptions = [
	{ name: 'Google', value: 'google' },
	{ name: 'LinkedIn', value: 'linkedin' },
	{ name: 'Meta', value: 'meta' },
	{ name: 'TikTok', value: 'tiktok' },
];

export class Adlane implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Adlane',
		name: 'adlane',
		icon: {
			light: 'file:adlane.svg',
			dark: 'file:adlane.svg',
		},
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description:
			'Ad library search: competitor ads on Meta, TikTok, LinkedIn and Google, saved-ad boards and competitor tracking',
		defaults: {
			name: 'Adlane',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'adlaneOAuth2Api',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Account', value: 'account' },
					{ name: 'Ad', value: 'ad' },
					{ name: 'Board', value: 'board' },
					{ name: 'Competitor', value: 'competitor' },
				],
				default: 'ad',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get Usage',
						value: 'get_usage',
						description: 'Your plan, searches used and left, and board and competitor limits',
						action: 'Get plan and usage',
					},
				],
				default: 'get_usage',
				displayOptions: { show: { resource: ['account'] } },
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Search',
						value: 'search_ads',
						description:
							'Search the Meta, TikTok, LinkedIn and Google ad libraries at once by keyword, advertiser or domain. Uses one search from your plan.',
						action: 'Search ad libraries',
					},
				],
				default: 'search_ads',
				displayOptions: { show: { resource: ['ad'] } },
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Create',
						value: 'create_board',
						description: 'Create a board for saved ads',
						action: 'Create a board',
					},
					{
						name: 'Get',
						value: 'get_board',
						description: 'Read the ads saved on one board, with your notes',
						action: 'Get a board',
					},
					{
						name: 'Get Many',
						value: 'list_boards',
						description: 'List your boards with ad counts',
						action: 'Get many boards',
					},
					{
						name: 'Save Ad',
						value: 'save_ad',
						description: 'Save one ad from a Search result to a board, with an optional note',
						action: 'Save an ad to a board',
					},
				],
				default: 'list_boards',
				displayOptions: { show: { resource: ['board'] } },
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get Many',
						value: 'list_competitors',
						description: 'List tracked competitors with total and new ad counts',
						action: 'Get many competitors',
					},
					{
						name: 'Track',
						value: 'track_competitor',
						description: 'Start tracking a competitor; Adlane checks their ads now',
						action: 'Track a competitor',
					},
				],
				default: 'list_competitors',
				displayOptions: { show: { resource: ['competitor'] } },
			},
			{
				displayName: 'Query',
				name: 'search_ads__query',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'allbirds.com',
				description:
					'Keyword, advertiser name or website domain, for example running shoes, Allbirds or allbirds.com',
				displayOptions: { show: { operation: ['search_ads'], resource: ['ad'] } },
			},
			{
				displayName: 'Options',
				name: 'options_search_ads',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: { show: { operation: ['search_ads'], resource: ['ad'] } },
				options: [
					{
						displayName: 'Country Code',
						name: 'country',
						type: 'string',
						default: '',
						placeholder: 'US',
						description:
							'Two-letter country code for Meta, LinkedIn and Google. Leave empty for all countries.',
					},
					{
						displayName: 'Mode',
						name: 'mode',
						type: 'options',
						options: [
							{ name: 'Advertiser', value: 'advertiser' },
							{ name: 'Domain', value: 'domain' },
							{ name: 'Keyword', value: 'keyword' },
						],
						default: 'domain',
						description:
							'How to read the query. Google searches by advertiser or domain only. Without this option, a domain is searched as a domain and anything else as a keyword.',
					},
					{
						displayName: 'Platforms',
						name: 'platforms',
						type: 'multiOptions',
						options: platformOptions,
						default: [],
						description: 'Ad libraries to search. Leave empty for all four.',
					},
				],
			},
			{
				displayName: 'Board ID',
				name: 'get_board__boardId',
				type: 'string',
				default: '',
				required: true,
				description: 'The board ID from Board → Get Many or Create',
				displayOptions: { show: { operation: ['get_board'], resource: ['board'] } },
			},
			{
				displayName: 'Name',
				name: 'create_board__name',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'Swipe file',
				description: 'Board name, up to 80 characters',
				displayOptions: { show: { operation: ['create_board'], resource: ['board'] } },
			},
			{
				displayName: 'Board ID',
				name: 'save_ad__boardId',
				type: 'string',
				default: '',
				required: true,
				description: 'The board ID from Board → Get Many or Create',
				displayOptions: { show: { operation: ['save_ad'], resource: ['board'] } },
			},
			{
				displayName: 'Search ID',
				name: 'save_ad__search_id',
				type: 'string',
				default: '',
				required: true,
				description: 'The search_id from the Ad → Search output',
				displayOptions: { show: { operation: ['save_ad'], resource: ['board'] } },
			},
			{
				displayName: 'Ad Key',
				name: 'save_ad__ad_key',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'meta:1335285412043498',
				description: 'The ad_key of one ad in that search',
				displayOptions: { show: { operation: ['save_ad'], resource: ['board'] } },
			},
			{
				displayName: 'Options',
				name: 'options_save_ad',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: { show: { operation: ['save_ad'], resource: ['board'] } },
				options: [
					{
						displayName: 'Note',
						name: 'note',
						type: 'string',
						default: '',
						typeOptions: { rows: 2 },
						description: 'Note saved with the ad, up to 1000 characters',
					},
				],
			},
			{
				displayName: 'Name',
				name: 'track_competitor__name',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'Allbirds',
				description: 'Competitor or brand name',
				displayOptions: { show: { operation: ['track_competitor'], resource: ['competitor'] } },
			},
			{
				displayName: 'Options',
				name: 'options_track_competitor',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: { show: { operation: ['track_competitor'], resource: ['competitor'] } },
				options: [
					{
						displayName: 'Domain',
						name: 'domain',
						type: 'string',
						default: '',
						placeholder: 'allbirds.com',
						description: 'Website domain, needed for Google',
					},
					{
						displayName: 'Platforms',
						name: 'platforms',
						type: 'multiOptions',
						options: platformOptions,
						default: [],
						description: 'Ad libraries to watch. Leave empty for all four.',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		return executeOperations(
			this,
			'https://adlane.app',
			'adlaneOAuth2Api',
			operations as unknown as Operation[],
			routes as Record<string, ResourceRoute>,
		);
	}
}
