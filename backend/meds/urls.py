from rest_framework.routers import DefaultRouter
from .views import (
    PatientViewSet,
    MedicationViewSet,
    FacilityViewSet,
    SourceViewSet,
    PrescriptionViewSet,
)

router = DefaultRouter()

router.register(r"patients", PatientViewSet)
router.register(r"medications", MedicationViewSet)
router.register(r"facilities", FacilityViewSet)
router.register(r"sources", SourceViewSet)
router.register(r"prescriptions", PrescriptionViewSet, basename='prescription')

urlpatterns = router.urls
