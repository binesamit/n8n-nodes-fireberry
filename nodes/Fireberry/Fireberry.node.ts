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
				description: 'Map the fields to create the record. Click the "⋮" menu → "Refresh Field List" to reload fields and lookup values.',
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
				description: 'Map the fields to update. Only specified fields will be changed. Click the "⋮" menu → "Refresh Field List" to reload fields and lookup values.',
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
				displayName: 'Query Mode',
				name: 'queryMode',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['query'],
					},
				},
				options: [
					{
						name: 'Simple Query Builder',
						value: 'simple',
						description: 'Build queries visually with fields, operators, and values',
					},
					{
						name: 'Advanced (Custom Query)',
						value: 'advanced',
						description: 'Write custom OData query string manually',
					},
				],
				default: 'simple',
				description: 'Choose how to build your query',
			},
			{
				displayName: 'Query Rules',
				name: 'queryRules',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						operation: ['query'],
						queryMode: ['simple'],
					},
				},
				default: {},
				placeholder: 'Add Rule',
				description: 'Add query rules to filter results',
				options: [
					{
						name: 'rules',
						displayName: 'Rules',
						values: [
							{
								displayName: 'Field',
								name: 'field',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getQueryFields',
								},
								default: '',
								description: 'Field to filter on',
							},
							{
								displayName: 'Operator',
								name: 'operator',
								type: 'options',
								options: [
									{
										name: 'Equals (=)',
										value: '=',
									},
									{
										name: 'Not Equals (≠)',
										value: '!=',
									},
									{
										name: 'Greater Than (>)',
										value: '>',
									},
									{
										name: 'Less Than (<)',
										value: '<',
									},
									{
										name: 'Greater or Equal (≥)',
										value: '>=',
									},
									{
										name: 'Less or Equal (≤)',
										value: '<=',
									},
									{
										name: 'Is Null',
										value: 'null',
									},
									{
										name: 'Is Not Null',
										value: 'notnull',
									},
									{
										name: 'Starts With',
										value: 'startswith',
									},
									{
										name: 'Ends With',
										value: 'endswith',
									},
									{
										name: 'Contains',
										value: 'contains',
									},
								],
								default: '=',
								description: 'Comparison operator',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getQueryFieldValue',
								},
								displayOptions: {
									hide: {
										operator: ['null', 'notnull'],
									},
								},
								default: '',
								description: 'Select or enter a value to compare against. For Picklist and Lookup fields, available options will load automatically.',
							},
							{
								displayName: 'Combine With',
								name: 'combineOperation',
								type: 'options',
								options: [
									{
										name: 'AND',
										value: 'and',
									},
									{
										name: 'OR',
										value: 'or',
									},
								],
								default: 'and',
								description: 'How to combine with the next rule',
							},
						],
					},
				],
			},
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['query'],
						queryMode: ['advanced'],
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

			// Load fields for query builder
			async getQueryFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const objectType = this.getNodeParameter('objectType') as string;

				if (!objectType) {
					return [];
				}

				try {
					const fields = await getObjectFieldsFromMetadata.call(this, objectType);

					if (!fields || fields.length === 0) {
						return [];
					}

					// Map fields to dropdown options with type information
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
							const fieldType = field.systemFieldTypeId || '';

							// Encode field type in the value: fieldName|fieldType
							const valueWithType = `${fieldName}|${fieldType}`;

							return {
								name: displayName,
								value: valueWithType,
							};
						})
						.sort((a: any, b: any) => a.name.localeCompare(b.name));

					return options;
				} catch (error) {
					console.error('Error loading query fields:', error);
					return [];
				}
			},

			// Load values for selected field in query builder
			async getQueryFieldValue(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const objectType = this.getNodeParameter('objectType') as string;

					if (!objectType) {
						return [{
							name: 'Please select Object Type first',
							value: '',
						}];
					}

					// Try to get the selected field with type from the current parameter path
					let selectedFieldWithType: string | undefined;
					let selectedFieldName: string | undefined;
					let selectedFieldType: string | undefined;

					try {
						// Get the current parameter path to find which rule we're in
						const currentPath = (this as any).getNodeParameter?.$getCurrentParameterPath?.() || '';

						// Try to extract field value from queryRules
						const queryRules = this.getNodeParameter('queryRules') as any;
						const rules = queryRules?.rules || [];

						// Parse the path to find the rule index
						const ruleIndexMatch = currentPath.match(/rules\[(\d+)\]/);
						if (ruleIndexMatch && rules.length > 0) {
							const ruleIndex = parseInt(ruleIndexMatch[1], 10);
							if (rules[ruleIndex] && rules[ruleIndex].field) {
								selectedFieldWithType = rules[ruleIndex].field;
							}
						}

						// Fallback: try last rule
						if (!selectedFieldWithType && rules.length > 0) {
							const lastRule = rules[rules.length - 1];
							if (lastRule?.field) {
								selectedFieldWithType = lastRule.field;
							}
						}
					} catch (e) {
						// Fallback - will return message to select field first
					}

					if (!selectedFieldWithType) {
						return [{
							name: 'Please select a Field first',
							value: '',
						}];
					}

					// Parse field|type
					const parts = selectedFieldWithType.split('|');
					selectedFieldName = parts[0];
					selectedFieldType = parts[1] || '';

					const fields = await getObjectFieldsFromMetadata.call(this, objectType);
					const field = fields.find((f: any) =>
						(f.name || f.fieldName) === selectedFieldName
					);

					if (!field) {
						return [{
							name: 'Field not found - enter manually',
							value: '',
						}];
					}

					const displayName = field.displayName || field.label || selectedFieldName;
					const options: INodePropertyOptions[] = [];

					// Load Picklist values
					if (selectedFieldType === 'be84ccec-c7c9-47dd-81fc-91cc92c8fcd9') {
						try {
							const fieldDetailsResponse = await fireberryApiRequest.call(
								this,
								'GET',
								`/metadata/records/${objectType}/fields/${selectedFieldName}`,
								{},
							);

							const picklistOptions = fieldDetailsResponse[0]?.data?.picklistOptions ||
												   fieldDetailsResponse.data?.picklistOptions || [];

							picklistOptions.forEach((option: any) => {
								options.push({
									name: option.label || option.text,
									value: option.text || option.label,
								});
							});
						} catch (error) {
							console.error('Error loading picklist values:', error);
						}
					}
					// Load Lookup values
					else if (selectedFieldType === 'a8fcdf65-91bc-46fd-82f6-1234758345a1') {
						try {
							const fieldDetailsResponse = await fireberryApiRequest.call(
								this,
								'GET',
								`/metadata/records/${objectType}/fields/${selectedFieldName}`,
								{},
							);

							const fieldObjectType = fieldDetailsResponse[0]?.data?.fieldObjectType ||
												   fieldDetailsResponse.data?.fieldObjectType;

							if (fieldObjectType) {
								const recordsResponse = await fireberryApiRequest.call(
									this,
									'POST',
									'/api/query',
									{
										objecttype: parseInt(fieldObjectType, 10),
										fields: '*',
										page_size: 50,
										page_number: 1,
									},
								);

								const records = recordsResponse.value || recordsResponse.data || [];
								const primaryField = recordsResponse.primaryField || 'name';
								const primaryKey = recordsResponse.primaryKey || 'id';

								records.forEach((record: any) => {
									const recordId = record[primaryKey] || record.id;
									const recordName = record[primaryField] || recordId;

									options.push({
										name: `${recordName}`,
										value: recordId,
										description: `ID: ${recordId}`,
									});
								});
							}
						} catch (error) {
							console.error('Error loading lookup values:', error);
						}
					}

					if (options.length === 0) {
						return [{
							name: `No dropdown values for ${displayName} - enter manually`,
							value: '',
						}];
					}

					return options;
				} catch (error) {
					console.error('Error loading query field values:', error);
					return [{
						name: 'Error loading values - enter manually',
						value: '',
					}];
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
							}
						} catch (error) {
							// Silently fail - field will default to string input
						}
					});

					await Promise.all(lookupDetailsPromises);

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
							let displayName = field.displayName || field.label || fieldName;
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
									// Use options type with loadOptionsMethod
									type = 'options';

									try {
										const queryBody = {
											objecttype: parseInt(fieldObjectType, 10),
											fields: '*',
											page_size: 100,
											page_number: 1,
										};
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

										if (Array.isArray(records)) {
											options = records.map((record: any) => ({
												name: record[primaryField] || record.name || record.fullname || record.title || `Record ${record[primaryKey]}`,
												value: String(record[primaryKey] || record.id),
											}));
										}
									} catch (error) {
										// Silently fail - field will default to string input
										options = [];
									}
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
							};

							// Add options for picklist/lookup fields
							if (options && options.length > 0 && type === 'options') {
								// Both Picklist and Lookup use direct options in resourceMapper
								fieldDef.options = options;
								// Don't use searchable list for better compatibility
								fieldDef.removeListSearch = true;
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
					const queryMode = this.getNodeParameter('queryMode', i, 'simple') as string;
					let query = '';

					// Build query based on mode
					if (queryMode === 'simple') {
						const queryRules = this.getNodeParameter('queryRules', i, {}) as any;
						const rules = queryRules.rules || [];

						if (rules.length > 0) {
							const queryParts: string[] = [];

							for (let j = 0; j < rules.length; j++) {
								const rule = rules[j];
								// Extract field name from "fieldName|fieldType" format
								const fieldWithType = rule.field;
								const field = fieldWithType ? fieldWithType.split('|')[0] : '';
								const operator = rule.operator;
								const value = rule.value;

								let queryPart = '';

								if (operator === 'null') {
									queryPart = `${field} = null`;
								} else if (operator === 'notnull') {
									queryPart = `${field} != null`;
								} else if (operator === 'startswith' || operator === 'endswith' || operator === 'contains') {
									// String functions
									queryPart = `${operator}(${field}, '${value}')`;
								} else {
									// Standard operators: =, !=, >, <, >=, <=
									queryPart = `${field} ${operator} '${value}'`;
								}

								queryParts.push(queryPart);

								// Add combine operation if not the last rule
								if (j < rules.length - 1) {
									queryParts.push(rule.combineOperation || 'and');
								}
							}

							query = queryParts.join(' ');
						}
					} else {
						// Advanced mode - use custom query
						query = this.getNodeParameter('query', i, '') as string;
					}

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
