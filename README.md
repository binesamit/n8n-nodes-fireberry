# n8n-nodes-fireberry

This is an n8n community node for [Fireberry CRM](https://www.fireberry.com/) (formerly Powerlink).

[Fireberry](https://www.fireberry.com/) is an Israeli CRM platform designed for medium-sized businesses.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Community Nodes (Recommended)

1. Go to **Settings > Community Nodes**.
2. Select **Install**.
3. Enter `n8n-nodes-fireberry` in **Enter npm package name**.
4. Agree to the risks and select **Install**.

### Manual Installation

To use this node, install it locally:

```bash
npm install n8n-nodes-fireberry
```

## Credentials

You need a Fireberry account to use this node.

### Get your API Token:

1. Log in to your Fireberry account
2. Click the gear icon (Settings) → **Integration**
3. Go to **API Forms**
4. Copy your **Token ID**

## Supported Operations

### Account (Company)
- **Create** - Create a new account
- **Update** - Update an existing account
- **Delete** - Delete an account
- **Get** - Retrieve a single account

### Contact (Person)
- **Create** - Create a new contact
- **Update** - Update an existing contact
- **Delete** - Delete a contact
- **Get** - Retrieve a single contact

### Case (Ticket/Support)
- **Create** - Create a new case
- **Update** - Update an existing case
- **Delete** - Delete a case
- **Get** - Retrieve a single case

### Task
- **Create** - Create a new task
- **Update** - Update an existing task
- **Delete** - Delete a task
- **Get** - Retrieve a single task

### Query
- **Execute** - Run advanced queries with custom filters

## Query Syntax

Fireberry supports powerful query operators:

- `=` - Equal
- `!=` - Not equal
- `>` - Greater than
- `<` - Less than
- `>=` - Greater than or equal
- `<=` - Less than or equal
- `AND` - Logical AND
- `OR` - Logical OR
- `is-null` - Check for NULL
- `is-not-null` - Check for NOT NULL
- `start-with` - String starts with
- `end-with` - String ends with
- `not-start-with` - String doesn't start with
- `not-end-with` - String doesn't end with

### Query Examples:

```
(accountname = "חברת דוגמה")

(idnumber = "123456789") AND (telephone1 != "")

((emailaddress1 is-not-null 1) OR (telephone1 is-not-null 1))

(accountname start-with "א")
```

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [Fireberry API Documentation](https://developers.fireberry.com/)
* [Fireberry Support](https://www.fireberry.com/articles/getting-started-with-rest-api)

## License

[MIT](LICENSE)
