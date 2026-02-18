import { useRef, useEffect, useState, useCallback } from "react";
import { useSocket } from "../hooks/useSocket";
import { useStore } from "../store/useStore";
import throttle from "lodash.throttle";

interface Point {
  x: number;
  y: number;
}

interface DrawData {
  prevPoint: Point | null;
  currentPoint: Point;
  color: string;
  size: number;
}

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const prevPoint = useRef<Point | null>(null);
  const socket = useSocket();
  const { brushColor, brushSize, roomId } = useStore();

  const drawLine = (
    context: CanvasRenderingContext2D,
    start: Point | null,
    end: Point,
    color: string,
    size: number,
  ) => {
    context.beginPath();
    context.lineWidth = size;
    context.strokeStyle = color;
    context.lineCap = "round";
    context.lineJoin = "round";

    if (start) {
      context.moveTo(start.x, start.y);
    } else {
      context.moveTo(end.x, end.y);
    }

    context.lineTo(end.x, end.y);
    context.stroke();
  };

  // Throttled cursor movement emission
  const emitCursorMove = useCallback(
    throttle((cursor: Point) => {
      if (socket && roomId) {
        socket.emit("cursor-move", { roomId, cursor });
      }
    }, 33), // ~30 fps
    [socket, roomId],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const handleResize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (canvas.width !== width || canvas.height !== height) {
        // Save current content
        const tempImage = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height,
        );
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Restore content
        context.putImageData(tempImage, 0, 0);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    if (socket) {
      socket.on("draw-data", (data: DrawData) => {
        drawLine(
          context,
          data.prevPoint,
          data.currentPoint,
          data.color,
          data.size,
        );
      });

      socket.on("get-canvas-state", (history: DrawData[]) => {
        history.forEach((data) => {
          drawLine(
            context,
            data.prevPoint,
            data.currentPoint,
            data.color,
            data.size,
          );
        });
      });

      socket.on("clear-canvas", () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
      });
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (socket) {
        socket.off("draw-data");
        socket.off("get-canvas-state");
        socket.off("clear-canvas");
      }
    };
  }, [socket]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const point = getPoint(e);
    prevPoint.current = point;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    prevPoint.current = null;
  };

  const getPoint = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    const currentPoint = getPoint(e);
    emitCursorMove(currentPoint);

    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const drawData: DrawData = {
      prevPoint: prevPoint.current,
      currentPoint,
      color: brushColor,
      size: brushSize,
    };

    drawLine(
      context,
      drawData.prevPoint,
      drawData.currentPoint,
      drawData.color,
      drawData.size,
    );

    if (socket && roomId) {
      socket.emit("draw-data", { roomId, drawData });
    }

    prevPoint.current = currentPoint;
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
      className="absolute inset-0 w-full h-full bg-transparent"
    />
  );
};