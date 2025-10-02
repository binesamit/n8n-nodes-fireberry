import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';

import {
	fireberryApiRequest,
	fireberryApiRequestAllItems,
	getAllObjectTypes,
	getObjectFieldsFromMetadata,
	FIELD_TYPE_MAP,
} from './GenericFunctions';

export class Fireberry implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Fireberry',
		name: 'fireberry',
		icon: 'file:fireberry.svg',
		group: ['transform'],
		version: 2,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["objectType"]}}',
		description: 'Interact with Fireberry CRM (formerly Powerlink) - Dynamic support for all objects',
		defaults: {
			name: 'Fireberry',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'fireberryApi',
				required: true,
			},
		],
		properties: [
			// Object Type Selection
			{
				displayName: 'Object Type',
				name: 'objectType',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getAllObjects',
				},
				default: '',
				required: true,
				description: 'Select the Fireberry object type to work with',
			},
			// Operation Selection
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new record',
						action: 'Create a record',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a record',
						action: 'Update a record',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a record',
						action: 'Delete a record',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a record by ID',
						action: 'Get a record',
					},
					{
						name: 'Query',
						value: 'query',
						description: 'Query records with advanced filters',
						action: 'Query records',
					},
				],
				default: 'create',
			},

			// ==============================
			// CREATE OPERATION - Fields as JSON
			// ==============================
			{
				displayName: 'Fields (JSON)',
				name: 'createFieldsJson',
				type: 'json',
				default: '{\n  "accountname": "Example Company",\n  "telephone1": "03-1234567",\n  "emailaddress1": "info@example.com"\n}',
				displayOptions: {
					show: {
						operation: ['create'],
					},
				},
				description: 'Enter all record fields as a JSON object. Field names must match exactly (case-sensitive). Click the expression icon (=) to use expressions.',
				placeholder: '{"fieldName": "value", "anotherField": "another value"}',
				hint: 'Available fields can be found in Fireberry under Settings → Customization for each object type',
			},

			// ==============================
			// UPDATE & DELETE & GET - Record ID
			// ==============================
			{
				displayName: 'Record ID',
				name: 'recordId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['update', 'delete', 'get'],
					},
				},
				default: '',
				description: 'ID of the record to operate on',
			},

			// UPDATE OPERATION - Fields as JSON
			{
				displayName: 'Update Fields (JSON)',
				name: 'updateFieldsJson',
				type: 'json',
				default: '{\n  "accountname": "Updated Company Name",\n  "telephone1": "03-9876543"\n}',
				displayOptions: {
					show: {
						operation: ['update'],
					},
				},
				description: 'Enter fields to update as a JSON object. Only include fields you want to change.',
				placeholder: '{"fieldName": "new value"}',
				hint: 'Only fields included in this JSON will be updated. Other fields remain unchanged.',
			},

			// ==============================
			// QUERY OPERATION
			// ==============================
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['query'],
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
						operation: ['query'],
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
						operation: ['query'],
						returnAll: [false],
					},
				},
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				default: 50,
				description: 'Number of results per page',
			},
			{
				displayName: 'Page Number',
				name: 'pageNumber',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['query'],
						returnAll: [false],
					},
				},
				typeOptions: {
					minValue: 1,
				},
				default: 1,
				description: 'Page number to retrieve',
			},
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['query'],
					},
				},
				default: '',
				placeholder: 'e.g., accountname eq \'Test\' and telephone1 ne null',
				description: 'OData-style query filter. Leave empty to get all records.',
			},
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['query'],
					},
				},
				default: '*',
				description: 'Comma-separated list of fields to return. Use * for all fields.',
			},
			{
				displayName: 'Additional Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						operation: ['query'],
					},
				},
				options: [
					{
						displayName: 'Sort By',
						name: 'sortBy',
						type: 'string',
						default: '',
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
		],
	};

	methods = {
		loadOptions: {
			// Load all available object types from Fireberry
			async getAllObjects(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return await getAllObjectTypes.call(this);
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const objectType = this.getNodeParameter('objectType', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				let responseData;

				if (operation === 'create') {
					const createFieldsJson = this.getNodeParameter('createFieldsJson', i) as string;

					let body: any;
					try {
						body = typeof createFieldsJson === 'string'
							? JSON.parse(createFieldsJson)
							: createFieldsJson;
					} catch (error) {
						throw new NodeOperationError(
							this.getNode(),
							'Invalid JSON in Fields. Please check your JSON syntax.',
							{ itemIndex: i },
						);
					}

					if (!body || Object.keys(body).length === 0) {
						throw new NodeOperationError(
							this.getNode(),
							'Please specify at least one field to create the record',
							{ itemIndex: i },
						);
					}

					responseData = await fireberryApiRequest.call(
						this,
						'POST',
						`/api/record/${objectType}`,
						body,
					);

				} else if (operation === 'update') {
					const recordId = this.getNodeParameter('recordId', i) as string;
					const updateFieldsJson = this.getNodeParameter('updateFieldsJson', i) as string;

					let body: any;
					try {
						body = typeof updateFieldsJson === 'string'
							? JSON.parse(updateFieldsJson)
							: updateFieldsJson;
					} catch (error) {
						throw new NodeOperationError(
							this.getNode(),
							'Invalid JSON in Update Fields. Please check your JSON syntax.',
							{ itemIndex: i },
						);
					}

					if (!body || Object.keys(body).length === 0) {
						throw new NodeOperationError(
							this.getNode(),
							'Please specify at least one field to update',
							{ itemIndex: i },
						);
					}

					responseData = await fireberryApiRequest.call(
						this,
						'PUT',
						`/api/record/${objectType}/${recordId}`,
						body,
					);

				} else if (operation === 'delete') {
					const recordId = this.getNodeParameter('recordId', i) as string;

					responseData = await fireberryApiRequest.call(
						this,
						'DELETE',
						`/api/record/${objectType}/${recordId}`,
					);

				} else if (operation === 'get') {
					const recordId = this.getNodeParameter('recordId', i) as string;

					responseData = await fireberryApiRequest.call(
						this,
						'GET',
						`/api/record/${objectType}/${recordId}`,
					);

				} else if (operation === 'query') {
					const query = this.getNodeParameter('query', i, '') as string;
					const fields = this.getNodeParameter('fields', i, '*') as string;
					const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;
					const sortBy = this.getNodeParameter('options.sortBy', i, '') as string;
					const sortType = this.getNodeParameter('options.sortType', i, 'desc') as string;

					const body: any = {
						objecttype: parseInt(objectType, 10),
						fields,
						...(query && { query }),
						...(sortBy && { sort_by: sortBy }),
						sort_type: sortType,
					};

					if (returnAll) {
						const limit = this.getNodeParameter('limit', i, 0) as number;
						responseData = await fireberryApiRequestAllItems.call(
							this,
							'/api/query',
							body,
							limit || undefined,
						);
					} else {
						const pageSize = this.getNodeParameter('pageSize', i, 50) as number;
						const pageNumber = this.getNodeParameter('pageNumber', i, 1) as number;

						body.page_size = pageSize;
						body.page_number = pageNumber;

						const response = await fireberryApiRequest.call(
							this,
							'POST',
							'/api/query',
							body,
						);

						responseData = response.value || response.data || response;
					}
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as any),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);
			} catch (error: any) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error.message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
