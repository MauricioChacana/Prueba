from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages

def loginview(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            messages.success(request, 'Logged in successfully')
            return redirect('index')
        else:
            messages.error(request, 'Login failed. Please check your username and password.')
    return render(request, 'login.html')