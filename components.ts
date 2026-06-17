import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} from "discord.js";
import { ticketTypes } from "./config.js";

export function buildOpenTicketButtons(): ActionRowBuilder<ButtonBuilder>[] {
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  const chunks = [];
  for (let i = 0; i < ticketTypes.length; i += 3) {
    chunks.push(ticketTypes.slice(i, i + 3));
  }
  for (const chunk of chunks) {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      chunk.map((t) =>
        new ButtonBuilder()
          .setCustomId(`open_ticket_${t.id}`)
          .setLabel(t.label)
          .setEmoji(t.emoji)
          .setStyle(ButtonStyle.Primary)
      )
    );
    rows.push(row);
  }
  return rows;
}

export function buildCloseTicketRow(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("close_ticket")
      .setLabel("إغلاق التذكرة")
      .setEmoji("🔒")
      .setStyle(ButtonStyle.Danger)
  );
}

export function buildConfirmCloseRow(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("confirm_close")
      .setLabel("تأكيد الإغلاق")
      .setEmoji("✅")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("cancel_close")
      .setLabel("إلغاء")
      .setEmoji("❌")
      .setStyle(ButtonStyle.Secondary)
  );
}
