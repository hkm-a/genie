import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';

const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC 通信处理
ipcMain.handle('get-scenes', async () => {
  return [
    {
      id: 'feynman-learning',
      name: 'Feynman Learning Method',
      name_zh: '费曼学习法',
      type: 'text',
      category: 'Learning & Understanding',
      category_zh: '学习与理解',
      description: '输入一个概念，获得简单解释、类比、自我检查问题和教学挑战',
      tags: ['概念解释', '费曼技巧', '学习法'],
      variables: [
        {
          name: 'topic',
          label: 'Topic or Concept',
          label_zh: '主题/概念',
          type: 'text',
          required: true,
          placeholder: '例如：量子纠缠',
        },
        {
          name: 'learner_level',
          label: 'Learner Level',
          label_zh: '学习者水平',
          type: 'select',
          required: true,
          options: ['小学生', '初中生', '高中生', '大学生', '专业人士'],
        },
      ],
    },
    {
      id: 'keyword-learning',
      name: 'Keyword Learning Assistant',
      name_zh: '关键词地图',
      type: 'text',
      category: 'Learning & Understanding',
      category_zh: '学习与理解',
      description: '输入一个新主题，获得关键术语、解释和学习顺序',
      tags: ['关键词', '学习路径', '知识图谱'],
      variables: [
        {
          name: 'topic',
          label: 'Learning Topic',
          label_zh: '学习主题',
          type: 'text',
          required: true,
          placeholder: '输入主题...',
        },
      ],
    },
    {
      id: 'cinema-poster',
      name: 'Oriental Ink Cinema Poster',
      name_zh: '东方水墨电影海报',
      type: 'image',
      category: '宣传海报',
      category_zh: '宣传海报',
      description: '生成东方水墨风格的电影海报',
      tags: ['水墨', '电影海报', '东方美学'],
      variables: [
        {
          name: 'theme',
          label: 'Theme',
          label_zh: '主题',
          type: 'text',
          required: true,
          placeholder: '例如：武侠',
        },
        {
          name: 'style',
          label: 'Style',
          label_zh: '风格',
          type: 'select',
          required: true,
          options: ['水墨', '写意', '工笔'],
        },
      ],
    },
  ];
});

ipcMain.handle('run-scene', async (_, sceneId: string, variables: any) => {
  return {
    success: true,
    result: {
      type: sceneId === 'cinema-poster' ? 'image' : 'text',
      content: sceneId !== 'cinema-poster' 
        ? `# 生成结果示例\n\n这是运行场景 "${sceneId}" 的示例输出。\n\n输入变量：${JSON.stringify(variables, null, 2)}`
        : undefined,
      image_url: sceneId === 'cinema-poster' ? `https://picsum.photos/seed/${Date.now()}/800/600` : undefined,
    },
    optimized_prompt: '优化后的提示词示例',
  };
});

ipcMain.handle('save-api-key', async (_, provider: string, apiKey: string) => {
  // 保存 API Key 到本地存储
  return { success: true };
});

ipcMain.handle('get-api-keys', async () => {
  return [];
});
