import { useStore } from "../store/useStore";
import { useSocket } from "../hooks/useSocket";

export const UserPresence = () => {
  const { users } = useStore();
  const socket = useSocket();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {users.map((user) => {
        if (!user.cursor || (socket && user.id === socket.id)) return null;

        return (
          <div
            key={user.id}
            className="absolute transition-all duration-75 ease-out"
            style={{
              left: user.cursor.x,
              top: user.cursor.y,
              transform: "translate(-2px, -2px)",
            }}
          >
            {/* Cursor Dot */}
            <div
              className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: "#60a5fa" }}
            />

            {/* Label */}
            <div className="ml-4 mt-2 px-2 py-1 rounded-md glass text-[10px] font-bold text-white whitespace-nowrap border border-white/20">
              {user.name}
            </div>
          </div>
        );
      })}
    </div>
  );
};