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
	accountOperations,
	accountFields
} from './descriptions/AccountDescription';
import {
	contactOperations,
	contactFields
} from './descriptions/ContactDescription';
import {
	caseOperations,
	caseFields
} from './descriptions/CaseDescription';
import {
	taskOperations,
	taskFields
} from './descriptions/TaskDescription';
import {
	queryOperations,
	queryFields
} from './descriptions/QueryDescription';

import {
	fireberryApiRequest,
	fireberryApiRequestAllItems,
	mapObjectTypeToNumber,
	validateQuery,
	loadObjectFields,
} from './GenericFunctions';

export class Fireberry implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Fireberry',
		name: 'fireberry',
		icon: 'file:fireberry.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Fireberry CRM (formerly Powerlink)',
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
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Account',
						value: 'account',
						description: 'Work with accounts (companies)',
					},
					{
						name: 'Contact',
						value: 'contact',
						description: 'Work with contacts (people)',
					},
					{
						name: 'Case',
						value: 'case',
						description: 'Work with cases (tickets/support)',
					},
					{
						name: 'Task',
						value: 'task',
						description: 'Work with tasks',
					},
					{
						name: 'Query',
						value: 'query',
						description: 'Advanced query operations',
					},
				],
				default: 'account',
			},
			...accountOperations,
			...accountFields,
			...contactOperations,
			...contactFields,
			...caseOperations,
			...caseFields,
			...taskOperations,
			...taskFields,
			...queryOperations,
			...queryFields,
		],
	};

	methods = {
		loadOptions: {
			// Load dynamic fields for Account
			async getAccountFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return await loadObjectFields.call(this, 'account');
			},
			// Load dynamic fields for Contact
			async getContactFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return await loadObjectFields.call(this, 'contact');
			},
			// Load dynamic fields for Case
			async getCaseFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return await loadObjectFields.call(this, 'case');
			},
			// Load dynamic fields for Task
			async getTaskFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return await loadObjectFields.call(this, 'task');
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData;

				// Use generic handler for all CRUD resources
				if (['account', 'contact', 'case', 'task'].includes(resource)) {
					responseData = await handleResourceOperation.call(this, resource, operation, i);
				} else if (resource === 'query') {
					responseData = await handleQueryOperations.call(this, operation, i);
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

/**
 * Generic handler for all resource operations (Account, Contact, Case, Task)
 * This eliminates code duplication across resources
 */
async function handleResourceOperation(
	this: IExecuteFunctions,
	resource: string,
	operation: string,
	itemIndex: number,
): Promise<any> {
	const objectTypeId = mapObjectTypeToNumber(resource);

	if (operation === 'create') {
		// Get required field based on resource type
		const requiredFieldMap: { [key: string]: string } = {
			account: 'accountname',
			contact: 'firstname',
			case: 'title',
			task: 'subject',
		};

		const requiredField = requiredFieldMap[resource];
		const body: any = {
			[requiredField]: this.getNodeParameter(requiredField, itemIndex),
		};

		// Add all optional fields that are not required
		const optionalFields = [
			'lastname', 'emailaddress1', 'mobilephone1', 'telephone1', 'jobtitle', 'accountid',
			'telephone2', 'telephone3', 'idnumber', 'websiteurl', 'billingcity', 'billingstreet',
			'billingpostalcode', 'fax1', 'firstname', 'revenue', 'numberofemployees',
			'description', 'prioritycode', 'statecode', 'customerid',
			'scheduledstart', 'scheduledend', 'regardingobjectid'
		];

		for (const field of optionalFields) {
			try {
				const value = this.getNodeParameter(field, itemIndex, undefined);
				if (value !== undefined && value !== '') {
					body[field] = value;
				}
			} catch (error) {
				// Field doesn't exist for this resource, skip it
			}
		}

		// Add additional fields
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as any;
		Object.assign(body, additionalFields);

		return await fireberryApiRequest.call(
			this,
			'POST',
			`/api/record/${objectTypeId}`,
			body,
		);

	} else if (operation === 'update') {
		const recordId = this.getNodeParameter('recordId', itemIndex) as string;
		const updateFields = this.getNodeParameter('updateFields', itemIndex, {}) as any;

		if (Object.keys(updateFields).length === 0) {
			throw new NodeOperationError(
				this.getNode(),
				'Please specify at least one field to update',
				{ itemIndex },
			);
		}

		return await fireberryApiRequest.call(
			this,
			'PUT',
			`/api/record/${objectTypeId}/${recordId}`,
			updateFields,
		);

	} else if (operation === 'delete') {
		const recordId = this.getNodeParameter('recordId', itemIndex) as string;

		return await fireberryApiRequest.call(
			this,
			'DELETE',
			`/api/record/${objectTypeId}/${recordId}`,
		);

	} else if (operation === 'get') {
		const recordId = this.getNodeParameter('recordId', itemIndex) as string;

		return await fireberryApiRequest.call(
			this,
			'GET',
			`/api/record/${objectTypeId}/${recordId}`,
		);
	}

	throw new NodeOperationError(
		this.getNode(),
		`Unknown operation: ${operation}`,
		{ itemIndex },
	);
}

async function handleQueryOperations(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<any> {
	const objectType = this.getNodeParameter('objectType', itemIndex) as string;
	const objectTypeId = mapObjectTypeToNumber(objectType);
	const query = this.getNodeParameter('query', itemIndex, '') as string;
	const fields = this.getNodeParameter('fields', itemIndex, '*') as string;
	const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
	const sortBy = this.getNodeParameter('options.sortBy', itemIndex, '') as string;
	const sortType = this.getNodeParameter('options.sortType', itemIndex, 'desc') as string;

	// Validate query syntax
	validateQuery(query);

	const body: any = {
		objecttype: objectTypeId,
		fields,
		...(query && { query }),
		...(sortBy && { sort_by: sortBy }),
		sort_type: sortType,
	};

	if (returnAll) {
		// Use automatic pagination
		const limit = this.getNodeParameter('limit', itemIndex, 0) as number;
		return await fireberryApiRequestAllItems.call(
			this,
			'/api/query',
			body,
			limit || undefined,
		);
	} else {
		// Manual pagination
		const pageSize = this.getNodeParameter('pageSize', itemIndex, 50) as number;
		const pageNumber = this.getNodeParameter('pageNumber', itemIndex, 1) as number;

		body.page_size = pageSize;
		body.page_number = pageNumber;

		const response = await fireberryApiRequest.call(
			this,
			'POST',
			'/api/query',
			body,
		);

		return response.value || response.data || response;
	}
}
