from django.core.management.base import BaseCommand
from meds.models import Patient, Medication, Facility, Source, Prescription
from datetime import date

class Command(BaseCommand):
    help = "Seed mock data for testing"

    def handle(self, *args, **kwargs):
        # Patients
        alice, _ = Patient.objects.get_or_create(name="Alice Smith")
        bob, _ = Patient.objects.get_or_create(name="Bob Jones")
        charlie, _ = Patient.objects.get_or_create(name="Charlie Brown")

        # Medications
        aspirin, _ = Medication.objects.get_or_create(name="Aspirin")
        ibuprofen, _ = Medication.objects.get_or_create(name="Ibuprofen")
        paracetamol, _ = Medication.objects.get_or_create(name="Paracetamol")

        # Facilities
        hospital, _ = Facility.objects.get_or_create(name="X Hospital", type="hospital", address="123 Hospital St")
        clinic, _ = Facility.objects.get_or_create(name="Y Clinic", type="clinic", address="456 Clinic St")
        pharmacy, _ = Facility.objects.get_or_create(name="Z Pharmacy", type="pharmacy", address="789 Pharmacy St")
        other, _ = Facility.objects.get_or_create(name="K Other", type="other", address="246 Other St")

        # Sources
        ehr, _ = Source.objects.get_or_create(type="ehr", label="EHR System", confidence=5)
        manual, _ = Source.objects.get_or_create(type="manual", label="Manual Entry", confidence=4)

        # Prescriptions
        Prescription.objects.get_or_create(
            patient=alice,
            medication=aspirin,
            facility=hospital,
            dose="100mg",
            start_date=date(2026,1,1),
            end_date=date(2026,1,10),
            status="stopped",
            source=ehr
        )

        # Edge case: same medication, different facility
        Prescription.objects.get_or_create(
            patient=alice,
            medication=aspirin,
            facility=clinic,
            dose="100mg",
            start_date=date(2026,1,11),
            end_date=date(2026,1,20),
            status="active",
            source=manual
        )

        Prescription.objects.get_or_create(
            patient=bob,
            medication=ibuprofen,
            facility=clinic,
            dose="200mg",
            start_date=date(2026,1,5),
            end_date=None,
            status="active",
            source=ehr
        )

        # Edge case: dose change over time
        Prescription.objects.get_or_create(
            patient=charlie,
            medication=paracetamol,
            facility=pharmacy,
            dose="500mg",
            start_date=date(2026,1,1),
            end_date=date(2026,1,10),
            status="stopped",
            source=manual
        )
        Prescription.objects.get_or_create(
            patient=charlie,
            medication=paracetamol,
            facility=pharmacy,
            dose="1000mg",
            start_date=date(2026,1,11),
            end_date=None,
            status="active",
            source=manual
        )

        self.stdout.write(self.style.SUCCESS("Mock data seeded successfully"))