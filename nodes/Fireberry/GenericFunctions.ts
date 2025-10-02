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
 * Load available fields for an object type dynamically
 * This function fetches the metadata/schema from Fireberry API
 */
export async function loadObjectFields(
	this: ILoadOptionsFunctions,
	objectType: string,
): Promise<INodePropertyOptions[]> {
	try {
		const objectTypeId = mapObjectTypeToNumber(objectType);

		// Query to get a sample record with all fields
		const response = await fireberryApiRequest.call(
			this,
			'POST',
			'/api/query',
			{
				objecttype: objectTypeId,
				page_size: 1,
				page_number: 1,
				fields: '*',
			},
		);

		const sampleRecord = response.value?.[0] || response.data?.[0];

		if (!sampleRecord) {
			// Return common fields if no records exist
			return getDefaultFieldsForObjectType(objectType);
		}

		// Convert record keys to field options
		const fields: INodePropertyOptions[] = Object.keys(sampleRecord)
			.filter(key => !key.startsWith('_')) // Filter out internal fields
			.map(key => ({
				name: formatFieldName(key),
				value: key,
			}))
			.sort((a, b) => a.name.localeCompare(b.name));

		return fields;
	} catch (error) {
		// Fallback to default fields if API call fails
		return getDefaultFieldsForObjectType(objectType);
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
