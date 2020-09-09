// @flow

export const checkWebCodecsSupported = ():boolean => {
  return !!window.VideoEncoder
}

export const checkInsertableStreamsSupported = ():boolean => {
  return !!window.RTCRtpSender.prototype.createEncodedVideoStreams
}