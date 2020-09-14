export const iceServers = {
  'iceServers': [
    {
      'urls': 'stun:stun.l.google.com:19302'
    },
    {
      'urls': 'turn:153.127.59.144:443?transport=udp',
      'credential': 'PPVnrp4D',
      'username': 'kokutele'
    },
    {
      'urls': 'turn:153.127.59.144:443?transport=tcp',
      'credential': 'PPVnrp4D',
      'username': 'kokutele'
    }
  ]
}