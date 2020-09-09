//@flow

export const getSourceMediaStream = async ():Promise<MediaStream> => {
  const stream = await window.navigator.mediaDevices.getUserMedia({video: true, audio: true})
    .catch( err => {throw err})

  return stream
}
