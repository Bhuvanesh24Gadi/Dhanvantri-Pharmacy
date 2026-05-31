from django.db.models import Sum, F
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from django.conf import settings


# Import our new Enterprise Models & Serializers
from .models import Category, Supplier, MfgInfo, Medicine, InvoiceSale
from .serializers import (CategorySerializer, SupplierSerializer, MfgInfoSerializer, 
                          MedicineSerializer, InvoiceSaleSerializer)

import google.generativeai as genai
from PIL import Image
import io

# --- Standard Database Endpoints ---
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

class MfgInfoViewSet(viewsets.ModelViewSet):
    queryset = MfgInfo.objects.all()
    serializer_class = MfgInfoSerializer

class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer

class InvoiceSaleViewSet(viewsets.ModelViewSet):
    queryset = InvoiceSale.objects.all()
    serializer_class = InvoiceSaleSerializer

# --- The Generative AI Vision Endpoint ---
class DigitizePrescriptionView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        file_obj = request.data.get('file')
        
        if not file_obj:
            return Response({"error": "No image file provided."}, status=400)

        try:
            genai.configure(api_key=settings.GOOGLE_API_KEY) 
            model = genai.GenerativeModel('gemini-2.5-flash-lite')
            image_data = Image.open(io.BytesIO(file_obj.read()))

            prompt = """
            You are an expert pharmaceutical AI. Analyze the uploaded image.
            First, determine if the image is a handwritten/printed PRESCRIPTION or a picture of a MEDICINE BOTTLE/BOX.

            Return the data STRICTLY in this JSON format:
            
            {
                "image_type": "Prescription" OR "Medicine",
                
                // ONLY fill this out if it is a Prescription
                "prescription_data": {
                    "patient_name": "...",
                    "date": "...",
                    "medications_found": ["Med 1 + dosage", "Med 2 + dosage"]
                },

                // ONLY fill this out if it is a Medicine Box/Bottle
                "medicine_data": {
                    "brand_name": "...",
                    "chemical_components": "...",
                    "category": "...",
                    "primary_use": "..."
                }
            }
            """
            response = model.generate_content([prompt, image_data])

            return Response({
                "success": True,
                "filename": file_obj.name,
                "extracted_text": response.text
            })

        except Exception as e:
            print("AI Error:", str(e))
            return Response({"error": "AI Processing failed. Check server console."}, status=500)
        
class DashboardStatsView(APIView):
    def get(self, request):
        # 1. Total unique medicines in the system
        total_medicines = Medicine.objects.count()
        
        # 2. How many items are running out? (Less than 10 left)
        low_stock_count = Medicine.objects.filter(stock_quantity__lt=10).count()
        
        # 3. Total Financial Value of current inventory
        inventory_value = Medicine.objects.aggregate(
            total_value=Sum(F('stock_quantity') * F('unit_price'))
        )['total_value'] or 0

        # 4. Get the actual names of the low stock items to show on the UI
        low_stock_items = Medicine.objects.filter(
            stock_quantity__lt=10
        ).values('medicine_name', 'stock_quantity')[:5] # Grab the top 5 most critical

        return Response({
            "total_medicines": total_medicines,
            "low_stock_count": low_stock_count,
            "inventory_value": round(inventory_value, 2),
            "low_stock_items": list(low_stock_items)
        })