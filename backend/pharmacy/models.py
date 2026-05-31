from django.db import models

# ==========================================
# RELATIONAL CORE & EXTERNAL WEB PORTAL
# ==========================================

class Category(models.Model):
    category_name = models.CharField(max_length=255)

    def __str__(self):
        return self.category_name

class CustomerData(models.Model):
    customer_name = models.CharField(max_length=255)
    loyalty_program_active = models.BooleanField(default=False)

    def __str__(self):
        return self.customer_name

class LoyaltyProgram(models.Model):
    customer = models.OneToOneField(CustomerData, on_delete=models.CASCADE)
    total_amount_spent = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

class MfgInfo(models.Model):
    contact_info = models.CharField(max_length=255)
    production_history = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Manufacturer {self.id}"

class Supplier(models.Model):
    supplier_name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    email = models.EmailField()
    address = models.TextField()

    def __str__(self):
        return self.supplier_name

# ==========================================
# CENTRAL HUB: MEDICINE
# ==========================================

class Medicine(models.Model):
    medicine_name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    batch_no = models.CharField(max_length=100)
    dosage = models.CharField(max_length=100)
    expiry_date = models.DateField()
    expiry_alert = models.BooleanField(default=False)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2)  # Cost from supplier
    unit_price = models.DecimalField(max_digits=10, decimal_places=2) # Price for customer
    stock_quantity = models.IntegerField(default=0)
    
    # Foreign Keys linking to other tables
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    manufacturer = models.ForeignKey(MfgInfo, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.medicine_name

class InteractionLog(models.Model):
    primary_medicine = models.ForeignKey(Medicine, related_name='primary_interactions', on_delete=models.CASCADE)
    interacting_medicine = models.ForeignKey(Medicine, related_name='secondary_interactions', on_delete=models.CASCADE)
    potential_conflict = models.BooleanField(default=True)

# ==========================================
# M:N RESOLUTION TABLES (JUNCTION TABLES)
# ==========================================

class SupplyRecord(models.Model):
    """Resolves the M:N relationship between Supplier and Medicine"""
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    supply_date = models.DateField(auto_now_add=True)
    quantity_supplied = models.IntegerField()
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2)

class OrderLog(models.Model):
    """The Supplier API Gateway Log"""
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    automated_stock_reordering = models.BooleanField(default=False)
    process_status = models.CharField(max_length=100)
    pricing_of_sales = models.CharField(max_length=100)

class InvoiceSale(models.Model):
    customer = models.ForeignKey(CustomerData, on_delete=models.SET_NULL, null=True)
    invoice_date = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

class SalesItem(models.Model):
    """Resolves the M:N relationship between Invoice and Medicine"""
    invoice = models.ForeignKey(InvoiceSale, on_delete=models.CASCADE, related_name='items')
    medicine = models.ForeignKey(Medicine, on_delete=models.PROTECT)
    quantity_sold = models.IntegerField()
    unit_sale_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    def save(self, *args, **kwargs):
        # Automatically calculate the subtotal before saving
        self.subtotal = self.quantity_sold * self.unit_sale_price
        super().save(*args, **kwargs)