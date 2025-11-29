import { createContext, useState, useCallback, useContext, useEffect } from "react";

const ActionPanelContext = createContext();

export const ActionPanelProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [content, setContent] = useState(null);
  const [anchorRect, setAnchorRect] = useState(null); // 👈 сюда запомним координаты кнопки

  const openPanel = useCallback((x, y, panelContent, anchor) => {
    setPosition({ x, y });
    setContent(panelContent);
    setAnchorRect(anchor || null);
    setIsOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsOpen(false);
    setContent(null);
    setAnchorRect(null);
  }, []);

  // 👇 Автоматическое закрытие при уходе мыши
  useEffect(() => {
    if (!isOpen) return;
    let timeoutId = null;

    const handleMove = (e) => {
      const panel = document.querySelector("#action-panel");
      const overPanel = panel?.contains(e.target);
      const overButton =
        anchorRect &&
        e.clientX >= anchorRect.left &&
        e.clientX <= anchorRect.right &&
        e.clientY >= anchorRect.top &&
        e.clientY <= anchorRect.bottom;

      if (!overPanel && !overButton) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          // проверяем ещё раз перед закрытием
          const panelNow = document.querySelector("#action-panel");
          const stillOver =
            panelNow?.contains(document.elementFromPoint(e.clientX, e.clientY));
          if (!stillOver) closePanel();
        }, 150); // 👈 задержка 150 мс
      } else {
        clearTimeout(timeoutId);
      }
    };

    window.addEventListener("mousemove", handleMove);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("mousemove", handleMove);
    };
  }, [isOpen, anchorRect, closePanel]);


  return (
    <ActionPanelContext.Provider value={{ isOpen, position, content, openPanel, closePanel }}>
      {children}
    </ActionPanelContext.Provider>
  );
};

export const useActionPanel = () => useContext(ActionPanelContext);
