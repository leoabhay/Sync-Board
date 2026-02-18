import { create } from "zustand";

interface User {
  id: string;
  name: string;
  cursor?: { x: number; y: number };
}

interface AppState {
  brushColor: string;
  brushSize: number;
  roomId: string | null;
  userName: string;
  users: User[];
  isJoined: boolean;

  setBrushColor: (color: string) => void;
  setBrushSize: (size: number) => void;
  setRoomId: (id: string | null) => void;
  setUserName: (name: string) => void;
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  removeUser: (userId: string) => void;
  updateUserCursor: (userId: string, cursor: { x: number; y: number }) => void;
  setIsJoined: (status: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  brushColor: "#ffffff",
  brushSize: 5,
  roomId: null,
  userName: "",
  users: [],
  isJoined: false,

  setBrushColor: (brushColor) => set({ brushColor }),
  setBrushSize: (brushSize) => set({ brushSize }),
  setRoomId: (roomId) => set({ roomId }),
  setUserName: (userName) => set({ userName }),
  setUsers: (users) => set({ users }),
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  removeUser: (userId) =>
    set((state) => ({ users: state.users.filter((u) => u.id !== userId) })),
  updateUserCursor: (userId, cursor) =>
    set((state) => ({
      users: state.users.map((u) => (u.id === userId ? { ...u, cursor } : u)),
    })),
  setIsJoined: (isJoined) => set({ isJoined }),
}));