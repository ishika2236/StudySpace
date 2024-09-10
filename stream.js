const APP_ID = "d7055ebabe4b4bf08032f06c5fe966e0"
const TOKEN = "007eJxTYHC72xTpIdBgrKLkEfAq+NQBxs/Xm6/HvuVct/WQwpnW+VsVGFLMDUxNU5MSk1JNkkyS0gwsDIyN0gzMkk3TUi3NzFINjiy8l9YQyMiwT/MBIyMDBIL4bAyZxRmZ2YkMDADMJSIF"
const CHANNEL = "ishika"

const client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'})

let localTracks = []
let remoteUsers = {}

let joinAndDisplayLocalStream = async () => {

    client.on('user-published', handleUserJoined)
    
    client.on('user-left', handleUserLeft)
    
    let UID = await client.join(APP_ID, CHANNEL, TOKEN, null)

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks() 

    let player = `<div class="video-container" id="user-container-${UID}">
                        <div class="video-player" id="user-${UID}"></div>
                  </div>`
    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

    localTracks[1].play(`user-${UID}`)
    
    await client.publish([localTracks[0], localTracks[1]])
}

let joinStream = async () => {
    await joinAndDisplayLocalStream()
    document.getElementById('join-btn').style.display = 'none'
    document.getElementById('stream-controls').style.display = 'flex'
}

let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.uid] = user 
    await client.subscribe(user, mediaType)

    if (mediaType === 'video'){
        let player = document.getElementById(`user-container-${user.uid}`)
        if (player != null){
            player.remove()
        }

        player = `<div class="video-container" id="user-container-${user.uid}">
                        <div class="video-player" id="user-${user.uid}"></div> 
                 </div>`
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

        user.videoTrack.play(`user-${user.uid}`)
    }

    if (mediaType === 'audio'){
        user.audioTrack.play()
    }
}

let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
}

let leaveAndRemoveLocalStream = async () => {
    for(let i = 0; localTracks.length > i; i++){
        localTracks[i].stop()
        localTracks[i].close()
    }

    await client.leave()
    document.getElementById('join-btn').style.display = 'block'
    document.getElementById('stream-controls').style.display = 'none'
    document.getElementById('video-streams').innerHTML = ''
}

let toggleMic = async (e) => {
    if (localTracks[0].muted){
        await localTracks[0].setMuted(false)
        e.target.innerText = 'Mic on'
        e.target.style.backgroundColor = 'cadetblue'
    }else{
        await localTracks[0].setMuted(true)
        e.target.innerText = 'Mic off'
        e.target.style.backgroundColor = '#EE4B2B'
    }
}

let toggleCamera = async (e) => {
    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        e.target.innerText = 'Camera on'
        e.target.style.backgroundColor = 'cadetblue'
    }else{
        await localTracks[1].setMuted(true)
        e.target.innerText = 'Camera off'
        e.target.style.backgroundColor = '#EE4B2B'
    }
}
let toggleScreen = async (e) => {
    if (!isScreenSharing) {
        screenTrack = await AgoraRTC.createScreenVideoTrack()
        await client.unpublish(localTracks[1])
        await client.publish(screenTrack)
        localTracks[1].stop()
        screenTrack.play(`user-${client.uid}`)
        isScreenSharing = true
        e.target.innerText = 'Stop Sharing'
        e.target.style.backgroundColor = '#EE4B2B'
    } else {
        await client.unpublish(screenTrack)
        screenTrack.stop()
        screenTrack.close()
        await client.publish(localTracks[1])
        localTracks[1].play(`user-${client.uid}`)
        isScreenSharing = false
        e.target.innerText = 'Share Screen'
        e.target.style.backgroundColor = '#0077be'
    }
}

let toggleWhiteboard = (e) => {
    const whiteboard = document.getElementById('whiteboard')
    if (whiteboard.style.display === 'none') {
        whiteboard.style.display = 'block'
        e.target.style.backgroundColor = '#EE4B2B'
    } else {
        whiteboard.style.display = 'none'
        e.target.style.backgroundColor = '#0077be'
    }
}

// Whiteboard functionality
const whiteboard = document.getElementById('whiteboard')
const ctx = whiteboard.getContext('2d')

let isDrawing = false
let lastX = 0
let lastY = 0

whiteboard.addEventListener('mousedown', startDrawing)
whiteboard.addEventListener('mousemove', draw)
whiteboard.addEventListener('mouseup', stopDrawing)
whiteboard.addEventListener('mouseout', stopDrawing)

function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY]
}

function draw(e) {
    if (!isDrawing) return
    ctx.beginPath()
    ctx.moveTo(lastX, lastY)
    ctx.lineTo(e.offsetX, e.offsetY)
    ctx.stroke()
    ;[lastX, lastY] = [e.offsetX, e.offsetY]
}

function stopDrawing() {
    isDrawing = false
}


document.getElementById('join-btn').addEventListener('click', joinStream)
document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream)
document.getElementById('mic-btn').addEventListener('click', toggleMic)
document.getElementById('camera-btn').addEventListener('click', toggleCamera)
document.getElementById('screen-btn').addEventListener('click', toggleScreen)
document.getElementById('whiteboard-btn').addEventListener('click', toggleWhiteboard)