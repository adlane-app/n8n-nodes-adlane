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

export class Adlane implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Adlane',
		name: 'adlane',
		icon: { light: 'file:adlane.svg', dark: 'file:adlane.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Automate your Adlane account',
		defaults: { name: 'Adlane' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [{ name: 'adlaneOAuth2Api', required: true }],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Account',
						value: 'account',
					},
					{
						name: 'Advertising Account',
						value: 'ad-accounts',
					},
					{
						name: 'Workspace',
						value: 'workspaces',
					},
				],
				default: 'account',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get Profile',
						value: 'get_profile',
						description:
							"Read the signed-in customer's own Adlane account profile. Does not search for or identify other people.",
						action: 'Get profile in adlane',
					},
				],
				default: 'get_profile',
				displayOptions: {
					show: {
						resource: ['account'],
					},
				},
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get Campaign Details',
						value: 'get_campaign_details',
						description:
							'Browse campaign status and configuration in an owned connected account. Follow pagination to find a campaign; no changes are made.',
						action: 'Get campaign details in adlane',
					},
					{
						name: 'Get Campaign Performance',
						value: 'get_campaign_performance',
						description:
							'Read campaign metrics for explicit inclusive dates in account timezone. Google costs are micros; Meta spend is in account currency. Conversions are attributed and may overlap between providers. Follow the returned cursor',
						action: 'Get campaign performance in adlane',
					},
					{
						name: 'List Ad Accounts',
						value: 'list_ad_accounts',
						description:
							'Read your connected advertising accounts with currency and timezone. Choose an account ID before requesting reports.',
						action: 'List ad accounts in adlane',
					},
				],
				default: 'get_campaign_details',
				displayOptions: {
					show: {
						resource: ['ad-accounts'],
					},
				},
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'List Workspaces',
						value: 'list_workspaces',
						description:
							'List up to 100 advertising workspaces owned by the signed-in account. Does not fetch advertising reports or change campaigns.',
						action: 'List workspaces in adlane',
					},
				],
				default: 'list_workspaces',
				displayOptions: {
					show: {
						resource: ['workspaces'],
					},
				},
			},
			{
				displayName: 'Account ID',
				name: 'get_campaign_details__accountId',
				type: 'string',
				default: '',
				required: true,
				description: 'The account ID for this operation',
				displayOptions: {
					show: {
						operation: ['get_campaign_details'],
						resource: ['ad-accounts'],
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'options_get_campaign_details',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['get_campaign_details'],
						resource: ['ad-accounts'],
					},
				},
				options: [
					{
						displayName: 'Cursor',
						name: 'cursor',
						type: 'string',
						default: '',
						description: 'The cursor for this operation',
					},
				],
			},
			{
				displayName: 'Account ID',
				name: 'get_campaign_performance__accountId',
				type: 'string',
				default: '',
				required: true,
				description: 'The account ID for this operation',
				displayOptions: {
					show: {
						operation: ['get_campaign_performance'],
						resource: ['ad-accounts'],
					},
				},
			},
			{
				displayName: 'Start Date',
				name: 'get_campaign_performance__startDate',
				type: 'string',
				default: '',
				required: true,
				description: 'The start date for this operation',
				displayOptions: {
					show: {
						operation: ['get_campaign_performance'],
						resource: ['ad-accounts'],
					},
				},
			},
			{
				displayName: 'End Date',
				name: 'get_campaign_performance__endDate',
				type: 'string',
				default: '',
				required: true,
				description: 'The end date for this operation',
				displayOptions: {
					show: {
						operation: ['get_campaign_performance'],
						resource: ['ad-accounts'],
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'options_get_campaign_performance',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['get_campaign_performance'],
						resource: ['ad-accounts'],
					},
				},
				options: [
					{
						displayName: 'Campaign ID',
						name: 'campaignId',
						type: 'string',
						default: '',
						description: 'The campaign ID for this operation',
					},
					{
						displayName: 'Cursor',
						name: 'cursor',
						type: 'string',
						default: '',
						description: 'The cursor for this operation',
					},
				],
			},
			{
				displayName: 'Additional Fields',
				name: 'options_list_ad_accounts',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['list_ad_accounts'],
						resource: ['ad-accounts'],
					},
				},
				options: [
					{
						displayName: 'Offset',
						name: 'offset',
						type: 'number',
						default: 0,
						description: 'The offset for this operation',
						typeOptions: {
							minValue: 0,
							maxValue: 10000,
							numberPrecision: 0,
						},
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
