import { INodeProperties } from 'n8n-workflow';

export const queryOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['query'],
			},
		},
		options: [
			{
				name: 'Execute',
				value: 'execute',
				description: 'Execute a custom query',
				action: 'Execute a query',
			},
		],
		default: 'execute',
	},
];

export const queryFields: INodeProperties[] = [
	{
		displayName: 'Object Type',
		name: 'objectType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['query'],
				operation: ['execute'],
			},
		},
		options: [
			{
				name: 'Account',
				value: 'account',
			},
			{
				name: 'Contact',
				value: 'contact',
			},
			{
				name: 'Case',
				value: 'case',
			},
			{
				name: 'Task',
				value: 'task',
			},
		],
		default: 'account',
		description: 'Type of object to query',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['query'],
				operation: ['execute'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['query'],
				operation: ['execute'],
				returnAll: [true],
			},
		},
		typeOptions: {
			minValue: 1,
		},
		default: 100,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Page Size',
		name: 'pageSize',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['query'],
				operation: ['execute'],
				returnAll: [false],
			},
		},
		default: 50,
		description: 'Number of records per page (max 100)',
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
	},
	{
		displayName: 'Page Number',
		name: 'pageNumber',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['query'],
				operation: ['execute'],
				returnAll: [false],
			},
		},
		default: 1,
		description: 'Page number to retrieve',
		typeOptions: {
			minValue: 1,
		},
	},
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		displayOptions: {
			show: {
				resource: ['query'],
				operation: ['execute'],
			},
		},
		default: '',
		placeholder: '(accountname = "דוגמה") AND (telephone1 != "")',
		description: 'Query string using Fireberry syntax. Leave empty for all records. Operators: =, !=, >, <, >=, <=, AND, OR, is-null, is-not-null, start-with, end-with',
	},
	{
		displayName: 'Fields to Return',
		name: 'fields',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['query'],
				operation: ['execute'],
			},
		},
		default: '*',
		placeholder: 'accountname,telephone1,emailaddress1',
		description: 'Comma-separated list of fields to return. Use * for all fields.',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['query'],
				operation: ['execute'],
			},
		},
		options: [
			{
				displayName: 'Sort By',
				name: 'sortBy',
				type: 'string',
				default: '',
				placeholder: 'accountname',
				description: 'Field name to sort by',
			},
			{
				displayName: 'Sort Type',
				name: 'sortType',
				type: 'options',
				options: [
					{
						name: 'Ascending',
						value: 'asc',
					},
					{
						name: 'Descending',
						value: 'desc',
					},
				],
				default: 'desc',
				description: 'Sort direction',
			},
		],
	},
];
