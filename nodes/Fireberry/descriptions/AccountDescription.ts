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
	// CREATE - Required field
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

	// CREATE - Common optional fields (outside collection)
	{
		displayName: 'Phone',
		name: 'telephone1',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Primary phone number',
	},
	{
		displayName: 'Email',
		name: 'emailaddress1',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Primary email address',
	},
	{
		displayName: 'ID Number',
		name: 'idnumber',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'ID of the person or company (HP/Israeli company ID)',
	},
	{
		displayName: 'City',
		name: 'billingcity',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Billing city',
	},
	{
		displayName: 'Street',
		name: 'billingstreet',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Billing street address',
	},
	{
		displayName: 'Website',
		name: 'websiteurl',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Website URL',
	},

	// CREATE - Additional Fields for less common fields
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
				displayName: 'Account Number',
				name: 'accountnumber',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Billing Country',
				name: 'billingcountry',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Billing Postal Code',
				name: 'billingpostalcode',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Billing State',
				name: 'billingstate',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Billing Zip Code',
				name: 'billingzipcode',
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
				displayName: 'Email 2',
				name: 'emailaddress2',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Email 3',
				name: 'emailaddress3',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Fax',
				name: 'fax1',
				type: 'string',
				default: '',
			},
			{
				displayName: 'First Name',
				name: 'firstname',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Last Name',
				name: 'lastname',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Number of Employees',
				name: 'numberofemployees',
				type: 'number',
				default: 0,
			},
			{
				displayName: 'Phone 2',
				name: 'telephone2',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Phone 3',
				name: 'telephone3',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Revenue',
				name: 'revenue',
				type: 'number',
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

	// UPDATE & DELETE & GET
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
				displayName: 'ID Number',
				name: 'idnumber',
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
				displayName: 'Street',
				name: 'billingstreet',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Website',
				name: 'websiteurl',
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
