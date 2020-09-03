const rtcConf = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302"
    }
  ]
}
export async function createCon(offer) {
  try {
    let lastIceResolver, connectionResolver;
    let getIce = new Promise((r) => (lastIceResolver = r));
    let result = {
      offer: "",
      answer: "",
      setAnswer: (ans) =>
      result.pc.setRemoteDescription(
        new RTCSessionDescription(JSON.parse(ans))
      ),
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
      __eventListeners: {},
    };

    const msghandler = (msg) => {
      try {
        let jmsg = JSON.parse(msg.data);
        if (result.__eventListeners[jmsg.event])
          result.__eventListeners[jmsg.event](jmsg.data);
      } catch (e) {
        console.error(e);
      }
    };

    result.pc.onicecandidate = (e) => {
      if (!e.candidate) return lastIceResolver();
    };

    if (!offer) {
      let dataChannel = result.pc.createDataChannel("dataChannel");
      dataChannel.onopen = () => {
        connectionResolver();
        dataChannel.onmessage = msghandler;
        console.log("sender opened");
      };

      result.pc
        .createOffer()
        .then((o) => {
          result.pc.setLocalDescription(o);
        })
        .catch(console.error);
      await getIce;
      result.offer = JSON.stringify(result.pc.localDescription);
    } else {
      result.pc.ondatachannel = (e) => {
        result.channel.dataChannel = e.channel;
        e.channel.onmessage = msghandler;
      };
      result.answerText = await result.pc
        .setRemoteDescription(offer)
        .then(() => result.pc.createAnswer())
        .then((answer) => result.pc.setLocalDescription(answer))
        .then(() => getIce)
        .then(() => JSON.stringify(result.pc.localDescription));
    }
    return result;
  } catch (e) {
    console.error(e);
    return null;
  }
}
