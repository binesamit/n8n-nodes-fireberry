import { INodeProperties } from 'n8n-workflow';

export const caseOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['case'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new case',
				action: 'Create a case',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a case',
				action: 'Update a case',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a case',
				action: 'Delete a case',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a case',
				action: 'Get a case',
			},
		],
		default: 'create',
	},
];

export const caseFields: INodeProperties[] = [
	// CREATE
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['case'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Title of the case',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['case'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Detailed description of the case',
			},
			{
				displayName: 'Customer ID',
				name: 'customerid',
				type: 'string',
				default: '',
				description: 'ID of the customer (account or contact) this case belongs to',
			},
			{
				displayName: 'Priority',
				name: 'prioritycode',
				type: 'options',
				options: [
					{
						name: 'Low',
						value: 1,
					},
					{
						name: 'Normal',
						value: 2,
					},
					{
						name: 'High',
						value: 3,
					},
				],
				default: 2,
				description: 'Priority level of the case',
			},
			{
				displayName: 'Status',
				name: 'statecode',
				type: 'options',
				options: [
					{
						name: 'Active',
						value: 0,
					},
					{
						name: 'Resolved',
						value: 1,
					},
					{
						name: 'Canceled',
						value: 2,
					},
				],
				default: 0,
				description: 'Status of the case',
			},
			{
				displayName: 'Custom Fields',
				name: 'customFieldsUi',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				placeholder: 'Add Custom Field',
				description: 'Add custom fields specific to your Fireberry account',
				options: [
					{
						name: 'customFieldValues',
						displayName: 'Custom Field',
						values: [
							{
								displayName: 'Field Name or ID',
								name: 'fieldId',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getCaseFields',
								},
								default: '',
								description: 'Select a custom field from your Fireberry account',
							},
							{
								displayName: 'Field Value',
								name: 'fieldValue',
								type: 'string',
								default: '',
								description: 'Value for the custom field',
							},
						],
					},
				],
			},
		],
	},
	// UPDATE & DELETE & GET
	{
		displayName: 'Record ID',
		name: 'recordId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['case'],
				operation: ['update', 'delete', 'get'],
			},
		},
		default: '',
		description: 'ID of the case record',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['case'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
			},
			{
				displayName: 'Priority',
				name: 'prioritycode',
				type: 'options',
				options: [
					{
						name: 'Low',
						value: 1,
					},
					{
						name: 'Normal',
						value: 2,
					},
					{
						name: 'High',
						value: 3,
					},
				],
				default: 2,
			},
			{
				displayName: 'Status',
				name: 'statecode',
				type: 'options',
				options: [
					{
						name: 'Active',
						value: 0,
					},
					{
						name: 'Resolved',
						value: 1,
					},
					{
						name: 'Canceled',
						value: 2,
					},
				],
				default: 0,
			},
			{
				displayName: 'Custom Fields',
				name: 'customFieldsUi',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				placeholder: 'Add Custom Field',
				description: 'Update custom fields',
				options: [
					{
						name: 'customFieldValues',
						displayName: 'Custom Field',
						values: [
							{
								displayName: 'Field Name or ID',
								name: 'fieldId',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getCaseFields',
								},
								default: '',
							},
							{
								displayName: 'Field Value',
								name: 'fieldValue',
								type: 'string',
								default: '',
							},
						],
					},
				],
			},
		],
	},
];
