from .views import DashboardStatsView
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (CategoryViewSet, SupplierViewSet, MfgInfoViewSet, 
                    MedicineViewSet, InvoiceSaleViewSet, DigitizePrescriptionView)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'suppliers', SupplierViewSet)
router.register(r'manufacturers', MfgInfoViewSet)
router.register(r'medicines', MedicineViewSet)
router.register(r'sales', InvoiceSaleViewSet)

urlpatterns = [
    # The standard database routes (e.g., api/pharmacy/medicines/)
    path('', include(router.urls)),
    
    # The AI OCR route (api/pharmacy/digitize/)
    path('digitize/', DigitizePrescriptionView.as_view(), name='digitize_prescription'),
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
]