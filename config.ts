export const config = {
  token: process.env.DISCORD_BOT_TOKEN!,
  ticketChannelId: "1514242715028553788",
  staffRoleId: "1516606754304032859",
  categoryId: process.env.TICKET_CATEGORY_ID || null,
};

export const ticketTypes = [
  {
    id: "inquiry",
    label: "استفسار",
    emoji: "❓",
    color: 0x3498db as const,
    description: "لديك استفسار وتريد مساعدة",
  },
  {
    id: "complaint_member",
    label: "شكوى على عضو",
    emoji: "⚠️",
    color: 0xe67e22 as const,
    description: "تريد تقديم شكوى ضد أحد الأعضاء",
  },
  {
    id: "complaint_admin",
    label: "شكوى على إداري",
    emoji: "🛡️",
    color: 0xe74c3c as const,
    description: "تريد تقديم شكوى ضد أحد الإداريين",
  },
  {
    id: "suggestion",
    label: "اقتراح",
    emoji: "💡",
    color: 0x2ecc71 as const,
    description: "لديك اقتراح لتحسين السيرفر",
  },
];
