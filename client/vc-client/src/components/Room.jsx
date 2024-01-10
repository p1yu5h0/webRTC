import React, { useCallback, useState, useEffect } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../services/peer";

const RoomPage = () => {
  const [remoteSocketId, setRemoteSocketId] = useState(0);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const socket = useSocket();

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", {
      to: remoteSocketId,
      offer,
    });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`User with email: ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);

      console.log(`Incoming call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
        peer.peer.addTrack(track, myStream);
      }
  }, [myStream])

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  const handleNegoNeedIncomming = useCallback(async ({from, offer})=>{
    const ans = await peer.getAnswer(offer);
    socket.emit("peer:nego:done", {to: from, ans});
  }, [socket])

  const handleNegoNeedFinal = useCallback(async ({ans})=>{
    await peer.setLocalDescription(ans);
  }, [])

  useEffect(() => {
    peer.peer.addEventListener("track", async (event) => {
      const remoteStream = event.streams;
      console.log(`GOT TRACKS!!`)
      setRemoteStream(remoteStream[0]);
    });
  }, [remoteStream]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal)
    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal)
    };
  }, [socket, handleUserJoined, handleIncommingCall, handleCallAccepted, handleNegoNeedIncomming, handleNegoNeedFinal]);

  return (
    <div>
      <h1>Room Page</h1>
      <h2>{remoteSocketId ? "New User Connected" : "No one in the room"}</h2>
      {remoteSocketId && <button onClick={handleCallUser}>CALL</button>}
      {myStream && <button onClick={sendStreams}>
        Send Stream
      </button>}
      {myStream && (
        <>
          <h3>My Stream:</h3>
          <ReactPlayer
            width="300px"
            height="300px"
            playing
            muted
            url={myStream}
          />
        </>
      )}
      {remoteStream && (
        <>
          <h3>Remote Stream:</h3>
          <ReactPlayer
            width="300px"
            height="300px"
            playing
            muted
            url={remoteStream}
          />
        </>
      )}
    </div>
  );
};

export default RoomPage;
