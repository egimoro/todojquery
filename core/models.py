from django.db import models
from django.db.models.base import Model

# Create your models here.

class TODO(models.Model):
    name = models.CharField(max_length=100, unique=True)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return self.name
