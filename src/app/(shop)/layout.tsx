import { ChatbotWidget } from "@/components/chatbotWidget";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <ChatbotWidget />
    </>
  );
}
