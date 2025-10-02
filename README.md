# @bines/n8n-nodes-fireberry

This is an n8n community node for [Fireberry CRM](https://www.fireberry.com/) (formerly Powerlink).

[Fireberry](https://www.fireberry.com/) is an Israeli CRM platform designed for medium-sized businesses.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## ✨ Version 3.0 - Full Dynamic Support with ResourceMapper

**v3.0** introduces advanced features with **full dynamic field support** including lookup fields:

- 🎯 **Universal Node** - One node for ALL Fireberry objects (not just Account, Contact, Case, Task)
- 🔄 **Dynamic Object Discovery** - Automatically loads all available objects from your Fireberry account
- 📝 **Smart Field Loading** - Fields are loaded dynamically with proper types
- 🔗 **Dynamic Lookup Fields** - Dropdown selection for related records (Contacts, Users, Accounts, etc.)
- 📋 **Dynamic Picklist Fields** - Dropdown selection for status, categories, and other picklist values
- 🚀 **ResourceMapper Integration** - Modern n8n field mapping with auto-complete and field matching
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

## Features

### 🎯 Dynamic Object Type Support
Choose from **all available objects** in your Fireberry account:
- לקוח (Account/Customer)
- איש קשר (Contact)
- קריאת שירות (Case)
- משימה (Task)
- משתמש (User)
- קמפיין (Campaign)
- הזמנה (Order)
- הצעת מחיר (Quote)
- **...and any other objects in your Fireberry account!**

### 📝 Smart Field Types

The node automatically handles **all field types** with appropriate UI controls:

1. **String** - Text input fields
2. **Number** - Numeric input with validation
3. **Phone** - Phone number fields
4. **Email** - Email address fields with validation
5. **URL** - Website URL fields
6. **Textarea** - Long text/notes fields
7. **Date** - Date picker
8. **DateTime** - Date and time picker
9. **Picklist** - 🔥 **Dropdown with values from Fireberry**
10. **Lookup/Reference** - 🔥 **Dropdown with related records (Users, Contacts, Accounts, etc.)**
11. **File/Document** - File attachments

### 🔗 Dynamic Lookup Fields (NEW!)

Lookup fields automatically display available records in a dropdown:
- **Primary Contact** (primarycontactid) → Shows all Contacts
- **Account Owner** (ownerid) → Shows all Users
- **Parent Account** (parentaccountid) → Shows all Accounts
- **Campaign** (campaignid) → Shows all Campaigns
- **Any custom lookup field** → Automatically loads related records!

Example:
```
When creating an Account:
- Select "איש קשר עיקרי" (Primary Contact)
- Choose from dropdown: "בנימין זאב", "נוי מור יוסף", "Amit Bines", etc.
- The correct Contact ID is automatically used
```

### 📋 Dynamic Picklist Fields

Picklist fields automatically display available options:
- **Status** → Shows: חדש, בתהליך, לקוח פעיל, etc.
- **Category** → Shows your custom categories
- **Priority** → Shows priority levels
- **Any custom picklist** → Automatically loads values!

## Supported Operations

All operations work with **any object type** in your Fireberry account:

### Create
Create a new record with ResourceMapper for easy field mapping:
- Auto-complete field names
- Proper field type validation
- Dynamic dropdowns for picklists and lookups
- Support for custom fields

### Update
Update an existing record by ID:
- Specify only the fields you want to change
- Same dynamic field support as Create
- ResourceMapper for easy updates

### Delete
Delete a record by its ID.

### Get
Retrieve a single record by its ID with all fields.

### Query
Execute advanced queries with **two modes**:

#### 🎯 Simple Query Builder (NEW in v3.5!)
Visual query builder similar to Make/Integromat:
- **Field Selection** - Dropdown of all available fields from your Object Type
- **Operator Selection** - Choose from: Equals, Not Equals, Greater Than, Less Than, Greater or Equal, Less or Equal, Is Null, Is Not Null, Starts With, Ends With, Contains
- **Value Input** - Enter the value to compare
- **AND/OR Logic** - Combine multiple rules with AND or OR
- **Auto-Generated Query** - Query string is built automatically

#### ⚙️ Advanced (Custom Query)
Write custom OData query strings manually for complex scenarios:
- **Return All** - Automatically paginate through all results
- **Limit** - Specify maximum number of results
- **Page Size** - Control results per page
- **Sorting** - Sort by any field (ascending/descending)
- **Field Selection** - Choose specific fields or use `*` for all

## Query Modes

### Simple Query Builder

Perfect for common filtering scenarios. Build queries visually:

**Example 1: Find active customers with email**
```
Rule 1: statecode = 0 (Combine with AND)
Rule 2: emailaddress1 Is Not Null
```
Result: `statecode eq '0' and emailaddress1 ne null`

**Example 2: Find accounts starting with 'א' OR 'מ'**
```
Rule 1: accountname Starts With 'א' (Combine with OR)
Rule 2: accountname Starts With 'מ'
```
Result: `startswith(accountname, 'א') or startswith(accountname, 'מ')`

### Advanced Query Syntax

Fireberry supports powerful OData query operators:

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
- `startswith` - String starts with
- `endswith` - String ends with
- `contains` - String contains

### Advanced Query Examples:

```
accountname eq 'חברת דוגמה'

idnumber eq '123456789' and telephone1 ne null

emailaddress1 ne null or telephone1 ne null

accountname startswith 'א'

createdon gt '2025-01-01' and statuscode eq 1
```

## Examples

### Example 1: Create a Customer with Contact
```
Object Type: לקוח (Account)
Operation: Create
Fields:
  - accountname: "חברת הדוגמה בע״מ"
  - idnumber: "123456789"
  - telephone1: "03-1234567"
  - emailaddress1: "info@example.co.il"
  - primarycontactid: [Select from dropdown: "בנימין זאב"]
  - ownerid: [Select from dropdown: "Amit Bines"]
```

### Example 2: Query Active Contacts (Simple Query Builder)
```
Object Type: איש קשר (Contact)
Operation: Query
Query Mode: Simple Query Builder
Query Rules:
  Rule 1:
    - Field: emailaddress1
    - Operator: Is Not Null
    - Combine With: AND
  Rule 2:
    - Field: statecode
    - Operator: Equals (=)
    - Value: 0
Return All: Yes
Fields: firstname,lastname,emailaddress1,mobilephone1,accountname
Sort By: lastname
Sort Type: Ascending
```

**Alternative using Advanced mode:**
```
Query Mode: Advanced (Custom Query)
Query: emailaddress1 ne null and statecode eq 0
```

### Example 3: Update Case Status
```
Object Type: קריאת שירות (Case)
Operation: Update
Record ID: {{$json["caseid"]}}
Update Fields:
  - statuscode: [Select from dropdown: "פתור"]
  - resolutionnotes: "Issue resolved successfully"
```

### Example 4: Create Task Assigned to User
```
Object Type: משימה (Task)
Operation: Create
Fields:
  - subject: "Follow up with customer"
  - description: "Call regarding quote"
  - ownerid: [Select from dropdown: "Amit Bines"]
  - accountid: [Select from dropdown: "חברת הדוגמה"]
  - duedate: "2025-10-10"
```

## Technical Details

### Field Type Detection

The node uses Fireberry's metadata API to determine field types:

```typescript
GUID → Field Type
b4919f2e-2996-48e4-a03c-ba39fb64386c → Picklist (Dropdown)
a8fcdf65-91bc-46fd-82f6-1234758345a1 → Lookup (Related Record)
6a34bfe3-fece-4da1-9136-a7b1e5ae3319 → Number
ce972d02-5013-46d4-9d1d-f09df1ac346a → DateTime
... and more
```

### Lookup Field Loading

For each lookup field, the node:
1. Fetches field metadata to determine target Object Type
2. Queries target Object Type for all records
3. Uses PrimaryKey and PrimaryField from API response
4. Displays records in dropdown with proper names and IDs

Example: For `primarycontactid` (Primary Contact field):
- Detects it's a lookup to Object Type 2 (Contacts)
- Queries all Contacts
- Displays: "בנימין זאב (fc7af7af-...)", "Amit Bines (682a84b8-...)"
- Uses correct contactid when creating/updating

## Migrating from v2.x

### What's New in v3.0:
- ✅ ResourceMapper for better field mapping UI
- ✅ Dynamic dropdown support for Picklist fields
- ✅ Dynamic dropdown support for Lookup fields
- ✅ Improved field type detection
- ✅ Better error handling

### Migration is Seamless:
- All v2.x workflows continue to work
- Field names remain the same
- New features available immediately for new nodes

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [Fireberry API Documentation](https://developers.fireberry.com/)
* [Fireberry Support](https://www.fireberry.com/articles/getting-started-with-rest-api)
* [GitHub Repository](https://github.com/binesamit/n8n-nodes-fireberry)

## Changelog

### v3.5.4 (2025-10-02)
- 🐛 **Critical Fix**: Fixed operator dropdown triggering Expression mode (again!)
- 🐛 Fixed Value dropdown not loading options
- ✨ Value dropdown now shows all Picklist and Lookup values with field labels
- ✨ Added "[Field Name]" prefix to help identify which field each value belongs to
- ✨ Added "Enter manually" option for text/number fields
- 🎨 Improved operator mapping (equal→=, notEqual→!=, etc.)

### v3.5.3 (2025-10-02)
- 🎉 **Major Feature**: Dynamic Value dropdown in Query Builder!
- ✨ Value field automatically detects Picklist and Lookup fields
- ✨ Picklist fields show dropdown with options (e.g., "פתוח", "סגור")
- ✨ Lookup fields show dropdown with related records (Contacts, Accounts, Users)
- ✨ Smart field type detection using metadata
- 🎨 Same UX as Create/Update operations!

### v3.5.1 (2025-10-02)
- 🐛 **Critical Fix**: Fixed query operators to use Fireberry's correct syntax (`=`, `!=`, `>`, `<` instead of `eq`, `ne`, `gt`, `lt`)
- 🐛 Fixed "One or more operators are invalid" error in Simple Query Builder
- ✨ Added helpful description for lookup field values in queries
- 📝 Improved placeholder text for query values

### v3.5.0 (2025-10-02)
- 🎉 **Major Feature**: Visual Query Builder!
- ✨ Simple Query Builder mode - Build queries visually like Make/Integromat
- ✨ Field dropdown with all available fields from Object Type
- ✨ 11 operators: Equals, Not Equals, Greater Than, Less Than, Greater or Equal, Less or Equal, Is Null, Is Not Null, Starts With, Ends With, Contains
- ✨ AND/OR logic between rules
- ✨ Auto-generated OData query strings
- ✨ Advanced mode for custom queries (backward compatible)
- 🎨 Improved UX for query building

### v3.4.1 (2025-10-02)
- 🎨 Added helpful description hints for "Refresh Field List" option
- 📝 Improved UX guidance for resourceMapper

### v3.3.10 (2025-10-02)
- 🎉 **Major Feature**: Dynamic dropdown support for Lookup fields!
- ✨ Lookup fields now display related records in dropdown (Contacts, Users, Accounts, etc.)
- ✨ Automatic PrimaryKey and PrimaryField detection for all Object Types
- ✨ Support for all lookup field types with proper record display
- 🐛 Fixed resourceMapper options display with `removeListSearch: true`
- 🎨 Improved UI for field selection

### v3.0.0 (2025-10-02)
- 🚀 **Major Update**: ResourceMapper integration
- ✨ Dynamic Picklist field support with dropdown values
- ✨ Improved field type detection
- ✨ Better error handling and validation
- 🎨 Modern n8n UI with auto-complete

### v2.0.0 (2025-10-02)
- 🚀 **BREAKING CHANGE**: Complete architectural restructure
- ✨ Dynamic object type selection from Fireberry metadata API
- ✨ Support for ALL Fireberry objects
- ✨ Dynamic field loading based on selected object
- ✨ Support for 11 different field types

### v1.0.0 (2025-10-01)
- 🎉 Initial release
- ✅ Support for Account, Contact, Case, Task
- ✅ CRUD operations
- ✅ Advanced Query with pagination

## License

[MIT](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues, questions, or feature requests, please open an issue on [GitHub](https://github.com/binesamit/n8n-nodes-fireberry/issues).
