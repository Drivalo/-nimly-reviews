# Zapier Integration

Create appointments in Nimly Reviews automatically when something happens in another app (e.g. a new booking in your calendar, CRM, or form tool).

## Endpoint

```
POST {BASE_URL}/api/jobs/create
```

Replace `{BASE_URL}` with your deployed app URL (e.g. `https://your-app.vercel.app`) or `http://localhost:3000` for local testing.

## Authentication

Send your API key in the `Authorization` header:

```
Authorization: Bearer YOUR_API_KEY
```

The key must match the `JOBS_API_KEY` environment variable on your Nimly Reviews server. Requests without a valid key receive `401 Unauthorized`.

Generate and set `JOBS_API_KEY` in `.env.local` (local) and in your hosting provider’s environment variables (production).

## Request body

Send JSON with the following fields:

| Field | Required | Description |
|-------|----------|-------------|
| `customer_name` | Yes | Client’s full name |
| `customer_phone` | Yes | Mobile number in E.164 format (e.g. `+447911123456`) |
| `customer_email` | No | Email address |
| `job_description` | No | Treatment, service, or job details |
| `job_value` | No | Numeric value (e.g. `85` or `85.00`) |

### Example

```json
{
  "customer_name": "Jane Smith",
  "customer_phone": "+447911123456",
  "customer_email": "jane@example.com",
  "job_description": "Haircut and colour",
  "job_value": 85
}
```

## Response

**Success — `201 Created`**

Returns the created job object, including `id`, `status` (`pending`), and timestamps.

**Errors**

| Status | Meaning |
|--------|---------|
| `401` | Missing or invalid API key |
| `400` | Invalid JSON or missing required fields |
| `500` | Database error |

## Setting up a Zap

1. **Trigger** — Choose your source app (Google Calendar, Typeform, Square, etc.) and configure when the Zap should run.

2. **Action** — Add **Webhooks by Zapier** → **POST**.

3. **Configure the webhook:**
   - **URL:** `https://your-app.vercel.app/api/jobs/create`
   - **Payload type:** JSON
   - **Headers:**
     - `Authorization`: `Bearer YOUR_API_KEY` (use your real `JOBS_API_KEY` value)
     - `Content-Type`: `application/json`
   - **Data** — Map fields from the trigger step:

     | Key | Zapier field |
     |-----|----------------|
     | `customer_name` | Client name from trigger |
     | `customer_phone` | Phone from trigger |
     | `customer_email` | Email (optional) |
     | `job_description` | Service / appointment title (optional) |
     | `job_value` | Price or amount (optional) |

4. **Test** — Run the Zap test step. You should see `201` and the new job in the Nimly Reviews admin dashboard under **Appointments**.

## What happens next

New jobs are created with:

- `status`: `pending`
- `sequence_halted`: `false`
- `consent_given`: `false`

Mark the appointment complete in the admin dashboard to start the review SMS flow (or rely on your existing workflow).

## cURL example

```bash
curl -X POST https://your-app.vercel.app/api/jobs/create \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Jane Smith",
    "customer_phone": "+447911123456",
    "customer_email": "jane@example.com",
    "job_description": "Haircut and colour",
    "job_value": 85
  }'
```
