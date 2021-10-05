from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.core.exceptions import ObjectDoesNotExist
from django.http.response import HttpResponse
from django.shortcuts import HttpResponseRedirect, render
from django.urls import reverse

from .models import User, Trip, Ubicacion
from . import utils
import json

# Create your views here.
# Create your views here.

def index(request):
    trips = Trip.objects.all()[:4]
    return render(request, 'trips/index.html', {'trips': trips})


@login_required
def trips(request):
    pass


@login_required
def profie(request):
    pass


@login_required
def publish_trip(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        origen_addr_component = utils.parse_address(data['origin']["address_components"])
        dest_addr_component = utils.parse_address(data['dest']["address_components"])
        try:
            origen = Ubicacion.objects.create(
            place_id=data['origin']['place_id'],
            name=data['origin']['name'],
            formatted_address=data['origin']['formatted_address'],
            locality=origen_addr_component.get('locality', None),
            adm_area_lv2 =origen_addr_component.get('administrative_area_level_2', None),
            adm_area_lv1 =origen_addr_component.get('administrative_area_level_1', None)
            )
            origen.save()
        except IntegrityError:
            origen = Ubicacion.objects.get(pk=data['origin']['place_id'])
        try:
            destino = Ubicacion.objects.create(
            place_id=data['dest']['place_id'],
            name=data['dest']['name'],
            formatted_address=data['dest']['formatted_address'],
            locality=dest_addr_component.get('locality', None),
            adm_area_lv2 =dest_addr_component.get('administrative_area_level_2', None),
            adm_area_lv1 =dest_addr_component.get('administrative_area_level_1', None)
            )
            destino.save()
        except IntegrityError:
            destino = Ubicacion.objects.get(pk=data['dest']['place_id'])
        trip = Trip.objects.create(
            origen = origen,
            destino = destino,
            user = request.user,
            vehicle = data.get('vehiculo', None),
            polyline=data.get('polyline', None)
            )
        trip.save()
        return HttpResponse(status=201)
    return render(request, 'trips/publish.html')

@login_required
def log_out(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

def log_in(request):
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            messages.error(request, 'Incorrect username or password!')
    return render(request, 'trips/login.html')

def register(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        confirm = request.POST.get("confirm")
        if not username or not password:
            messages.error(request, 'Usuario incorrecto!')
        elif password != confirm:
            messages.error(request, 'Contrasenas deben coincidir!')
        try:
            user = User.objects.create_user(username, password=password)
            user.save()
            messages.success(request, 'Usuario creado con exito!')
            return HttpResponseRedirect(reverse("login"))
        except IntegrityError as e:
            messages.error(request, 'Usuario ya existe!')
    return render(request, 'trips/register.html')