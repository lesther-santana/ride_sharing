from django.db import models
from django.db.models import Q, F
from django.contrib.auth.models import AbstractUser


# Create your models here.
class User(AbstractUser):
    pass


class Trip(models.Model):
    origen = models.ForeignKey('Ubicacion', on_delete=models.DO_NOTHING, related_name="origen")
    destino = models.ForeignKey('Ubicacion', on_delete=models.DO_NOTHING, related_name="destino")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    vehicle = models.CharField(max_length=10, null=True)
    mapa = models.ImageField(upload_to='trips', null=True)
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    polyline = models.TextField(null=True)

    def __str__(self) -> str:
        return f'viaje: {self.origen} - {self.destino}'
    
    def serialize(self):
        return {
            'id': self.id,
            'origen': {
                'name': self.origen.name,
                'formatted_address': self.origen.formatted_address
                },
            'destino': {
                'name': self.destino.name,
                'formatted_address': self.destino.formatted_address
                },
            'date_created': self.date_created,
            'polyline': self.polyline
        }

    class Meta:
        ordering =['-date_created']


class Ubicacion(models.Model):
    place_id = models.TextField(primary_key=True)
    name = models.TextField()
    formatted_address = models.TextField()
    locality = models.CharField(max_length=80, null=True)
    adm_area_lv2 = models.CharField(max_length=80, null=True)
    adm_area_lv1 = models.CharField(max_length=80, null=True)
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    

    def __str__(self) -> str:
        return self.name


class Convo(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f'{self.trip}, started by {self.user} to {self.trip.user}'

    class Meta:
        ordering =['-date_created']


class Mensaje(models.Model):
    convo = models.ForeignKey(Convo, on_delete=models.CASCADE)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    date_created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering =['date_created']
        

    def __str__(self) -> str:
        return f'{self.pk} by {self.sender} on {self.date_created}'

    def serialize(self):
        return {
            'id': self.id,
            'sender': self.sender.username,
            'text': self.text,
            'date_created': self.date_created
        }