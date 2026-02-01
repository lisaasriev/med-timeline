from rest_framework import serializers
from .models import Patient, Medication, Facility, Source, Prescription

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = "__all__"

class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = "__all__"

class FacilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Facility
        fields = "__all__"

class SourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Source
        fields = "__all__"

class PrescriptionSerializer(serializers.ModelSerializer):
    patient = PatientSerializer()
    medication = MedicationSerializer()
    facility = FacilitySerializer()
    source = SourceSerializer()

    class Meta:
        model = Prescription
        fields = "__all__"