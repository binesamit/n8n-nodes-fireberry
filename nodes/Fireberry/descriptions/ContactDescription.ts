// nodes/Fireberry/descriptions/ContactDescription.ts

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
	// CREATE
	{
		displayName: 'Last Name',
		name: 'lastname',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Last name of the contact',
	},
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
				displayName: 'First Name',
				name: 'firstname',
				type: 'string',
				default: '',
				description: 'First name of the contact',
			},
			{
				displayName: 'Email',
				name: 'emailaddress1',
				type: 'string',
				default: '',
				description: 'Primary email address',
			},
			{
				displayName: 'Mobile Phone',
				name: 'mobilephone',
				type: 'string',
				default: '',
				description: 'Mobile phone number',
			},
			{
				displayName: 'Phone',
				name: 'telephone1',
				type: 'string',
				default: '',
				description: 'Primary phone number',
			},
			{
				displayName: 'Job Title',
				name: 'jobtitle',
				type: 'string',
				default: '',
				description: 'Job title or position',
			},
			{
				displayName: 'Parent Account ID',
				name: 'parentcustomerid',
				type: 'string',
				default: '',
				description: 'ID of the parent account (company) this contact belongs to',
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
				name: 'mobilephone',
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
