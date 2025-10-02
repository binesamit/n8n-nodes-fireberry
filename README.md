# @bines/n8n-nodes-fireberry

This is an n8n community node for [Fireberry CRM](https://www.fireberry.com/) (formerly Powerlink).

[Fireberry](https://www.fireberry.com/) is an Israeli CRM platform designed for medium-sized businesses.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## ✨ Version 2.0 - Fully Dynamic Node

**v2.0** introduces a complete architectural overhaul with **dynamic object type support**:

- 🎯 **Universal Node** - One node for ALL Fireberry objects (not just Account, Contact, Case, Task)
- 🔄 **Dynamic Object Discovery** - Automatically loads all available objects from your Fireberry account
- 📝 **Dynamic Field Loading** - Fields are loaded based on selected object type
- 🚀 **Zero Maintenance** - No code changes needed when Fireberry schema changes
- 🌐 **Future-Proof** - Works with new objects and fields without updates

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Community Nodes (Recommended)

1. Go to **Settings > Community Nodes**.
2. Select **Install**.
3. Enter `@bines/n8n-nodes-fireberry` in **Enter npm package name**.
4. Agree to the risks and select **Install**.

### Manual Installation

To use this node, install it locally:

```bash
npm install @bines/n8n-nodes-fireberry
```

## Credentials

You need a Fireberry account to use this node.

### Get your API Token:

1. Log in to your Fireberry account
2. Click the gear icon (Settings) → **Integration**
3. Go to **API Forms**
4. Copy your **Token ID**

## How It Works

### 1. Select Object Type
Choose from **all available objects** in your Fireberry account:
- לקוח (Account/Customer)
- איש קשר (Contact)
- קריאת שירות (Case)
- משימה (Task)
- הזמנה (Order)
- הצעת מחיר (Quote)
- **...and any other objects in your Fireberry account!**

### 2. Select Operation
- **Create** - Create a new record
- **Update** - Update an existing record
- **Delete** - Delete a record
- **Get** - Retrieve a single record by ID
- **Query** - Execute advanced queries with filters

### 3. Configure Fields
Fields are loaded dynamically based on your selected object type. The node discovers:
- Standard fields
- Custom fields
- Field types (string, number, date, email, phone, picklist, etc.)
- Required vs optional fields

## Supported Operations

All operations work with **any object type** in your Fireberry account:

### Create
Create a new record with any fields available for the selected object type.

### Update
Update an existing record by ID. Specify only the fields you want to change.

### Delete
Delete a record by its ID.

### Get
Retrieve a single record by its ID.

### Query
Execute advanced queries with OData-style filters, pagination, and sorting.

## Query Syntax

Fireberry supports powerful query operators:

- `eq` - Equal
- `ne` - Not equal
- `gt` - Greater than
- `lt` - Less than
- `ge` - Greater than or equal
- `le` - Less than or equal
- `and` - Logical AND
- `or` - Logical OR
- `null` - Check for NULL
- `ne null` - Check for NOT NULL

### Query Examples:

```
accountname eq 'חברת דוגמה'

idnumber eq '123456789' and telephone1 ne null

emailaddress1 ne null or telephone1 ne null

accountname startswith 'א'
```

### Query Features:
- **Return All** - Automatically paginate through all results
- **Limit** - Specify maximum number of results
- **Page Size** - Control results per page
- **Sorting** - Sort by any field (ascending/descending)
- **Field Selection** - Choose specific fields to return or use `*` for all

## Supported Field Types

The node automatically handles **11 different field types**:

1. **String** - Text fields
2. **Number** - Numeric values
3. **Phone** - Phone numbers
4. **Email** - Email addresses
5. **URL** - Website URLs
6. **Textarea** - Long text fields
7. **Date** - Date fields
8. **DateTime** - Date and time fields
9. **Picklist** - Dropdown selections
10. **Lookup/Reference** - Related records
11. **File/Document** - File attachments

## Migrating from v1.x

If you're upgrading from v1.x, note these **breaking changes**:

### What Changed:
- **Resource Selection Removed** - Instead of selecting "Account", "Contact", etc., you now select from all available objects via the "Object Type" dropdown
- **Dynamic Fields** - Fields are no longer hardcoded; they load dynamically from your Fireberry account
- **Object Type ID** - You now select objects by their numeric ID (loaded automatically)

### Migration Steps:
1. Update to v2.0.0
2. Open existing workflows
3. Re-select object types from the new dropdown
4. Re-map fields (field names remain the same)

### Benefits:
- Access to **all** Fireberry objects (not just 4)
- No need to update npm package when Fireberry adds new fields
- Custom fields automatically available

## Examples

### Example 1: Create a Customer
```
Object Type: לקוח (Account)
Operation: Create
Fields:
  - accountname: "חברת הדוגמה בע״מ"
  - idnumber: "123456789"
  - telephone1: "03-1234567"
  - emailaddress1: "info@example.co.il"
```

### Example 2: Query Contacts
```
Object Type: איש קשר (Contact)
Operation: Query
Return All: Yes
Query: emailaddress1 ne null and mobilephone1 ne null
Fields: firstname,lastname,emailaddress1,mobilephone1
Sort By: lastname
Sort Type: Ascending
```

### Example 3: Update Order Status
```
Object Type: הזמנה (Order)
Operation: Update
Record ID: {{$json["orderid"]}}
Update Fields:
  - status: "completed"
  - notes: "Order processed successfully"
```

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [Fireberry API Documentation](https://developers.fireberry.com/)
* [Fireberry Support](https://www.fireberry.com/articles/getting-started-with-rest-api)

## Changelog

### v2.0.0 (2025-10-02)
- 🚀 **BREAKING CHANGE**: Complete architectural restructure
- ✨ Dynamic object type selection from Fireberry metadata API
- ✨ Support for ALL Fireberry objects (not just 4 predefined types)
- ✨ Dynamic field loading based on selected object
- ✨ Support for 11 different field types
- 🗑️ Removed static description files
- 🗑️ Removed resource-based navigation

### v1.1.1 (2025-10-01)
- ✨ Added File/Document field type support

### v1.1.0 (2025-10-01)
- ✨ Added dynamic metadata loading
- ✨ Added field type mapping (10 types)

### v1.0.1 (2025-10-01)
- 🐛 Fixed field names (mobilephone → mobilephone1)
- 🐛 Fixed field structure (moved common fields outside collection)

### v1.0.0 (2025-10-01)
- 🎉 Initial release
- ✅ Support for Account, Contact, Case, Task
- ✅ CRUD operations
- ✅ Advanced Query with pagination

## License

[MIT](LICENSE)
