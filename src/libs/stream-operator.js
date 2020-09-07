//@flow

export const getSourceMediaStream = async ():Promise<MediaStream> => {
  return await window.navigator.mediaDevices.getUserMedia({video: true, audio: true})
}