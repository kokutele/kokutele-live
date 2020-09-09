// @flow

export const checkWebCodecsSupported = ():boolean => {
  return !!window.VideoEncoder
}