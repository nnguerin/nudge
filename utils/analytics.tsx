export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    if (__DEV__) {
      console.log('📊 Event:', event, properties);
    }
    // TODO: Send to analytics service later
  },

  identify: (userId: string, traits?: Record<string, any>) => {
    if (__DEV__) {
      console.log('👤 Identify:', userId, traits);
    }
    // TODO: Send to analytics service later
  },
};

/**
 * // Authentication
- 'sign_up_completed'
- 'sign_in_completed'

// Core value delivery
- 'nudge_scheduled' (properties: recipientType, frequency)
- 'prompt_sent' (properties: promptId, source: 'ai' | 'community' | 'custom')
- 'conversation_confirmed' (did they actually message?)

// Engagement
- 'prompt_browsed'
- 'prompt_voted' (properties: direction: 'up' | 'down')
- 'contact_added'

// Monetization signals (for later)
- 'premium_paywall_shown'
- 'upgrade_clicked'
 */
