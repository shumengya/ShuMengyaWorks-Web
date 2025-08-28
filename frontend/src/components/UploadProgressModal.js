import React from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  min-width: 400px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${fadeIn} 0.3s ease-out;
  
  @media (max-width: 768px) {
    min-width: 300px;
    padding: 20px;
    margin: 20px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e8f5e8;
`;

const ModalTitle = styled.h2`
  color: #2e7d32;
  font-size: 1.5rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f0f0f0;
    color: #333;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const UploadList = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const UploadItem = styled.div`
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #81c784;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FileInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 10px;
`;

const FileName = styled.div`
  font-weight: 500;
  color: #333;
  word-break: break-all;
  flex: 1;
`;

const FileSize = styled.div`
  font-size: 0.9rem;
  color: #666;
  background: #e0e0e0;
  padding: 2px 8px;
  border-radius: 12px;
`;

const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.9rem;
`;

const ProgressText = styled.span`
  color: #2e7d32;
  font-weight: 500;
`;

const ProgressPercentage = styled.span`
  color: #666;
  font-weight: bold;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 12px;
  background: #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 5px;
`;

const ProgressBar = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #81c784);
  transition: width 0.3s ease;
  width: ${props => props.progress}%;
  border-radius: 6px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const SpeedInfo = styled.div`
  font-size: 0.8rem;
  color: #999;
  display: flex;
  justify-content: space-between;
`;

const StatusIcon = styled.span`
  font-size: 1.2rem;
  margin-right: 5px;
`;

const RetryInfo = styled.div`
  font-size: 0.8rem;
  color: #ff9800;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const ErrorMessage = styled.div`
  font-size: 0.8rem;
  color: #f44336;
  margin-top: 5px;
  padding: 5px 8px;
  background: #ffebee;
  border-radius: 4px;
  border-left: 3px solid #f44336;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
  font-size: 1.1rem;
`;

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatSpeed = (bytesPerSecond) => {
  return formatFileSize(bytesPerSecond) + '/s';
};

const formatETA = (seconds) => {
  if (!seconds || seconds <= 0) return '计算中...';
  if (seconds < 60) return `${seconds}秒`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}分钟`;
  return `${Math.round(seconds / 3600)}小时`;
};

const calculateETA = (uploaded, total, speed) => {
  if (speed === 0 || uploaded >= total) return '完成';
  const remaining = total - uploaded;
  const seconds = Math.round(remaining / speed);
  return formatETA(seconds);
};

const UploadProgressModal = ({ 
  isOpen, 
  onClose, 
  uploadItems, 
  canClose = true 
}) => {
  if (!isOpen) return null;

  const hasActiveUploads = Object.keys(uploadItems).length > 0;

  return (
    <ModalOverlay onClick={canClose ? onClose : undefined}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <StatusIcon>📤</StatusIcon>
            文件上传进度
            {hasActiveUploads && <span style={{ color: '#81c784' }}>({Object.keys(uploadItems).length})</span>}
          </ModalTitle>
          <CloseButton 
            onClick={onClose} 
            disabled={!canClose}
            title={canClose ? '关闭' : '上传中，无法关闭'}
          >
            ×
          </CloseButton>
        </ModalHeader>

        <UploadList>
          {!hasActiveUploads ? (
            <EmptyState>
              <StatusIcon>✅</StatusIcon>
              当前没有文件上传任务
            </EmptyState>
          ) : (
            Object.entries(uploadItems).map(([fileKey, uploadInfo]) => {
              const { 
                fileName, 
                fileSize, 
                progress, 
                uploaded, 
                speed, 
                status,
                retryCount,
                eta,
                error
              } = uploadInfo;
              
              const isCompleted = status === 'completed' || progress >= 100;
              const isFailed = status === 'error';
              const isRetrying = status === 'retrying';
              const isUploading = status === 'uploading' || (!status && progress < 100);
              
              return (
                <UploadItem key={fileKey}>
                  <FileInfo>
                    <FileName>
                      {isCompleted && <StatusIcon>✅</StatusIcon>}
                      {isFailed && <StatusIcon>❌</StatusIcon>}
                      {isRetrying && <StatusIcon>🔄</StatusIcon>}
                      {isUploading && <StatusIcon>📤</StatusIcon>}
                      {fileName}
                    </FileName>
                    <FileSize>{formatFileSize(fileSize)}</FileSize>
                  </FileInfo>
                  
                  {/* 重试信息 */}
                  {(isRetrying || (retryCount > 0 && !isCompleted)) && (
                    <RetryInfo>
                      <span>🔄</span>
                      {isRetrying ? '重试中...' : `已重试 ${retryCount} 次`}
                    </RetryInfo>
                  )}
                  
                  <ProgressInfo>
                    <ProgressText>
                      {isFailed ? '上传失败' : 
                       isCompleted ? '上传完成' : 
                       isRetrying ? '重试中...' : '上传中...'}
                    </ProgressText>
                    <ProgressPercentage>{progress}%</ProgressPercentage>
                  </ProgressInfo>
                  
                  <ProgressBarContainer>
                    <ProgressBar progress={progress} />
                  </ProgressBarContainer>
                  
                  <SpeedInfo>
                    <span>
                      {formatFileSize(uploaded || 0)} / {formatFileSize(fileSize)}
                    </span>
                    {(isUploading || isRetrying) && (
                      <span>
                        {speed > 0 && (
                          <>
                            {formatSpeed(speed)}
                            {eta > 0 ? ` • 剩余 ${formatETA(eta)}` : 
                             speed > 0 ? ` • 剩余 ${calculateETA(uploaded || 0, fileSize, speed)}` : ''}
                          </>
                        )}
                        {speed === 0 && !isRetrying && '计算速度中...'}
                      </span>
                    )}
                  </SpeedInfo>
                  
                  {/* 错误信息 */}
                  {(isFailed || error) && (
                    <ErrorMessage>
                      {error || '上传失败，请重试'}
                    </ErrorMessage>
                  )}
                </UploadItem>
              );
            })
          )}
        </UploadList>
      </ModalContent>
    </ModalOverlay>
  );
};

export default UploadProgressModal;
