import {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IWebhookFunctions,
	IHttpRequestMethods,
	IRequestOptions,
	NodeApiError,
	INodePropertyOptions,
} from 'n8n-workflow';

/**
 * Make an API request to Fireberry
 */
export async function fireberryApiRequest(
	this: IExecuteFunctions | IWebhookFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: any = {},
	qs: any = {},
): Promise<any> {
	const credentials = await this.getCredentials('fireberryApi');

	const options: IRequestOptions = {
		method,
		body,
		qs,
		url: `${credentials.baseUrl}${endpoint}`,
		headers: {
			'Content-Type': 'application/json',
			'tokenid': credentials.apiToken as string,
		},
		json: true,
	};

	try {
		return await this.helpers.request(options);
	} catch (error: any) {
		// Enhanced error handling with API response details
		if (error.response?.body) {
			const errorBody = error.response.body;
			const errorMessage = errorBody.message || errorBody.error || JSON.stringify(errorBody);
			throw new NodeApiError(this.getNode(), error as any, {
				message: `Fireberry API Error: ${errorMessage}`,
				description: `Status: ${error.statusCode}`,
			});
		}
		throw new NodeApiError(this.getNode(), error as any);
	}
}

/**
 * Make an API request with automatic pagination
 */
export async function fireberryApiRequestAllItems(
	this: IExecuteFunctions,
	endpoint: string,
	body: any = {},
	maxResults?: number,
): Promise<any[]> {
	const returnData: any[] = [];
	let pageNumber = 1;
	const pageSize = 100; // Maximum page size

	body.page_size = pageSize;

	do {
		body.page_number = pageNumber;

		const responseData = await fireberryApiRequest.call(
			this,
			'POST',
			endpoint,
			body,
		);

		const items = responseData.value || responseData.data || [];
		returnData.push(...items);

		// Check if we've reached the limit or if there are no more items
		if (maxResults && returnData.length >= maxResults) {
			return returnData.slice(0, maxResults);
		}

		if (items.length < pageSize) {
			// No more pages
			break;
		}

		pageNumber++;
	} while (true);

	return returnData;
}

/**
 * Object type mapping constants
 */
export const OBJECT_TYPE_MAP: { [key: string]: number } = {
	account: 1,
	contact: 2,
	case: 5,
	task: 10,
};

/**
 * Fireberry field type mapping (systemFieldTypeId to n8n field type)
 */
export const FIELD_TYPE_MAP: { [key: string]: { n8nType: string; description: string } } = {
	'3f62f67a-1cee-403a-bec6-aa02a9804edb': { n8nType: 'string', description: 'Phone' },
	'a1e7ed6f-5083-477b-b44c-9943a6181359': { n8nType: 'string', description: 'String' },
	'6a34bfe3-fece-4da1-9136-a7b1e5ae3319': { n8nType: 'number', description: 'Number' },
	'b4919f2e-2996-48e4-a03c-ba39fb64386c': { n8nType: 'options', description: 'Picklist' },
	'ce972d02-5013-46d4-9d1d-f09df1ac346a': { n8nType: 'dateTime', description: 'DateTime' },
	'c713d2f7-8fa9-43c3-8062-f07486eaf567': { n8nType: 'string', description: 'Email' },
	'c820d32f-44df-4c2a-9c1e-18734e864fd5': { n8nType: 'string', description: 'URL' },
	'80108f9d-1e75-40fa-9fa9-02be4ddc1da1': { n8nType: 'string', description: 'Textarea' },
	'83bf530c-e04c-462b-9ffc-a46f750fc072': { n8nType: 'dateTime', description: 'Date' },
	'a8fcdf65-91bc-46fd-82f6-1234758345a1': { n8nType: 'string', description: 'Lookup/Reference' },
};

/**
 * Map resource name to Fireberry object type number
 */
export function mapObjectTypeToNumber(objectType: string): number {
	const objectId = OBJECT_TYPE_MAP[objectType.toLowerCase()];

	if (!objectId) {
		throw new Error(`Unknown object type: ${objectType}. Supported types: ${Object.keys(OBJECT_TYPE_MAP).join(', ')}`);
	}

	return objectId;
}

/**
 * Validate query syntax
 */
export function validateQuery(query: string): boolean {
	if (!query || query.trim() === '') {
		return true; // Empty query is valid
	}

	const openParens = (query.match(/\(/g) || []).length;
	const closeParens = (query.match(/\)/g) || []).length;

	if (openParens !== closeParens) {
		throw new Error('Mismatched parentheses in query');
	}

	return true;
}

/**
 * Load available fields for an object type dynamically from metadata API
 */
export async function loadObjectFields(
	this: ILoadOptionsFunctions,
	objectType: string,
): Promise<INodePropertyOptions[]> {
	try {
		const fieldsData = await getObjectFieldsFromMetadata.call(this, objectType);

		if (!fieldsData || fieldsData.length === 0) {
			return getDefaultFieldsForObjectType(objectType);
		}

		// Convert metadata fields to options
		const fields: INodePropertyOptions[] = fieldsData
			.filter((field: any) => {
				// Filter out system/internal fields
				const fname = field.fieldName?.toLowerCase() || '';
				return !fname.startsWith('_') &&
				       !fname.includes('deleted') &&
				       !fname.includes('created') &&
				       !fname.includes('modified');
			})
			.map((field: any) => ({
				name: field.label || formatFieldName(field.fieldName),
				value: field.fieldName,
			}))
			.sort((a, b) => a.name.localeCompare(b.name));

		return fields;
	} catch (error) {
		// Fallback to default fields if API call fails
		return getDefaultFieldsForObjectType(objectType);
	}
}

/**
 * Get all fields for an object from Fireberry metadata API
 */
export async function getObjectFieldsFromMetadata(
	this: ILoadOptionsFunctions,
	objectType: string,
): Promise<any[]> {
	try {
		const objectTypeId = mapObjectTypeToNumber(objectType);

		const response = await fireberryApiRequest.call(
			this,
			'GET',
			`/metadata/records/${objectTypeId}/fields`,
			{},
		);

		// Response structure: [{ success: true, data: [...] }]
		const data = response[0]?.data || response.data || [];
		return data;
	} catch (error) {
		console.error('Error fetching metadata fields:', error);
		return [];
	}
}

/**
 * Get picklist values for a specific field
 */
export async function getPicklistValues(
	this: ILoadOptionsFunctions,
	objectType: string,
	fieldName: string,
): Promise<INodePropertyOptions[]> {
	try {
		const objectTypeId = mapObjectTypeToNumber(objectType);

		const response = await fireberryApiRequest.call(
			this,
			'GET',
			`/metadata/records/${objectTypeId}/fields/${fieldName}/values`,
			{},
		);

		// Response structure: [{ success: true, data: { values: [...] } }]
		const values = response[0]?.data?.values || response.data?.values || [];

		return values.map((v: any) => ({
			name: v.name,
			value: v.value,
		}));
	} catch (error) {
		console.error('Error fetching picklist values:', error);
		return [];
	}
}

/**
 * Format field name for display
 */
function formatFieldName(fieldName: string): string {
	// Convert camelCase or snake_case to Title Case
	return fieldName
		.replace(/([A-Z])/g, ' $1')
		.replace(/_/g, ' ')
		.trim()
		.split(' ')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ');
}

/**
 * Get default fields when API metadata is unavailable
 */
function getDefaultFieldsForObjectType(objectType: string): INodePropertyOptions[] {
	const defaultFields: { [key: string]: INodePropertyOptions[] } = {
		account: [
			{ name: 'Account ID', value: 'accountid' },
			{ name: 'Account Name', value: 'accountname' },
			{ name: 'Phone', value: 'telephone1' },
			{ name: 'Email', value: 'emailaddress1' },
			{ name: 'ID Number', value: 'idnumber' },
			{ name: 'City', value: 'billingcity' },
			{ name: 'Street', value: 'billingstreet' },
			{ name: 'Website', value: 'websiteurl' },
		],
		contact: [
			{ name: 'Contact ID', value: 'contactid' },
			{ name: 'First Name', value: 'firstname' },
			{ name: 'Last Name', value: 'lastname' },
			{ name: 'Email', value: 'emailaddress1' },
			{ name: 'Mobile Phone', value: 'mobilephone' },
			{ name: 'Phone', value: 'telephone1' },
		],
		case: [
			{ name: 'Case ID', value: 'incidentid' },
			{ name: 'Title', value: 'title' },
			{ name: 'Description', value: 'description' },
			{ name: 'Priority', value: 'prioritycode' },
			{ name: 'Status', value: 'statecode' },
		],
		task: [
			{ name: 'Task ID', value: 'activityid' },
			{ name: 'Subject', value: 'subject' },
			{ name: 'Description', value: 'description' },
			{ name: 'Start Date', value: 'scheduledstart' },
			{ name: 'End Date', value: 'scheduledend' },
		],
	};

	return defaultFields[objectType] || [];
}
