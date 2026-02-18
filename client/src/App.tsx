import { useStore } from "./store/useStore";
import { Canvas } from "./components/Canvas";
import { Toolbar } from "./components/Toolbar";
import { RoomJoin } from "./components/RoomJoin";
import { UserPresence } from "./components/UserPresence";

function App() {
  const { roomId, isJoined } = useStore();

  if (!roomId || !isJoined) {
    return <RoomJoin />;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[var(--bg-gradient)]">
      {/* Background patterns */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#ffffff 0.5px, transparent 0.5px)",
          backgroundSize: "24px 24px",
        }}
      />

      <Canvas />
      <UserPresence />
      <Toolbar />

      {/* Room Badge */}
      <div className="fixed top-6 left-6 z-40 flex items-center gap-3 px-4 py-2 glass rounded-full border border-white/10 group animate-in slide-in-from-left duration-300">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-sm shadow-green-400/50" />
        <span className="text-xs font-bold tracking-widest text-white/70 uppercase">
          Room: {roomId}
        </span>
      </div>
    </div>
  );
}

export default App;