import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { adminCreateWork, adminUpdateWork, adminUploadFile, adminDeleteFile } from '../services/adminApi';
import UploadProgressModal from './UploadProgressModal';

// 获取API基础URL
const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace('/api', '');
  }
  if (process.env.NODE_ENV === 'production') {
    return '';
  }
  return 'http://localhost:5000';
};

const EditorContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const EditorHeader = styled.div`
  background: white;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const EditorTitle = styled.h1`
  color: #2e7d32;
  font-size: 1.8rem;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    text-align: center;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`;

const Button = styled.button`
  background: ${props => {
    if (props.variant === 'success') return '#4caf50';
    if (props.variant === 'danger') return '#f44336';
    return '#81c784';
  }};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s ease;
  
  &:hover {
    background: ${props => {
      if (props.variant === 'success') return '#45a049';
      if (props.variant === 'danger') return '#d32f2f';
      return '#66bb6a';
    }};
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    width: 100%;
  }
`;

const FormSection = styled.div`
  background: white;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const SectionTitle = styled.h2`
  color: #2e7d32;
  font-size: 1.3rem;
  margin-bottom: 20px;
  border-bottom: 2px solid #e8f5e8;
  padding-bottom: 10px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 500;
  color: #2e7d32;
  margin-bottom: 8px;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s ease;
  
  &:focus {
    border-color: #81c784;
  }
  
  @media (max-width: 768px) {
    padding: 12px;
    font-size: 16px; /* 防止iOS缩放 */
  }
`;

const TextArea = styled.textarea`
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s ease;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  
  &:focus {
    border-color: #81c784;
  }
  
  @media (max-width: 768px) {
    padding: 12px;
    font-size: 16px;
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background: white;
  cursor: pointer;
  
  &:focus {
    border-color: #81c784;
  }
  
  @media (max-width: 768px) {
    padding: 12px;
    font-size: 16px;
  }
`;

const TagsInput = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  min-height: 45px;
  align-items: center;
  
  &:focus-within {
    border-color: #81c784;
  }
`;

const Tag = styled.span`
  background: #e8f5e8;
  color: #2e7d32;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TagRemove = styled.button`
  background: none;
  border: none;
  color: #2e7d32;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0;
  
  &:hover {
    color: #f44336;
  }
`;

const TagInput = styled.input`
  border: none;
  outline: none;
  flex: 1;
  min-width: 100px;
  padding: 4px;
  font-size: 14px;
`;

const PlatformSelector = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const PlatformCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #81c784;
    background: #f8f9fa;
  }
  
  input:checked + & {
    border-color: #81c784;
    background: #e8f5e8;
  }
`;

const FileUploadSection = styled.div`
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: border-color 0.3s ease;
  
  &:hover {
    border-color: #81c784;
  }
  
  &.dragover {
    border-color: #81c784;
    background: #f8f9fa;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  margin-top: 15px;
`;

const FileItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  position: relative;
  cursor: ${props => props.selectable ? 'pointer' : 'default'};
  
  ${props => props.isCover && `
    border: 2px solid #81c784;
    background: #f8f9fa;
  `}
  
  &:hover {
    ${props => props.selectable && `
      border-color: #81c784;
      background: #f8f9fa;
    `}
  }
`;

const FilePreview = styled.img`
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 8px;
`;

const FileName = styled.span`
  font-size: 0.8rem;
  color: #666;
  text-align: center;
  word-break: break-all;
`;

const FileDeleteButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ErrorMessage = styled.div`
  background: #ffebee;
  color: #c62828;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const SuccessMessage = styled.div`
  background: #e8f5e8;
  color: #2e7d32;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
`;



const WorkEditor = ({ work, onClose }) => {
  const [formData, setFormData] = useState({
    作品ID: '',
    作品作品: '',
    作品描述: '',
    作者: '树萌芽',
    作品版本号: '1.0.0',
    作品分类: '其他',
    作品标签: [],
    支持平台: [],
    作品截图: [],
    作品视频: [],
    作品封面: '',
    文件名称: {}
  });

  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploadItems, setUploadItems] = useState({});
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const platforms = ['Windows', 'Android', 'Linux', 'iOS', 'macOS'];
  const categories = ['游戏', '工具', '应用', '网站', '其他'];

  useEffect(() => {
    if (work) {
      setFormData({
        ...work,
        作品标签: work.作品标签 || [],
        支持平台: work.支持平台 || [],
        作品截图: work.作品截图 || [],
        作品视频: work.作品视频 || [],
        文件名称: work.文件名称 || {}
      });
    }
  }, [work]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
    setSuccess(null);
  };

  const handleTagAdd = (e) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!formData.作品标签.includes(newTag.trim())) {
        handleInputChange('作品标签', [...formData.作品标签, newTag.trim()]);
      }
      setNewTag('');
    }
  };

  const handleTagRemove = (tagToRemove) => {
    handleInputChange('作品标签', formData.作品标签.filter(tag => tag !== tagToRemove));
  };

  const handlePlatformChange = (platform, checked) => {
    if (checked) {
      handleInputChange('支持平台', [...formData.支持平台, platform]);
    } else {
      handleInputChange('支持平台', formData.支持平台.filter(p => p !== platform));
      // 移除该平台的文件名称
      const newFileNames = { ...formData.文件名称 };
      delete newFileNames[platform];
      handleInputChange('文件名称', newFileNames);
    }
  };

  const handleFileUpload = async (files, fileType, platform = null) => {
    if (!formData.作品ID) {
      setError('请先保存作品基本信息后再上传文件');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadItems({});
    setShowUploadModal(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`上传文件: ${file.name}, 作品ID: ${formData.作品ID}, 文件类型: ${fileType}, 平台: ${platform}`);
        
        // 显示文件大小
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
        console.log(`文件大小: ${fileSizeMB}MB`);
        
        // 设置当前文件的进度信息
        const fileKey = `${file.name}_${i}`;
        
        // 初始化上传项目
        setUploadItems(prev => ({
          ...prev,
          [fileKey]: {
            fileName: file.name,
            fileSize: file.size,
            progress: 0,
            uploaded: 0,
            speed: 0,
            status: 'uploading'
          }
        }));
        
        const response = await adminUploadFile(
          formData.作品ID, 
          fileType, 
          file, 
          platform,
          (progressInfo) => {
            setUploadItems(prev => ({
              ...prev,
              [fileKey]: {
                ...prev[fileKey],
                ...progressInfo,
                status: 'uploading'
              }
            }));
          }
        );
        console.log('上传响应:', response);
        
        if (response.success) {
          // 更新文件列表
          if (fileType === 'image') {
            const newImages = [...formData.作品截图, response.filename];
            handleInputChange('作品截图', newImages);
            if (!formData.作品封面) {
              handleInputChange('作品封面', response.filename);
            }
          } else if (fileType === 'video') {
            handleInputChange('作品视频', [...formData.作品视频, response.filename]);
          } else if (fileType === 'platform' && platform) {
            const newFileNames = { ...formData.文件名称 };
            newFileNames[platform] = newFileNames[platform] || [];
            newFileNames[platform].push(response.filename);
            handleInputChange('文件名称', newFileNames);
          }
          setSuccess(`文件上传成功: ${response.filename} (${fileSizeMB}MB)`);
          
          // 标记该文件上传完成
          setUploadItems(prev => ({
            ...prev,
            [fileKey]: {
              ...prev[fileKey],
              progress: 100,
              status: 'completed'
            }
          }));
        } else {
          setError(`文件上传失败: ${response.message}`);
          
          // 标记该文件上传失败
          setUploadItems(prev => ({
            ...prev,
            [fileKey]: {
              ...prev[fileKey],
              status: 'error'
            }
          }));
        }
      }
    } catch (error) {
      console.error('文件上传失败:', error);
      
      // 标记所有上传项目为失败
      setUploadItems(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          if (updated[key].status === 'uploading') {
            updated[key].status = 'error';
          }
        });
        return updated;
      });
      
      if (error.response) {
        setError(`文件上传失败: ${error.response.data?.message || error.response.statusText}`);
      } else {
        setError(`文件上传失败: ${error.message}`);
      }
    } finally {
      setUploading(false);
      
      // 3秒后自动清理完成的上传项目
      setTimeout(() => {
        setUploadItems(prev => {
          const filtered = {};
          Object.entries(prev).forEach(([key, item]) => {
            if (item.status === 'uploading' || item.status === 'error') {
              filtered[key] = item;
            }
          });
          return filtered;
        });
      }, 3000);
    }
  };

  const handleFileDelete = async (filename, fileType, platform = null) => {
    if (!window.confirm(`确定要删除文件 ${filename} 吗？`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await adminDeleteFile(formData.作品ID, fileType, filename, platform);
      if (response.success) {
        // 更新文件列表
        if (fileType === 'image') {
          const newImages = formData.作品截图.filter(img => img !== filename);
          handleInputChange('作品截图', newImages);
          if (formData.作品封面 === filename) {
            handleInputChange('作品封面', newImages[0] || '');
          }
        } else if (fileType === 'video') {
          handleInputChange('作品视频', formData.作品视频.filter(video => video !== filename));
        } else if (fileType === 'platform' && platform) {
          const newFileNames = { ...formData.文件名称 };
          newFileNames[platform] = newFileNames[platform].filter(file => file !== filename);
          handleInputChange('文件名称', newFileNames);
        }
        setSuccess(`文件删除成功: ${filename}`);
      }
    } catch (error) {
      console.error('文件删除失败:', error);
      setError('文件删除失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSetCover = (filename) => {
    handleInputChange('作品封面', filename);
    setSuccess(`封面设置成功: ${filename}`);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e, fileType, platform = null) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files, fileType, platform);
    }
  };

  const handleSave = async () => {
    if (!formData.作品ID || !formData.作品作品) {
      setError('作品ID和作品名称不能为空');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response;
      if (work) {
        // 更新现有作品
        response = await adminUpdateWork(formData.作品ID, formData);
      } else {
        // 创建新作品
        response = await adminCreateWork(formData);
      }

      if (response.success) {
        setSuccess(work ? '作品更新成功' : '作品创建成功');
        // 如果是创建新作品，不要自动关闭，让用户可以继续上传文件
        if (work) {
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error('保存失败:', error);
      setError('保存失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <EditorContainer>
      <EditorHeader>
        <EditorTitle>{work ? '编辑作品' : '添加新作品'}</EditorTitle>
        <ButtonGroup>
          <Button variant="success" onClick={handleSave} disabled={loading || uploading}>
            {loading ? '保存中...' : '保存'}
          </Button>
          <Button onClick={onClose} disabled={uploading}>
            返回
          </Button>
        </ButtonGroup>
      </EditorHeader>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      


      {/* 基本信息 */}
      <FormSection>
        <SectionTitle>基本信息</SectionTitle>
        <FormGrid>
          <FormGroup>
            <Label htmlFor="workId">作品ID *</Label>
            <Input
              id="workId"
              type="text"
              value={formData.作品ID}
              onChange={(e) => handleInputChange('作品ID', e.target.value)}
              placeholder="唯一标识符，只能包含字母、数字、下划线"
              disabled={!!work} // 编辑时不能修改ID
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="workName">作品名称 *</Label>
            <Input
              id="workName"
              type="text"
              value={formData.作品作品}
              onChange={(e) => handleInputChange('作品作品', e.target.value)}
              placeholder="作品的显示名称"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="author">作者</Label>
            <Input
              id="author"
              type="text"
              value={formData.作者}
              onChange={(e) => handleInputChange('作者', e.target.value)}
              placeholder="作者名称"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="version">版本号</Label>
            <Input
              id="version"
              type="text"
              value={formData.作品版本号}
              onChange={(e) => handleInputChange('作品版本号', e.target.value)}
              placeholder="如: 1.0.0"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="category">分类</Label>
            <Select
              id="category"
              value={formData.作品分类}
              onChange={(e) => handleInputChange('作品分类', e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </FormGroup>
        </FormGrid>
        
        <FormGroup style={{ marginTop: '20px' }}>
          <Label htmlFor="description">作品描述</Label>
          <TextArea
            id="description"
            value={formData.作品描述}
            onChange={(e) => handleInputChange('作品描述', e.target.value)}
            placeholder="详细描述作品的功能和特点"
            rows={4}
          />
        </FormGroup>

        <FormGroup style={{ marginTop: '20px' }}>
          <Label>作品标签</Label>
          <TagsInput>
            {formData.作品标签.map((tag, index) => (
              <Tag key={index}>
                {tag}
                <TagRemove onClick={() => handleTagRemove(tag)}>×</TagRemove>
              </Tag>
            ))}
            <TagInput
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleTagAdd}
              placeholder="输入标签，按回车添加"
            />
          </TagsInput>
        </FormGroup>

        <FormGroup style={{ marginTop: '20px' }}>
          <Label>支持平台</Label>
          <PlatformSelector>
            {platforms.map(platform => (
              <PlatformCheckbox key={platform}>
                <input
                  type="checkbox"
                  checked={formData.支持平台.includes(platform)}
                  onChange={(e) => handlePlatformChange(platform, e.target.checked)}
                />
                {platform}
              </PlatformCheckbox>
            ))}
          </PlatformSelector>
        </FormGroup>
      </FormSection>

      {/* 文件管理 */}
      {formData.作品ID && (
        <>
          {/* 作品截图 */}
          <FormSection>
            <SectionTitle>作品截图</SectionTitle>
            <FileUploadSection
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'image')}
            >
              <p>拖拽图片文件到这里或点击选择文件</p>
              <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '8px' }}>
                支持 PNG、JPG、JPEG、GIF 格式，支持批量选择多张图片
              </p>
              <p style={{ fontSize: '0.7rem', color: '#999', marginTop: '4px' }}>
                单个文件最大支持 5000MB (5GB)
              </p>
              <FileInput
                id="imageUpload"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(Array.from(e.target.files), 'image')}
              />
              <Button 
                onClick={() => document.getElementById('imageUpload').click()}
                style={{ marginTop: '10px' }}
                disabled={uploading}
              >
                {uploading ? '上传中...' : '选择图片 (支持多选)'}
              </Button>
            </FileUploadSection>
            
            {formData.作品截图.length > 0 && (
              <div>
                <h4 style={{ marginBottom: '10px', color: '#2e7d32' }}>
                  已上传图片 (点击图片设置为封面)
                </h4>
                <FileList>
                  {formData.作品截图.map((image, index) => (
                    <FileItem 
                      key={index}
                      selectable={true}
                      isCover={formData.作品封面 === image}
                      onClick={() => handleSetCover(image)}
                    >
                      <FileDeleteButton onClick={(e) => {
                        e.stopPropagation();
                        handleFileDelete(image, 'image');
                      }}>
                        ×
                      </FileDeleteButton>
                      <FilePreview
                        src={`${getApiBaseUrl()}/api/image/${formData.作品ID}/${image}`}
                        alt={image}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <FileName>{image}</FileName>
                      {formData.作品封面 === image && (
                        <span style={{ 
                          fontSize: '0.7rem', 
                          color: '#4caf50', 
                          fontWeight: 'bold',
                          marginTop: '4px',
                          padding: '2px 6px',
                          background: '#e8f5e8',
                          borderRadius: '4px'
                        }}>
                          当前封面
                        </span>
                      )}
                    </FileItem>
                  ))}
                </FileList>
              </div>
            )}
          </FormSection>

          {/* 作品视频 */}
          <FormSection>
            <SectionTitle>作品视频</SectionTitle>
            <FileUploadSection>
              <p>上传作品演示视频</p>
              <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '8px' }}>
                支持 MP4、AVI、MOV 格式
              </p>
              <p style={{ fontSize: '0.7rem', color: '#999', marginTop: '4px' }}>
                单个文件最大支持 5000MB (5GB)
              </p>
              <FileInput
                id="videoUpload"
                type="file"
                multiple
                accept="video/*"
                onChange={(e) => handleFileUpload(Array.from(e.target.files), 'video')}
              />
              <Button 
                onClick={() => document.getElementById('videoUpload').click()}
                style={{ marginTop: '10px' }}
                disabled={uploading}
              >
                {uploading ? '上传中...' : '选择视频'}
              </Button>
            </FileUploadSection>
            
            {formData.作品视频.length > 0 && (
              <FileList>
                {formData.作品视频.map((video, index) => (
                  <FileItem key={index}>
                    <FileDeleteButton onClick={() => handleFileDelete(video, 'video')}>
                      ×
                    </FileDeleteButton>
                    <div style={{ 
                      width: '100%', 
                      height: '80px', 
                      background: '#f0f0f0', 
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '8px'
                    }}>
                      🎬
                    </div>
                    <FileName>{video}</FileName>
                  </FileItem>
                ))}
              </FileList>
            )}
          </FormSection>

          {/* 平台文件 */}
          {formData.支持平台.map(platform => (
            <FormSection key={platform}>
              <SectionTitle>{platform} 平台文件</SectionTitle>
              <FileUploadSection>
                <p>上传 {platform} 平台的应用文件</p>
                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '8px' }}>
                  支持 ZIP、RAR、APK、EXE、DMG 等格式
                </p>
                <p style={{ fontSize: '0.7rem', color: '#999', marginTop: '4px' }}>
                  单个文件最大支持 5000MB (5GB)
                </p>
                <FileInput
                  id={`${platform}Upload`}
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(Array.from(e.target.files), 'platform', platform)}
                />
                <Button 
                  onClick={() => document.getElementById(`${platform}Upload`).click()}
                  style={{ marginTop: '10px' }}
                  disabled={uploading}
                >
                  {uploading ? '上传中...' : '选择文件'}
                </Button>
              </FileUploadSection>
              
              {formData.文件名称[platform] && formData.文件名称[platform].length > 0 && (
                <FileList>
                  {formData.文件名称[platform].map((file, index) => (
                    <FileItem key={index}>
                      <FileDeleteButton onClick={() => handleFileDelete(file, 'platform', platform)}>
                        ×
                      </FileDeleteButton>
                      <div style={{ 
                        width: '100%', 
                        height: '80px', 
                        background: '#f0f0f0', 
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '8px'
                      }}>
                        📦
                      </div>
                      <FileName>{file}</FileName>
                    </FileItem>
                  ))}
                </FileList>
              )}
            </FormSection>
          ))}
        </>
      )}
      
      {/* 上传进度弹窗 */}
      <UploadProgressModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        uploadItems={uploadItems}
        canClose={!uploading}
      />
    </EditorContainer>
  );
};

export default WorkEditor;
