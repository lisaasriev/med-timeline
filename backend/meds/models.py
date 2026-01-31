from django.db import models

class Patient(models.Model):
    name = models.CharField(max_length=100, null=False, blank=False)

    def __str__(self):
        return self.name

class Medication(models.Model):
    name = models.CharField(max_length=100, null=False, blank=False)

    def __str__(self):
        return self.name

class Facility(models.Model):    
    TYPE_CHOICES = [
        ('hospital', 'Hospital'),
        ('clinic', 'Clinic'),
        ('pharmacy', 'Pharmacy'),
        ('other', 'Other')
    ]

    name = models.CharField(max_length=100, null=False, blank=False)
    type = models.CharField(max_length=100, choices=TYPE_CHOICES, default='hospital')
    address = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Source(models.Model):
    type = models.CharField(max_length=100, null=False, blank=False)
    label = models.CharField(max_length=100, null=False, blank=False)
    confidence = models.IntegerField()

    def __str__(self):
        return f"{self.label} ({self.type})"

class Prescription(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('stopped', 'Stopped'),
        ('unknown', 'Unknown')
    ]
        
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    medication = models.ForeignKey(Medication, on_delete=models.CASCADE)
    facility = models.ForeignKey(Facility, on_delete=models.CASCADE)
    dose = models.CharField(max_length=50)
    start_date = models.DateField(null=False, blank=False)
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    source = models.ForeignKey(Source, on_delete=models.CASCADE, null=False, blank=False)

    def __str__(self):
        return f"{self.medication.name} for {self.patient.name} ({self.start_date} → {self.end_date or 'ongoing'})"
