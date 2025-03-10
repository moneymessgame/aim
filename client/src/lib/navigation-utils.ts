"use client";

import { useRouter } from "next/navigation";

// Карта доступных маршрутов для навигации
export const availableRoutes: Record<string, string> = {
  "главная": "/",
  "домой": "/",
  "агент": "/agent",
  "агенты": "/agent",
  "создать агента": "/createagent",
  "создание агента": "/createagent",
  "новый агент": "/createagent",
  "тест": "/test",
  "тестирование": "/test",
};

// Функция для обработки команды навигации
export function parseNavigationCommand(text: string): string | null {
  // Шаблоны команд для навигации
  const patterns = [
    /перейти на страницу (.+)/i,
    /перейди на страницу (.+)/i,
    /открой страницу (.+)/i,
    /открыть страницу (.+)/i,
    /перейти к (.+)/i,
    /перейди к (.+)/i,
    /открой (.+)/i,
    /открыть (.+)/i,
  ];

  // Проверяем каждый шаблон
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const destination = match[1].trim().toLowerCase();
      return destination;
    }
  }

  return null;
}

// Хук для навигации
export function useNavigation() {
  const router = useRouter();

  // Функция для выполнения навигации
  const navigateTo = (text: string): boolean => {
    const destination = parseNavigationCommand(text);
    
    if (!destination) return false;
    
    // Проверяем, есть ли указанный маршрут в списке доступных
    for (const [key, path] of Object.entries(availableRoutes)) {
      if (destination?.includes(key)) {
        router.push(path);
        return true;
      }
    }
    
    return false;
  };

  return { navigateTo };
}
