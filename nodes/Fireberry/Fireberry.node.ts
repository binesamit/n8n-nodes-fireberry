import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	INodeProperties,
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
			// CREATE OPERATION - Dynamic Fields
			// ==============================
			{
				displayName: 'Fields',
				name: 'createFields',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['create'],
					},
				},
				options: [
					{
						name: 'field',
						displayName: 'Field',
						values: [
							{
								displayName: 'Field Name',
								name: 'name',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getObjectFields',
								},
								default: '',
								description: 'Choose a field to set',
							},
							{
								displayName: 'Field Type',
								name: 'fieldType',
								type: 'hidden',
								default: '',
								description: 'Internal field type indicator',
							},
							{
								displayName: 'Field Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Enter the value for this field',
							},
						],
					},
				],
				description: 'Click "Add Field" to add each field you want to set on the new record',
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

			// UPDATE OPERATION - Fields
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['update'],
					},
				},
				options: [
					{
						name: 'field',
						displayName: 'Field',
						values: [
							{
								displayName: 'Field Name',
								name: 'name',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getObjectFields',
								},
								default: '',
								description: 'Choose a field to update',
							},
							{
								displayName: 'Field Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'New value for the field',
							},
						],
					},
				],
				description: 'Specify fields to update. Only these fields will be changed.',
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

			// Load fields for selected object type
			async getObjectFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const objectType = this.getNodeParameter('objectType') as string;

				if (!objectType) {
					return [];
				}

				try {
					const fields = await getObjectFieldsFromMetadata.call(this, objectType);

					if (!fields || fields.length === 0) {
						return [];
					}

					// Map fields to dropdown options
					const options = fields
						.filter((field: any) => {
							// Filter out internal/system fields
							const fieldName = field.name || field.fieldName || '';
							return fieldName &&
								   !fieldName.startsWith('_') &&
								   !fieldName.toLowerCase().includes('deleted');
						})
						.map((field: any) => {
							const fieldName = field.name || field.fieldName || '';
							const displayName = field.displayName || field.label || fieldName;
							const fieldType = FIELD_TYPE_MAP[field.systemFieldTypeId]?.description || 'Field';

							return {
								name: `${displayName} (${fieldName})`,
								value: fieldName,
								description: fieldType,
							};
						})
						.sort((a: any, b: any) => a.name.localeCompare(b.name));

					return options;
				} catch (error) {
					console.error('Error loading fields:', error);
					return [];
				}
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
					const createFieldsData = this.getNodeParameter('createFields', i, {}) as any;
					const fieldArray = createFieldsData.field || [];

					if (fieldArray.length === 0) {
						throw new NodeOperationError(
							this.getNode(),
							'Please add at least one field to create the record',
							{ itemIndex: i },
						);
					}

					const body: any = {};
					for (const field of fieldArray) {
						body[field.name] = field.value;
					}

					responseData = await fireberryApiRequest.call(
						this,
						'POST',
						`/api/record/${objectType}`,
						body,
					);

				} else if (operation === 'update') {
					const recordId = this.getNodeParameter('recordId', i) as string;
					const updateFieldsData = this.getNodeParameter('updateFields', i, {}) as any;
					const fieldArray = updateFieldsData.field || [];

					if (fieldArray.length === 0) {
						throw new NodeOperationError(
							this.getNode(),
							'Please specify at least one field to update',
							{ itemIndex: i },
						);
					}

					const body: any = {};
					for (const field of fieldArray) {
						body[field.name] = field.value;
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
