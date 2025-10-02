import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class FireberryApi implements ICredentialType {
	name = 'fireberryApi';
	displayName = 'Fireberry API';
	documentationUrl = 'https://developers.fireberry.com/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The API token for your Fireberry account. Find it in Settings → Integration → API Forms → My Token',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.powerlink.co.il',
			description: 'Base URL for the Fireberry API (default: https://api.powerlink.co.il). Change only if using a different region or custom domain.',
			placeholder: 'https://api.powerlink.co.il',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				tokenid: '={{$credentials.apiToken}}',
				'Content-Type': 'application/json',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/api/query',
			method: 'POST',
			body: {
				objecttype: 1,
				page_size: 1,
				page_number: 1,
				fields: 'accountid',
			},
		},
	};
}
