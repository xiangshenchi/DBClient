import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation files can be defined here or imported
const resources = {
  en: {
    translation: {
      "app_title": "DBClient",
      "search_connections": "Search connections by name... (Ctrl+F)",
      "filter_all": "All",
      "filter_favorites": "Favorites",
      "add_connection": "Add Connection (Ctrl+N)",
      "no_connections_found": "No connections found",
      "get_started_add": "Get started by adding a database connection",
      "online": "Online",
      "offline": "Offline",
      "unknown": "Unknown",
      "pinging": "Pinging...",
      "never_connected": "Never",
      "open_source_github": "Open Source on GitHub: xiangshenchi/DBClient",
      
      // Lock screen
      "welcome_back": "Welcome Back",
      "enter_password_to_decrypt": "Enter your password to decrypt your connections",
      "enter_master_password": "Enter master password",
      "unlock": "Unlock",
      "incorrect_password": "Incorrect password",
      "setup_pin": "Set up a 4-digit PIN",
      "enter_pin": "Enter your PIN to unlock",
      "forgot_pin": "Forgot PIN?",
      "reset_app": "Reset App?",
      "reset_app_desc": "This will clear your PIN and permanently delete all your local connections. If you have a WebDAV backup, you can restore them after resetting.",
      "reset_app_btn": "Reset App",
      
      // Connection Edit
      "add_new_connection": "New Connection",
      "edit_connection": "Edit Connection",
      "database_type": "Database Type",
      "connection_name": "Connection Name",
      "eg_production_mysql": "e.g. Production MySQL",
      "host": "Host/IP",
      "port": "Port",
      "username": "Username",
      "username_optional": "Username (Optional)",
      "password": "Password",
      "database": "Database Name",
      "database_index": "Database Index (Optional, default 0)",
      "enable_ssl": "Enable SSL / TLS",
      "save_connection": "Save Connection",
      "cancel": "Cancel",
      "test_connection": "Test Connection",
      "testing": "Testing...",
      "connection_successful": "Connection Successful!",
      "connection_failed": "Connection Failed",
      
      // WebDAV
      "webdav_sync": "WebDAV Sync",
      "webdav_desc": "Backup and sync your connections using WebDAV",
      "server_url": "Server URL",
      "password_app_password": "Password / App Password",
      "backup_file_path": "Backup File Path",
      "confirm_restore": "Confirm Restore",
      "restore": "Restore",
      "backup": "Backup",
      "webdav_fill_all": "Please fill in all WebDAV details",
      "webdav_backup_success": "Backup to WebDAV successful!",
      "webdav_backup_failed": "Backup failed",
      "webdav_restore_success": "Successfully restored connections!",
      "webdav_restore_failed": "Restore failed",
      "sync_now": "Sync Now",
      "sync_success": "Sync successful",
      "sync_failed": "Sync failed",
      "last_sync": "Last sync: ",
      "back_to_connections": "Back to connections",
      
      // Workspace
      "workspace": "Workspace",
      "disconnect": "Disconnect",
      "tables_tab": "Tables",
      "history": "History",
      "search_tables": "Search tables...",
      "no_history_yet": "No history yet",
      "queries_run_here": "Queries run in this session will appear here",
      "loading": "Loading...",
      "no_tables_found": "No tables found",
      "failed_to_connect": "or failed to connect",
      "no_matching_tables": "No matching tables",
      "enter_sql_here": "ENTER SQL HERE... (SELECT, SHOW, DESCRIBE)",
      "read_only_limit": "Read-only (LIMIT auto-applied)",
      "execute_query": "Run",
      "rows_in_ms": "{{count}} rows in {{ms}}ms",
      "csv": "CSV",
      "query_returned_0_rows": "Query returned 0 rows.",
      "no_results": "No results",
      "no_data": "No data",
      "query_tab": "Query",
      
      // Theme/Lang
      "toggle_theme": "Toggle Theme",
      "switch_language": "Switch Language",
      
      // General
      "delete": "Delete",
      "edit": "Edit",
      "favorite": "Favorite",
      "unfavorite": "Unfavorite",
      "confirm": "Confirm",
      "confirm_delete": "Are you sure you want to delete this connection?",
      "yes": "Yes",
      "no": "No"
    }
  },
  zh: {
    translation: {
      "app_title": "DBClient",
      "search_connections": "按名称搜索连接... (Ctrl+F)",
      "filter_all": "全部",
      "filter_favorites": "收藏",
      "add_connection": "添加连接 (Ctrl+N)",
      "no_connections_found": "未找到连接",
      "get_started_add": "添加一个数据库连接以开始使用",
      "online": "在线",
      "offline": "离线",
      "unknown": "未知",
      "pinging": "Ping...",
      "never_connected": "从未使用",
      "open_source_github": "GitHub 开源: xiangshenchi/DBClient",
      
      // Lock screen
      "welcome_back": "欢迎回来",
      "enter_password_to_decrypt": "输入密码以解密您的连接信息",
      "enter_master_password": "输入主密码",
      "unlock": "解锁",
      "incorrect_password": "密码不正确",
      "setup_pin": "设置 4 位 PIN 码",
      "enter_pin": "输入您的 PIN 码以解锁",
      "forgot_pin": "忘记 PIN 码？",
      "reset_app": "重置应用？",
      "reset_app_desc": "这将清除您的 PIN 码并永久删除所有本地连接。如果您有 WebDAV 备份，则可以在重置后恢复它们。",
      "reset_app_btn": "重置应用",
      
      // Connection Edit
      "add_new_connection": "添加新连接",
      "edit_connection": "编辑连接",
      "database_type": "数据库类型",
      "connection_name": "连接名称",
      "eg_production_mysql": "例如：生产环境 MySQL",
      "host": "主机/IP",
      "port": "端口",
      "username": "用户名",
      "username_optional": "用户名（可选）",
      "password": "密码",
      "database": "数据库名称",
      "database_index": "数据库索引（可选，默认 0）",
      "enable_ssl": "启用 SSL / TLS",
      "save_connection": "保存连接",
      "cancel": "取消",
      "test_connection": "测试连接",
      "testing": "测试中...",
      "connection_successful": "连接成功！",
      "connection_failed": "连接失败",
      
      // WebDAV
      "webdav_sync": "WebDAV 同步",
      "webdav_desc": "使用 WebDAV 备份和同步您的连接",
      "server_url": "服务器 URL",
      "password_app_password": "密码 / 应用密码",
      "backup_file_path": "备份文件路径",
      "confirm_restore": "确认恢复",
      "restore": "恢复",
      "backup": "备份",
      "webdav_fill_all": "请填写所有 WebDAV 详情",
      "webdav_backup_success": "备份到 WebDAV 成功！",
      "webdav_backup_failed": "备份失败",
      "webdav_restore_success": "成功恢复连接！",
      "webdav_restore_failed": "恢复失败",
      "sync_now": "立即同步",
      "sync_success": "同步成功",
      "sync_failed": "同步失败",
      "last_sync": "上次同步: ",
      "back_to_connections": "返回连接列表",
      
      // Workspace
      "workspace": "工作区",
      "disconnect": "断开连接",
      "query_tab": "查询",
      "tables_tab": "表",
      "history": "历史",
      "search_tables": "搜索表...",
      "no_history_yet": "暂无历史",
      "queries_run_here": "此会话中运行的查询将显示在这里",
      "loading": "加载中...",
      "no_tables_found": "未找到表",
      "failed_to_connect": "或连接失败",
      "no_matching_tables": "没有匹配的表",
      "enter_sql_here": "在此处输入 SQL... (SELECT, SHOW, DESCRIBE)",
      "read_only_limit": "只读 (自动应用 LIMIT)",
      "execute_query": "执行",
      "rows_in_ms": "{{count}} 行，耗时 {{ms}}ms",
      "csv": "CSV",
      "query_returned_0_rows": "查询返回 0 行。",
      "no_results": "无结果",
      "no_data": "无数据",
      
      // Theme/Lang
      "toggle_theme": "切换主题",
      "switch_language": "切换语言",
      
      // General
      "delete": "删除",
      "edit": "编辑",
      "favorite": "收藏",
      "unfavorite": "取消收藏",
      "confirm": "确认",
      "confirm_delete": "您确定要删除此连接吗？",
      "yes": "是",
      "no": "否"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
