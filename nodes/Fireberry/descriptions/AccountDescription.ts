import { INodeProperties } from 'n8n-workflow';

export const accountOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['account'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new account',
				action: 'Create an account',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an account',
				action: 'Update an account',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an account',
				action: 'Delete an account',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get an account',
				action: 'Get an account',
			},
		],
		default: 'create',
	},
];

export const accountFields: INodeProperties[] = [
	// CREATE
	{
		displayName: 'Account Name',
		name: 'accountname',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Name of the account (company)',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Phone',
				name: 'telephone1',
				type: 'string',
				default: '',
				description: 'Primary phone number',
			},
			{
				displayName: 'ID Number',
				name: 'idnumber',
				type: 'string',
				default: '',
				description: 'Company ID number (HP/Israeli company ID)',
			},
			{
				displayName: 'Email',
				name: 'emailaddress1',
				type: 'string',
				default: '',
				description: 'Primary email address',
			},
			{
				displayName: 'City',
				name: 'billingcity',
				type: 'string',
				default: '',
				description: 'Billing city',
			},
			{
				displayName: 'Street',
				name: 'billingstreet',
				type: 'string',
				default: '',
				description: 'Billing street address',
			},
			{
				displayName: 'Postal Code',
				name: 'billingpostalcode',
				type: 'string',
				default: '',
				description: 'Billing postal code',
			},
			{
				displayName: 'Website',
				name: 'websiteurl',
				type: 'string',
				default: '',
				description: 'Company website URL',
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
									loadOptionsMethod: 'getAccountFields',
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
	// UPDATE
	{
		displayName: 'Record ID',
		name: 'recordId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['update', 'delete', 'get'],
			},
		},
		default: '',
		description: 'ID of the record to operate on',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Account Name',
				name: 'accountname',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Phone',
				name: 'telephone1',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Email',
				name: 'emailaddress1',
				type: 'string',
				default: '',
			},
			{
				displayName: 'City',
				name: 'billingcity',
				type: 'string',
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
									loadOptionsMethod: 'getAccountFields',
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
