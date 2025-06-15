import { useParams } from "react-router-dom";
import { ChatStart } from "../components/ChatStart";
import { ChatThread } from "../components/ChatThread";

// App color classes and font are already set via Tailwind config and index.css

export default function Chat() {
  const { threadId } = useParams<{ threadId?: string }>();

  // Show landing/new chat UI if no threadId
  if (!threadId) {
    return <ChatStart />;
  }
  // Otherwise show active chat thread
  return <ChatThread />;
}
