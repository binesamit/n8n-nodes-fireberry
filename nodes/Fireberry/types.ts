export interface FireberryAccount {
	accountid?: string;
	accountname: string;
	telephone1?: string;
	emailaddress1?: string;
	idnumber?: string;
	billingcity?: string;
	billingstreet?: string;
	billingpostalcode?: string;
	websiteurl?: string;
	[key: string]: any;
}

export interface FireberryContact {
	contactid?: string;
	firstname?: string;
	lastname?: string;
	emailaddress1?: string;
	mobilephone?: string;
	telephone1?: string;
	parentcustomerid?: string;
	[key: string]: any;
}

export interface FireberryCase {
	incidentid?: string;
	title: string;
	description?: string;
	customerid?: string;
	prioritycode?: number;
	statecode?: number;
	[key: string]: any;
}

export interface FireberryTask {
	activityid?: string;
	subject: string;
	description?: string;
	scheduledstart?: string;
	scheduledend?: string;
	regardingobjectid?: string;
	[key: string]: any;
}

export interface FireberryQueryRequest {
	objecttype: number;
	page_size: number;
	page_number: number;
	fields: string;
	query?: string;
	sort_by?: string;
	sort_type?: 'asc' | 'desc';
}

export interface FireberryQueryResponse {
	data: any[];
	total_count: number;
	page_number: number;
	page_size: number;
}
