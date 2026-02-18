import { Minus, Plus, Trash2, LogOut } from "lucide-react";
import { useStore } from "../store/useStore";
import { useSocket } from "../hooks/useSocket";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COLORS = [
  "#ffffff", // White
  "#f87171", // Red
  "#fbbf24", // Amber
  "#4ade80", // Green
  "#60a5fa", // Blue
  "#a78bfa", // Violet
  "#f472b6", // Pink
];

export const Toolbar = () => {
  const {
    brushColor,
    setBrushColor,
    brushSize,
    setBrushSize,
    roomId,
    setRoomId,
  } = useStore();
  const socket = useSocket();

  const handleClear = () => {
    if (socket && roomId) {
      socket.emit("clear-canvas", roomId);
    }
  };

  const handleExit = () => {
    setRoomId(null);
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-4 glass-dark rounded-full custom-shadow border border-white/10">
      {/* Colors */}
      <div className="flex items-center gap-2 pr-4 border-r border-white/10">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => setBrushColor(color)}
            className={cn(
              "w-6 h-6 rounded-full transition-transform hover:scale-125 border border-white/20",
              brushColor === color &&
                "scale-125 ring-2 ring-white/50 ring-offset-2 ring-offset-transparent",
            )}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {/* Brush Size */}
      <div className="flex items-center gap-3 px-4 border-r border-white/10">
        <button
          onClick={() => setBrushSize(Math.max(1, brushSize - 2))}
          className="p-1 hover:bg-white/10 rounded-md transition-colors"
        >
          <Minus size={18} />
        </button>
        <span className="text-sm font-medium w-4 text-center">{brushSize}</span>
        <button
          onClick={() => setBrushSize(Math.min(50, brushSize + 2))}
          className="p-1 hover:bg-white/10 rounded-md transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pl-2">
        <button
          onClick={handleClear}
          className="p-2 hover:bg-red-500/20 text-red-400 rounded-md transition-colors flex items-center gap-2"
          title="Clear Canvas"
        >
          <Trash2 size={20} />
        </button>
        <button
          onClick={handleExit}
          className="p-2 hover:bg-white/10 text-white rounded-md transition-colors"
          title="Exit Room"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
};