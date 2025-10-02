import { INodeProperties } from 'n8n-workflow';

export const contactOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['contact'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new contact',
				action: 'Create a contact',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a contact',
				action: 'Update a contact',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a contact',
				action: 'Delete a contact',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a contact',
				action: 'Get a contact',
			},
		],
		default: 'create',
	},
];

export const contactFields: INodeProperties[] = [
	// CREATE - Required field
	{
		displayName: 'First Name',
		name: 'firstname',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'First name of the contact',
	},

	// CREATE - Optional standard fields (outside collection)
	{
		displayName: 'Last Name',
		name: 'lastname',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Last name',
	},
	{
		displayName: 'Email',
		name: 'emailaddress1',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Primary email address',
	},
	{
		displayName: 'Mobile Phone',
		name: 'mobilephone1',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Primary mobile phone number',
	},
	{
		displayName: 'Phone',
		name: 'telephone1',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Primary phone number',
	},
	{
		displayName: 'Job Title',
		name: 'jobtitle',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Job title or position',
	},
	{
		displayName: 'Account ID',
		name: 'accountid',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'ID of the related account (company)',
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
				resource: ['contact'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Billing City',
				name: 'billingcity',
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
				displayName: 'Billing Street',
				name: 'billingstreet',
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
				displayName: 'Company Name',
				name: 'companyname',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Department',
				name: 'department',
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
				name: 'fax',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Mobile Phone 2',
				name: 'mobilephone2',
				type: 'string',
				default: '',
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
									loadOptionsMethod: 'getContactFields',
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
				resource: ['contact'],
				operation: ['update', 'delete', 'get'],
			},
		},
		default: '',
		description: 'ID of the contact record',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['update'],
			},
		},
		options: [
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
				displayName: 'Email',
				name: 'emailaddress1',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Mobile Phone',
				name: 'mobilephone1',
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
				displayName: 'Job Title',
				name: 'jobtitle',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Account ID',
				name: 'accountid',
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
									loadOptionsMethod: 'getContactFields',
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
