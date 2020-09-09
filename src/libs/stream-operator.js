//@flow

export const getSourceMediaStream = async ():Promise<MediaStream> => {
  console.log( 0 )
  const stream = await window.navigator.mediaDevices.getUserMedia({video: true, audio: true})
    .catch( err => {throw err})
  console.log( stream )

  return stream
}