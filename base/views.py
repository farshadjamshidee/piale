from django.shortcuts import render
from django.http import JsonResponse
from agora_token_builder import RtcTokenBuilder
import random
import time
import json

from .models import RoomMember
from django.views.decorators.csrf import csrf_exempt


def get_token(request):
    app_id = 'b0e42932c753403bbcaee9960fada6f2'
    certificate = 'f8bdddde9b224d2aa35174489c2e4af8'
    channel_name = request.GET.get('channel')
    uid = random.randint(1, 230)
    role = 1
    expiration_token_in_seconds = 3600 * 24
    current_timestamp = time.time()
    privilege_expired_ts = current_timestamp + expiration_token_in_seconds
    token = RtcTokenBuilder.buildTokenWithUid(appId=app_id,
                                              appCertificate=certificate,
                                              channelName=channel_name,
                                              uid=uid, role=role,
                                              privilegeExpiredTs=privilege_expired_ts)

    return JsonResponse({'token': token, 'uid': uid}, safe=False)


def lobby(request):
    return render(request,'base/lobby.html')


def room(request):
    return render(request,'base/room.html')


@csrf_exempt
def create_user(request):
    data = json.loads(request.body)
    member , created = RoomMember.objects.get_or_create(
        name=data['name'],
        uid=data['uid'],
        room_name=data['room_name']
    )
    return JsonResponse({'name':data['name']},safe=False)


def get_member(request):
    uid = request.GET.get('UID')
    room_name = request.GET.get('room_name')

    member = RoomMember.objects.get(
        uid=uid,
        room_name=room_name
    )
    name = member.name

    return JsonResponse({'name': member.name}, safe=False)


@csrf_exempt
def delete_member(request):
    data = json.loads(request.body)
    print(data)
    member = RoomMember.objects.filter(
        uid=data['uid']
        # name=data['name'],
        # room_name=['room_name']
    )
    print(member)
    if member.delete():
        return JsonResponse({'status': True} ,safe=False)
    else:
        return JsonResponse({'status': False}, safe=False)
