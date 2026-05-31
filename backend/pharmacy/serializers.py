from rest_framework import serializers
from django.db import transaction
from .models import (Category, CustomerData, MfgInfo, Supplier, 
                     Medicine, SupplyRecord, InvoiceSale, SalesItem)

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'

class MfgInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MfgInfo
        fields = '__all__'

class MedicineSerializer(serializers.ModelSerializer):
    # This automatically fetches the readable names instead of just showing ID numbers
    category_name = serializers.CharField(source='category.category_name', read_only=True)
    
    class Meta:
        model = Medicine
        fields = '__all__'

# ==========================================
# ENTERPRISE TRANSACTION LOGIC
# ==========================================

class SalesItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesItem
        fields = ['id', 'medicine', 'quantity_sold', 'unit_sale_price', 'subtotal']
        read_only_fields = ['subtotal']

class InvoiceSaleSerializer(serializers.ModelSerializer):
    # This allows us to submit an Invoice AND its items in one single JSON payload
    items = SalesItemSerializer(many=True) 

    class Meta:
        model = InvoiceSale
        fields = ['id', 'customer', 'invoice_date', 'total_amount', 'items']
        read_only_fields = ['total_amount']

    @transaction.atomic # If anything fails, roll back the entire database action
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # 1. Create the master invoice
        invoice = InvoiceSale.objects.create(**validated_data)
        total = 0

        # 2. Loop through the cart items
        for item_data in items_data:
            # Create the line item
            item = SalesItem.objects.create(invoice=invoice, **item_data)
            total += item.subtotal

            # 3. Reduce the physical inventory stock!
            medicine = item.medicine
            medicine.stock_quantity -= item.quantity_sold
            
            # Security check to prevent negative inventory
            if medicine.stock_quantity < 0:
                raise serializers.ValidationError(f"Insufficient stock for {medicine.medicine_name}. Only {medicine.stock_quantity + item.quantity_sold} left.")
            
            medicine.save()

        # 4. Save the final calculated total
        invoice.total_amount = total
        invoice.save()
        
        return invoice