"use client";

import posthog from "posthog-js";

export const portfolioLog = {
  artworkOpened(artworkId: string, category?: string) {
    posthog.logger.info("portfolio artwork opened", {
      interaction: "gallery_artwork_opened",
      artwork_id: artworkId,
      ...(category ? { category } : {}),
    });
  },

  pricingCategorySelected(category: string) {
    posthog.logger.info("portfolio pricing category selected", {
      interaction: "pricing_category_selected",
      category,
    });
  },

  contactChannelSelected(channel: string) {
    posthog.logger.info("portfolio contact channel selected", {
      interaction: "contact_channel_selected",
      channel,
    });
  },
};
