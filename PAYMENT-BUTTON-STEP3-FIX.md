# ✅ Fix: Payment Button Blocked on Step 3 (Plan Selection)

## Problem

The "Proceed to Payment" button is disabled on Step 3 because the message shows:
```
No active plans found. Please contact support or the administrator.
```

This means there are **no SaaS plans created yet** in your database.

## Solution: Create Default Plans

Follow these steps:

### Step 1: Open the Billing Workspace
Go to [http://localhost:3000/app/billing](http://localhost:3000/app/billing)

### Step 2: Create at Least One Active Plan

In the "Create SaaS Plan" form, fill in:

| Field | Example Value |
|-------|---------------|
| **Slug** | `starter` |
| **Plan name** | `Starter Plan` |
| **Billing Cycle** | `MONTHLY` |
| **Price** | `999` (₹999) |
| **Max students** | `100` |
| **Max storage (GB)** | `10` |
| **White-label app** | `NO` |
| **Active** | `YES` ← **IMPORTANT!** |

Click **"Save Plan"** button.

### Step 3: Create a Second Plan (Optional but Recommended)

| Field | Example Value |
|-------|---------------|
| **Slug** | `professional` |
| **Plan name** | `Professional Plan` |
| **Billing Cycle** | `MONTHLY` |
| **Price** | `2499` (₹2499) |
| **Max students** | `500` |
| **Max storage (GB)** | `100` |
| **White-label app** | `YES` |
| **Active** | `YES` ← **IMPORTANT!** |

Click **"Save Plan"** button.

### Step 4: Go Back to Onboarding

Now go to [http://localhost:3000/onboarding](http://localhost:3000/onboarding)

1. Complete Steps 1-2 (Organization details)
2. On **Step 3 (Choose Your Plan)**, you should now see your created plans
3. Select a plan
4. Click **"Proceed to Payment"** button (now it will be clickable! ✅)

## Why This Happens

- The onboarding page checks for **active plans** (`isActive: true`)
- If no plans exist, the button is disabled to prevent creating subscriptions without a plan
- This is a safety feature to ensure users can't proceed without selecting a valid plan

## Verification

To verify plans were created, check the SaaS Plans table on the Billing page:
- You should see your plans displayed with columns:
  - ID, Slug, Name, Cycle, Price, Students, Storage, White-label, Active, Updated

## Quick Reference: API Endpoints

The onboarding uses this endpoint:
- `GET /api/tenant/plans` - Returns all **active** plans (`isActive: true`)

The billing page uses:
- `GET /api/core-saas/billing/plans` - Returns all plans (active and inactive)

---

**After creating plans, the "Proceed to Payment" button will be clickable!** 🎉
