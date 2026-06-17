import { EmbedBuilder } from "discord.js";
import { ticketTypes } from "./config.js";

export function buildPanelEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle("🎫 نظام التذاكر")
    .setDescription(
      "مرحباً بك في نظام الدعم!\nاختر نوع التذكرة المناسب من الأزرار أدناه وسيتم فتح قناة خاصة بك."
    )
    .setColor(0x5865f2)
    .addFields(
      ticketTypes.map((t) => ({
        name: `${t.emoji} ${t.label}`,
        value: t.description,
        inline: true,
      }))
    )
    .setFooter({ text: "سيتم الرد عليك في أقرب وقت ممكن" })
    .setTimestamp();
}

export function buildTicketEmbed(
  type: (typeof ticketTypes)[number],
  userName: string
): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle(`${type.emoji} ${type.label}`)
    .setDescription(
      `مرحباً **${userName}**!\n\nتم فتح تذكرتك بنجاح.\nيرجى شرح طلبك بالتفصيل وسيقوم فريق الإدارة بالرد عليك قريباً.`
    )
    .setColor(type.color)
    .addFields([
      { name: "نوع التذكرة", value: `${type.emoji} ${type.label}`, inline: true },
      { name: "الحالة", value: "🟢 مفتوحة", inline: true },
    ])
    .setFooter({ text: "لإغلاق التذكرة اضغط زر الإغلاق أدناه" })
    .setTimestamp();
}

export function buildClosedEmbed(closedBy: string): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle("🔒 تم إغلاق التذكرة")
    .setDescription(`تم إغلاق هذه التذكرة بواسطة **${closedBy}**`)
    .setColor(0x99aab5)
    .setTimestamp();
}
