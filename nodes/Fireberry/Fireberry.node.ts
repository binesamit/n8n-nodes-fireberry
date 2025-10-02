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
	getPicklistValues,
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
			// CREATE OPERATION - Resource Mapper
			// ==============================
			{
				displayName: 'Columns',
				name: 'columns',
				type: 'resourceMapper',
				noDataExpression: true,
				default: {
					mappingMode: 'defineBelow',
					value: null,
				},
				required: true,
				displayOptions: {
					show: {
						operation: ['create'],
					},
				},
				typeOptions: {
					loadOptionsDependsOn: ['objectType'],
					resourceMapper: {
						resourceMapperMethod: 'getColumns',
						mode: 'add',
						fieldWords: {
							singular: 'field',
							plural: 'fields',
						},
						addAllFields: true,
						multiKeyMatch: false,
					},
				},
				description: 'Map the fields to create the record',
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

			// UPDATE OPERATION - Resource Mapper
			{
				displayName: 'Columns',
				name: 'updateColumns',
				type: 'resourceMapper',
				noDataExpression: true,
				default: {
					mappingMode: 'defineBelow',
					value: null,
				},
				required: true,
				displayOptions: {
					show: {
						operation: ['update'],
					},
				},
				typeOptions: {
					loadOptionsDependsOn: ['objectType'],
					resourceMapper: {
						resourceMapperMethod: 'getColumns',
						mode: 'update',
						fieldWords: {
							singular: 'field',
							plural: 'fields',
						},
						addAllFields: false,
						multiKeyMatch: false,
					},
				},
				description: 'Map the fields to update. Only specified fields will be changed.',
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
								name: `${displayName}`,
								value: fieldName,
								description: `${fieldType} - ${fieldName}`,
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



		resourceMapping: {
			// Get columns/fields for resourceMapper
			async getColumns(this: ILoadOptionsFunctions): Promise<any> {
				const objectType = this.getNodeParameter('objectType', 0) as string;

				if (!objectType) {
					return { fields: [] };
				}

				try {
					const fields = await getObjectFieldsFromMetadata.call(this, objectType);

					if (!fields || fields.length === 0) {
						return { fields: [] };
					}

					// Pre-fetch fieldObjectType for all lookup fields
					const lookupFieldsInfo: { [key: string]: string } = {};
					const lookupFields = fields.filter((f: any) =>
						f.systemFieldTypeId === 'a8fcdf65-91bc-46fd-82f6-1234758345a1'
					);

					// Fetch all lookup field details in parallel
					const lookupDetailsPromises = lookupFields.map(async (field: any) => {
						const fieldName = field.name || field.fieldName || '';
						try {
							const fieldDetailsResponse = await fireberryApiRequest.call(
								this,
								'GET',
								`/metadata/records/${objectType}/fields/${fieldName}`,
								{},
							);
							const fieldObjectType = fieldDetailsResponse[0]?.data?.fieldObjectType ||
												  fieldDetailsResponse.data?.fieldObjectType;
							if (fieldObjectType) {
								lookupFieldsInfo[fieldName] = fieldObjectType;
								console.log(`✅ Lookup field "${fieldName}" → Object Type ${fieldObjectType}`);
							} else {
								console.log(`⚠️ No fieldObjectType found for lookup field "${fieldName}"`);
							}
						} catch (error) {
							console.error(`❌ Error fetching lookup field details for ${fieldName}:`, error);
						}
					});

					await Promise.all(lookupDetailsPromises);
					console.log(`📊 Loaded ${Object.keys(lookupFieldsInfo).length} lookup field mappings:`, lookupFieldsInfo);

					// Map to resourceMapper format
					const mappedFieldsPromises = fields
						.filter((field: any) => {
							const fieldName = field.name || field.fieldName || '';
							return fieldName &&
								   !fieldName.startsWith('_') &&
								   !fieldName.toLowerCase().includes('deleted');
						})
						.map(async (field: any) => {
							const fieldName = field.name || field.fieldName || '';
							const displayName = field.displayName || field.label || fieldName;
							const fieldTypeId = field.systemFieldTypeId;

							// Determine field type for resourceMapper
							let type = 'string';
							let options: INodePropertyOptions[] | undefined = undefined;

							if (fieldTypeId === 'b4919f2e-2996-48e4-a03c-ba39fb64386c') {
								// Picklist - fetch values and build options
								type = 'options';
								try {
									const values = await getPicklistValues.call(this, objectType, fieldName);
									options = values.map(v => ({
										name: v.name,
										value: v.value,
									}));
								} catch (error) {
									console.error(`Error loading picklist values for ${fieldName}:`, error);
									options = [];
								}
							} else if (fieldTypeId === 'a8fcdf65-91bc-46fd-82f6-1234758345a1') {
								// Lookup/Reference - use pre-fetched fieldObjectType
								const fieldObjectType = lookupFieldsInfo[fieldName];

								if (fieldObjectType) {
									type = 'options';
									try {
										const queryBody = {
											objecttype: parseInt(fieldObjectType, 10),
											fields: '*',
											page_size: 100,
											page_number: 1,
										};
										console.log(`🔍 Querying Object Type ${fieldObjectType} for field "${fieldName}"...`);
										const response = await fireberryApiRequest.call(
											this,
											'POST',
											'/api/query',
											queryBody,
										);

										// Query API returns: { success: true, data: { Data: [...], Columns: [...], PrimaryKey: "...", PrimaryField: "..." }, message: "..." }
										const records = response.data?.Data || response.Data || response.value || [];
										const primaryKey = response.data?.PrimaryKey || 'id';
										const primaryField = response.data?.PrimaryField || 'name';

										console.log(`📊 Object Type ${fieldObjectType}: PrimaryKey="${primaryKey}", PrimaryField="${primaryField}", Records=${records?.length || 0}`);

										if (!Array.isArray(records)) {
											console.log(`❌ Records is not an array for "${fieldName}"`);
											options = [];
										} else {
											options = records.map((record: any) => ({
												name: record[primaryField] || record.name || record.fullname || record.title || `Record ${record[primaryKey]}`,
												value: String(record[primaryKey] || record.id),
											}));
											console.log(`✅ Loaded ${options?.length || 0} options for "${fieldName}" from Object Type ${fieldObjectType}`);
										}
									} catch (error) {
										console.error(`❌ Error loading lookup values for ${fieldName}:`, error);
										options = [];
									}
								} else {
									console.log(`⚠️ No fieldObjectType for "${fieldName}" - using string input`);
								}
								// If no fieldObjectType, field stays as string type (default)
							} else if (fieldTypeId === '6a34bfe3-fece-4da1-9136-a7b1e5ae3319') {
								// Number
								type = 'number';
							} else if (fieldTypeId === 'ce972d02-5013-46d4-9d1d-f09df1ac346a' ||
									   fieldTypeId === '83bf530c-e04c-462b-9ffc-a46f750fc072') {
								// DateTime or Date
								type = 'dateTime';
							}

							const fieldDef: any = {
								id: fieldName,
								displayName,
								required: field.isRequired || false,
								defaultMatch: false,
								display: true,
								type,
								removeListSearch: false,
							};

							// Only add options if they exist and have values
							if (options && options.length > 0) {
								fieldDef.options = options;
							}

							return fieldDef;
						});

					const mappedFields = await Promise.all(mappedFieldsPromises);

					return {
						fields: mappedFields,
					};
				} catch (error) {
					console.error('Error getting columns:', error);
					return { fields: [] };
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
					const columnsData = this.getNodeParameter('columns', i) as any;

					let body: any = {};

					// Handle different mapping modes
					if (columnsData.mappingMode === 'autoMapInputData') {
						// Use input data directly
						body = items[i].json;
					} else if (columnsData.mappingMode === 'defineBelow' && columnsData.value) {
						// Manual mapping
						body = columnsData.value;
					} else {
						throw new NodeOperationError(
							this.getNode(),
							'Please map at least one field to create the record',
							{ itemIndex: i },
						);
					}

					if (Object.keys(body).length === 0) {
						throw new NodeOperationError(
							this.getNode(),
							'No fields to create. Please map at least one field.',
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
					const columnsData = this.getNodeParameter('updateColumns', i) as any;

					let body: any = {};

					// Handle different mapping modes
					if (columnsData.mappingMode === 'autoMapInputData') {
						// Use input data directly
						body = items[i].json;
					} else if (columnsData.mappingMode === 'defineBelow' && columnsData.value) {
						// Manual mapping
						body = columnsData.value;
					} else {
						throw new NodeOperationError(
							this.getNode(),
							'Please map at least one field to update',
							{ itemIndex: i },
						);
					}

					if (Object.keys(body).length === 0) {
						throw new NodeOperationError(
							this.getNode(),
							'No fields to update. Please map at least one field.',
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
