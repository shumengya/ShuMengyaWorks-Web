import axios from 'axios';

// 配置API基础URL
const getApiBaseUrl = () => {
  // 如果设置了环境变量，优先使用
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // 生产环境使用相对路径（需要代理）或绝对路径
  if (process.env.NODE_ENV === 'production') {
    // 如果前后端部署在同一域名下，使用相对路径
    return '/api';
    // 如果后端部署在不同地址，请修改为后端的完整URL
    // return 'http://your-backend-domain.com:5000/api';
  }
  
  // 开发环境使用localhost
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

const adminApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// 管理员token
let adminToken = null;

export const setAdminToken = (token) => {
  adminToken = token;
  adminApi.defaults.headers.common['Authorization'] = token;
};

export const getAdminToken = () => adminToken;

// 管理员获取所有作品
export const adminGetWorks = async () => {
  const response = await adminApi.get('/admin/works', {
    params: { token: adminToken }
  });
  return response.data;
};

// 管理员创建作品
export const adminCreateWork = async (workData) => {
  const response = await adminApi.post('/admin/works', workData, {
    params: { token: adminToken }
  });
  return response.data;
};

// 管理员更新作品
export const adminUpdateWork = async (workId, workData) => {
  const response = await adminApi.put(`/admin/works/${workId}`, workData, {
    params: { token: adminToken }
  });
  return response.data;
};

// 管理员删除作品
export const adminDeleteWork = async (workId) => {
  const response = await adminApi.delete(`/admin/works/${workId}`, {
    params: { token: adminToken }
  });
  return response.data;
};

// 管理员上传文件 (支持大文件和详细进度回调，增强错误处理和重试机制)
export const adminUploadFile = async (workId, fileType, file, platform = null, onProgress = null, maxRetries = 3) => {
  // 检查文件大小 (前端预检查)
  const maxSize = 5000 * 1024 * 1024; // 5000MB
  if (file.size > maxSize) {
    throw new Error(`文件太大，最大支持 ${maxSize / (1024 * 1024)}MB，当前文件大小：${(file.size / (1024 * 1024)).toFixed(1)}MB`);
  }

  console.log(`开始上传文件: ${file.name}, 大小: ${(file.size / (1024 * 1024)).toFixed(1)}MB, 作品ID: ${workId}, 类型: ${fileType}, 平台: ${platform}`);

  const formData = new FormData();
  formData.append('file', file);
  if (platform) {
    formData.append('platform', platform);
  }

  let startTime = Date.now();
  let lastLoaded = 0;
  let lastTime = startTime;
  let retryCount = 0;

  // 根据文件大小动态调整超时时间
  const getTimeoutForFileSize = (fileSize) => {
    const fileSizeMB = fileSize / (1024 * 1024);
    if (fileSizeMB < 10) return 5 * 60 * 1000;      // 小于10MB: 5分钟
    if (fileSizeMB < 100) return 15 * 60 * 1000;    // 小于100MB: 15分钟
    if (fileSizeMB < 500) return 30 * 60 * 1000;    // 小于500MB: 30分钟
    return 60 * 60 * 1000;                          // 大于500MB: 60分钟
  };

  const uploadAttempt = async () => {
    try {
      console.log(`上传尝试 ${retryCount + 1}/${maxRetries + 1}`);
      
      const timeout = getTimeoutForFileSize(file.size);
      console.log(`设置超时时间: ${timeout / 1000}秒`);
      
      const response = await adminApi.post(`/admin/upload/${workId}/${fileType}`, formData, {
        params: { token: adminToken },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: timeout,
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const currentTime = Date.now();
            const currentLoaded = progressEvent.loaded;
            
            // 计算上传速度
            const timeDiff = (currentTime - lastTime) / 1000;
            const loadedDiff = currentLoaded - lastLoaded;
            const speed = timeDiff > 0 ? loadedDiff / timeDiff : 0;
            
            const percentCompleted = Math.round((currentLoaded * 100) / progressEvent.total);
            
            // 计算剩余时间
            const remainingBytes = progressEvent.total - currentLoaded;
            const eta = speed > 0 ? Math.round(remainingBytes / speed) : 0;
            
            onProgress({
              progress: percentCompleted,
              uploaded: currentLoaded,
              total: progressEvent.total,
              speed: speed,
              fileName: file.name,
              fileSize: file.size,
              eta: eta,
              retryCount: retryCount
            });
            
            lastLoaded = currentLoaded;
            lastTime = currentTime;
          }
        },
      });
      
      console.log(`文件上传成功: ${file.name}`);
      return response.data;
      
    } catch (error) {
      console.error(`上传尝试 ${retryCount + 1} 失败:`, error);
      
      // 分析错误类型
      const isRetryableError = (error) => {
        if (!error.response) {
          // 网络错误或超时，可重试
          return true;
        }
        
        const status = error.response.status;
        // 5xx服务器错误可重试，4xx客户端错误通常不可重试
        if (status >= 500) return true;
        if (status === 408 || status === 429) return true; // 超时或限流可重试
        
        return false;
      };
      
      const errorMessage = error.response?.data?.message || error.message || '未知错误';
      
      // 如果是可重试的错误且还有重试次数
      if (isRetryableError(error) && retryCount < maxRetries) {
        retryCount++;
        const delayMs = Math.min(1000 * Math.pow(2, retryCount - 1), 10000); // 指数退避，最大10秒
        
        console.log(`${delayMs}ms后进行第${retryCount}次重试...`);
        
        // 通知前端正在重试
        if (onProgress) {
          onProgress({
            progress: 0,
            uploaded: 0,
            total: file.size,
            speed: 0,
            fileName: file.name,
            fileSize: file.size,
            eta: 0,
            retryCount: retryCount,
            status: 'retrying',
            error: `上传失败，${delayMs/1000}秒后重试: ${errorMessage}`
          });
        }
        
        await new Promise(resolve => setTimeout(resolve, delayMs));
        return uploadAttempt(); // 递归重试
      }
      
      // 不可重试或重试次数用完
      console.error(`文件上传最终失败: ${file.name}, 错误: ${errorMessage}`);
      
      // 增强错误信息
      let enhancedError = new Error(errorMessage);
      enhancedError.originalError = error;
      enhancedError.retryCount = retryCount;
      enhancedError.fileName = file.name;
      enhancedError.fileSize = file.size;
      
      // 根据错误类型提供更好的用户提示
      if (error.code === 'ECONNABORTED' || errorMessage.includes('timeout')) {
        enhancedError.message = `文件上传超时，请检查网络连接或尝试上传更小的文件。文件: ${file.name}`;
      } else if (error.response?.status === 413) {
        enhancedError.message = `文件太大无法上传: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)}MB)`;
      } else if (error.response?.status >= 500) {
        enhancedError.message = `服务器错误，请稍后重试。文件: ${file.name}`;
      }
      
      throw enhancedError;
    }
  };

  return uploadAttempt();
};

// 管理员删除文件
export const adminDeleteFile = async (workId, fileType, filename, platform = null) => {
  const params = { token: adminToken };
  if (platform) {
    params.platform = platform;
  }

  const response = await adminApi.delete(`/admin/delete-file/${workId}/${fileType}/${filename}`, {
    params
  });
  return response.data;
};

export default adminApi;
