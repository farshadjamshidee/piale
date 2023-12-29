from django.contrib import admin
from base.models import RoomMember


@admin.register(RoomMember)
class RoomMemberAdmin(admin.ModelAdmin):
    list_display = ['name','room_name','uid']
