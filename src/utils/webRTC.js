const rtcConf = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun.2.google.com:19302" },
    { urls: "stun:stun.3.google.com:19302" },
    { urls: "stun:stun.4.google.com:19302" },
    { urls: "stun:stun.stunprotocol.org" },
  ],
};
export default async function createCon(offer) {
  try {
    let lastIceResolver, connectionResolver;
    let getIce = new Promise((r) => (lastIceResolver = r));
    let result = {
      offer: null,
      answer: null,
      setAnswer: (ans) =>
        result.pc.setRemoteDescription(new RTCSessionDescription(ans)),
      pc: new RTCPeerConnection(rtcConf),
      connected: new Promise((r) => (connectionResolver = r)),
      channel: {
        dataChannel: null,
        on: (event, callback = () => {}) => {
          if (event) result.__eventListeners[event] = callback;
        },
        emit: async (event, data) => {
          await result.connected;
          result.channel.dataChannel.send(JSON.stringify({ event, data }));
        },
      },
      __eventListeners: { "*": () => {} },
    };

    const msghandler = (msg) => {
      try {
        let jmsg = JSON.parse(msg.data);

        if (jmsg.candidate) {
          result.pc.addIceCandidate(jmsg.candidate).catch(console.error);
          return;
        }
        if (result.__eventListeners[jmsg.event])
          result.__eventListeners[jmsg.event](jmsg.data);
        result.__eventListeners["*"](jmsg.event, jmsg.data);
      } catch (e) {
        console.error(e);
      }
    };
    let offered;
    result.pc.onicecandidate = (e) => {
      if (!e.candidate) return;
      if (!offered) {
        offered = true;
        return lastIceResolver();
      }
      return result.connected.then(() => {
        result.channel.dataChannel.send(
          JSON.stringify({ candidate: e.candidate.toJSON() })
        );
      });
    };

    if (!offer) {
      result.channel.dataChannel = result.pc.createDataChannel("dataChannel");
      result.channel.dataChannel.onopen = () => {
        result.channel.dataChannel.onmessage = msghandler;
        connectionResolver();
      };

      result.pc
        .createOffer()
        .then((o) => {
          result.pc.setLocalDescription(o);
        })
        .catch(console.error);
      await getIce;
      result.offer = result.pc.localDescription.toJSON();
    } else {
      result.pc.ondatachannel = (e) => {
        result.channel.dataChannel = e.channel;
        connectionResolver();
        result.channel.dataChannel.onmessage = msghandler;
      };
      result.answer = await result.pc
        .setRemoteDescription(offer)
        .then(() => result.pc.createAnswer())
        .then((answer) => result.pc.setLocalDescription(answer))
        .then(() => getIce)
        .then(() => result.pc.localDescription.toJSON());
    }
    return result;
  } catch (e) {
    console.error(e);
    return null;
  }
}
