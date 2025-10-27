## Strapi Audit Logging

### Design:
* The audit logs are being managed using a middleware. On any write(POST, PUT, DELETE), we are storing the changes 
against the user in an audit table.
* The audit logs can be accessed with APIs(filtering enabled). Currently there is only authentication and no 
authorization checks for accessing logs.
* Postgres is being used as the database for storing logs.

### Database Schema Design
```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  document_id VARCHAR(255),
  content_type VARCHAR(255) NOT NULL,
  record_id VARCHAR(255) NOT NULL,
  action VARCHAR(255) NOT NULL,
  user_id VARCHAR(255),
  user_email VARCHAR(255),
  changed_fields JSONB,
  full_payload JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### API Design Pattern

- `GET /api/audit-logs` - List with filtering/pagination
- `GET /api/audit-logs/:id` - Single record retrieval

### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-develop)

```
npm run develop
# or
yarn develop
```

### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-start)

```
npm run start
# or
yarn start
```

### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-build)

```
npm run build
# or
yarn build
```

