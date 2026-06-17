import {
  ButtonInteraction,
  ChannelType,
  Guild,
  GuildMember,
  PermissionFlagsBits,
  TextChannel,
  EmbedBuilder,
} from "discord.js";
import { config, ticketTypes } from "./config.js";
import { buildTicketEmbed, buildClosedEmbed } from "./embeds.js";
import { buildCloseTicketRow, buildConfirmCloseRow } from "./components.js";
import { logger } from "../lib/logger.js";

export async function handleOpenTicket(
  interaction: ButtonInteraction,
  typeId: string
) {
  const type = ticketTypes.find((t) => t.id === typeId);
  if (!type) return;

  await interaction.deferReply({ ephemeral: true });

  const guild = interaction.guild as Guild;
  const member = interaction.member as GuildMember;
  const channelName = `${type.emoji}-${member.user.username}`.toLowerCase().replace(/[^a-z0-9\-]/g, "-").slice(0, 50);

  const existing = guild.channels.cache.find(
    (c) =>
      c.name === channelName &&
      c.type === ChannelType.GuildText
  );

  if (existing) {
    await interaction.editReply({
      content: `لديك تذكرة مفتوحة بالفعل! <#${existing.id}>`,
    });
    return;
  }

  const overwrites: any[] = [
    {
      id: guild.roles.everyone,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    {
      id: member.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.AttachFiles,
      ],
    },
    {
      id: config.staffRoleId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.ManageMessages,
      ],
    },
  ];

  const channelOptions: any = {
    name: channelName,
    type: ChannelType.GuildText,
    permissionOverwrites: overwrites,
    topic: `تذكرة ${type.label} - مفتوحة بواسطة ${member.user.tag}`,
  };

  if (config.categoryId) {
    channelOptions.parent = config.categoryId;
  }

  const channel = await guild.channels.create(channelOptions) as TextChannel;

  const embed = buildTicketEmbed(type, member.user.username);
  await channel.send({
    content: `<@${member.id}> | <@&${config.staffRoleId}>`,
    embeds: [embed],
    components: [buildCloseTicketRow()],
  });

  await interaction.editReply({
    content: `✅ تم فتح تذكرتك بنجاح! <#${channel.id}>`,
  });

  logger.info({ userId: member.id, type: typeId, channel: channel.name }, "Ticket opened");
}

export async function handleCloseTicket(interaction: ButtonInteraction) {
  await interaction.reply({
    content: "هل أنت متأكد من إغلاق هذه التذكرة؟",
    components: [buildConfirmCloseRow()],
    ephemeral: true,
  });
}

export async function handleConfirmClose(interaction: ButtonInteraction) {
  await interaction.deferUpdate();
  const channel = interaction.channel as TextChannel;
  const closedBy = (interaction.member as GuildMember).user.username;

  const embed = buildClosedEmbed(closedBy);
  await channel.send({ embeds: [embed] });

  logger.info({ channel: channel.name, closedBy }, "Ticket closed");

  setTimeout(async () => {
    try {
      await channel.delete(`Ticket closed by ${closedBy}`);
    } catch (e) {
      logger.error(e, "Failed to delete ticket channel");
    }
  }, 5000);
}

export async function handleCancelClose(interaction: ButtonInteraction) {
  await interaction.update({
    content: "❌ تم إلغاء الإغلاق.",
    components: [],
  });
}
