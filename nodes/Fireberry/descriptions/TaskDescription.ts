import { INodeProperties } from 'n8n-workflow';

export const taskOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['task'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new task',
				action: 'Create a task',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a task',
				action: 'Update a task',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a task',
				action: 'Delete a task',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a task',
				action: 'Get a task',
			},
		],
		default: 'create',
	},
];

export const taskFields: INodeProperties[] = [
	// CREATE
	{
		displayName: 'Subject',
		name: 'subject',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Subject of the task',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['task'],
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
				description: 'Detailed description of the task',
			},
			{
				displayName: 'Start Date',
				name: 'scheduledstart',
				type: 'dateTime',
				default: '',
				description: 'Scheduled start date and time',
			},
			{
				displayName: 'End Date',
				name: 'scheduledend',
				type: 'dateTime',
				default: '',
				description: 'Scheduled end date and time',
			},
			{
				displayName: 'Regarding Object ID',
				name: 'regardingobjectid',
				type: 'string',
				default: '',
				description: 'ID of the related object (account, contact, case, etc.)',
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
									loadOptionsMethod: 'getTaskFields',
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
				resource: ['task'],
				operation: ['update', 'delete', 'get'],
			},
		},
		default: '',
		description: 'ID of the task record',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Subject',
				name: 'subject',
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
				displayName: 'Start Date',
				name: 'scheduledstart',
				type: 'dateTime',
				default: '',
			},
			{
				displayName: 'End Date',
				name: 'scheduledend',
				type: 'dateTime',
				default: '',
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
									loadOptionsMethod: 'getTaskFields',
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
