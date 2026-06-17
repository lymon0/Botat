import {
  Client,
  GatewayIntentBits,
  Events,
  ButtonInteraction,
  ChatInputCommandInteraction,
  Interaction,
  REST,
  Routes,
  SlashCommandBuilder,
  TextChannel,
  PermissionFlagsBits,
} from "discord.js";
import { config } from "./config.js";
import { buildPanelEmbed } from "./embeds.js";
import { buildOpenTicketButtons } from "./components.js";
import {
  handleOpenTicket,
  handleCloseTicket,
  handleConfirmClose,
  handleCancelClose,
} from "./handlers.js";
import { logger } from "../lib/logger.js";

const commands = [
  new SlashCommandBuilder()
    .setName("setup-tickets")
    .setDescription("أرسل لوحة التذاكر إلى القناة المحددة")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .toJSON(),
];

export async function startBot() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
    ],
  });

  client.once(Events.ClientReady, async (c) => {
    logger.info({ tag: c.user.tag }, "Discord bot is ready");

    // Register slash commands
    try {
      const rest = new REST().setToken(config.token);
      await rest.put(Routes.applicationCommands(c.user.id), { body: commands });
      logger.info("Slash commands registered");
    } catch (err) {
      logger.error(err, "Failed to register slash commands");
    }

    // Try to auto-send the panel on startup
    await sendOrUpdatePanel(c);
  });

  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      const cmd = interaction as ChatInputCommandInteraction;
      if (cmd.commandName === "setup-tickets") {
        await cmd.deferReply({ ephemeral: true });
        const success = await sendOrUpdatePanel(client);
        if (success) {
          await cmd.editReply(`✅ تم إرسال لوحة التذاكر إلى <#${config.ticketChannelId}>`);
        } else {
          await cmd.editReply(
            `❌ فشل الإرسال. تأكد أن البوت عنده صلاحية **View Channel** و **Send Messages** على القناة <#${config.ticketChannelId}>.`
          );
        }
      }
      return;
    }

    // Handle button interactions
    if (!interaction.isButton()) return;
    const btn = interaction as ButtonInteraction;

    try {
      if (btn.customId.startsWith("open_ticket_")) {
        const typeId = btn.customId.replace("open_ticket_", "");
        await handleOpenTicket(btn, typeId);
      } else if (btn.customId === "close_ticket") {
        await handleCloseTicket(btn);
      } else if (btn.customId === "confirm_close") {
        await handleConfirmClose(btn);
      } else if (btn.customId === "cancel_close") {
        await handleCancelClose(btn);
      }
    } catch (err) {
      logger.error(err, "Error handling interaction");
      try {
        if (btn.replied || btn.deferred) {
          await btn.followUp({ content: "حدث خطأ، حاول مجدداً.", ephemeral: true });
        } else {
          await btn.reply({ content: "حدث خطأ، حاول مجدداً.", ephemeral: true });
        }
      } catch {}
    }
  });

  await client.login(config.token);
}

export async function sendOrUpdatePanel(client: Client): Promise<boolean> {
  try {
    const channel = await client.channels.fetch(config.ticketChannelId);
    if (!channel || !channel.isTextBased()) {
      logger.warn({ channelId: config.ticketChannelId }, "Ticket panel channel not found or not text-based");
      return false;
    }

    const textChannel = channel as TextChannel;
    const messages = await textChannel.messages.fetch({ limit: 20 });
    const existing = messages.find(
      (m) => m.author.id === client.user!.id && m.embeds.length > 0
    );

    const embed = buildPanelEmbed();
    const rows = buildOpenTicketButtons();

    if (existing) {
      await existing.edit({ embeds: [embed], components: rows });
      logger.info("Ticket panel updated");
    } else {
      await textChannel.send({ embeds: [embed], components: rows });
      logger.info({ channelId: config.ticketChannelId }, "Ticket panel sent");
    }
    return true;
  } catch (err: any) {
    if (err?.code === 50001) {
      logger.warn(
        { channelId: config.ticketChannelId },
        "Missing Access to ticket panel channel — make sure the bot has View Channel + Send Messages permissions on that channel"
      );
    } else {
      logger.error(err, "Failed to send/update ticket panel");
    }
    return false;
  }
}
