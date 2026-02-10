/**
 * 将对象转为 urlencoded 格式字符串（原生 API 版）
 * @param {Object} obj - 要转换的对象
 * @returns {string} urlencoded 格式的字符串
 */
export function objToUrlEncoded(obj) {
  // 空对象直接返回空字符串
  if (!obj || typeof obj !== 'object') return '';
  
  const params = new URLSearchParams();
  // 遍历对象，添加键值对
  for (const [key, value] of Object.entries(obj)) {
    // 过滤 undefined/null（可选，根据业务需求调整）
    if (value !== undefined && value !== null) {
      params.append(key, value);
    }
  }
  // 转为 urlencoded 字符串（自动编码特殊字符）
  return params.toString();
}