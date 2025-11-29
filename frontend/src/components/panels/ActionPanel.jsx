import { createPortal } from "react-dom";
import { useActionPanel } from "../../context/ActionPanelContext";

function ActionPanel() {
  const { isOpen, position, content, closePanel } = useActionPanel();

  if (!isOpen) return null;

  return createPortal(
    <div
      id="action-panel"
      className="
        fixed 
        bg-white 
        border border-gray-200 
        rounded-xl 
        shadow-xl 
        p-2 
        z-[1000]
        min-w-[200px]
        text-sm
        animate-fade-in
      "
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onMouseLeave={closePanel}
    >
      {content}
    </div>,
    document.body
  );
}

export default ActionPanel;
