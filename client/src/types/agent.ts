export interface ModuleConfig {
  name: string;
  [key: string]: any;
}

export interface TaskConfig {
  name: string;
  weight: number;
}

export interface AgentData {
  name: string;
  bio: string[];
  traits: string[];
  examples: string[];
  example_accounts: string[];
  loop_delay: number;
  config: ModuleConfig[];
  tasks: TaskConfig[];
  use_time_based_weights: boolean;
  time_based_multipliers: {
    tweet_night_multiplier: number;
    engagement_day_multiplier: number;
    [key: string]: number;
  };
}

export interface AgentTemplate {
  name: string;
  description: string;
  config: Partial<AgentData>;
}

// Шаблоны для быстрого создания агентов
export const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    name: 'Базовый агент',
    description: 'Простой агент Twitter с базовой конфигурацией',
    config: {
      config: [
        {
          name: 'twitter',
          timeline_read_count: 10,
          own_tweet_replies_count: 2,
          tweet_interval: 5400
        },
        {
          name: 'openai',
          model: 'gpt-3.5-turbo'
        }
      ],
      tasks: [
        { name: 'post-tweet', weight: 1 },
        { name: 'reply-to-tweet', weight: 1 },
        { name: 'like-tweet', weight: 1 }
      ]
    }
  },
  {
    name: 'Агент с поддержкой блокчейна',
    description: 'Агент с поддержкой Ethereum и возможностью работы с токенами',
    config: {
      config: [
        {
          name: 'twitter',
          timeline_read_count: 10,
          own_tweet_replies_count: 2,
          tweet_interval: 5400
        },
        {
          name: 'openai',
          model: 'gpt-3.5-turbo'
        },
        {
          name: 'evm',
          network: 'ethereum'
        },
        {
          name: 'sonic',
          network: 'testnet'
        }
      ],
      tasks: [
        { name: 'post-tweet', weight: 1 },
        { name: 'reply-to-tweet', weight: 1 },
        { name: 'like-tweet', weight: 1 }
      ]
    }
  }
];

// Модуль конфигурации для различных сервисов
export const MODULE_CONFIGS: Record<string, ModuleConfig> = {
  twitter: {
    name: 'twitter',
    timeline_read_count: 10,
    own_tweet_replies_count: 2,
    tweet_interval: 5400
  },
  openai: {
    name: 'openai',
    model: 'gpt-3.5-turbo'
  },
  anthropic: {
    name: 'anthropic',
    model: 'claude-3-5-sonnet-20241022'
  },
  sonic: {
    name: 'sonic',
    network: 'testnet'
  },
  evm: {
    name: 'evm',
    network: 'ethereum'
  },
  discord: {
    name: 'discord',
    message_read_count: 10,
    message_emoji_name: '❤️',
    server_id: ''
  },
  farcaster: {
    name: 'farcaster',
    timeline_read_count: 10,
    cast_interval: 60
  }
};
