from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
import json
import os
import shutil
import hashlib
import time
import logging
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
import tempfile

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 设置上传文件大小限制为5000MB
app.config['MAX_CONTENT_LENGTH'] = 5000 * 1024 * 1024  # 5000MB

# 优化Flask配置以处理大文件
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['MAX_FORM_MEMORY_SIZE'] = 1024 * 1024 * 1024  # 1GB
app.config['MAX_FORM_PARTS'] = 1000

# 获取项目根目录
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORKS_DIR = os.path.join(BASE_DIR, 'works')
CONFIG_DIR = os.path.join(BASE_DIR, 'config')

# 管理员token
ADMIN_TOKEN = "shumengya520"

# 允许的文件扩展名
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'avi', 'mov', 'zip', 'rar', 'apk', 'exe', 'dmg'}

# 防刷机制：存储用户操作记录
# 格式: {user_fingerprint: {action_type: {work_id: last_action_time}}}
user_actions = {}

# 防刷时间间隔（秒）
RATE_LIMITS = {
    'view': 60,      # 浏览：1分钟内同一用户同一作品只能计数一次
    'download': 300, # 下载：5分钟内同一用户同一作品只能计数一次  
    'like': 3600     # 点赞：1小时内同一用户同一作品只能计数一次
}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def verify_admin_token():
    """验证管理员token"""
    token = request.args.get('token') or request.headers.get('Authorization')
    return token == ADMIN_TOKEN

def get_user_fingerprint():
    """生成用户指纹，用于防刷"""
    # 使用IP地址和User-Agent生成指纹
    ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.environ.get('REMOTE_ADDR', ''))
    user_agent = request.headers.get('User-Agent', '')
    fingerprint_string = f"{ip}:{user_agent}"
    return hashlib.md5(fingerprint_string.encode()).hexdigest()

def can_perform_action(action_type, work_id):
    """检查用户是否可以执行某个操作（防刷检查）"""
    fingerprint = get_user_fingerprint()
    current_time = time.time()
    
    # 如果用户从未记录过，允许操作
    if fingerprint not in user_actions:
        user_actions[fingerprint] = {}
    
    if action_type not in user_actions[fingerprint]:
        user_actions[fingerprint][action_type] = {}
    
    # 检查这个作品的上次操作时间
    last_action_time = user_actions[fingerprint][action_type].get(work_id, 0)
    time_diff = current_time - last_action_time
    
    # 如果时间间隔足够，允许操作
    if time_diff >= RATE_LIMITS.get(action_type, 0):
        user_actions[fingerprint][action_type][work_id] = current_time
        return True
    
    return False

def update_work_stats(work_id, stat_type, increment=1):
    """更新作品统计数据"""
    work_dir = os.path.join(WORKS_DIR, work_id)
    config_path = os.path.join(work_dir, 'work_config.json')
    
    if not os.path.exists(config_path):
        return False
    
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        # 确保统计字段存在
        stat_fields = ['作品下载量', '作品浏览量', '作品点赞量', '作品更新次数']
        for field in stat_fields:
            if field not in config:
                config[field] = 0
        
        # 更新指定统计数据
        if stat_type in config:
            config[stat_type] += increment
            config['更新时间'] = datetime.now().isoformat()
            
            with open(config_path, 'w', encoding='utf-8') as f:
                json.dump(config, f, ensure_ascii=False, indent=2)
            
            return True
    except Exception as e:
        print(f"更新统计数据失败: {e}")
        return False
    
    return False

#加载网站设置
def load_settings():
    """加载网站设置"""
    settings_path = os.path.join(CONFIG_DIR, 'settings.json')
    try:
        with open(settings_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {
            "网站名字": "树萌芽の作品集",
            "网站描述": "展示我的创意作品和项目",
            "站长": "树萌芽",
            "联系邮箱": "3205788256@qq.com",
            "主题颜色": "#81c784",
            "每页作品数量": 12,
            "启用搜索": True,
            "启用分类": True
        }

#加载单个作品配置
def load_work_config(work_id):
    """加载单个作品配置"""
    work_path = os.path.join(WORKS_DIR, work_id, 'work_config.json')
    try:
        with open(work_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
            # 添加下载链接
            config['下载链接'] = {}
            if '支持平台' in config and '文件名称' in config:
                for platform in config['支持平台']:
                    if platform in config['文件名称']:
                        files = config['文件名称'][platform]
                        config['下载链接'][platform] = [
                            f"/api/download/{work_id}/{platform}/{file}" 
                            for file in files
                        ]
            
            # 添加图片链接
            if '作品截图' in config:
                config['图片链接'] = [
                    f"/api/image/{work_id}/{img}" 
                    for img in config['作品截图']
                ]
            
            # 添加视频链接
            if '作品视频' in config:
                config['视频链接'] = [
                    f"/api/video/{work_id}/{video}" 
                    for video in config['作品视频']
                ]
                
            return config
    except FileNotFoundError:
        return None


#==============================公开API接口===============================
#获取所有作品
def get_all_works():
    """获取所有作品"""
    works = []
    if not os.path.exists(WORKS_DIR):
        return works
    
    for work_id in os.listdir(WORKS_DIR):
        work_dir = os.path.join(WORKS_DIR, work_id)
        if os.path.isdir(work_dir):
            config = load_work_config(work_id)
            if config:
                works.append(config)
    
    # 按更新时间排序
    works.sort(key=lambda x: x.get('更新时间', ''), reverse=True)
    return works

#获取网站设置
@app.route('/api/settings')
def get_settings():
    """获取网站设置"""
    return jsonify(load_settings())

#获取所有作品列表
@app.route('/api/works')
def get_works():
    """获取所有作品列表"""
    works = get_all_works()
    return jsonify({
        'success': True,
        'data': works,
        'total': len(works)
    })

#获取单个作品详情
@app.route('/api/works/<work_id>')
def get_work_detail(work_id):
    """获取单个作品详情"""
    config = load_work_config(work_id)
    if config:
        # 增加浏览量（防刷检查）
        if can_perform_action('view', work_id):
            update_work_stats(work_id, '作品浏览量')
            # 重新加载配置获取最新数据
            config = load_work_config(work_id)
        
        return jsonify({
            'success': True,
            'data': config
        })
    else:
        return jsonify({
            'success': False,
            'message': '作品不存在'
        }), 404

#提供作品图片
@app.route('/api/image/<work_id>/<filename>')
def serve_image(work_id, filename):
    """提供作品图片"""
    image_dir = os.path.join(WORKS_DIR, work_id, 'image')
    if os.path.exists(os.path.join(image_dir, filename)):
        return send_from_directory(image_dir, filename)
    return jsonify({'error': '图片不存在'}), 404

#提供作品视频
@app.route('/api/video/<work_id>/<filename>')
def serve_video(work_id, filename):
    """提供作品视频"""
    video_dir = os.path.join(WORKS_DIR, work_id, 'video')
    if os.path.exists(os.path.join(video_dir, filename)):
        return send_from_directory(video_dir, filename)
    return jsonify({'error': '视频不存在'}), 404

#提供作品下载
@app.route('/api/download/<work_id>/<platform>/<filename>')
def download_file(work_id, platform, filename):
    """提供作品下载"""
    platform_dir = os.path.join(WORKS_DIR, work_id, 'platform', platform)
    if os.path.exists(os.path.join(platform_dir, filename)):
        # 增加下载量（防刷检查）
        if can_perform_action('download', work_id):
            update_work_stats(work_id, '作品下载量')
        
        return send_from_directory(platform_dir, filename, as_attachment=True)
    return jsonify({'error': '文件不存在'}), 404

#搜索作品
@app.route('/api/search')
def search_works():
    """搜索作品"""
    from flask import request
    query = request.args.get('q', '').lower()
    category = request.args.get('category', '')
    
    works = get_all_works()
    
    if query:
        filtered_works = []
        for work in works:
            # 在作品名称、描述、标签中搜索
            if (query in work.get('作品作品', '').lower() or
                query in work.get('作品描述', '').lower() or
                any(query in tag.lower() for tag in work.get('作品标签', []))):
                filtered_works.append(work)
        works = filtered_works
    
    if category:
        works = [work for work in works if work.get('作品分类', '') == category]
    
    return jsonify({
        'success': True,
        'data': works,
        'total': len(works)
    })

#获取所有分类
@app.route('/api/categories')
def get_categories():
    """获取所有分类"""
    works = get_all_works()
    categories = list(set(work.get('作品分类', '') for work in works if work.get('作品分类')))
    return jsonify({
        'success': True,
        'data': categories
    })

@app.route('/api/like/<work_id>', methods=['POST'])
def like_work(work_id):
    """点赞作品"""
    # 检查作品是否存在
    config = load_work_config(work_id)
    if not config:
        return jsonify({
            'success': False,
            'message': '作品不存在'
        }), 404
    
    # 防刷检查
    if not can_perform_action('like', work_id):
        return jsonify({
            'success': False,
            'message': '操作太频繁，请稍后再试'
        }), 429
    
    # 增加点赞量
    if update_work_stats(work_id, '作品点赞量'):
        # 获取最新的点赞数
        updated_config = load_work_config(work_id)
        return jsonify({
            'success': True,
            'message': '点赞成功',
            'likes': updated_config.get('作品点赞量', 0)
        })
    else:
        return jsonify({
            'success': False,
            'message': '点赞失败'
        }), 500
#==============================公开API接口===============================



# ===========================================
# 管理员API接口
# ===========================================

@app.route('/api/admin/works', methods=['GET'])
def admin_get_works():
    """管理员获取所有作品（包含更多详细信息）"""
    if not verify_admin_token():
        return jsonify({'success': False, 'message': '权限不足'}), 403
    
    works = get_all_works()
    return jsonify({
        'success': True,
        'data': works,
        'total': len(works)
    })

@app.route('/api/admin/works/<work_id>', methods=['PUT'])
def admin_update_work(work_id):
    """管理员更新作品信息"""
    if not verify_admin_token():
        return jsonify({'success': False, 'message': '权限不足'}), 403
    
    try:
        data = request.get_json()
        work_dir = os.path.join(WORKS_DIR, work_id)
        config_path = os.path.join(work_dir, 'work_config.json')
        
        if not os.path.exists(config_path):
            return jsonify({'success': False, 'message': '作品不存在'}), 404
        
        # 读取现有配置获取当前统计数据
        with open(config_path, 'r', encoding='utf-8') as f:
            current_config = json.load(f)
        
        # 确保统计字段存在并保持原值
        stat_fields = ['作品下载量', '作品浏览量', '作品点赞量', '作品更新次数']
        for field in stat_fields:
            if field not in data:
                data[field] = current_config.get(field, 0)
        
        # 更新时间和更新次数
        data['更新时间'] = datetime.now().isoformat()
        data['作品更新次数'] = current_config.get('作品更新次数', 0) + 1
        
        # 保存配置文件
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        return jsonify({'success': True, 'message': '更新成功'})
    
    except Exception as e:
        return jsonify({'success': False, 'message': f'更新失败: {str(e)}'}), 500

@app.route('/api/admin/works/<work_id>', methods=['DELETE'])
def admin_delete_work(work_id):
    """管理员删除作品"""
    if not verify_admin_token():
        return jsonify({'success': False, 'message': '权限不足'}), 403
    
    try:
        work_dir = os.path.join(WORKS_DIR, work_id)
        
        if not os.path.exists(work_dir):
            return jsonify({'success': False, 'message': '作品不存在'}), 404
        
        # 删除整个作品目录
        shutil.rmtree(work_dir)
        
        return jsonify({'success': True, 'message': '删除成功'})
    
    except Exception as e:
        return jsonify({'success': False, 'message': f'删除失败: {str(e)}'}), 500

@app.route('/api/admin/works', methods=['POST'])
def admin_create_work():
    """管理员创建新作品"""
    if not verify_admin_token():
        return jsonify({'success': False, 'message': '权限不足'}), 403
    
    try:
        data = request.get_json()
        work_id = data.get('作品ID')
        
        if not work_id:
            return jsonify({'success': False, 'message': '作品ID不能为空'}), 400
        
        work_dir = os.path.join(WORKS_DIR, work_id)
        
        # 检查作品是否已存在
        if os.path.exists(work_dir):
            return jsonify({'success': False, 'message': '作品ID已存在'}), 409
        
        # 创建作品目录结构
        os.makedirs(work_dir, exist_ok=True)
        os.makedirs(os.path.join(work_dir, 'image'), exist_ok=True)
        os.makedirs(os.path.join(work_dir, 'video'), exist_ok=True)
        os.makedirs(os.path.join(work_dir, 'platform'), exist_ok=True)
        
        # 创建平台子目录
        platforms = data.get('支持平台', [])
        for platform in platforms:
            platform_dir = os.path.join(work_dir, 'platform', platform)
            os.makedirs(platform_dir, exist_ok=True)
        
        # 设置默认值
        current_time = datetime.now().isoformat()
        config = {
            '作品ID': work_id,
            '作品作品': data.get('作品作品', ''),
            '作品描述': data.get('作品描述', ''),
            '作者': data.get('作者', '树萌芽'),
            '作品版本号': data.get('作品版本号', '1.0.0'),
            '作品分类': data.get('作品分类', '其他'),
            '作品标签': data.get('作品标签', []),
            '上传时间': current_time,
            '更新时间': current_time,
            '支持平台': platforms,
            '文件名称': {},
            '作品截图': [],
            '作品视频': [],
            '作品封面': '',
            '作品下载量': 0,
            '作品浏览量': 0,
            '作品点赞量': 0,
            '作品更新次数': 0
        }
        
        # 保存配置文件
        config_path = os.path.join(work_dir, 'work_config.json')
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(config, f, ensure_ascii=False, indent=2)
        
        return jsonify({'success': True, 'message': '创建成功', 'work_id': work_id})
    
    except Exception as e:
        return jsonify({'success': False, 'message': f'创建失败: {str(e)}'}), 500

@app.route('/api/admin/upload/<work_id>/<file_type>', methods=['POST'])
def admin_upload_file(work_id, file_type):
    """管理员上传文件（优化大文件处理）"""
    if not verify_admin_token():
        return jsonify({'success': False, 'message': '权限不足'}), 403
    
    temp_file_path = None
    try:
        logger.info(f"开始上传文件 - 作品ID: {work_id}, 文件类型: {file_type}")
        
        work_dir = os.path.join(WORKS_DIR, work_id)
        if not os.path.exists(work_dir):
            logger.error(f"作品目录不存在: {work_dir}")
            return jsonify({'success': False, 'message': '作品不存在'}), 404
        
        if 'file' not in request.files:
            logger.error("请求中没有文件")
            return jsonify({'success': False, 'message': '没有文件'}), 400
        
        file = request.files['file']
        if file.filename == '':
            logger.error("没有选择文件")
            return jsonify({'success': False, 'message': '没有选择文件'}), 400
        
        original_filename = secure_filename(file.filename)
        logger.info(f"原始文件名: {original_filename}")
        
        # 检查文件格式
        if not allowed_file(original_filename):
            logger.error(f"不支持的文件格式: {original_filename}")
            return jsonify({'success': False, 'message': '不支持的文件格式'}), 400
        
        file_extension = original_filename.rsplit('.', 1)[1].lower()
        
        # 读取现有配置来生成新文件名
        config_path = os.path.join(work_dir, 'work_config.json')
        if not os.path.exists(config_path):
            logger.error(f"配置文件不存在: {config_path}")
            return jsonify({'success': False, 'message': '作品配置不存在'}), 404
            
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        # 根据文件类型确定保存目录和文件名
        if file_type == 'image':
            save_dir = os.path.join(work_dir, 'image')
            existing_images = config.get('作品截图', [])
            image_number = len(existing_images) + 1
            filename = f"image{image_number}.{file_extension}"
        elif file_type == 'video':
            save_dir = os.path.join(work_dir, 'video')
            existing_videos = config.get('作品视频', [])
            video_number = len(existing_videos) + 1
            filename = f"video{video_number}.{file_extension}"
        elif file_type == 'platform':
            platform = request.form.get('platform')
            if not platform:
                logger.error("平台参数缺失")
                return jsonify({'success': False, 'message': '平台参数缺失'}), 400
            save_dir = os.path.join(work_dir, 'platform', platform)
            filename = f"{work_id}_{platform.lower()}.{file_extension}"
        else:
            logger.error(f"不支持的文件类型: {file_type}")
            return jsonify({'success': False, 'message': '不支持的文件类型'}), 400
        
        # 确保目录存在
        os.makedirs(save_dir, exist_ok=True)
        final_file_path = os.path.join(save_dir, filename)
        
        logger.info(f"目标文件路径: {final_file_path}")
        
        # 使用临时文件进行流式保存，避免内存溢出
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_file_path = temp_file.name
            logger.info(f"临时文件路径: {temp_file_path}")
            
            # 分块读取和写入文件，减少内存使用
            chunk_size = 8192  # 8KB chunks
            total_size = 0
            
            while True:
                chunk = file.stream.read(chunk_size)
                if not chunk:
                    break
                temp_file.write(chunk)
                total_size += len(chunk)
                
                # 检查文件大小
                max_size = 5000 * 1024 * 1024  # 5000MB
                if total_size > max_size:
                    logger.error(f"文件太大: {total_size} bytes")
                    return jsonify({
                        'success': False, 
                        'message': f'文件太大，最大支持 {max_size // (1024*1024)}MB，当前文件大小：{total_size // (1024*1024)}MB'
                    }), 413
        
        logger.info(f"文件写入临时文件完成，总大小: {total_size} bytes")
        
        # 移动临时文件到最终位置
        shutil.move(temp_file_path, final_file_path)
        temp_file_path = None  # 标记已移动，避免重复删除
        
        logger.info(f"文件移动到最终位置完成: {final_file_path}")
        
        # 更新配置文件
        if file_type == 'image':
            if filename not in config.get('作品截图', []):
                config.setdefault('作品截图', []).append(filename)
            if not config.get('作品封面'):
                config['作品封面'] = filename
        elif file_type == 'video':
            if filename not in config.get('作品视频', []):
                config.setdefault('作品视频', []).append(filename)
        elif file_type == 'platform':
            platform = request.form.get('platform')
            config.setdefault('文件名称', {}).setdefault(platform, [])
            if filename not in config['文件名称'][platform]:
                config['文件名称'][platform].append(filename)
        
        config['更新时间'] = datetime.now().isoformat()
        
        # 原子性更新配置文件
        temp_config_path = config_path + '.tmp'
        try:
            with open(temp_config_path, 'w', encoding='utf-8') as f:
                json.dump(config, f, ensure_ascii=False, indent=2)
            shutil.move(temp_config_path, config_path)
        except Exception as e:
            # 清理临时配置文件
            if os.path.exists(temp_config_path):
                os.remove(temp_config_path)
            raise e
        
        logger.info(f"文件上传成功: {filename}, 大小: {total_size} bytes")
        
        return jsonify({
            'success': True, 
            'message': '上传成功',
            'filename': filename,
            'file_size': total_size
        })
        
    except Exception as e:
        # 清理临时文件
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except:
                pass
        
        logger.error(f"文件上传错误: {str(e)}")
        logger.error(f"错误类型: {type(e)}")
        import traceback
        traceback.print_exc()
        
        # 特殊处理文件大小超限错误
        if 'Request Entity Too Large' in str(e) or 'exceeded maximum allowed payload' in str(e):
            return jsonify({
                'success': False, 
                'message': '文件太大，请选择小于5000MB的文件'
            }), 413
        
        return jsonify({'success': False, 'message': f'上传失败: {str(e)}'}), 500

@app.route('/api/admin/delete-file/<work_id>/<file_type>/<filename>', methods=['DELETE'])
def admin_delete_file(work_id, file_type, filename):
    """管理员删除文件"""
    if not verify_admin_token():
        return jsonify({'success': False, 'message': '权限不足'}), 403
    
    try:
        work_dir = os.path.join(WORKS_DIR, work_id)
        config_path = os.path.join(work_dir, 'work_config.json')
        
        if not os.path.exists(config_path):
            return jsonify({'success': False, 'message': '作品不存在'}), 404
        
        # 确定文件路径
        if file_type == 'image':
            file_path = os.path.join(work_dir, 'image', filename)
        elif file_type == 'video':
            file_path = os.path.join(work_dir, 'video', filename)
        elif file_type == 'platform':
            platform = request.args.get('platform')
            if not platform:
                return jsonify({'success': False, 'message': '平台参数缺失'}), 400
            file_path = os.path.join(work_dir, 'platform', platform, filename)
        else:
            return jsonify({'success': False, 'message': '不支持的文件类型'}), 400
        
        # 删除文件
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # 更新配置文件
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        if file_type == 'image':
            if filename in config.get('作品截图', []):
                config['作品截图'].remove(filename)
            if config.get('作品封面') == filename:
                config['作品封面'] = config['作品截图'][0] if config['作品截图'] else ''
        elif file_type == 'video':
            if filename in config.get('作品视频', []):
                config['作品视频'].remove(filename)
        elif file_type == 'platform':
            platform = request.args.get('platform')
            if platform in config.get('文件名称', {}):
                if filename in config['文件名称'][platform]:
                    config['文件名称'][platform].remove(filename)
        
        config['更新时间'] = datetime.now().isoformat()
        
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(config, f, ensure_ascii=False, indent=2)
        
        return jsonify({'success': True, 'message': '删除成功'})
    
    except Exception as e:
        return jsonify({'success': False, 'message': f'删除失败: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)