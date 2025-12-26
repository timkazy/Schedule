// src/config/appConfig.js
export const appConfig = {
  // Режим работы: 'local' или 'server'
  // dataSource: 'local', // или 'server'
  dataSource: 'server', // или 'server'
  
  // Настройки сервера
  server: {
    baseUrl: 'http://192.168.0.6:8000',
    timeout: 3000, // 5 секунд
  },
  
  // Настройки локальных данных
  local: {
    useCache: true,
    cacheDuration: 900000, // 15 минут в мс
  },
  
  // Дополнительные настройки
  features: {
    enableLogging: true,
    showDataSourceIndicator: true,
  }
};

// Хелпер для проверки режима
export const isLocalMode = () => appConfig.dataSource === 'local';
export const isServerMode = () => appConfig.dataSource === 'server';
