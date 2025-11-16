# -*- coding: utf-8 -*-
import json
import re
import os

# 获取当前脚本所在目录
script_dir = r'D:\PythonDemo\大嘴鸟'
# 获取上级目录
parent_dir = r'D:\PythonDemo'
# 构建文件路径
txt_file = os.path.join(parent_dir, '七上生字词.txt')

# 读取文件
with open(txt_file, 'r', encoding='utf-8') as f:
    lines = [line.strip() for line in f.readlines() if line.strip()]

words = []
seen_words = set()  # 用于去重

for line in lines:
    # 处理错误词/正确词格式：如 "莫明其妙/莫名其妙"
    if '/' in line:
        parts = line.split('/')
        if len(parts) == 2:
            wrong = parts[0].strip()
            right = parts[1].strip()
            # 添加错误词
            if wrong not in seen_words:
                words.append({"word": wrong, "correct": False, "right": right})
                seen_words.add(wrong)
            # 添加正确词（如果还没有）
            if right not in seen_words:
                words.append({"word": right, "correct": True})
                seen_words.add(right)
    
    # 处理带拼音的词：如 "朗润 (lǎng rùn)"
    elif '(' in line and ')' in line:
        match = re.match(r'^(.+?)\s*\((.+?)\)$', line)
        if match:
            word = match.group(1).strip()
            pinyin = match.group(2).strip()
            full_word = f"{word} ({pinyin})"
            # 检查是否已存在
            if full_word not in seen_words:
                words.append({"word": full_word, "correct": True})
                seen_words.add(full_word)
    
    # 处理普通词（不包含括号和斜杠）
    elif line and '(' not in line and '/' not in line:
        # 检查是否已存在
        if line not in seen_words:
            words.append({"word": line, "correct": True})
            seen_words.add(line)

# 生成JavaScript代码
js_code = """// 默认词库 - 七年级上册生字词
const WORD_BANK = """ + json.dumps(words, ensure_ascii=False, indent=2) + """;

function sampleWord(probWrong = 0.10, forceWrong = false) {
  const wrongs = WORD_BANK.filter(w => !w.correct);
  const rights = WORD_BANK.filter(w => w.correct);
  if (forceWrong && wrongs.length > 0) {
    const w = wrongs[Math.floor(Math.random()*wrongs.length)]; 
    return { text:w.word, correct:false, right:w.right }; 
  }
  const useWrong = Math.random() < probWrong && wrongs.length > 0;
  if (useWrong) { 
    const w = wrongs[Math.floor(Math.random()*wrongs.length)]; 
    return { text:w.word, correct:false, right:w.right }; 
  }
  const r = rights[Math.floor(Math.random()*rights.length)]; 
  return { text:r.word, correct:true };
}
"""

# 写入文件
output_file = os.path.join(script_dir, 'words_curated.js')
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(js_code)

print(f'词库生成成功，共 {len(words)} 个词条')
print(f'其中正确词：{sum(1 for w in words if w.get("correct"))} 个')
print(f'其中错误词：{sum(1 for w in words if not w.get("correct"))} 个')
print(f'文件已保存到：{output_file}')

