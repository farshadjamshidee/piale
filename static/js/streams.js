const APP_ID = 'b0e42932c753403bbcaee9960fada6f2' // this is agora app id
const CHANNEL = sessionStorage.getItem('room') // LOVE
const TOKEN = sessionStorage.getItem('token') //'007eJxTYHgscd2/6KvQ2s39tl1ycmeXOXb3iW+v0O/x6WxaOeOa3AUFhiSDVBMjS2OjZHNTYxMD46Sk5MTUVEtLM4O0xJREszSjVPe+1IZARoaLzypZGRkgEMRnYfDxD3NlYAAAYeYfxQ=='
let UID = Number(sessionStorage.getItem('UID'))

let NAME = sessionStorage.getItem('name')

const client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'})

let localTracks = []
let remoteUsers =  {}

let joinAndDisplayLocalStream = async() =>{
    document.getElementById('room-name').innerText = CHANNEL
    client.on('user-published',handleUserJoined)
    client.on('user-left',handleUserLeft)
    try {
        await client.join(APP_ID, CHANNEL,TOKEN,UID)
    }catch (error){
        console.error(error)
        window.open('/','_self')
    }


    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()

    let member = await createMember()

    let player = `<div class="video-container" id="user-container-${UID}">
                        <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
                        <div class="video-player" id="user-${UID}"></div>
                  </div>`
    document.getElementById('video-streams').insertAdjacentHTML('beforeend',player)

    localTracks[1].play(`user-${UID}`) // create a video tag and start to play that

    await client.publish([localTracks[0],localTracks[1]]) // let other users use
}

let handleUserJoined = async(user, mediaType) => {
    remoteUsers[user.uid] = user
    await client.subscribe(user, mediaType)

    if (mediaType === 'video'){
        let player = document.getElementById(`user-container-${user.uid}`)

        if (player != null){
            player.remove()
        }

        let member = await getMember(user)
        player = `<div class="video-container" id="user-container-${user.uid}">
                        <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
                        <div class="video-player" id="user-${user.uid}"></div>
                  </div>`
        document.getElementById('video-streams').insertAdjacentHTML('beforeend',player)

        user.videoTrack.play(`user-${user.uid}`)
    }

    if (mediaType === 'audio'){
        user.audioTrack.play()
    }

}

let handleUserLeft = async(user) => {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
}

let leaveAndRemoveLocalStream = async() => {
    for (let index =0; localTracks.length > index ; index++ ){
        localTracks[index].stop()
        localTracks[index].close()
    }

    await client.leave()
    let status =await deleteMember()
//    alert(status)
    if (status === true){
//        alert(status)
        window.open('/','_self')
    }

}


let toggleCamera = async(e) =>{
    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        e.target.style.backgroundColor = '#fff'
    }
    else{
        await localTracks[1].setMuted(true)
        e.target.style.backgroundColor = 'rgba(255,80,80,1)'
    }
}


let toggleMic = async(e) =>{
    if(localTracks[0].muted){
        await localTracks[0].setMuted(false)
        e.target.style.backgroundColor = '#fff'
    }
    else{
        await localTracks[0].setMuted(true)
        e.target.style.backgroundColor = 'rgba(255,80,80,1)'
    }
}


let createMember = async() => {
    let response = await fetch('/create_member/',{
        method:'POST',
        header: {
            'Content_Type':'application/json'
        },
        body:JSON.stringify({'name':NAME, 'room_name':CHANNEL, 'uid':UID})
    })
    let member = await  response.json()
    return member
}

let getMember = async(user) => {
    let response = await fetch(`/get_mamber/?UID=${user.uid}&room_name=${CHANNEL}`)
    let member = await response.json()

    return member
}

let deleteMember = async() => {
    let response = await fetch('/delete_member/',{
        method:'POST',
        header: {
            'Content_Type':'application/json'
        },
        body:JSON.stringify({'name':NAME, 'room_name':CHANNEL, 'uid':UID})
    })
    let member = await  response.json()
    return member.status
}



joinAndDisplayLocalStream()

window.addEventListener('beforeunload', deleteMember)

document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream)
document.getElementById('camera-btn').addEventListener('click', toggleCamera)
document.getElementById('mic-btn').addEventListener('click', toggleMic)