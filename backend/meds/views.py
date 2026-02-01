from rest_framework.viewsets import ReadOnlyModelViewSet
from django.db.models import Q
from .models import *
from .serializers import *

class PatientViewSet(ReadOnlyModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer

class MedicationViewSet(ReadOnlyModelViewSet):
    queryset = Medication.objects.all()
    serializer_class = MedicationSerializer

class FacilityViewSet(ReadOnlyModelViewSet):
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer

class SourceViewSet(ReadOnlyModelViewSet):
    queryset = Source.objects.all()
    serializer_class = SourceSerializer

class PrescriptionViewSet(ReadOnlyModelViewSet):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer

    def get_queryset(self):
        qs = Prescription.objects.select_related(
            "patient",
            "medication",
            "facility",
            "source",
        ).all()

        patient_id = self.request.query_params.get("patient_id")
        if patient_id:
            qs = qs.filter(patient_id=patient_id)

        status = self.request.query_params.get("status")
        if status:
            qs = qs.filter(status=status)

        start_date = self.request.query_params.get("start")
        end_date = self.request.query_params.get("end")
        if start_date and end_date:
            qs = qs.filter(
                start_date__lte=end_date
            ).filter(
                Q(end_date__gte=start_date) | Q(end_date__isnull=True)
            )

        qs = qs.order_by("-start_date")

        return qs
    
    


