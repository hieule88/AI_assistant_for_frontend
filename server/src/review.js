function countMatches(text, regex) {
  return (text.match(regex) || []).length;
}

export function validateHtml(content, file = '/index.html') {
  const issues = [];
  const html = String(content || '');
  const add = (level, message) => issues.push({ level, message, file });

  if (html.trim().length < 200) {
    add('error', 'Nội dung quá ngắn — có thể model trả thiếu hoặc rỗng.');
  }

  if (!/<\/html\s*>\s*$/i.test(html.trim())) {
    add('error', 'Không kết thúc bằng </html> — HTML có thể bị cắt cụt (tăng QWEN_MAX_TOKENS?).');
  }

  if (!/<!doctype html>/i.test(html)) add('warning', 'Thiếu <!doctype html>.');
  if (!/<html[\s>]/i.test(html)) add('error', 'Thiếu thẻ <html>.');
  if (!/<head[\s>]/i.test(html)) add('warning', 'Thiếu thẻ <head>.');
  if (!/<body[\s>]/i.test(html)) add('error', 'Thiếu thẻ <body>.');
  if (!/<\/body\s*>/i.test(html)) add('error', 'Thiếu thẻ đóng </body>.');

  const scriptOpen = countMatches(html, /<script[\s>]/gi);
  const scriptClose = countMatches(html, /<\/script\s*>/gi);
  if (scriptOpen !== scriptClose) {
    add('error', `Số <script> (${scriptOpen}) không khớp </script> (${scriptClose}).`);
  }
  const styleOpen = countMatches(html, /<style[\s>]/gi);
  const styleClose = countMatches(html, /<\/style\s*>/gi);
  if (styleOpen !== styleClose) {
    add('error', `Số <style> (${styleOpen}) không khớp </style> (${styleClose}).`);
  }

  if (/\bTODO\b|\bFIXME\b|lorem ipsum|YOUR_[A-Z_]+|\bXXX\b/i.test(html)) {
    add('warning', 'Còn sót TODO/FIXME/placeholder chưa hoàn thiện.');
  }

  if (/<script[^>]+src\s*=\s*["']https?:/i.test(html) || /<link[^>]+href\s*=\s*["']https?:\/\/[^"']*\.css/i.test(html)) {
    add('warning', 'Có vẻ nạp script/CSS từ CDN ngoài — yêu cầu là HTML tự chứa, không CDN.');
  }

  return issues;
}

/**
 * @returns {{ ok:boolean, errors:Array, warnings:Array, issues:Array }}
 */

export function reviewProject(project) {
  const issues = [];

  const index = project.files.find((f) => f.path === '/index.html') || project.files[0];
  if (!index) {
    issues.push({ level: 'error', message: 'Project không có file nào.', file: '-' });
  } else {
    if (project.entry !== '/index.html') {
      issues.push({ level: 'warning', message: `entry = "${project.entry}" (nên là "/index.html").`, file: project.entry });
    }
    issues.push(...validateHtml(index.content, index.path));
  }

  const errors = issues.filter((i) => i.level === 'error');
  const warnings = issues.filter((i) => i.level === 'warning');
  return { ok: errors.length === 0, errors, warnings, issues };
}

export function summarizeIssues(issues) {
  if (!issues.length) return 'không có lỗi';
  return issues.map((i) => `[${i.level}] ${i.message}`).join(' · ');
}
