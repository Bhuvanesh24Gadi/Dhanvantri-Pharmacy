from django.contrib import admin
from .models import (Category, CustomerData, LoyaltyProgram, MfgInfo, 
                     Supplier, Medicine, InteractionLog, SupplyRecord, 
                     OrderLog, InvoiceSale, SalesItem)

# Registering the Relational Core
admin.site.register(Category)
admin.site.register(Supplier)
admin.site.register(MfgInfo)
admin.site.register(Medicine)

# Registering the Sales & Customers
admin.site.register(CustomerData)
admin.site.register(LoyaltyProgram)
admin.site.register(InvoiceSale)
admin.site.register(SalesItem)

# Registering Logs & Records
admin.site.register(InteractionLog)
admin.site.register(SupplyRecord)
admin.site.register(OrderLog)