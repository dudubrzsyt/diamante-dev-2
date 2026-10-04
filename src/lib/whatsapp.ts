export const PHONE_NUMBER = "+551155229775";
export const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER || "5511992179989").replace(/\D/g, "");

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
