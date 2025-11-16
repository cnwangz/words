// 默认词库 - 七年级上册生字词
const WORD_BANK = [
  {
    "word": "莫名其妙",
    "correct": true
  },
  {
    "word": "莫明其妙",
    "correct": false,
    "right": "莫名其妙"
  },
  {
    "word": "不假思索",
    "correct": true
  },
  {
    "word": "不加思索",
    "correct": false,
    "right": "不假思索"
  },
  {
    "word": "废寝忘食",
    "correct": true
  },
  {
    "word": "费寝忘食",
    "correct": false,
    "right": "废寝忘食"
  },
  {
    "word": "再接再厉",
    "correct": true
  },
  {
    "word": "再接再励",
    "correct": false,
    "right": "再接再厉"
  },
  {
    "word": "变本加厉",
    "correct": true
  },
  {
    "word": "变本加利",
    "correct": false,
    "right": "变本加厉"
  },
  {
    "word": "偃旗息鼓",
    "correct": true
  },
  {
    "word": "掩旗息鼓",
    "correct": false,
    "right": "偃旗息鼓"
  },
  {
    "word": "别出心裁",
    "correct": true
  },
  {
    "word": "别出新裁",
    "correct": false,
    "right": "别出心裁"
  },
  {
    "word": "谈笑风生",
    "correct": true
  },
  {
    "word": "谈笑风声",
    "correct": false,
    "right": "谈笑风生"
  },
  {
    "word": "流光溢彩",
    "correct": true
  },
  {
    "word": "流光溢采",
    "correct": false,
    "right": "流光溢彩"
  },
  {
    "word": "呕心沥血",
    "correct": true
  },
  {
    "word": "沤心沥血",
    "correct": false,
    "right": "呕心沥血"
  },
  {
    "word": "大相径庭",
    "correct": true
  },
  {
    "word": "大相经庭",
    "correct": false,
    "right": "大相径庭"
  },
  {
    "word": "不省人事",
    "correct": true
  },
  {
    "word": "不醒人事",
    "correct": false,
    "right": "不省人事"
  },
  {
    "word": "艰苦朴素",
    "correct": true
  },
  {
    "word": "坚苦朴素",
    "correct": false,
    "right": "艰苦朴素"
  },
  {
    "word": "锐不可当",
    "correct": true
  },
  {
    "word": "锐不可挡",
    "correct": false,
    "right": "锐不可当"
  },
  {
    "word": "粗制滥造",
    "correct": true
  },
  {
    "word": "粗制烂造",
    "correct": false,
    "right": "粗制滥造"
  },
  {
    "word": "鞠躬尽瘁",
    "correct": true
  },
  {
    "word": "鞠躬尽粹",
    "correct": false,
    "right": "鞠躬尽瘁"
  },
  {
    "word": "神态安详",
    "correct": true
  },
  {
    "word": "神态安祥",
    "correct": false,
    "right": "神态安详"
  },
  {
    "word": "清冽可鉴",
    "correct": true
  },
  {
    "word": "清洌可鉴",
    "correct": false,
    "right": "清冽可鉴"
  },
  {
    "word": "墨守成规",
    "correct": true
  },
  {
    "word": "墨守陈规",
    "correct": false,
    "right": "墨守成规"
  },
  {
    "word": "张灯结彩",
    "correct": true
  },
  {
    "word": "张灯接彩",
    "correct": false,
    "right": "张灯结彩"
  },
  {
    "word": "抑扬顿挫",
    "correct": true
  },
  {
    "word": "仰扬顿挫",
    "correct": false,
    "right": "抑扬顿挫"
  },
  {
    "word": "甜言蜜语",
    "correct": true
  },
  {
    "word": "甜言密语",
    "correct": false,
    "right": "甜言蜜语"
  },
  {
    "word": "绿树成荫",
    "correct": true
  },
  {
    "word": "绿树成阴",
    "correct": false,
    "right": "绿树成荫"
  },
  {
    "word": "反映情况",
    "correct": true
  },
  {
    "word": "反应情况",
    "correct": false,
    "right": "反映情况"
  },
  {
    "word": "两全其美",
    "correct": true
  },
  {
    "word": "两全齐美",
    "correct": false,
    "right": "两全其美"
  },
  {
    "word": "打架斗殴",
    "correct": true
  },
  {
    "word": "打架斗欧",
    "correct": false,
    "right": "打架斗殴"
  },
  {
    "word": "不可思议",
    "correct": true
  },
  {
    "word": "不可思意",
    "correct": false,
    "right": "不可思议"
  },
  {
    "word": "鬼鬼祟祟",
    "correct": true
  },
  {
    "word": "鬼鬼崇崇",
    "correct": false,
    "right": "鬼鬼祟祟"
  },
  {
    "word": "抑扬钝挫",
    "correct": false,
    "right": "抑扬顿挫"
  },
  {
    "word": "不知所措",
    "correct": true
  },
  {
    "word": "不知所错",
    "correct": false,
    "right": "不知所措"
  },
  {
    "word": "改邪归正",
    "correct": true
  },
  {
    "word": "改斜归正",
    "correct": false,
    "right": "改邪归正"
  },
  {
    "word": "错落有致",
    "correct": true
  },
  {
    "word": "错落有志",
    "correct": false,
    "right": "错落有致"
  },
  {
    "word": "无精打采",
    "correct": true
  },
  {
    "word": "无精打彩",
    "correct": false,
    "right": "无精打采"
  },
  {
    "word": "杳无消息",
    "correct": true
  },
  {
    "word": "沓无消息",
    "correct": false,
    "right": "杳无消息"
  },
  {
    "word": "痛心疾首",
    "correct": true
  },
  {
    "word": "痛心疾手",
    "correct": false,
    "right": "痛心疾首"
  },
  {
    "word": "出类拔萃",
    "correct": true
  },
  {
    "word": "出类拔翠",
    "correct": false,
    "right": "出类拔萃"
  },
  {
    "word": "白璧微瑕",
    "correct": true
  },
  {
    "word": "白壁微瑕",
    "correct": false,
    "right": "白璧微瑕"
  },
  {
    "word": "卑躬屈膝",
    "correct": true
  },
  {
    "word": "卑躬曲膝",
    "correct": false,
    "right": "卑躬屈膝"
  },
  {
    "word": "互相推诿",
    "correct": true
  },
  {
    "word": "互相推委",
    "correct": false,
    "right": "互相推诿"
  },
  {
    "word": "关怀备至",
    "correct": true
  },
  {
    "word": "关怀倍至",
    "correct": false,
    "right": "关怀备至"
  },
  {
    "word": "如法炮制",
    "correct": true
  },
  {
    "word": "如法泡制",
    "correct": false,
    "right": "如法炮制"
  },
  {
    "word": "英雄辈出",
    "correct": true
  },
  {
    "word": "英雄倍出",
    "correct": false,
    "right": "英雄辈出"
  },
  {
    "word": "嘉宾满堂",
    "correct": true
  },
  {
    "word": "佳宾满堂",
    "correct": false,
    "right": "嘉宾满堂"
  },
  {
    "word": "乔装打扮",
    "correct": true
  },
  {
    "word": "巧装打扮",
    "correct": false,
    "right": "乔装打扮"
  },
  {
    "word": "一张一弛",
    "correct": true
  },
  {
    "word": "一张一驰",
    "correct": false,
    "right": "一张一弛"
  },
  {
    "word": "病入膏肓",
    "correct": true
  },
  {
    "word": "病入膏盲",
    "correct": false,
    "right": "病入膏肓"
  },
  {
    "word": "好高骛远",
    "correct": true
  },
  {
    "word": "好高鹜远",
    "correct": false,
    "right": "好高骛远"
  },
  {
    "word": "破釜沉舟",
    "correct": true
  },
  {
    "word": "破斧沉舟",
    "correct": false,
    "right": "破釜沉舟"
  },
  {
    "word": "迫不及待",
    "correct": true
  },
  {
    "word": "迫不急待",
    "correct": false,
    "right": "迫不及待"
  },
  {
    "word": "陈词滥调",
    "correct": true
  },
  {
    "word": "陈词烂调",
    "correct": false,
    "right": "陈词滥调"
  },
  {
    "word": "称心如意",
    "correct": true
  },
  {
    "word": "趁心如意",
    "correct": false,
    "right": "称心如意"
  },
  {
    "word": "语无伦次",
    "correct": true
  },
  {
    "word": "语无论次",
    "correct": false,
    "right": "语无伦次"
  },
  {
    "word": "相形见绌",
    "correct": true
  },
  {
    "word": "相形见拙",
    "correct": false,
    "right": "相形见绌"
  },
  {
    "word": "直截了当",
    "correct": true
  },
  {
    "word": "直接了当",
    "correct": false,
    "right": "直截了当"
  },
  {
    "word": "毛骨悚然",
    "correct": true
  },
  {
    "word": "毛骨耸然",
    "correct": false,
    "right": "毛骨悚然"
  },
  {
    "word": "名列前茅",
    "correct": true
  },
  {
    "word": "手屈一指",
    "correct": false,
    "right": "首屈一指"
  },
  {
    "word": "首屈一指",
    "correct": true
  },
  {
    "word": "丰功伟绩",
    "correct": true
  },
  {
    "word": "丰功伟迹",
    "correct": false,
    "right": "丰功伟绩"
  },
  {
    "word": "惨无人道",
    "correct": true
  },
  {
    "word": "残无人道",
    "correct": false,
    "right": "惨无人道"
  },
  {
    "word": "铤而走险",
    "correct": true
  },
  {
    "word": "挺而走险",
    "correct": false,
    "right": "铤而走险"
  },
  {
    "word": "徇私舞弊",
    "correct": true
  },
  {
    "word": "殉私舞弊",
    "correct": false,
    "right": "徇私舞弊"
  },
  {
    "word": "声色俱厉",
    "correct": true
  },
  {
    "word": "声色俱历",
    "correct": false,
    "right": "声色俱厉"
  },
  {
    "word": "天翻地覆",
    "correct": true
  },
  {
    "word": "天翻地复",
    "correct": false,
    "right": "天翻地覆"
  },
  {
    "word": "汗流浃背",
    "correct": true
  },
  {
    "word": "汗流夹背",
    "correct": false,
    "right": "汗流浃背"
  },
  {
    "word": "声名狼藉",
    "correct": true
  },
  {
    "word": "声名狼籍",
    "correct": false,
    "right": "声名狼藉"
  },
  {
    "word": "川流不息",
    "correct": true
  },
  {
    "word": "穿流不息",
    "correct": false,
    "right": "川流不息"
  },
  {
    "word": "一筹莫展",
    "correct": true
  },
  {
    "word": "一愁莫展",
    "correct": false,
    "right": "一筹莫展"
  },
  {
    "word": "异口同声",
    "correct": true
  },
  {
    "word": "一口同声",
    "correct": false,
    "right": "异口同声"
  },
  {
    "word": "因地制宜",
    "correct": true
  },
  {
    "word": "记忆犹新",
    "correct": true
  },
  {
    "word": "记忆尤新",
    "correct": false,
    "right": "记忆犹新"
  },
  {
    "word": "貌合神离",
    "correct": true
  },
  {
    "word": "貌和神离",
    "correct": false,
    "right": "貌合神离"
  },
  {
    "word": "珠联璧合",
    "correct": true
  },
  {
    "word": "珠连壁合",
    "correct": false,
    "right": "珠联璧合"
  },
  {
    "word": "原驰蜡象",
    "correct": true
  },
  {
    "word": "原驰腊象",
    "correct": false,
    "right": "原驰蜡象"
  },
  {
    "word": "挑拨离间",
    "correct": true
  },
  {
    "word": "挑拔离间",
    "correct": false,
    "right": "挑拨离间"
  },
  {
    "word": "雍容典雅",
    "correct": true
  },
  {
    "word": "雍荣典雅",
    "correct": false,
    "right": "雍容典雅"
  },
  {
    "word": "原形毕露",
    "correct": true
  },
  {
    "word": "原形必露",
    "correct": false,
    "right": "原形毕露"
  },
  {
    "word": "如火如荼",
    "correct": true
  },
  {
    "word": "如火如茶",
    "correct": false,
    "right": "如火如荼"
  },
  {
    "word": "不屑置辩",
    "correct": true
  },
  {
    "word": "不屑置辨",
    "correct": false,
    "right": "不屑置辩"
  },
  {
    "word": "披星戴月",
    "correct": true
  },
  {
    "word": "披星带月",
    "correct": false,
    "right": "披星戴月"
  },
  {
    "word": "漠不关心",
    "correct": true
  },
  {
    "word": "莫不关心",
    "correct": false,
    "right": "漠不关心"
  },
  {
    "word": "嗡 (wēng)",
    "correct": true
  },
  {
    "word": "朗润 (lǎng rùn)",
    "correct": true
  },
  {
    "word": "酝酿 (yùn niàng)",
    "correct": true
  },
  {
    "word": "抖擞 (dǒu sǒu)",
    "correct": true
  },
  {
    "word": "健壮 (jiàn zhuàng)",
    "correct": true
  },
  {
    "word": "呼朋引伴 (hū péng yǐn bàn)",
    "correct": true
  },
  {
    "word": "花枝招展 (huā zhī zhāo zhǎn)",
    "correct": true
  },
  {
    "word": "镶 (xiāng)",
    "correct": true
  },
  {
    "word": "单单 (dān dān)",
    "correct": true
  },
  {
    "word": "安适 (ān shì)",
    "correct": true
  },
  {
    "word": "着落 (zhuó luò)",
    "correct": true
  },
  {
    "word": "慈善 (cí shàn)",
    "correct": true
  },
  {
    "word": "肌肤 (jī fū)",
    "correct": true
  },
  {
    "word": "秀气 (xiù qì)",
    "correct": true
  },
  {
    "word": "宽敞 (kuān chǎng)",
    "correct": true
  },
  {
    "word": "贮蓄 (zhù xù)",
    "correct": true
  },
  {
    "word": "澄清 (chéng qīng)",
    "correct": true
  },
  {
    "word": "空灵 (kōng líng)",
    "correct": true
  },
  {
    "word": "地毯 (dì tǎn)",
    "correct": true
  },
  {
    "word": "蝉 (chán)",
    "correct": true
  },
  {
    "word": "花苞 (huā bāo)",
    "correct": true
  },
  {
    "word": "娇媚 (jiāo mèi)",
    "correct": true
  },
  {
    "word": "棱镜 (léng jìng)",
    "correct": true
  },
  {
    "word": "粗犷 (cū guǎng)",
    "correct": true
  },
  {
    "word": "睫毛 (jié máo)",
    "correct": true
  },
  {
    "word": "衣裳 (yī shang)",
    "correct": true
  },
  {
    "word": "铃铛 (líng dang)",
    "correct": true
  },
  {
    "word": "端庄 (duān zhuāng)",
    "correct": true
  },
  {
    "word": "静谧 (jìng mì)",
    "correct": true
  },
  {
    "word": "屋檐 (wū yán)",
    "correct": true
  },
  {
    "word": "凄冷 (qī lěng)",
    "correct": true
  },
  {
    "word": "化妆 (huà zhuāng)",
    "correct": true
  },
  {
    "word": "莅临 (lì lín)",
    "correct": true
  },
  {
    "word": "造访 (zào fǎng)",
    "correct": true
  },
  {
    "word": "干涩 (gān sè)",
    "correct": true
  },
  {
    "word": "草垛 (cǎo duò)",
    "correct": true
  },
  {
    "word": "绿茵茵 (lǜ yīn yīn)",
    "correct": true
  },
  {
    "word": "咄咄逼人 (duō duō bī rén)",
    "correct": true
  },
  {
    "word": "瘫痪 (tān huàn)",
    "correct": true
  },
  {
    "word": "暴怒 (bào nù)",
    "correct": true
  },
  {
    "word": "憔悴 (qiáo cuì)",
    "correct": true
  },
  {
    "word": "央求 (yāng qiú)",
    "correct": true
  },
  {
    "word": "絮叨 (xù dāo)",
    "correct": true
  },
  {
    "word": "诀别 (jué bié)",
    "correct": true
  },
  {
    "word": "淡雅 (dàn yǎ)",
    "correct": true
  },
  {
    "word": "高洁 (gāo jié)",
    "correct": true
  },
  {
    "word": "烂漫 (làn màn)",
    "correct": true
  },
  {
    "word": "翻来覆去 (fān lái fù qù)",
    "correct": true
  },
  {
    "word": "喜出望外 (xǐ chū wàng wài)",
    "correct": true
  },
  {
    "word": "信服 (xìn fú)",
    "correct": true
  },
  {
    "word": "分歧 (fēn qí)",
    "correct": true
  },
  {
    "word": "取决 (qǔ jué)",
    "correct": true
  },
  {
    "word": "一霎 (yī shà)",
    "correct": true
  },
  {
    "word": "两全 (liǎng quán)",
    "correct": true
  },
  {
    "word": "粼粼 (lín lín)",
    "correct": true
  },
  {
    "word": "各得其所 (gè dé qí suǒ)",
    "correct": true
  },
  {
    "word": "蒂 (dì)",
    "correct": true
  },
  {
    "word": "梗 (gěng)",
    "correct": true
  },
  {
    "word": "匿笑 (nì xiào)",
    "correct": true
  },
  {
    "word": "沐浴 (mù yù)",
    "correct": true
  },
  {
    "word": "祷告 (dǎo gào)",
    "correct": true
  },
  {
    "word": "姊妹 (zǐ mèi)",
    "correct": true
  },
  {
    "word": "亭亭 (tíng tíng)",
    "correct": true
  },
  {
    "word": "徘徊 (pái huái)",
    "correct": true
  },
  {
    "word": "遮蔽 (zhē bì)",
    "correct": true
  },
  {
    "word": "心绪 (xīn xù)",
    "correct": true
  },
  {
    "word": "流转 (liú zhuǎn)",
    "correct": true
  },
  {
    "word": "荫蔽 (yīn bì)",
    "correct": true
  },
  {
    "word": "抱头鼠窜 (cuàn)",
    "correct": true
  },
  {
    "word": "觅 (mì)",
    "correct": true
  },
  {
    "word": "跪 (guì)",
    "correct": true
  },
  {
    "word": "倘若 (tǎng ruò)",
    "correct": true
  },
  {
    "word": "鉴赏 (jiàn shǎng)",
    "correct": true
  },
  {
    "word": "啄食 (zhuó shí)",
    "correct": true
  },
  {
    "word": "和蔼 (hé ǎi)",
    "correct": true
  },
  {
    "word": "恭敬 (gōng jìng)",
    "correct": true
  },
  {
    "word": "质朴 (zhì pǔ)",
    "correct": true
  },
  {
    "word": "博学 (bó xué)",
    "correct": true
  },
  {
    "word": "渊博 (yuān bó)",
    "correct": true
  },
  {
    "word": "倜傥 (tì tǎng)",
    "correct": true
  },
  {
    "word": "淋漓 (lín lí)",
    "correct": true
  },
  {
    "word": "盔甲 (kuī jiǎ)",
    "correct": true
  },
  {
    "word": "绅士 (shēn shì)",
    "correct": true
  },
  {
    "word": "人迹罕至 (rén jì hǎn zhì)",
    "correct": true
  },
  {
    "word": "人声鼎沸 (rén shēng dǐng fèi)",
    "correct": true
  },
  {
    "word": "捡 (jiǎn)",
    "correct": true
  },
  {
    "word": "感慨 (gǎn kǎi)",
    "correct": true
  },
  {
    "word": "搓捻 (cuō niǎn)",
    "correct": true
  },
  {
    "word": "绽开 (zhàn kāi)",
    "correct": true
  },
  {
    "word": "争执 (zhēng zhí)",
    "correct": true
  },
  {
    "word": "惭愧 (cán kuì)",
    "correct": true
  },
  {
    "word": "悔恨 (huǐ hèn)",
    "correct": true
  },
  {
    "word": "激荡 (jī dàng)",
    "correct": true
  },
  {
    "word": "奥秘 (ào mì)",
    "correct": true
  },
  {
    "word": "拼凑 (pīn còu)",
    "correct": true
  },
  {
    "word": "企盼 (qǐ pàn)",
    "correct": true
  },
  {
    "word": "截然不同 (jié rán bù tóng)",
    "correct": true
  },
  {
    "word": "疲倦不堪 (pí juàn bù kān)",
    "correct": true
  },
  {
    "word": "小心翼翼 (xiǎo xīn yì yì)",
    "correct": true
  },
  {
    "word": "不求甚解 (bù qiú shèn jiě)",
    "correct": true
  },
  {
    "word": "混为一谈 (hùn wéi yī tán)",
    "correct": true
  },
  {
    "word": "恍然大悟 (huǎng rán dà wù)",
    "correct": true
  },
  {
    "word": "油然而生 (yóu rán ér shēng)",
    "correct": true
  },
  {
    "word": "花团锦簇 (huā tuán jǐn cù)",
    "correct": true
  },
  {
    "word": "美不胜收 (měi bù shèng shōu)",
    "correct": true
  },
  {
    "word": "冀 (jì)",
    "correct": true
  },
  {
    "word": "派遣 (pài qiǎn)",
    "correct": true
  },
  {
    "word": "殉职 (xùn zhí)",
    "correct": true
  },
  {
    "word": "动机 (dòng jī)",
    "correct": true
  },
  {
    "word": "狭隘 (xiá ài)",
    "correct": true
  },
  {
    "word": "极端 (jí duān)",
    "correct": true
  },
  {
    "word": "热忱 (rè chén)",
    "correct": true
  },
  {
    "word": "冷清 (lěng qīng)",
    "correct": true
  },
  {
    "word": "纯粹 (chún cuì)",
    "correct": true
  },
  {
    "word": "佩服 (pèi fú)",
    "correct": true
  },
  {
    "word": "高明 (gāo míng)",
    "correct": true
  },
  {
    "word": "鄙薄 (bǐ bó)",
    "correct": true
  },
  {
    "word": "拈轻怕重 (niān qīng pà zhòng)",
    "correct": true
  },
  {
    "word": "漠不关心 (mò bù guān xīn)",
    "correct": true
  },
  {
    "word": "麻木不仁 (má mù bù rén)",
    "correct": true
  },
  {
    "word": "精益求精 (jīng yì qiú jīng)",
    "correct": true
  },
  {
    "word": "见异思迁 (jiàn yì sī qiān)",
    "correct": true
  },
  {
    "word": "栋 (dòng)",
    "correct": true
  },
  {
    "word": "拣 (jiǎn)",
    "correct": true
  },
  {
    "word": "戳 (chuō)",
    "correct": true
  },
  {
    "word": "慷慨 (kāng kǎi)",
    "correct": true
  },
  {
    "word": "帐篷 (zhàng péng)",
    "correct": true
  },
  {
    "word": "废墟 (fèi xū)",
    "correct": true
  },
  {
    "word": "坍塌 (tān tā)",
    "correct": true
  },
  {
    "word": "呼啸 (hū xiào)",
    "correct": true
  },
  {
    "word": "滚烫 (gǔn tàng)",
    "correct": true
  },
  {
    "word": "张扬 (zhāng yáng)",
    "correct": true
  },
  {
    "word": "溜达 (liū dá)",
    "correct": true
  },
  {
    "word": "琢磨 (zuó mo)",
    "correct": true
  },
  {
    "word": "酬劳 (chóu láo)",
    "correct": true
  },
  {
    "word": "硬朗 (yìng lǎng)",
    "correct": true
  },
  {
    "word": "水渠 (shuǐ qú)",
    "correct": true
  },
  {
    "word": "流淌 (liú tǎng)",
    "correct": true
  },
  {
    "word": "光秃秃 (guāng tū tū)",
    "correct": true
  },
  {
    "word": "不毛之地 (bù máo zhī dì)",
    "correct": true
  },
  {
    "word": "刨根问底 (páo gēn wèn dǐ)",
    "correct": true
  },
  {
    "word": "沉默寡言 (chén mò guǎ yán)",
    "correct": true
  },
  {
    "word": "灼 (zhuó)",
    "correct": true
  },
  {
    "word": "趴 (pā)",
    "correct": true
  },
  {
    "word": "酷热 (kù rè)",
    "correct": true
  },
  {
    "word": "厌倦 (yàn juàn)",
    "correct": true
  },
  {
    "word": "附和 (fù hè)",
    "correct": true
  },
  {
    "word": "突兀 (tū wù)",
    "correct": true
  },
  {
    "word": "怦怦 (pēng pēng)",
    "correct": true
  },
  {
    "word": "哭泣 (kū qì)",
    "correct": true
  },
  {
    "word": "呻吟 (shēn yín)",
    "correct": true
  },
  {
    "word": "恍惚 (huǎng hū)",
    "correct": true
  },
  {
    "word": "暮色 (mù sè)",
    "correct": true
  },
  {
    "word": "安慰 (ān wèi)",
    "correct": true
  },
  {
    "word": "凌乱 (líng luàn)",
    "correct": true
  },
  {
    "word": "惊讶 (jīng yà)",
    "correct": true
  },
  {
    "word": "畏惧 (wèi jù)",
    "correct": true
  },
  {
    "word": "参差不齐 (cēn cī bù qí)",
    "correct": true
  },
  {
    "word": "哄堂大笑 (hōng táng dà xiào)",
    "correct": true
  },
  {
    "word": "惊慌失措 (jīng huāng shī cuò)",
    "correct": true
  },
  {
    "word": "缕 (lǚ)",
    "correct": true
  },
  {
    "word": "倚 (yǐ)",
    "correct": true
  },
  {
    "word": "妄 (wàng)",
    "correct": true
  },
  {
    "word": "消耗 (xiāo hào)",
    "correct": true
  },
  {
    "word": "忧郁 (yōu yù)",
    "correct": true
  },
  {
    "word": "懒惰 (lǎn duò)",
    "correct": true
  },
  {
    "word": "安详 (ān xiáng)",
    "correct": true
  },
  {
    "word": "乞丐 (qǐ gài)",
    "correct": true
  },
  {
    "word": "预警 (yù jǐng)",
    "correct": true
  },
  {
    "word": "怅然 (chàng rán)",
    "correct": true
  },
  {
    "word": "蜷伏 (quán fú)",
    "correct": true
  },
  {
    "word": "叮嘱 (dīng zhǔ)",
    "correct": true
  },
  {
    "word": "惩戒 (chéng jiè)",
    "correct": true
  },
  {
    "word": "悲楚 (bēi chǔ)",
    "correct": true
  },
  {
    "word": "断语 (duàn yǔ)",
    "correct": true
  },
  {
    "word": "冤枉 (yuān wang)",
    "correct": true
  },
  {
    "word": "虐待 (nüè dài)",
    "correct": true
  },
  {
    "word": "芙蓉鸟 (fú róng niǎo)",
    "correct": true
  },
  {
    "word": "畏罪潜逃 (wèi zuì qián táo)",
    "correct": true
  },
  {
    "word": "敛 (liǎn)",
    "correct": true
  },
  {
    "word": "哺乳 (bǔ rǔ)",
    "correct": true
  },
  {
    "word": "羞怯 (xiū qiè)",
    "correct": true
  },
  {
    "word": "写照 (xiě zhào)",
    "correct": true
  },
  {
    "word": "匍匐 (pú fú)",
    "correct": true
  },
  {
    "word": "原委 (yuán wěi)",
    "correct": true
  },
  {
    "word": "鹦鹉 (yīng wǔ)",
    "correct": true
  },
  {
    "word": "温驯 (wēn xùn)",
    "correct": true
  },
  {
    "word": "禁锢 (jìn gù)",
    "correct": true
  },
  {
    "word": "滑翔 (huá xiáng)",
    "correct": true
  },
  {
    "word": "余晖 (yú huī)",
    "correct": true
  },
  {
    "word": "俯冲 (fǔ chōng)",
    "correct": true
  },
  {
    "word": "柠檬 (níng méng)",
    "correct": true
  },
  {
    "word": "怪诞不经 (guài dàn bù jīng)",
    "correct": true
  },
  {
    "word": "大相径庭 (dà xiāng jìng tíng)",
    "correct": true
  },
  {
    "word": "神采奕奕 (shén cǎi yì yì)",
    "correct": true
  },
  {
    "word": "赐 (cì)",
    "correct": true
  },
  {
    "word": "聘 (pìn)",
    "correct": true
  },
  {
    "word": "炫耀 (xuàn yào)",
    "correct": true
  },
  {
    "word": "称职 (chèn zhí)",
    "correct": true
  },
  {
    "word": "愚蠢 (yú chǔn)",
    "correct": true
  },
  {
    "word": "现款 (xiàn kuǎn)",
    "correct": true
  },
  {
    "word": "妥当 (tuǒ dàng)",
    "correct": true
  },
  {
    "word": "理智 (lǐ zhì)",
    "correct": true
  },
  {
    "word": "呈报 (chéng bào)",
    "correct": true
  },
  {
    "word": "钦差 (qīn chāi)",
    "correct": true
  },
  {
    "word": "滑稽 (huá jī)",
    "correct": true
  },
  {
    "word": "圈定 (quān dìng)",
    "correct": true
  },
  {
    "word": "陛下 (bì xià)",
    "correct": true
  },
  {
    "word": "爵士 (jué shì)",
    "correct": true
  },
  {
    "word": "头衔 (tóu xián)",
    "correct": true
  },
  {
    "word": "勋章 (xūn zhāng)",
    "correct": true
  },
  {
    "word": "袍子 (páo zǐ)",
    "correct": true
  },
  {
    "word": "不可救药 (bù kě jiù yào)",
    "correct": true
  },
  {
    "word": "骇人听闻 (hài rén tīng wén)",
    "correct": true
  },
  {
    "word": "随声附和 (suí shēng fù hè)",
    "correct": true
  },
  {
    "word": "缥缈 (piāo miǎo)",
    "correct": true
  },
  {
    "word": "定然 (dìng rán)",
    "correct": true
  },
  {
    "word": "陈列 (chén liè)",
    "correct": true
  },
  {
    "word": "闲游 (xián yóu)",
    "correct": true
  },
  {
    "word": "荒凉 (huāng liáng)",
    "correct": true
  },
  {
    "word": "寂寞 (jì mò)",
    "correct": true
  },
  {
    "word": "莽莽 (mǎng mǎng)",
    "correct": true
  },
  {
    "word": "蓬勃 (péng bó)",
    "correct": true
  },
  {
    "word": "澄澈 (chéng chè)",
    "correct": true
  },
  {
    "word": "掺和 (chān huo)",
    "correct": true
  },
  {
    "word": "非凡 (fēi fán)",
    "correct": true
  },
  {
    "word": "气概 (qì gài)",
    "correct": true
  },
  {
    "word": "灵敏 (líng mǐn)",
    "correct": true
  },
  {
    "word": "泥潭 (ní tán)",
    "correct": true
  },
  {
    "word": "绵延 (mián yán)",
    "correct": true
  },
  {
    "word": "神通广大 (shén tōng guǎng dà)",
    "correct": true
  },
  {
    "word": "灵机一动 (líng jī yī dòng)",
    "correct": true
  },
  {
    "word": "雕像 (diāo xiàng)",
    "correct": true
  },
  {
    "word": "庇护 (bì hù)",
    "correct": true
  },
  {
    "word": "爱慕 (ài mù)",
    "correct": true
  },
  {
    "word": "虚荣 (xū róng)",
    "correct": true
  },
  {
    "word": "较量 (jiào liàng)",
    "correct": true
  },
  {
    "word": "凯歌 (kǎi gē)",
    "correct": true
  },
  {
    "word": "杞人忧天 (qǐ rén yōu tiān)",
    "correct": true
  },
  {
    "word": "人不知而不愠",
    "correct": true
  },
  {
    "word": "人不知而不温",
    "correct": false,
    "right": "人不知而不愠"
  },
  {
    "word": "温故而知新",
    "correct": true
  },
  {
    "word": "温故而知心",
    "correct": false,
    "right": "温故而知新"
  },
  {
    "word": "随君直到夜郎西",
    "correct": true
  },
  {
    "word": "随君直到夜朗西",
    "correct": false,
    "right": "随君直到夜郎西"
  },
  {
    "word": "随君直到夜郎溪",
    "correct": false,
    "right": "随君直到夜郎西"
  },
  {
    "word": "逝者如斯夫",
    "correct": true
  }
];

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
