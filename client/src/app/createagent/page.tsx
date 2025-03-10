'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ModuleConfig {
  name: string;
  [key: string]: any;
}

interface TaskConfig {
  name: string;
  weight: number;
}

interface AgentData {
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
  };
}

// Шаблоны агентов
interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  data: AgentData;
}

const agentTemplates: AgentTemplate[] = [
  {
    id: 'crypto-analyst',
    name: 'Crypto Analyst',
    description: 'Expert in cryptocurrency analysis and market trends',
    data: {
      name: 'CryptoAnalyst',
      bio: [
        "I'm CryptoAnalyst, a specialized AI focused on cryptocurrency market analysis and insights.",
        "I track market trends, analyze on-chain data, and provide unbiased perspectives on the crypto ecosystem.",
        "My goal is to help you navigate the complex world of digital assets with data-driven insights."
      ],
      traits: ['Analytical', 'Objective', 'Detailed', 'Educational'],
      examples: [
        'Bitcoin showing strong on-chain accumulation patterns despite market volatility. Long-term holders increasing positions. #BTC #CryptoAnalysis',
        'New DeFi protocol analysis: examining tokenomics, security features, and potential risks. Thread 🧵👇 #DeFi #CryptoResearch'
      ],
      example_accounts: ['0xSatoshi', 'CryptoQuant', 'glassnode'],
      loop_delay: 1200,
      config: [
        {
          name: 'twitter',
          timeline_read_count: 15,
          own_tweet_replies_count: 3,
          tweet_interval: 7200
        },
        {
          name: 'openai',
          model: 'gpt-4-turbo'
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
        { name: 'reply-to-tweet', weight: 1.5 },
        { name: 'like-tweet', weight: 0.8 }
      ],
      use_time_based_weights: true,
      time_based_multipliers: {
        tweet_night_multiplier: 0.6,
        engagement_day_multiplier: 1.3
      }
    }
  },
  {
    id: 'ai-researcher',
    name: 'AI Researcher',
    description: 'AI research specialist sharing latest breakthroughs and academic papers',
    data: {
      name: 'AIResearcher',
      bio: [
        "I'm AIResearcher, dedicated to tracking and explaining the latest advancements in artificial intelligence.",
        "I simplify complex AI research papers and highlight significant breakthroughs in machine learning, NLP, computer vision, and more.",
        "My mission is to make cutting-edge AI research accessible to everyone, regardless of technical background."
      ],
      traits: ['Curious', 'Explanatory', 'Thorough', 'Insightful'],
      examples: [
        'New paper from DeepMind introduces improved reinforcement learning architecture with 23% better sample efficiency. Here\'s what this means for AI capabilities... #AIResearch',
        'Breaking down the latest multimodal model: strengths, limitations, and potential applications in creative industries. Thread 🧵 #MachineLearning #AIProgress'
      ],
      example_accounts: ['DeepMind', 'OpenAI', 'YannLeCun'],
      loop_delay: 900,
      config: [
        {
          name: 'twitter',
          timeline_read_count: 20,
          own_tweet_replies_count: 5,
          tweet_interval: 4800
        },
        {
          name: 'anthropic',
          model: 'claude-3-5-sonnet-20241022'
        },
        {
          name: 'discord',
          message_read_count: 15,
          message_emoji_name: '🧠',
          server_id: ''
        }
      ],
      tasks: [
        { name: 'post-tweet', weight: 1.2 },
        { name: 'reply-to-tweet', weight: 1 },
        { name: 'like-tweet', weight: 0.5 }
      ],
      use_time_based_weights: false,
      time_based_multipliers: {
        tweet_night_multiplier: 0.4,
        engagement_day_multiplier: 1.5
      }
    }
  },
  {
    id: 'gaming-bot',
    name: 'Gaming Bot',
    description: 'Gaming enthusiast covering gaming news, reviews and community events',
    data: {
      name: 'GameMaster',
      bio: [
        "I'm GameMaster, your companion for all things gaming and esports!",
        "I track gaming news, share reviews, highlight upcoming releases, and keep you updated on esports tournaments.",
        "Whether you're into indie games or AAA titles, PC or console, I've got insights for every type of gamer."
      ],
      traits: ['Enthusiastic', 'Knowledgeable', 'Community-focused', 'Fun'],
      examples: [
        'Just played the new DLC for Elden Ring and it\'s absolutely mind-blowing! The boss designs are next level. No spoilers, but prepare yourselves! #EldenRing #Gaming',
        'Today\'s indie spotlight: Sea of Stars brings gorgeous pixel art and turn-based combat inspired by classic JRPGs. Definitely worth checking out! #IndieGames'
      ],
      example_accounts: ['IGN', 'Wario64', 'TheGameAwards'],
      loop_delay: 600,
      config: [
        {
          name: 'twitter',
          timeline_read_count: 25,
          own_tweet_replies_count: 8,
          tweet_interval: 3600
        },
        {
          name: 'openai',
          model: 'gpt-3.5-turbo'
        },
        {
          name: 'discord',
          message_read_count: 30,
          message_emoji_name: '🎮',
          server_id: ''
        }
      ],
      tasks: [
        { name: 'post-tweet', weight: 1 },
        { name: 'reply-to-tweet', weight: 1.8 },
        { name: 'like-tweet', weight: 1.2 }
      ],
      use_time_based_weights: true,
      time_based_multipliers: {
        tweet_night_multiplier: 1.2,
        engagement_day_multiplier: 0.9
      }
    }
  },
  {
    id: 'startup-advisor',
    name: 'Startup Advisor',
    description: 'Startup and entrepreneurship advisor sharing business insights and tech trends',
    data: {
      name: 'StartupGuru',
      bio: [
        "I'm StartupGuru, a virtual advisor for entrepreneurs and startup founders.",
        "I share actionable advice on fundraising, product-market fit, team building, and navigating the startup ecosystem.",
        "My goal is to help founders avoid common pitfalls and accelerate their journey to building successful companies."
      ],
      traits: ['Strategic', 'Practical', 'Experienced', 'Supportive'],
      examples: [
        'Fundraising tip: Before approaching VCs, create a detailed data room with your metrics, financials, and market research. Being organized shows you\'re serious and saves time during due diligence. #StartupAdvice',
        'Product-market fit isn\'t a one-time achievement—it\'s an ongoing process. Markets evolve, customer needs shift. The best founders continuously validate their assumptions. #StartupGrowth'
      ],
      example_accounts: ['paulg', 'ycombinator', 'andrewchen'],
      loop_delay: 1800,
      config: [
        {
          name: 'twitter',
          timeline_read_count: 12,
          own_tweet_replies_count: 4,
          tweet_interval: 6400
        },
        {
          name: 'openai',
          model: 'gpt-4-turbo'
        },
        {
          name: 'farcaster',
          timeline_read_count: 15,
          cast_interval: 120
        }
      ],
      tasks: [
        { name: 'post-tweet', weight: 1.5 },
        { name: 'reply-to-tweet', weight: 1 },
        { name: 'like-tweet', weight: 0.5 }
      ],
      use_time_based_weights: false,
      time_based_multipliers: {
        tweet_night_multiplier: 0.4,
        engagement_day_multiplier: 1.5
      }
    }
  }
];

export default function AgentCreator() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  
  // Default empty agent data
  const emptyAgentData: AgentData = {
    name: '',
    bio: [''],
    traits: ['Curious', 'Creative'],
    examples: ['This is an example tweet.'],
    example_accounts: ['0xzerebro'],
    loop_delay: 900,
    config: [],
    tasks: [
      { name: 'post-tweet', weight: 1 },
      { name: 'reply-to-tweet', weight: 1 },
      { name: 'like-tweet', weight: 1 }
    ],
    use_time_based_weights: false,
    time_based_multipliers: {
      tweet_night_multiplier: 0.4,
      engagement_day_multiplier: 1.5
    }
  }
  
  const [agentData, setAgentData] = useState<AgentData>(emptyAgentData)
  
  const [currentModuleType, setCurrentModuleType] = useState('twitter')
  // Функция применения шаблона агента
  const applyTemplate = (templateId: string) => {
    if (!templateId) {
      setAgentData(emptyAgentData)
      return
    }
    
    const template = agentTemplates.find(t => t.id === templateId)
    if (template) {
      setAgentData({...template.data})
    }
  }
  
  // Обработчик изменения шаблона
  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value
    setSelectedTemplate(templateId)
    applyTemplate(templateId)
  }

  const [moduleConfigs, setModuleConfigs] = useState<Record<string, any>>({
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
    sonic: {
      name: 'sonic',
      network: 'testnet'
    },
    evm: {
      name: 'evm',
      network: 'ethereum'
    },
    anthropic: {
      name: 'anthropic',
      model: 'claude-3-5-sonnet-20241022'
    },
    discord: {
      name: 'discord',
      message_read_count: 10,
      message_emoji_name: '❤️',
      server_id: ''
    }
  })

  const validateForm = (): boolean => {
    if (!agentData.name) {
      setError('Имя агента обязательно к заполнению')
      return false
    }
    
    if (agentData.bio.some(item => !item)) {
      setError('Все поля описания должны быть заполнены')
      return false
    }
    
    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/agents/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка сохранения агента')
      }
      
      setSuccess(`Агент "${agentData.name}" успешно создан`)
      setTimeout(() => {
        router.push('/api-test') // Перенаправление на страницу тестирования API
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при сохранении агента')
    } finally {
      setLoading(false)
    }
  }

  const addModuleConfig = () => {
    if (!currentModuleType) return
    
    const config = { ...moduleConfigs[currentModuleType] }
    setAgentData({
      ...agentData,
      config: [...agentData.config, config]
    })
  }

  const removeModuleConfig = (index: number) => {
    const newConfig = [...agentData.config]
    newConfig.splice(index, 1)
    setAgentData({
      ...agentData,
      config: newConfig
    })
  }

  const updateModuleConfig = (index: number, key: string, value: any) => {
    const newConfig = [...agentData.config]
    newConfig[index] = {
      ...newConfig[index],
      [key]: value
    }
    setAgentData({
      ...agentData,
      config: newConfig
    })
  }

  const addArrayItem = (key: keyof AgentData, emptyValue: string = '') => {
    if (Array.isArray(agentData[key])) {
      const newArray = [...(agentData[key] as any[])]
      newArray.push(emptyValue)
      setAgentData({
        ...agentData,
        [key]: newArray
      })
    }
  }

  const updateArrayItem = (key: keyof AgentData, index: number, value: any) => {
    if (Array.isArray(agentData[key])) {
      const newArray = [...(agentData[key] as any[])]
      newArray[index] = value
      setAgentData({
        ...agentData,
        [key]: newArray
      })
    }
  }

  const removeArrayItem = (key: keyof AgentData, index: number) => {
    if (Array.isArray(agentData[key])) {
      const newArray = [...(agentData[key] as any[])]
      newArray.splice(index, 1)
      setAgentData({
        ...agentData,
        [key]: newArray
      })
    }
  }

  const addTask = () => {
    setAgentData({
      ...agentData,
      tasks: [...agentData.tasks, { name: '', weight: 1 }]
    })
  }

  const updateTask = (index: number, field: keyof TaskConfig, value: any) => {
    const newTasks = [...agentData.tasks]
    newTasks[index] = {
      ...newTasks[index],
      [field]: field === 'weight' ? Number(value) : value
    }
    setAgentData({
      ...agentData,
      tasks: newTasks
    })
  }

  const removeTask = (index: number) => {
    const newTasks = [...agentData.tasks]
    newTasks.splice(index, 1)
    setAgentData({
      ...agentData,
      tasks: newTasks
    })
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-100 min-h-screen rounded-lg">
      <h1 className="text-4xl font-bold mb-8 font-[var(--font-bebas-neue)] tracking-wider">СОЗДАНИЕ НОВОГО АГЕНТА</h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-xl shadow-md mb-6">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-xl shadow-md mb-6">
          {success}
        </div>
      )}

      {/* Выбор шаблона агента */}
      <div className="mb-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-medium mb-4 font-[var(--font-bebas-neue)] tracking-wider">CHOOSE AN AGENT TEMPLATE</h2>
        <p className="mb-4 text-[var(--text-dark)]">Start with a pre-configured template or create an agent from scratch.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            className={`cursor-pointer p-4 rounded-xl shadow-md transition-all duration-200 ${selectedTemplate === '' ? 'border-2 border-blue-500 bg-blue-50' : 'border border-gray-200 hover:border-blue-400 bg-white'}`}
            onClick={() => {
              setSelectedTemplate('')
              applyTemplate('')
            }}
          >
            <h3 className="font-medium mb-2 font-[var(--font-bebas-neue)] tracking-wide">CUSTOM AGENT</h3>
            <p className="text-sm text-[var(--text-light)]">Create your own agent from scratch</p>
          </div>
          
          {agentTemplates.map(template => (
            <div 
              key={template.id}
              className={`cursor-pointer p-4 rounded-xl shadow-md transition-all duration-200 ${selectedTemplate === template.id ? 'border-2 border-blue-500 bg-blue-50' : 'border border-gray-200 hover:border-blue-400 bg-white'}`}
              onClick={() => {
                setSelectedTemplate(template.id)
                applyTemplate(template.id)
              }}
            >
              <h3 className="font-medium mb-2 font-[var(--font-bebas-neue)] tracking-wide">{template.name.toUpperCase()}</h3>
              <p className="text-sm text-[var(--text-light)]">{template.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="space-y-6">
          <div>
            <label className="block text-[var(--text-dark)] font-medium mb-2 font-[var(--font-montserrat)]">Имя агента *</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[var(--text-dark)]"
              value={agentData.name}
              onChange={(e) => setAgentData({ ...agentData, name: e.target.value })}
              placeholder="ExampleAgent"
            />
          </div>
          
          <div>
            <label className="block text-[var(--text-dark)] font-medium mb-2 font-[var(--font-montserrat)]">Описание агента *</label>
            {agentData.bio.map((line, index) => (
              <div key={`bio-${index}`} className="flex mb-2">
                <textarea
                  className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[var(--text-dark)]"
                  value={line}
                  onChange={(e) => updateArrayItem('bio', index, e.target.value)}
                  placeholder="Описание агента"
                  rows={2}
                />
                {agentData.bio.length > 1 && (
                  <button
                    type="button"
                    className="ml-2 text-red-600 hover:text-red-800 transition-all duration-200"
                    onClick={() => removeArrayItem('bio', index)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-800 font-medium"
              onClick={() => addArrayItem('bio')}
            >
              + Добавить описание
            </button>
          </div>
          
          <div>
            <label className="block text-[var(--text-dark)] font-medium mb-2 font-[var(--font-montserrat)]">Характеристики</label>
            {agentData.traits.map((trait, index) => (
              <div key={`trait-${index}`} className="flex mb-2">
                <input
                  type="text"
                  className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[var(--text-dark)]"
                  value={trait}
                  onChange={(e) => updateArrayItem('traits', index, e.target.value)}
                  placeholder="Характеристика"
                />
                <button
                  type="button"
                  className="ml-2 text-red-600 hover:text-red-800 transition-all duration-200"
                  onClick={() => removeArrayItem('traits', index)}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-800 font-medium"
              onClick={() => addArrayItem('traits')}
            >
              + Добавить характеристику
            </button>
          </div>
          
          <div>
            <label className="block text-[var(--text-dark)] font-medium mb-2 font-[var(--font-montserrat)]">Примеры твитов</label>
            {agentData.examples.map((example, index) => (
              <div key={`example-${index}`} className="flex mb-2">
                <input
                  type="text"
                  className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[var(--text-dark)]"
                  value={example}
                  onChange={(e) => updateArrayItem('examples', index, e.target.value)}
                  placeholder="Пример твита"
                />
                <button
                  type="button"
                  className="ml-2 text-red-600 hover:text-red-800 transition-all duration-200"
                  onClick={() => removeArrayItem('examples', index)}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-800 font-medium"
              onClick={() => addArrayItem('examples')}
            >
              + Добавить пример
            </button>
          </div>
          
          <div>
            <label className="block text-[var(--text-dark)] font-medium mb-2 font-[var(--font-montserrat)]">Примеры аккаунтов</label>
            {agentData.example_accounts.map((account, index) => (
              <div key={`account-${index}`} className="flex mb-2">
                <input
                  type="text"
                  className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[var(--text-dark)]"
                  value={account}
                  onChange={(e) => updateArrayItem('example_accounts', index, e.target.value)}
                  placeholder="Аккаунт"
                />
                <button
                  type="button"
                  className="ml-2 text-red-600 hover:text-red-800 transition-all duration-200"
                  onClick={() => removeArrayItem('example_accounts', index)}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-800 font-medium"
              onClick={() => addArrayItem('example_accounts')}
            >
              + Добавить аккаунт
            </button>
          </div>
          
          <div>
            <label className="block text-[var(--text-dark)] font-medium mb-2 font-[var(--font-montserrat)]">Задержка цикла (в секундах)</label>
            <input
              type="number"
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[var(--text-dark)]"
              value={agentData.loop_delay}
              onChange={(e) => setAgentData({ ...agentData, loop_delay: Number(e.target.value) })}
              min="1"
            />
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-[var(--text-dark)] font-medium mb-2 font-[var(--font-montserrat)]">Задачи</label>
            {agentData.tasks.map((task, index) => (
              <div key={`task-${index}`} className="flex items-center mb-2">
                <input
                  type="text"
                  className="flex-1 p-2 border rounded mr-2"
                  value={task.name}
                  onChange={(e) => updateTask(index, 'name', e.target.value)}
                  placeholder="Название задачи"
                />
                <input
                  type="number"
                  className="w-20 p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[var(--text-dark)]"
                  value={task.weight}
                  onChange={(e) => updateTask(index, 'weight', e.target.value)}
                  min="0"
                  step="0.1"
                />
                <button
                  type="button"
                  className="ml-2 text-red-600 hover:text-red-800 transition-all duration-200"
                  onClick={() => removeTask(index)}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-800 font-medium"
              onClick={addTask}
            >
              + Добавить задачу
            </button>
          </div>
          
          <div>
            <label className="block text-[var(--text-dark)] font-medium mb-2 font-[var(--font-montserrat)]">Конфигурация модулей</label>
            <div className="mb-4">
              <select
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2 text-[var(--text-dark)]"
                value={currentModuleType}
                onChange={(e) => setCurrentModuleType(e.target.value)}
              >
                {Object.keys(moduleConfigs).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full shadow-md transition-all duration-200"
                onClick={addModuleConfig}
              >
                Добавить модуль
              </button>
            </div>
            
            {agentData.config.map((config, index) => (
              <div key={`config-${index}`} className="border border-gray-200 rounded-xl p-5 mb-4 bg-white shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">{config.name}</h3>
                  <button
                    type="button"
                    className="text-red-600 hover:text-red-800 transition-all duration-200 font-medium"
                    onClick={() => removeModuleConfig(index)}
                  >
                    Удалить
                  </button>
                </div>
                
                {Object.entries(config).map(([key, value]) => 
                  key !== 'name' ? (
                    <div key={`${index}-${key}`} className="mb-2">
                      <label className="block text-sm text-[var(--text-light)] mb-1">{key}</label>
                      <input
                        type={typeof value === 'number' ? 'number' : 'text'}
                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[var(--text-dark)]"
                        value={value}
                        onChange={(e) => updateModuleConfig(
                          index,
                          key,
                          typeof value === 'number' ? Number(e.target.value) : e.target.value
                        )}
                      />
                    </div>
                  ) : null
                )}
              </div>
            ))}
          </div>
          
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="use_time_based_weights"
              checked={agentData.use_time_based_weights}
              onChange={(e) => setAgentData({ ...agentData, use_time_based_weights: e.target.checked })}
              className="mr-2 w-5 h-5 text-blue-500 focus:ring-blue-400 rounded"
            />
            <label htmlFor="use_time_based_weights" className="text-[var(--text-dark)]">
              Использовать веса на основе времени
            </label>
          </div>
          
          {agentData.use_time_based_weights && (
            <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-md">
              <h3 className="font-medium mb-4">Множители на основе времени</h3>
              <div className="mb-2">
                <label className="block text-sm text-gray-700 mb-1">Ночной множитель твитов</label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[var(--text-dark)]"
                  value={agentData.time_based_multipliers.tweet_night_multiplier}
                  onChange={(e) => setAgentData({
                    ...agentData,
                    time_based_multipliers: {
                      ...agentData.time_based_multipliers,
                      tweet_night_multiplier: Number(e.target.value)
                    }
                  })}
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Дневной множитель взаимодействия</label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[var(--text-dark)]"
                  value={agentData.time_based_multipliers.engagement_day_multiplier}
                  onChange={(e) => setAgentData({
                    ...agentData,
                    time_based_multipliers: {
                      ...agentData.time_based_multipliers,
                      engagement_day_multiplier: Number(e.target.value)
                    }
                  })}
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex gap-4 mt-8">
        <button
          type="button"
          className="bg-blue-500 text-white px-8 py-4 rounded-full shadow-lg hover:bg-blue-600 disabled:opacity-50 transition-all duration-200 font-medium"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Сохранение...' : 'Сохранить агента'}
        </button>
        <Link href="/api-test" className="bg-gray-200 text-gray-800 px-8 py-4 rounded-full shadow-md hover:bg-gray-300 transition-all duration-200 font-medium">
          Отмена
        </Link>
      </div>

      {agentData.config.length > 0 && (
        <div className="mt-10">
          <h3 className="text-2xl font-medium mb-4 font-[var(--font-bebas-neue)] tracking-wider">ПРЕДПРОСМОТР JSON КОНФИГУРАЦИИ</h3>
          <pre className="bg-white p-5 rounded-xl border border-gray-200 shadow-lg overflow-x-auto text-[var(--text-dark)]">
            {JSON.stringify(agentData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
