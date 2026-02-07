# Quick Start Guide - Rental Management System

## 🚀 Getting Started

### 1. Navigate to Dashboard
```
http://localhost:3000/dashboard
```

You'll see all modules available:
- Companies Management
- Clients Management  
- Inventory Management
- Rentals Management
- Invoices Management
- Payments (Coming Soon)
- Reports (Coming Soon)

---

## 📋 Step-by-Step Workflow

### Step 1: Setup Companies First
**Route**: `/companies`

1. Click **"Add Company"**
2. Fill in:
   - Company Name
   - Address, City, State, Zip
   - GST Number
   - Phone & Email
   - **Bank Details**:
     - Account Holder Name
     - Account Number
     - Bank Name
     - IFSC Code
     - UPI ID
   - **Incharge Details** (For Signature):
     - Incharge Name
     - Incharge Phone
     - Incharge Email
     - Signature Image URL (optional)
3. Click **"Add Company"**

✅ You can now create multiple companies, each with their own bank details

---

### Step 2: Add Clients
**Route**: `/clients`

1. Click **"Add Client"**
2. Fill in:
   - Client Name
   - GST Number
   - Address, City, State, Zip
   - Phone & Email
   - Contact Person Name & Phone
3. Click **"Add Client"**

---

### Step 3: Setup Inventory
**Route**: `/inventory`

1. Click **"Add Item"**
2. Fill in:
   - Item Name (e.g., "LED Light Panel")
   - Category (e.g., "Lighting")
   - Description
   - Quantity
   - Unit (Piece/Meter/KG/Liter)
   - Price per Unit
3. Click **"Add Item"**

---

### Step 4: Create Rental Booking
**Route**: `/rentals`

1. Click **"Create Rental"**
2. Select:
   - Client
   - Rental Start Date
   - Expected Return Date
3. Add Items:
   - Click **"+ Add Item"**
   - Select item from inventory
   - Enter quantity
   - Repeat for multiple items
4. Set Status (Active/Completed/Cancelled)
5. Add Notes (optional)
6. Click **"Create Rental"**

---

### Step 5: Generate Invoice
**Route**: `/invoices`

This is where all the integration happens!

#### Create Invoice
1. Click **"Create Invoice"**
2. **Select Company** (IMPORTANT!) 
   - This auto-populates:
     - A: Company Address
     - C: Bank Details
     - D: Sender/Incharge Details
     - F: Signature Field
3. **Select Rental**
   - This auto-populates:
     - B: Item List
     - Client Information
4. **Fill Invoice Details**:
   - Invoice Number (e.g., INV-001)
   - Invoice Date
   - Due Date
   - Include GST? (Yes/No)
   - GST Rate (default: 18%)
   - Notes (optional)
5. Click **"Create Invoice"**

#### Invoice Generated With:
- ✓ A: Company Address
- ✓ B: Item List from Rental
- ✓ C: Bank Details (Company-specific)
- ✓ D: Sender Details (Incharge Info)
- ✓ E: Total with GST Calculation
- ✓ F: Signature Field

---

## 🎯 Key Features

### Multi-Company Support
Create multiple companies and each invoice automatically uses the correct company's details:
- Different bank accounts for each company
- Different incharge/sender details
- All bank details automatically populated

### Example:
```
Company A (Astra Lighting)
├── Bank: HDFC
├── Account: 123456789
└── Incharge: John Doe

Company B (Solecthon Lights)
├── Bank: ICICI
├── Account: 987654321
└── Incharge: Jane Smith

When selecting Company A → Invoice shows HDFC details
When selecting Company B → Invoice shows ICICI details
```

### Invoice Fields
- **A**: Company Address (auto from selected company)
- **B**: Item List (auto from selected rental's items)
- **C**: Bank Details (auto from selected company)
- **D**: Sender/Incharge Details (auto from selected company)
- **E**: Total with optional GST calculation
- **F**: Signature field (from company incharge info)

---

## 🔍 Important Notes

### Company Setup
- **Must** fill company details first
- Bank details are crucial for invoices
- Each company can have different payment methods
- Incharge signature auto-appears on invoices

### Client Setup
- GST number helps in tax calculations
- Contact person is shown on invoices as "Bill To"

### Inventory
- Quantities track available items
- Price determines rental costs
- Categories help organize equipment

### Rentals
- Link clients to rentals
- Add specific items they're renting
- Set dates and track status

### Invoices
- Always select company first (critical!)
- Company selection auto-fills most fields
- GST is optional - choose based on requirements
- Print directly from browser

---

## 📊 Data Flow

```
Company Setup
    ↓
Add Clients
    ↓
Setup Inventory
    ↓
Create Rental (Client + Items)
    ↓
Generate Invoice
    ├─ Select Company (auto-fills: address, bank, incharge, signature)
    ├─ Select Rental (auto-fills: client, items)
    ├─ Set dates & GST
    └─ Create Invoice (all fields integrated!)
```

---

## ✅ Checklist for First Invoice

- [ ] Created at least 1 Company with bank details
- [ ] Created at least 1 Client
- [ ] Added items to Inventory
- [ ] Created a Rental with items
- [ ] Generated Invoice with company selection

---

## 🆘 Troubleshooting

### Invoice not showing all details?
- **Check**: Did you select a Company? Company selection is critical!
- **Check**: Rental has items added
- **Check**: Client is linked to rental

### Bank details not showing?
- **Fix**: Go to Companies page → Edit the company → Ensure bank fields are filled

### Items not showing in rental?
- **Fix**: Go to Inventory first → Add items → Then create rental

---

## 🎓 Database Structure (For Developers)

### Companies Collection
```
{
  name: "Astra Lighting",
  address: "123 Main St",
  city: "Mumbai",
  bankAccountNumber: "123456789",
  bankName: "HDFC Bank",
  inchargeName: "John Doe",
  // ... more fields
}
```

### Invoices Collection
```
{
  companyId: "doc123",  // Links to Companies
  rentalId: "doc456",    // Links to Rentals
  invoiceNumber: "INV-001",
  includeGST: true,
  gstRate: 18,
  // ... more fields
}
```

---

## 🚀 Next Steps

After getting comfortable with the basic flow:

1. **Payments Module** - Track payment status
2. **Reports** - Generate business analytics
3. **Email** - Send invoices via email
4. **Authentication** - User login & permissions
5. **Quotes** - Generate quotes before rentals

---

## 💡 Pro Tips

1. **Invoice Numbering**: Use sequential format like INV-001, INV-002
2. **Multiple Companies**: Test with 2+ companies to see auto-population
3. **Bulk Items**: Add common items once, reuse in multiple rentals
4. **GST Toggle**: Use for B2B (with GST) and B2C (without) invoices
5. **Signature**: Upload company head's signature as image for professional invoices

---

**Everything is ready! Start creating companies and invoices now! 🎉**
