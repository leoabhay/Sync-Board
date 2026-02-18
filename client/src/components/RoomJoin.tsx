import { useState } from "react";
import { useStore } from "../store/useStore";
import { MousePointer2, Users, Layers } from "lucide-react";

export const RoomJoin = () => {
  const [roomInput, setRoomInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const { setRoomId, setUserName } = useStore();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomInput.trim() && nameInput.trim()) {
      setUserName(nameInput.trim());
      setRoomId(roomInput.trim());
    }
  };

  const generateRandomRoom = () => {
    const id = Math.random().toString(36).substring(2, 8);
    setRoomInput(id);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[var(--bg-gradient)]">
      <div className="max-w-md w-full glass p-8 rounded-3xl custom-shadow border border-white/10 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
            <Layers className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2 bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
            SyncBoard
          </h1>
          <p className="text-blue-200/60 font-medium">
            Real-time collaborative canvas
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/70 ml-1">
              Display Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Abhay"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full px-5 py-4 rounded-xl glass-dark border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/70 ml-1">
              Room Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Enter or generate code"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                className="flex-1 px-5 py-4 rounded-xl glass-dark border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono uppercase tracking-widest text-sm"
              />
              <button
                type="button"
                onClick={generateRandomRoom}
                className="px-4 py-4 rounded-xl glass-dark border border-white/10 hover:bg-white/5 transition-all text-white/70"
                title="Generate random room"
              >
                <MousePointer2 size={20} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-white text-blue-950 font-bold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all shadow-xl shadow-white/10"
          >
            Enter Workspace
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 flex justify-center gap-6">
          <div className="flex items-center gap-2 text-white/40 text-xs font-medium uppercase tracking-wider">
            <Users size={14} />
            <span>Multi-user</span>
          </div>
          <div className="flex items-center gap-2 text-white/40 text-xs font-medium uppercase tracking-wider">
            <Layers size={14} />
            <span>Instant Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};