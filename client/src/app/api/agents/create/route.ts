import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: Request) {
  try {
    // Получаем данные из запроса
    const data = await request.json()
    
    // Валидация имени агента
    if (!data.name) {
      return NextResponse.json(
        { error: 'Отсутствует имя агента' },
        { status: 400 }
      )
    }
    
    // Формируем имя файла (заменяем пробелы и спецсимволы на дефисы)
    const filename = `${data.name.toLowerCase().replace(/[^a-z0-9А-Яа-я]/g, '-')}.json`
    
    // Определяем путь к директории агентов
    const rootDir = process.cwd()
    // Проект структурирован следующим образом: /aim/client и /aim/zerepy
    // Нужно перейти на один уровень вверх от client и зайти в zerepy/agents
    const agentsDir = path.join(rootDir, '../zerepy/agents')
    const filePath = path.join(agentsDir, filename)
    
    // Проверяем существование директории
    if (!fs.existsSync(agentsDir)) {
      return NextResponse.json(
        { error: 'Директория агентов не найдена' },
        { status: 500 }
      )
    }
    
    // Проверяем не существует ли уже файл с таким именем
    if (fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `Агент с именем ${filename} уже существует` },
        { status: 400 }
      )
    }
    
    // Записываем данные в файл
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
    
    return NextResponse.json({
      success: true,
      message: `Агент ${data.name} успешно создан`,
      filePath: filePath
    })
  } catch (error: any) {
    console.error('Ошибка создания агента:', error)
    
    return NextResponse.json(
      { 
        error: 'Ошибка создания агента', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}
