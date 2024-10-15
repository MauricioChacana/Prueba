# accounts/forms.py
from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm

class SignUpForm(UserCreationForm):
    Email = forms.EmailField(required=True)
    Rut = forms.CharField(max_length=12)
    Colegio = forms.CharField(max_length=100)
    Curso = forms.CharField(max_length=100)

    class Meta:
        model = User
        fields = ('username', 'Email', 'Rut', 'Colegio', 'Curso', 'password1', 'password2')
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Ingresa tu nombre'}),
            'Email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Ingresa tu correo'}),
            'Rut': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Ingresa tu rut'}),
            'Colegio': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Ingresa tu colegio'}),
            'Curso': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Ingresa tu curso'}),
            'password1': forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Ingrese tu contraseña'}),
            'password2': forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Confirme tu contraseña'}),
        }