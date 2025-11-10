// 啄木鸟 · 字词学习版
// 玩法：点击字词 -> 啄木鸟飞向该词 -> 吞食后判断
// 正确：加分、体型增大；错误：扣分、体型减小；错误占比约 5%

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

// UI
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const speedEl = document.getElementById('speed');
const correctEl = document.getElementById('correct');
const wrongEl = document.getElementById('wrong');
const progressEl = document.getElementById('progress');
const wrongRateEl = document.getElementById('wrongRate');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const overlay = document.getElementById('overlay');
const overlayStart = document.getElementById('overlayStart');
const overlayTitle = document.getElementById('overlayTitle');
const overlayTip = document.getElementById('overlayTip');
const toast = document.getElementById('toast');
const bgMusic = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicBtn');

// 音乐状态
let musicEnabled = true;

// 等级：移动速度（像素/帧）、出词间隔(ms)、最大并发词数
const LEVELS = [
	{ name: '慢',   birdSpeed: 4,  spawnMs: 1400, maxItems: 3 },
	{ name: '中',   birdSpeed: 5.5,spawnMs: 1200, maxItems: 4 },
	{ name: '快',   birdSpeed: 7,  spawnMs: 1000, maxItems: 5 },
	{ name: '很快', birdSpeed: 8.5,spawnMs: 850,  maxItems: 6 },
	{ name: '极快', birdSpeed: 10, spawnMs: 750,  maxItems: 7 }
];

const STATE = {
	running: false,
	paused: false,
	score: 0,
	level: 1,
	correct: 0,
	wrong: 0,
	probWrong: 0.10,
	correctCounter: 0 // 用于追踪连续正确词数量
};

// 啄木鸟（圆形+三角喙的简化造型）
const bird = {
	x: 120,
	y: canvas.height - 120,
	target: null, // {x,y,index}
	size: 16, // 半径，随正确/错误变化
	color: '#e11d48',
	// 自由飞行相关
	idleMode: false, // 空闲模式
	vx: 0, // x方向速度
	vy: 0, // y方向速度
	nextIdleTarget: null, // 下一个随机目标点
	idleTimer: 0 // 空闲计时器
};

let items = []; // {x,y,text,correct,right, w,h, ttl}
let spawnTimer; let animationId;

function resetGame() {
	STATE.running = false; STATE.paused = false;
	STATE.score = 0; STATE.level = 1; STATE.correct = 0; STATE.wrong = 0; STATE.correctCounter = 0;
	items = [];
	bird.x = 120; bird.y = canvas.height - 120; bird.size = 16; bird.target = null;
	bird.idleMode = false; bird.idleTimer = 0; bird.nextIdleTarget = null; // 重置空闲状态
	
	// 停止背景音乐
	if (bgMusic) {
		bgMusic.pause();
		bgMusic.currentTime = 0;
	}
	
	updateUI();
	overlay.classList.remove('hidden');
	overlayTitle.textContent = '点击开始';
	overlayTip.textContent = '点击字词，大嘴鸟飞去吞食：正确变强、错误变弱（每9个正确词必出1个错误词）';
	draw();
}

function updateUI() {
	scoreEl.textContent = STATE.score;
	levelEl.textContent = STATE.level;
	speedEl.textContent = LEVELS[STATE.level - 1].name;
	correctEl.textContent = STATE.correct;
	wrongEl.textContent = STATE.wrong;
	const need = 15; const cur = STATE.correct % need;
	progressEl && (progressEl.textContent = `${cur}/15`);
	wrongRateEl && (wrongRateEl.textContent = `${Math.round(STATE.probWrong*100)}%`);
}

// 背景装饰元素
const clouds = [
	{ x: 150, y: 80, size: 60, speed: 0.3 },
	{ x: 450, y: 120, size: 80, speed: 0.25 },
	{ x: 750, y: 60, size: 70, speed: 0.35 },
	{ x: 200, y: 150, size: 50, speed: 0.2 },
	{ x: 600, y: 100, size: 65, speed: 0.3 }
];

// 树木数据（x位置、摆动角度、生长进度）
const trees = [
	{ x: 100, swayAngle: 0, targetSway: 0, growthStage: 0 },
	{ x: 700, swayAngle: 0, targetSway: 0, growthStage: 0 },
	{ x: 850, swayAngle: 0, targetSway: 0, growthStage: 0 }
];

let sunAngle = 0;
let lastClickX = canvas.width / 2; // 记录上次点击位置
const particles = []; // {x, y, vx, vy, life, color, size}
const floatingTexts = []; // {x, y, text, color, life, scale}
const errorPrompt = { active: false, wrongWord: '', rightWord: '', x: 0, y: 0, scale: 0, timer: 0 }; // 错误提示

function drawBackground() {
	// 天空渐变
	const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height - 120);
	skyGrad.addColorStop(0, '#87ceeb');
	skyGrad.addColorStop(1, '#e6f2ff');
	ctx.fillStyle = skyGrad;
	ctx.fillRect(0, 0, canvas.width, canvas.height - 120);
	
	// 太阳（人格化）
	sunAngle += 0.01;
	const sunX = canvas.width - 120;
	const sunY = 100;
	const sunSize = 40;
	
	// 太阳光晕（脉冲效果）
	const pulseSize = sunSize * (1.4 + Math.sin(sunAngle * 2) * 0.1);
	ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
	ctx.beginPath();
	ctx.arc(sunX, sunY, pulseSize, 0, Math.PI * 2);
	ctx.fill();
	
	// 太阳光芒
	ctx.strokeStyle = '#ffd700';
	ctx.lineWidth = 3;
	for (let i = 0; i < 12; i++) {
		const angle = (i / 12) * Math.PI * 2 + sunAngle;
		const rayLength = sunSize + 15 + Math.sin(sunAngle * 3 + i) * 5;
		ctx.beginPath();
		ctx.moveTo(sunX + Math.cos(angle) * sunSize, sunY + Math.sin(angle) * sunSize);
		ctx.lineTo(sunX + Math.cos(angle) * rayLength, sunY + Math.sin(angle) * rayLength);
		ctx.stroke();
	}
	
	// 太阳身体
	ctx.fillStyle = '#ffd700';
	ctx.beginPath();
	ctx.arc(sunX, sunY, sunSize, 0, Math.PI * 2);
	ctx.fill();
	
	// 太阳眼睛（开心的眯眯眼）
	ctx.fillStyle = '#333';
	ctx.lineWidth = 3;
	// 左眼
	ctx.beginPath();
	ctx.arc(sunX - 12, sunY - 8, 2, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(sunX - 12, sunY - 8, 8, 0.2, Math.PI - 0.2);
	ctx.stroke();
	// 右眼
	ctx.beginPath();
	ctx.arc(sunX + 12, sunY - 8, 2, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(sunX + 12, sunY - 8, 8, 0.2, Math.PI - 0.2);
	ctx.stroke();
	
	// 太阳嘴巴（大大的笑容）
	ctx.strokeStyle = '#ff6b6b';
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.arc(sunX, sunY + 5, 20, 0.3, Math.PI - 0.3);
	ctx.stroke();
	
	// 太阳脸颊（红晕）
	ctx.fillStyle = 'rgba(255, 150, 150, 0.4)';
	ctx.beginPath();
	ctx.arc(sunX - 25, sunY + 8, 8, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(sunX + 25, sunY + 8, 8, 0, Math.PI * 2);
	ctx.fill();
	
	// 云朵（动态）
	for (const cloud of clouds) {
		cloud.x += cloud.speed;
		if (cloud.x > canvas.width + 100) cloud.x = -100;
		drawCloud(cloud.x, cloud.y, cloud.size);
	}
	
	// 远山
	ctx.fillStyle = '#a5c4f4';
	ctx.beginPath();
	ctx.moveTo(0, canvas.height - 120);
	ctx.lineTo(160, canvas.height - 220);
	ctx.lineTo(320, canvas.height - 120);
	ctx.closePath();
	ctx.fill();
	ctx.beginPath();
	ctx.moveTo(280, canvas.height - 120);
	ctx.lineTo(520, canvas.height - 260);
	ctx.lineTo(760, canvas.height - 120);
	ctx.closePath();
	ctx.fill();
	
	// 地面
	const groundGrad = ctx.createLinearGradient(0, canvas.height - 120, 0, canvas.height);
	groundGrad.addColorStop(0, '#90ee90');
	groundGrad.addColorStop(1, '#7cb342');
	ctx.fillStyle = groundGrad;
	ctx.fillRect(0, canvas.height - 120, canvas.width, 120);
	
	// 更新树木摆动
	for (const tree of trees) {
		// 平滑过渡到目标摆动角度
		tree.swayAngle += (tree.targetSway - tree.swayAngle) * 0.1;
		// 自然衰减
		tree.targetSway *= 0.95;
		// 根据等级更新生长阶段
		tree.growthStage = STATE.level;
	}
	
	// 绘制树木
	for (const tree of trees) {
		drawTree(tree, canvas.height - 120);
	}
	
	// 地面装饰（小草）
	ctx.fillStyle = '#66bb6a';
	for (let i = 0; i < 20; i++) {
		const x = (i * 50) % canvas.width;
		const y = canvas.height - 120 + Math.sin(i) * 5;
		ctx.fillRect(x, y, 2, 8);
	}
	
	// 可爱的草地装饰
	drawGroundDecorations();
}

// 绘制草地装饰（乌龟、小兔子、蘑菇、小花等）
function drawGroundDecorations() {
	const groundY = canvas.height - 120;
	
	// 乌龟（左边，向右爬行）
	drawTurtle(150, groundY, 0.8);
	
	// 小兔子（右边，面向左）
	drawRabbit(canvas.width - 180, groundY - 5, 0.7, true);
	
	// 蘑菇
	drawMushroom(280, groundY, '#ff6b6b', 12);
	drawMushroom(450, groundY, '#ffeb3b', 10);
	drawMushroom(750, groundY, '#ff6b6b', 14);
	
	// 小花
	drawFlower(320, groundY - 5, '#ff69b4', 8);
	drawFlower(520, groundY - 5, '#9c27b0', 7);
	drawFlower(680, groundY - 5, '#ff6b6b', 9);
	drawFlower(850, groundY - 5, '#ffa726', 8);
}

// 绘制乌龟（向右爬行）
function drawTurtle(x, y, scale = 1) {
	ctx.save();
	ctx.translate(x, y);
	ctx.scale(scale, scale);
	
	// 乌龟壳（椭圆形，绿色）
	ctx.fillStyle = '#4caf50';
	ctx.beginPath();
	ctx.ellipse(0, 0, 20, 15, 0, 0, Math.PI * 2);
	ctx.fill();
	
	// 乌龟壳纹理（六边形图案）
	ctx.strokeStyle = '#2e7d32';
	ctx.lineWidth = 1.5;
	// 中央六边形
	ctx.beginPath();
	for (let i = 0; i < 6; i++) {
		const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
		const px = Math.cos(angle) * 8;
		const py = Math.sin(angle) * 8;
		if (i === 0) ctx.moveTo(px, py);
		else ctx.lineTo(px, py);
	}
	ctx.closePath();
	ctx.stroke();
	
	// 周围小六边形
	const hexPositions = [
		[-12, -8], [12, -8], [-12, 8], [12, 8], [0, -12], [0, 12]
	];
	for (const [hx, hy] of hexPositions) {
		ctx.beginPath();
		for (let i = 0; i < 6; i++) {
			const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
			const px = hx + Math.cos(angle) * 4;
			const py = hy + Math.sin(angle) * 4;
			if (i === 0) ctx.moveTo(px, py);
			else ctx.lineTo(px, py);
		}
		ctx.closePath();
		ctx.stroke();
	}
	
	// 乌龟脖子（向右延伸，长脖子）
	ctx.fillStyle = '#66bb6a';
	ctx.beginPath();
	ctx.ellipse(18, -2, 12, 5, 0, 0, Math.PI * 2);
	ctx.fill();
	
	// 乌龟头部（向右，在脖子末端）
	ctx.beginPath();
	ctx.ellipse(28, -3, 8, 6, 0, 0, Math.PI * 2);
	ctx.fill();
	
	// 乌龟眼睛（右眼）
	ctx.fillStyle = '#212121';
	ctx.beginPath();
	ctx.arc(32, -4, 2, 0, Math.PI * 2);
	ctx.fill();
	ctx.fillStyle = '#fff';
	ctx.beginPath();
	ctx.arc(32.5, -4.5, 0.8, 0, Math.PI * 2);
	ctx.fill();
	
	// 乌龟嘴巴（向右）
	ctx.strokeStyle = '#212121';
	ctx.lineWidth = 1.5;
	ctx.beginPath();
	ctx.moveTo(35, -3);
	ctx.lineTo(37, -2);
	ctx.stroke();
	
	// 乌龟前腿（右前腿）
	ctx.fillStyle = '#66bb6a';
	ctx.beginPath();
	ctx.ellipse(15, 8, 5, 8, 0.3, 0, Math.PI * 2);
	ctx.fill();
	// 左前腿
	ctx.beginPath();
	ctx.ellipse(5, 8, 5, 8, -0.3, 0, Math.PI * 2);
	ctx.fill();
	
	// 乌龟后腿（右后腿）
	ctx.beginPath();
	ctx.ellipse(10, 12, 5, 7, 0.2, 0, Math.PI * 2);
	ctx.fill();
	// 左后腿
	ctx.beginPath();
	ctx.ellipse(-10, 12, 5, 7, -0.2, 0, Math.PI * 2);
	ctx.fill();
	
	// 乌龟尾巴（向右后方）
	ctx.fillStyle = '#2e7d32';
	ctx.beginPath();
	ctx.moveTo(-18, 5);
	ctx.lineTo(-22, 8);
	ctx.lineTo(-20, 10);
	ctx.closePath();
	ctx.fill();
	
	// 乌龟壳边缘高光
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.ellipse(0, -12, 18, 12, 0, 0, Math.PI * 2);
	ctx.stroke();
	
	ctx.restore();
}

// 绘制小兔子
function drawRabbit(x, y, scale = 1, faceLeft = false) {
	ctx.save();
	ctx.translate(x, y);
	if (faceLeft) ctx.scale(-1, 1);
	ctx.scale(scale, scale);
	
	// 身体
	ctx.fillStyle = '#f5f5f5';
	ctx.beginPath();
	ctx.ellipse(0, 0, 18, 22, 0, 0, Math.PI * 2);
	ctx.fill();
	
	// 头部
	ctx.beginPath();
	ctx.arc(0, -25, 15, 0, Math.PI * 2);
	ctx.fill();
	
	// 长耳朵
	ctx.fillStyle = '#ffe0e0';
	ctx.beginPath();
	ctx.ellipse(-8, -38, 4, 12, -0.2, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.ellipse(8, -38, 4, 12, 0.2, 0, Math.PI * 2);
	ctx.fill();
	
	// 外耳轮廓
	ctx.strokeStyle = '#f5f5f5';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.ellipse(-8, -38, 4, 12, -0.2, 0, Math.PI * 2);
	ctx.stroke();
	ctx.beginPath();
	ctx.ellipse(8, -38, 4, 12, 0.2, 0, Math.PI * 2);
	ctx.stroke();
	
	// 眼睛
	ctx.fillStyle = '#333';
	ctx.beginPath();
	ctx.arc(-5, -27, 2, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(5, -27, 2, 0, Math.PI * 2);
	ctx.fill();
	
	// 鼻子
	ctx.fillStyle = '#ff69b4';
	ctx.beginPath();
	ctx.arc(0, -22, 2, 0, Math.PI * 2);
	ctx.fill();
	
	// 嘴巴（可爱的Y形）
	ctx.strokeStyle = '#333';
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(0, -22);
	ctx.lineTo(0, -18);
	ctx.moveTo(0, -18);
	ctx.lineTo(-3, -16);
	ctx.moveTo(0, -18);
	ctx.lineTo(3, -16);
	ctx.stroke();
	
	// 前腿
	ctx.fillStyle = '#f5f5f5';
	ctx.beginPath();
	ctx.ellipse(-8, 15, 4, 10, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.ellipse(8, 15, 4, 10, 0, 0, Math.PI * 2);
	ctx.fill();
	
	// 尾巴（小绒球）
	ctx.beginPath();
	ctx.arc(-15, 5, 6, 0, Math.PI * 2);
	ctx.fill();
	
	ctx.restore();
}

// 绘制蘑菇
function drawMushroom(x, y, color, size) {
	ctx.save();
	// 蘑菇杆
	ctx.fillStyle = '#f5f5dc';
	ctx.fillRect(x - size/3, y - size, size * 0.66, size);
	
	// 蘑菇帽
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.ellipse(x, y - size, size, size * 0.6, 0, Math.PI, 0, true);
	ctx.fill();
	
	// 蘑菇斑点
	ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
	for (let i = 0; i < 3; i++) {
		const angle = (i / 3) * Math.PI - Math.PI / 2;
		const px = x + Math.cos(angle) * size * 0.5;
		const py = y - size - Math.sin(angle) * size * 0.3;
		ctx.beginPath();
		ctx.arc(px, py, size * 0.15, 0, Math.PI * 2);
		ctx.fill();
	}
	ctx.restore();
}

// 绘制小花
function drawFlower(x, y, color, size) {
	ctx.save();
	// 花茎
	ctx.strokeStyle = '#4caf50';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(x, y - size * 1.5);
	ctx.stroke();
	
	// 花瓣（5瓣）
	ctx.fillStyle = color;
	for (let i = 0; i < 5; i++) {
		const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
		const px = x + Math.cos(angle) * size * 0.6;
		const py = y - size * 1.5 + Math.sin(angle) * size * 0.6;
		ctx.beginPath();
		ctx.arc(px, py, size * 0.4, 0, Math.PI * 2);
		ctx.fill();
	}
	
	// 花心
	ctx.fillStyle = '#ffeb3b';
	ctx.beginPath();
	ctx.arc(x, y - size * 1.5, size * 0.3, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
}

function drawCloud(x, y, size) {
	// 云朵身体
	ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
	ctx.beginPath();
	ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
	ctx.arc(x + size * 0.5, y, size * 0.7, 0, Math.PI * 2);
	ctx.arc(x + size, y, size * 0.6, 0, Math.PI * 2);
	ctx.arc(x + size * 0.3, y - size * 0.3, size * 0.5, 0, Math.PI * 2);
	ctx.arc(x + size * 0.7, y - size * 0.3, size * 0.5, 0, Math.PI * 2);
	ctx.fill();
	
	// 云朵眼睛（可爱的圆眼睛）
	ctx.fillStyle = '#333';
	ctx.beginPath();
	ctx.arc(x + size * 0.35, y - size * 0.1, size * 0.08, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(x + size * 0.65, y - size * 0.1, size * 0.08, 0, Math.PI * 2);
	ctx.fill();
	
	// 眼睛高光（让眼睛更有神）
	ctx.fillStyle = '#fff';
	ctx.beginPath();
	ctx.arc(x + size * 0.35 - 2, y - size * 0.1 - 2, size * 0.03, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(x + size * 0.65 - 2, y - size * 0.1 - 2, size * 0.03, 0, Math.PI * 2);
	ctx.fill();
	
	// 云朵嘴巴（甜美的微笑）
	ctx.strokeStyle = '#ff9999';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.arc(x + size * 0.5, y + size * 0.1, size * 0.25, 0.2, Math.PI - 0.2);
	ctx.stroke();
	
	// 云朵脸颊（粉色腮红）
	ctx.fillStyle = 'rgba(255, 182, 193, 0.4)';
	ctx.beginPath();
	ctx.arc(x + size * 0.15, y + size * 0.05, size * 0.12, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(x + size * 0.85, y + size * 0.05, size * 0.12, 0, Math.PI * 2);
	ctx.fill();
}

function drawTree(tree, groundY) {
	const x = tree.x;
	const swayAngle = tree.swayAngle;
	const stage = tree.growthStage || 1;
	
	// 基础高度随等级增长
	const baseHeight = 40 + (stage - 1) * 8; // 每级增加8像素
	const trunkWidth = 16;
	const crownSize = 35 + (stage - 1) * 5; // 树冠也随等级增大
	
	ctx.save();
	ctx.translate(x, groundY);
	
	// 应用摆动效果（从树根开始旋转）
	ctx.rotate(swayAngle);
	
	// 树干（渐变色，更立体）
	const trunkGrad = ctx.createLinearGradient(-trunkWidth/2, -baseHeight, trunkWidth/2, 0);
	trunkGrad.addColorStop(0, '#a0522d');
	trunkGrad.addColorStop(0.5, '#8b4513');
	trunkGrad.addColorStop(1, '#6b3410');
	ctx.fillStyle = trunkGrad;
	ctx.fillRect(-trunkWidth/2, -baseHeight, trunkWidth, baseHeight);
	
	// 树干纹理（木纹）
	ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)';
	ctx.lineWidth = 2;
	for (let i = 0; i < 3; i++) {
		const yPos = -baseHeight + (i + 1) * (baseHeight / 4);
		ctx.beginPath();
		ctx.moveTo(-trunkWidth/2 + 2, yPos);
		ctx.lineTo(trunkWidth/2 - 2, yPos);
		ctx.stroke();
	}
	
	// 树冠（多层，更丰富）
	const crownY = -baseHeight - 10;
	
	// 深绿色底层（阴影）
	ctx.fillStyle = '#1a6b1a';
	ctx.beginPath();
	ctx.arc(0, crownY, crownSize * 1.1, 0, Math.PI * 2);
	ctx.fill();
	
	// 主树冠（中央）
	const crownGrad = ctx.createRadialGradient(0, crownY - 10, 0, 0, crownY, crownSize);
	crownGrad.addColorStop(0, '#90ee90');
	crownGrad.addColorStop(0.5, '#32cd32');
	crownGrad.addColorStop(1, '#228b22');
	ctx.fillStyle = crownGrad;
	ctx.beginPath();
	ctx.arc(0, crownY, crownSize, 0, Math.PI * 2);
	ctx.fill();
	
	// 左侧树冠
	ctx.fillStyle = '#2e8b57';
	ctx.beginPath();
	ctx.arc(-crownSize * 0.4, crownY - crownSize * 0.3, crownSize * 0.7, 0, Math.PI * 2);
	ctx.fill();
	
	// 右侧树冠
	ctx.beginPath();
	ctx.arc(crownSize * 0.4, crownY - crownSize * 0.3, crownSize * 0.7, 0, Math.PI * 2);
	ctx.fill();
	
	// 树冠高光（让树更立体）
	ctx.fillStyle = 'rgba(144, 238, 144, 0.4)';
	ctx.beginPath();
	ctx.arc(-crownSize * 0.2, crownY - crownSize * 0.4, crownSize * 0.3, 0, Math.PI * 2);
	ctx.fill();
	
	// 树叶细节（随等级增加更多叶子）
	if (stage >= 2) {
		ctx.fillStyle = '#3cb371';
		for (let i = 0; i < stage; i++) {
			const angle = (i / stage) * Math.PI * 2;
			const leafX = Math.cos(angle) * crownSize * 0.8;
			const leafY = crownY + Math.sin(angle) * crownSize * 0.8;
			ctx.beginPath();
			ctx.ellipse(leafX, leafY, 8, 12, angle, 0, Math.PI * 2);
			ctx.fill();
		}
	}
	
	// 果实（等级3+）
	if (stage >= 3) {
		ctx.fillStyle = '#ff6347';
		const fruitCount = Math.min(stage - 2, 5);
		for (let i = 0; i < fruitCount; i++) {
			const angle = (i / fruitCount) * Math.PI * 2 + Math.PI / 4;
			const fruitX = Math.cos(angle) * crownSize * 0.6;
			const fruitY = crownY + Math.sin(angle) * crownSize * 0.6;
			ctx.beginPath();
			ctx.arc(fruitX, fruitY, 5, 0, Math.PI * 2);
			ctx.fill();
			// 果实高光
			ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
			ctx.beginPath();
			ctx.arc(fruitX - 2, fruitY - 2, 2, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = '#ff6347';
		}
	}
	
	// 花朵（等级5）
	if (stage >= 5) {
		ctx.fillStyle = '#ffb6c1';
		for (let i = 0; i < 8; i++) {
			const angle = (i / 8) * Math.PI * 2;
			const flowerX = Math.cos(angle) * crownSize * 0.9;
			const flowerY = crownY + Math.sin(angle) * crownSize * 0.9;
			// 花瓣
			for (let p = 0; p < 5; p++) {
				const petalAngle = angle + (p / 5) * Math.PI * 2;
				ctx.beginPath();
				ctx.arc(
					flowerX + Math.cos(petalAngle) * 4,
					flowerY + Math.sin(petalAngle) * 4,
					3, 0, Math.PI * 2
				);
				ctx.fill();
			}
			// 花心
			ctx.fillStyle = '#ffd700';
			ctx.beginPath();
			ctx.arc(flowerX, flowerY, 2, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = '#ffb6c1';
		}
	}
	
	ctx.restore();
}

function updateParticles() {
	for (let i = particles.length - 1; i >= 0; i--) {
		const p = particles[i];
		p.x += p.vx;
		p.y += p.vy;
		p.life -= 2;
		p.vy += 0.2; // 重力
		if (p.life <= 0) {
			particles.splice(i, 1);
		}
	}
}

function drawParticles() {
	for (const p of particles) {
		ctx.save();
		ctx.globalAlpha = p.life / 100;
		ctx.fillStyle = p.color;
		ctx.beginPath();
		ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	}
}

function createParticles(x, y, color, count = 10) {
	for (let i = 0; i < count; i++) {
		particles.push({
			x, y,
			vx: (Math.random() - 0.5) * 4,
			vy: (Math.random() - 0.5) * 4 - 2,
			life: 100,
			color: color,
			size: 2 + Math.random() * 3
		});
	}
}

// 创建浮动文字提示
function createFloatingText(x, y, text, color) {
	floatingTexts.push({
		x: x + 80, // 在词条右侧显示
		y: y,
		text: text,
		color: color,
		life: 120, // 持续时间
		scale: 0.5 // 初始缩放
	});
}

// 更新浮动文字
function updateFloatingTexts() {
	for (let i = floatingTexts.length - 1; i >= 0; i--) {
		const ft = floatingTexts[i];
		ft.y -= 1.5; // 向上浮动
		ft.life -= 2;
		// 缩放动画：0.5 -> 1.2 -> 1.0
		if (ft.life > 100) {
			ft.scale = 0.5 + (120 - ft.life) / 20 * 0.7; // 0.5 -> 1.2
		} else if (ft.scale > 1.0) {
			ft.scale -= 0.02; // 1.2 -> 1.0
		}
		if (ft.life <= 0) {
			floatingTexts.splice(i, 1);
		}
	}
}

// 绘制浮动文字
function drawFloatingTexts() {
	for (const ft of floatingTexts) {
		ctx.save();
		ctx.globalAlpha = ft.life / 120;
		ctx.font = `bold ${24 * ft.scale}px "Microsoft YaHei", SimHei, Arial`;
		ctx.textAlign = 'left';
		ctx.textBaseline = 'middle';
		// 文字描边
		ctx.strokeStyle = '#fff';
		ctx.lineWidth = 4;
		ctx.strokeText(ft.text, ft.x, ft.y);
		// 文字填充
		ctx.fillStyle = ft.color;
		ctx.fillText(ft.text, ft.x, ft.y);
		ctx.restore();
	}
}

function drawBird() {
	ctx.save();
	ctx.translate(bird.x, bird.y);

	// 等级配色（更鲜艳的卡通色）
	const lv = STATE.level;
	const bodyColors = [
		'#00bcd4', // 青色
		'#03a9f4', // 蓝色
		'#2196f3', // 深蓝
		'#3f51b5', // 靛蓝
		'#9c27b0'  // 紫色
	];
	const bodyColor = bodyColors[lv - 1] || bodyColors[0];
	const bellyColor = '#fff9c4'; // 浅黄色肚皮
	const beakColor = '#ff6f00'; // 橙色大嘴

	// 朝向角度
	let angle = 0;
	if (bird.target) angle = Math.atan2(bird.target.y - bird.y, bird.target.x - bird.x);
	ctx.rotate(angle);

	// 1. 尾羽（Lv3+，在身体后面绘制）
	if (lv >= 3) {
		const tailColors = ['#26c6da', '#29b6f6', '#42a5f5', '#5c6bc0', '#ab47bc'];
		ctx.fillStyle = tailColors[lv - 1];
		ctx.beginPath();
		ctx.moveTo(-bird.size * 0.8, 0);
		ctx.lineTo(-bird.size * 1.5, -bird.size * 0.4);
		ctx.lineTo(-bird.size * 1.3, 0);
		ctx.lineTo(-bird.size * 1.5, bird.size * 0.4);
		ctx.closePath();
		ctx.fill();
		// 尾羽纹理
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(-bird.size * 1.2, -bird.size * 0.2);
		ctx.lineTo(-bird.size * 1.4, -bird.size * 0.3);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(-bird.size * 1.2, bird.size * 0.2);
		ctx.lineTo(-bird.size * 1.4, bird.size * 0.3);
		ctx.stroke();
	}

	// 2. 翅膀（Lv4+，在身体两侧）
	if (lv >= 4) {
		const wingColor = '#80deea';
		const time = Date.now() * 0.005;
		const flapAngle = Math.sin(time * 2) * 0.2; // 扇动效果
		
		// 左翅膀
		ctx.save();
		ctx.translate(-bird.size * 0.5, 0);
		ctx.rotate(-0.3 + flapAngle);
		ctx.fillStyle = wingColor;
		ctx.beginPath();
		ctx.ellipse(0, 0, bird.size * 0.6, bird.size * 1.2, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
		
		// 右翅膀
		ctx.save();
		ctx.translate(-bird.size * 0.5, 0);
		ctx.rotate(0.3 - flapAngle);
		ctx.fillStyle = wingColor;
		ctx.beginPath();
		ctx.ellipse(0, 0, bird.size * 0.6, bird.size * 1.2, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	}

	// 3. 身体（椭圆形，卡通风格）
	ctx.fillStyle = bodyColor;
	ctx.beginPath();
	ctx.ellipse(0, 0, bird.size * 1.1, bird.size, 0, 0, Math.PI * 2);
	ctx.fill();
	
	// 身体轮廓线
	ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
	ctx.lineWidth = 2;
	ctx.stroke();

	// 4. 肚皮（Lv2+）
	if (lv >= 2) {
		ctx.fillStyle = bellyColor;
		ctx.beginPath();
		ctx.ellipse(bird.size * 0.2, bird.size * 0.1, bird.size * 0.6, bird.size * 0.7, 0, 0, Math.PI * 2);
		ctx.fill();
	}

	// 5. 大嘴巴（标志性特征）
	// 上喙
	ctx.fillStyle = beakColor;
	ctx.beginPath();
	ctx.moveTo(bird.size * 0.8, -bird.size * 0.3);
	ctx.quadraticCurveTo(bird.size * 1.8, -bird.size * 0.4, bird.size * 2.2, -bird.size * 0.1);
	ctx.lineTo(bird.size * 2.2, 0);
	ctx.lineTo(bird.size * 0.8, 0);
	ctx.closePath();
	ctx.fill();
	
	// 下喙
	ctx.beginPath();
	ctx.moveTo(bird.size * 0.8, 0);
	ctx.lineTo(bird.size * 2.2, 0);
	ctx.quadraticCurveTo(bird.size * 1.8, bird.size * 0.3, bird.size * 0.8, bird.size * 0.2);
	ctx.closePath();
	ctx.fill();
	
	// 喙的高光
	ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
	ctx.beginPath();
	ctx.ellipse(bird.size * 1.5, -bird.size * 0.15, bird.size * 0.3, bird.size * 0.1, 0, 0, Math.PI * 2);
	ctx.fill();
	
	// 喙的轮廓
	ctx.strokeStyle = '#e65100';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(bird.size * 0.8, -bird.size * 0.3);
	ctx.quadraticCurveTo(bird.size * 1.8, -bird.size * 0.4, bird.size * 2.2, -bird.size * 0.1);
	ctx.stroke();

	// 6. 眼睛（大大的卡通眼睛）
	// 眼白
	ctx.fillStyle = '#fff';
	ctx.beginPath();
	ctx.ellipse(bird.size * 0.3, -bird.size * 0.4, bird.size * 0.35, bird.size * 0.4, 0, 0, Math.PI * 2);
	ctx.fill();
	
	// 眼珠
	ctx.fillStyle = '#111';
	ctx.beginPath();
	ctx.arc(bird.size * 0.4, -bird.size * 0.35, bird.size * 0.15, 0, Math.PI * 2);
	ctx.fill();
	
	// 眼睛高光（让眼睛更有神）
	ctx.fillStyle = '#fff';
	ctx.beginPath();
	ctx.arc(bird.size * 0.45, -bird.size * 0.4, bird.size * 0.06, 0, Math.PI * 2);
	ctx.fill();
	
	// 眼睛轮廓
	ctx.strokeStyle = '#000';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.ellipse(bird.size * 0.3, -bird.size * 0.4, bird.size * 0.35, bird.size * 0.4, 0, 0, Math.PI * 2);
	ctx.stroke();

	// 7. 头冠（Lv3+）
	if (lv >= 3) {
		const crestColors = ['#ff4081', '#e91e63', '#f06292', '#ba68c8', '#ce93d8'];
		ctx.fillStyle = crestColors[lv - 1];
		
		// 多根羽毛
		for (let i = 0; i < lv - 1; i++) {
			const offsetX = (i - (lv - 2) / 2) * bird.size * 0.2;
			ctx.beginPath();
			ctx.moveTo(offsetX - bird.size * 0.1, -bird.size * 0.8);
			ctx.lineTo(offsetX, -bird.size * 1.3);
			ctx.lineTo(offsetX + bird.size * 0.1, -bird.size * 0.8);
			ctx.closePath();
			ctx.fill();
		}
	}

	// 8. 小腿和爪子（Lv5）
	if (lv >= 5) {
		ctx.restore(); // 先恢复旋转
		ctx.save();
		ctx.translate(bird.x, bird.y);
		
		ctx.strokeStyle = '#ff6f00';
		ctx.lineWidth = 3;
		
		// 左腿
		ctx.beginPath();
		ctx.moveTo(-bird.size * 0.3, bird.size * 0.8);
		ctx.lineTo(-bird.size * 0.3, bird.size * 1.2);
		ctx.stroke();
		// 左爪
		ctx.beginPath();
		ctx.moveTo(-bird.size * 0.3, bird.size * 1.2);
		ctx.lineTo(-bird.size * 0.5, bird.size * 1.35);
		ctx.moveTo(-bird.size * 0.3, bird.size * 1.2);
		ctx.lineTo(-bird.size * 0.1, bird.size * 1.35);
		ctx.stroke();
		
		// 右腿
		ctx.beginPath();
		ctx.moveTo(bird.size * 0.3, bird.size * 0.8);
		ctx.lineTo(bird.size * 0.3, bird.size * 1.2);
		ctx.stroke();
		// 右爪
		ctx.beginPath();
		ctx.moveTo(bird.size * 0.3, bird.size * 1.2);
		ctx.lineTo(bird.size * 0.1, bird.size * 1.35);
		ctx.moveTo(bird.size * 0.3, bird.size * 1.2);
		ctx.lineTo(bird.size * 0.5, bird.size * 1.35);
		ctx.stroke();
	}

	ctx.restore();
}

function drawItems() {
	for (const it of items) {
		ctx.save();
		// 卡片闪烁效果（随时间变化）
		const time = Date.now() * 0.005;
		const pulse = Math.sin(time + it.x * 0.01) * 0.1 + 0.9;
		
		// 卡片阴影
		ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
		ctx.shadowBlur = 8;
		ctx.shadowOffsetX = 2;
		ctx.shadowOffsetY = 2;
		
		// 使用词条自己的颜色
		const colors = it.colors || ['#ffe08a', '#ffc241'];
		const grad = ctx.createLinearGradient(it.x, it.y - it.h/2, it.x, it.y + it.h/2);
		grad.addColorStop(0, colors[0]);
		grad.addColorStop(1, colors[1]);
		ctx.fillStyle = grad;
		
		// 根据形状类型绘制不同的形状
		const shape = it.shape || 'rect';
		drawShape(ctx, it.x, it.y, it.w, it.h, shape);
		
		// 边框
		ctx.shadowBlur = 0;
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
		ctx.lineWidth = 3;
		drawShape(ctx, it.x, it.y, it.w, it.h, shape, true);
		
		// 绘制卡通图案（在文字上方）
		const patternType = it.patternType || 'apple';
		drawCartoonPattern(ctx, it.x, it.y - 12, patternType, it.w * 0.6);
		
		// 文本（在图案下方，自适应字号，调大1/3）
		ctx.fillStyle = '#222';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		let fs = Math.round(16 * 4 / 3); // 调大1/3，约21px
		const maxW = it.w - 20;
		ctx.font = `bold ${fs}px "Microsoft YaHei", SimHei, Arial`;
		while (ctx.measureText(it.text).width > maxW && fs > 13) {
			fs -= 1;
			ctx.font = `bold ${fs}px "Microsoft YaHei", SimHei, Arial`;
		}
		
		// 文字描边效果
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
		ctx.lineWidth = 2;
		ctx.strokeText(it.text, it.x, it.y + 8);
		ctx.fillText(it.text, it.x, it.y + 8);
		ctx.restore();
	}
}

// 绘制卡通图案
function drawCartoonPattern(ctx, x, y, patternType, size) {
	ctx.save();
	ctx.translate(x, y);
	
	const scale = size / 40; // 基础尺寸为40，根据传入size缩放
	
	switch(patternType) {
		// 水果类
		case 'apple':
			// 苹果身体
			ctx.fillStyle = '#ff4444';
			ctx.beginPath();
			ctx.ellipse(0, 0, 12 * scale, 15 * scale, 0, 0, Math.PI * 2);
			ctx.fill();
			// 苹果叶子
			ctx.fillStyle = '#4caf50';
			ctx.beginPath();
			ctx.ellipse(0, -15 * scale, 4 * scale, 6 * scale, -0.3, 0, Math.PI * 2);
			ctx.fill();
			// 高光
			ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
			ctx.beginPath();
			ctx.arc(-5 * scale, -5 * scale, 4 * scale, 0, Math.PI * 2);
			ctx.fill();
			break;
			
		case 'orange':
			// 橙子身体
			ctx.fillStyle = '#ff9800';
			ctx.beginPath();
			ctx.arc(0, 0, 14 * scale, 0, Math.PI * 2);
			ctx.fill();
			// 橙子纹理
			ctx.strokeStyle = 'rgba(255, 152, 0, 0.5)';
			ctx.lineWidth = 1;
			for (let i = 0; i < 6; i++) {
				const angle = (i / 6) * Math.PI * 2;
				ctx.beginPath();
				ctx.moveTo(0, 0);
				ctx.lineTo(Math.cos(angle) * 14 * scale, Math.sin(angle) * 14 * scale);
				ctx.stroke();
			}
			// 高光
			ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
			ctx.beginPath();
			ctx.arc(-6 * scale, -6 * scale, 5 * scale, 0, Math.PI * 2);
			ctx.fill();
			break;
			
		case 'strawberry':
			// 草莓身体
			ctx.fillStyle = '#f44336';
			ctx.beginPath();
			ctx.moveTo(0, 10 * scale);
			ctx.quadraticCurveTo(-8 * scale, -5 * scale, 0, -12 * scale);
			ctx.quadraticCurveTo(8 * scale, -5 * scale, 0, 10 * scale);
			ctx.closePath();
			ctx.fill();
			// 草莓叶子
			ctx.fillStyle = '#4caf50';
			ctx.beginPath();
			ctx.arc(-6 * scale, -12 * scale, 3 * scale, 0, Math.PI * 2);
			ctx.arc(0, -15 * scale, 3 * scale, 0, Math.PI * 2);
			ctx.arc(6 * scale, -12 * scale, 3 * scale, 0, Math.PI * 2);
			ctx.fill();
			// 草莓籽
			ctx.fillStyle = '#ffeb3b';
			for (let i = 0; i < 8; i++) {
				const angle = (i / 8) * Math.PI * 2;
				const dist = 6 + (i % 2) * 2;
				ctx.beginPath();
				ctx.arc(Math.cos(angle) * dist * scale, Math.sin(angle) * dist * scale, 1.5 * scale, 0, Math.PI * 2);
				ctx.fill();
			}
			break;
			
		case 'banana':
			// 香蕉身体
			ctx.fillStyle = '#ffeb3b';
			ctx.beginPath();
			ctx.moveTo(-8 * scale, 8 * scale);
			ctx.quadraticCurveTo(-10 * scale, -5 * scale, -5 * scale, -10 * scale);
			ctx.quadraticCurveTo(0, -12 * scale, 5 * scale, -8 * scale);
			ctx.quadraticCurveTo(8 * scale, 0, 8 * scale, 8 * scale);
			ctx.closePath();
			ctx.fill();
			// 香蕉纹理
			ctx.strokeStyle = 'rgba(255, 193, 7, 0.6)';
			ctx.lineWidth = 1;
			for (let i = 0; i < 3; i++) {
				ctx.beginPath();
				ctx.moveTo(-5 * scale + i * 5 * scale, -8 * scale);
				ctx.lineTo(-3 * scale + i * 3 * scale, 6 * scale);
				ctx.stroke();
			}
			break;
			
		case 'grape':
			// 葡萄串
			ctx.fillStyle = '#9c27b0';
			for (let row = 0; row < 3; row++) {
				const count = row === 0 ? 2 : row === 1 ? 3 : 2;
				for (let i = 0; i < count; i++) {
					const offsetX = (i - (count - 1) / 2) * 6 * scale;
					const offsetY = (row - 1) * 6 * scale;
					ctx.beginPath();
					ctx.arc(offsetX, offsetY, 4 * scale, 0, Math.PI * 2);
					ctx.fill();
					// 高光
					ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
					ctx.beginPath();
					ctx.arc(offsetX - 1.5 * scale, offsetY - 1.5 * scale, 1.5 * scale, 0, Math.PI * 2);
					ctx.fill();
					ctx.fillStyle = '#9c27b0';
				}
			}
			// 葡萄藤
			ctx.strokeStyle = '#4caf50';
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(0, -10 * scale);
			ctx.lineTo(0, -14 * scale);
			ctx.stroke();
			break;
			
		case 'cherry':
			// 樱桃1
			ctx.fillStyle = '#e91e63';
			ctx.beginPath();
			ctx.arc(-4 * scale, 2 * scale, 5 * scale, 0, Math.PI * 2);
			ctx.fill();
			// 樱桃2
			ctx.beginPath();
			ctx.arc(4 * scale, 2 * scale, 5 * scale, 0, Math.PI * 2);
			ctx.fill();
			// 高光
			ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
			ctx.beginPath();
			ctx.arc(-5 * scale, 1 * scale, 2 * scale, 0, Math.PI * 2);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(3 * scale, 1 * scale, 2 * scale, 0, Math.PI * 2);
			ctx.fill();
			// 樱桃梗
			ctx.strokeStyle = '#4caf50';
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(-4 * scale, -3 * scale);
			ctx.lineTo(0, -8 * scale);
			ctx.lineTo(4 * scale, -3 * scale);
			ctx.stroke();
			break;
			
		case 'watermelon':
			// 西瓜身体
			ctx.fillStyle = '#4caf50';
			ctx.beginPath();
			ctx.ellipse(0, 0, 12 * scale, 8 * scale, 0, 0, Math.PI * 2);
			ctx.fill();
			// 西瓜条纹
			ctx.strokeStyle = '#2e7d32';
			ctx.lineWidth = 2;
			for (let i = -1; i <= 1; i++) {
				ctx.beginPath();
				ctx.moveTo(-12 * scale, i * 4 * scale);
				ctx.lineTo(12 * scale, i * 4 * scale);
				ctx.stroke();
			}
			// 西瓜果肉（内部）
			ctx.fillStyle = '#ff5252';
			ctx.beginPath();
			ctx.ellipse(0, 0, 8 * scale, 5 * scale, 0, 0, Math.PI * 2);
			ctx.fill();
			// 西瓜籽
			ctx.fillStyle = '#212121';
			ctx.beginPath();
			ctx.arc(2 * scale, 0, 1 * scale, 0, Math.PI * 2);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(-2 * scale, 0, 1 * scale, 0, Math.PI * 2);
			ctx.fill();
			break;
			
		case 'pineapple':
			// 菠萝身体
			ctx.fillStyle = '#ffc107';
			ctx.beginPath();
			ctx.ellipse(0, 0, 10 * scale, 14 * scale, 0, 0, Math.PI * 2);
			ctx.fill();
			// 菠萝纹理
			ctx.strokeStyle = '#ff8f00';
			ctx.lineWidth = 1.5;
			for (let i = 0; i < 6; i++) {
				const angle = (i / 6) * Math.PI * 2;
				ctx.beginPath();
				ctx.moveTo(0, -14 * scale);
				ctx.lineTo(Math.cos(angle) * 10 * scale, Math.sin(angle) * 10 * scale);
				ctx.stroke();
			}
			// 菠萝叶子
			ctx.fillStyle = '#4caf50';
			for (let i = 0; i < 5; i++) {
				const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
				ctx.beginPath();
				ctx.moveTo(0, -14 * scale);
				ctx.lineTo(Math.cos(angle) * 6 * scale, -14 * scale + Math.sin(angle) * 8 * scale);
				ctx.lineTo(Math.cos(angle) * 3 * scale, -14 * scale + Math.sin(angle) * 4 * scale);
				ctx.closePath();
				ctx.fill();
			}
			break;
			
		case 'peach':
			// 桃子身体
			ctx.fillStyle = '#ffb3ba';
			ctx.beginPath();
			ctx.ellipse(0, 0, 12 * scale, 14 * scale, 0, 0, Math.PI * 2);
			ctx.fill();
			// 桃子高光
			ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
			ctx.beginPath();
			ctx.arc(-4 * scale, -4 * scale, 5 * scale, 0, Math.PI * 2);
			ctx.fill();
			// 桃子叶子
			ctx.fillStyle = '#4caf50';
			ctx.beginPath();
			ctx.ellipse(0, -14 * scale, 3 * scale, 5 * scale, -0.2, 0, Math.PI * 2);
			ctx.fill();
			break;
			
		// 昆虫类
		case 'butterfly':
			// 蝴蝶身体
			ctx.fillStyle = '#795548';
			ctx.beginPath();
			ctx.ellipse(0, 0, 2 * scale, 8 * scale, 0, 0, Math.PI * 2);
			ctx.fill();
			// 上翅膀
			ctx.fillStyle = '#ff9800';
			ctx.beginPath();
			ctx.ellipse(-6 * scale, -4 * scale, 6 * scale, 5 * scale, -0.3, 0, Math.PI * 2);
			ctx.fill();
			ctx.beginPath();
			ctx.ellipse(6 * scale, -4 * scale, 6 * scale, 5 * scale, 0.3, 0, Math.PI * 2);
			ctx.fill();
			// 下翅膀
			ctx.fillStyle = '#ffc107';
			ctx.beginPath();
			ctx.ellipse(-5 * scale, 2 * scale, 5 * scale, 4 * scale, 0.2, 0, Math.PI * 2);
			ctx.fill();
			ctx.beginPath();
			ctx.ellipse(5 * scale, 2 * scale, 5 * scale, 4 * scale, -0.2, 0, Math.PI * 2);
			ctx.fill();
			// 翅膀斑点
			ctx.fillStyle = '#212121';
			ctx.beginPath();
			ctx.arc(-6 * scale, -4 * scale, 2 * scale, 0, Math.PI * 2);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(6 * scale, -4 * scale, 2 * scale, 0, Math.PI * 2);
			ctx.fill();
			break;
			
		case 'bee':
			// 蜜蜂身体
			ctx.fillStyle = '#ffc107';
			ctx.beginPath();
			ctx.ellipse(0, 0, 6 * scale, 4 * scale, 0, 0, Math.PI * 2);
			ctx.fill();
			// 蜜蜂条纹
			ctx.fillStyle = '#212121';
			ctx.fillRect(-6 * scale, -2 * scale, 12 * scale, 1.5 * scale);
			ctx.fillRect(-6 * scale, 0.5 * scale, 12 * scale, 1.5 * scale);
			// 蜜蜂翅膀
			ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
			ctx.beginPath();
			ctx.ellipse(-4 * scale, -5 * scale, 3 * scale, 4 * scale, -0.3, 0, Math.PI * 2);
			ctx.fill();
			ctx.beginPath();
			ctx.ellipse(4 * scale, -5 * scale, 3 * scale, 4 * scale, 0.3, 0, Math.PI * 2);
			ctx.fill();
			// 蜜蜂眼睛
			ctx.fillStyle = '#212121';
			ctx.beginPath();
			ctx.arc(-2 * scale, -1 * scale, 1.5 * scale, 0, Math.PI * 2);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(2 * scale, -1 * scale, 1.5 * scale, 0, Math.PI * 2);
			ctx.fill();
			// 蜜蜂触角
			ctx.strokeStyle = '#212121';
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(-3 * scale, -4 * scale);
			ctx.lineTo(-4 * scale, -6 * scale);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(3 * scale, -4 * scale);
			ctx.lineTo(4 * scale, -6 * scale);
			ctx.stroke();
			ctx.fillStyle = '#212121';
			ctx.beginPath();
			ctx.arc(-4 * scale, -6 * scale, 1 * scale, 0, Math.PI * 2);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(4 * scale, -6 * scale, 1 * scale, 0, Math.PI * 2);
			ctx.fill();
			break;
			
		case 'ladybug':
			// 瓢虫身体
			ctx.fillStyle = '#f44336';
			ctx.beginPath();
			ctx.ellipse(0, 0, 8 * scale, 6 * scale, 0, 0, Math.PI * 2);
			ctx.fill();
			// 瓢虫头部
			ctx.fillStyle = '#212121';
			ctx.beginPath();
			ctx.arc(0, -6 * scale, 4 * scale, 0, Math.PI * 2);
			ctx.fill();
			// 瓢虫斑点
			ctx.fillStyle = '#212121';
			ctx.beginPath();
			ctx.arc(-3 * scale, -1 * scale, 1.5 * scale, 0, Math.PI * 2);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(3 * scale, -1 * scale, 1.5 * scale, 0, Math.PI * 2);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(0, 2 * scale, 1.5 * scale, 0, Math.PI * 2);
			ctx.fill();
			// 瓢虫眼睛
			ctx.fillStyle = '#fff';
			ctx.beginPath();
			ctx.arc(-2 * scale, -6 * scale, 1 * scale, 0, Math.PI * 2);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(2 * scale, -6 * scale, 1 * scale, 0, Math.PI * 2);
			ctx.fill();
			break;
			
		case 'dragonfly':
			// 蜻蜓身体
			ctx.fillStyle = '#00bcd4';
			ctx.beginPath();
			ctx.ellipse(0, 0, 1.5 * scale, 10 * scale, 0, 0, Math.PI * 2);
			ctx.fill();
			// 蜻蜓翅膀
			ctx.fillStyle = 'rgba(0, 188, 212, 0.3)';
			ctx.strokeStyle = '#00bcd4';
			ctx.lineWidth = 1.5;
			// 前翅
			ctx.beginPath();
			ctx.ellipse(-4 * scale, -3 * scale, 5 * scale, 2.5 * scale, -0.2, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
			ctx.beginPath();
			ctx.ellipse(4 * scale, -3 * scale, 5 * scale, 2.5 * scale, 0.2, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
			// 后翅
			ctx.beginPath();
			ctx.ellipse(-3 * scale, 1 * scale, 4 * scale, 2 * scale, 0.2, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
			ctx.beginPath();
			ctx.ellipse(3 * scale, 1 * scale, 4 * scale, 2 * scale, -0.2, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
			// 蜻蜓眼睛
			ctx.fillStyle = '#212121';
			ctx.beginPath();
			ctx.arc(-2 * scale, -8 * scale, 2 * scale, 0, Math.PI * 2);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(2 * scale, -8 * scale, 2 * scale, 0, Math.PI * 2);
			ctx.fill();
			break;
			
		// 鸟类
		case 'bird':
			// 小鸟身体
			ctx.fillStyle = '#ff9800';
			ctx.beginPath();
			ctx.ellipse(0, 0, 6 * scale, 4 * scale, 0, 0, Math.PI * 2);
			ctx.fill();
			// 小鸟头部
			ctx.beginPath();
			ctx.arc(-4 * scale, -2 * scale, 3 * scale, 0, Math.PI * 2);
			ctx.fill();
			// 小鸟翅膀
			ctx.fillStyle = '#ff6f00';
			ctx.beginPath();
			ctx.ellipse(2 * scale, 0, 4 * scale, 3 * scale, 0.3, 0, Math.PI * 2);
			ctx.fill();
			// 小鸟眼睛
			ctx.fillStyle = '#212121';
			ctx.beginPath();
			ctx.arc(-5 * scale, -2 * scale, 1 * scale, 0, Math.PI * 2);
			ctx.fill();
			// 小鸟嘴巴
			ctx.fillStyle = '#ff6f00';
			ctx.beginPath();
			ctx.moveTo(-7 * scale, -2 * scale);
			ctx.lineTo(-9 * scale, -1 * scale);
			ctx.lineTo(-7 * scale, 0);
			ctx.closePath();
			ctx.fill();
			break;
			
		case 'parrot':
			// 鹦鹉身体
			ctx.fillStyle = '#4caf50';
			ctx.beginPath();
			ctx.ellipse(0, 0, 7 * scale, 5 * scale, 0, 0, Math.PI * 2);
			ctx.fill();
			// 鹦鹉头部
			ctx.fillStyle = '#ffeb3b';
			ctx.beginPath();
			ctx.arc(-5 * scale, -3 * scale, 4 * scale, 0, Math.PI * 2);
			ctx.fill();
			// 鹦鹉翅膀
			ctx.fillStyle = '#2e7d32';
			ctx.beginPath();
			ctx.ellipse(3 * scale, 0, 5 * scale, 4 * scale, 0.2, 0, Math.PI * 2);
			ctx.fill();
			// 鹦鹉尾巴
			ctx.beginPath();
			ctx.moveTo(7 * scale, 0);
			ctx.lineTo(10 * scale, -3 * scale);
			ctx.lineTo(10 * scale, 3 * scale);
			ctx.closePath();
			ctx.fill();
			// 鹦鹉眼睛
			ctx.fillStyle = '#212121';
			ctx.beginPath();
			ctx.arc(-6 * scale, -3 * scale, 1.5 * scale, 0, Math.PI * 2);
			ctx.fill();
			// 鹦鹉嘴巴
			ctx.fillStyle = '#ff6f00';
			ctx.beginPath();
			ctx.moveTo(-9 * scale, -3 * scale);
			ctx.lineTo(-11 * scale, -2 * scale);
			ctx.lineTo(-9 * scale, -1 * scale);
			ctx.closePath();
			ctx.fill();
			break;
			
		case 'eagle':
			// 老鹰身体
			ctx.fillStyle = '#795548';
			ctx.beginPath();
			ctx.ellipse(0, 0, 8 * scale, 5 * scale, 0, 0, Math.PI * 2);
			ctx.fill();
			// 老鹰头部
			ctx.fillStyle = '#fff';
			ctx.beginPath();
			ctx.arc(-6 * scale, -3 * scale, 3 * scale, 0, Math.PI * 2);
			ctx.fill();
			// 老鹰翅膀
			ctx.fillStyle = '#5d4037';
			ctx.beginPath();
			ctx.ellipse(3 * scale, -2 * scale, 6 * scale, 4 * scale, -0.2, 0, Math.PI * 2);
			ctx.fill();
			ctx.beginPath();
			ctx.ellipse(3 * scale, 2 * scale, 6 * scale, 4 * scale, 0.2, 0, Math.PI * 2);
			ctx.fill();
			// 老鹰眼睛
			ctx.fillStyle = '#ffc107';
			ctx.beginPath();
			ctx.arc(-7 * scale, -3 * scale, 1.5 * scale, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = '#212121';
			ctx.beginPath();
			ctx.arc(-7 * scale, -3 * scale, 0.8 * scale, 0, Math.PI * 2);
			ctx.fill();
			// 老鹰嘴巴
			ctx.fillStyle = '#ff6f00';
			ctx.beginPath();
			ctx.moveTo(-9 * scale, -3 * scale);
			ctx.lineTo(-11 * scale, -2 * scale);
			ctx.lineTo(-9 * scale, -1 * scale);
			ctx.closePath();
			ctx.fill();
			break;
			
		case 'owl':
			// 猫头鹰身体
			ctx.fillStyle = '#8d6e63';
			ctx.beginPath();
			ctx.ellipse(0, 0, 8 * scale, 10 * scale, 0, 0, Math.PI * 2);
			ctx.fill();
			// 猫头鹰头部
			ctx.fillStyle = '#a1887f';
			ctx.beginPath();
			ctx.arc(0, -6 * scale, 6 * scale, 0, Math.PI * 2);
			ctx.fill();
			// 猫头鹰眼睛
			ctx.fillStyle = '#fff';
			ctx.beginPath();
			ctx.arc(-3 * scale, -6 * scale, 3 * scale, 0, Math.PI * 2);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(3 * scale, -6 * scale, 3 * scale, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = '#212121';
			ctx.beginPath();
			ctx.arc(-3 * scale, -6 * scale, 1.5 * scale, 0, Math.PI * 2);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(3 * scale, -6 * scale, 1.5 * scale, 0, Math.PI * 2);
			ctx.fill();
			// 猫头鹰嘴巴
			ctx.fillStyle = '#ff6f00';
			ctx.beginPath();
			ctx.moveTo(0, -3 * scale);
			ctx.lineTo(-2 * scale, -1 * scale);
			ctx.lineTo(2 * scale, -1 * scale);
			ctx.closePath();
			ctx.fill();
			// 猫头鹰耳朵
			ctx.fillStyle = '#8d6e63';
			ctx.beginPath();
			ctx.moveTo(-4 * scale, -12 * scale);
			ctx.lineTo(-6 * scale, -16 * scale);
			ctx.lineTo(-2 * scale, -14 * scale);
			ctx.closePath();
			ctx.fill();
			ctx.beginPath();
			ctx.moveTo(4 * scale, -12 * scale);
			ctx.lineTo(6 * scale, -16 * scale);
			ctx.lineTo(2 * scale, -14 * scale);
			ctx.closePath();
			ctx.fill();
			break;
			
		default:
			// 默认绘制苹果
			ctx.fillStyle = '#ff4444';
			ctx.beginPath();
			ctx.ellipse(0, 0, 12 * scale, 15 * scale, 0, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = '#4caf50';
			ctx.beginPath();
			ctx.ellipse(0, -15 * scale, 4 * scale, 6 * scale, -0.3, 0, Math.PI * 2);
			ctx.fill();
			break;
	}
	
	ctx.restore();
}

// 绘制不同形状的函数
function drawShape(ctx, x, y, w, h, shape, strokeOnly = false) {
	ctx.beginPath();
	
	switch(shape) {
		case 'circle': // 圆形
			const radius = Math.min(w, h) / 2;
			ctx.arc(x, y, radius, 0, Math.PI * 2);
			break;
			
		case 'ellipse': // 椭圆
			ctx.ellipse(x, y, w/2, h/2, 0, 0, Math.PI * 2);
			break;
			
		case 'diamond': // 菱形
			ctx.moveTo(x, y - h/2);
			ctx.lineTo(x + w/2, y);
			ctx.lineTo(x, y + h/2);
			ctx.lineTo(x - w/2, y);
			ctx.closePath();
			break;
			
		case 'hexagon': // 六边形
			const hexRadius = Math.min(w, h) / 2;
			for (let i = 0; i < 6; i++) {
				const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
				const px = x + Math.cos(angle) * hexRadius;
				const py = y + Math.sin(angle) * hexRadius * 0.9;
				if (i === 0) ctx.moveTo(px, py);
				else ctx.lineTo(px, py);
			}
			ctx.closePath();
			break;
			
		case 'star': // 星形
			const starRadius = Math.min(w, h) / 2;
			for (let i = 0; i < 10; i++) {
				const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
				const r = i % 2 === 0 ? starRadius : starRadius * 0.5;
				const px = x + Math.cos(angle) * r;
				const py = y + Math.sin(angle) * r;
				if (i === 0) ctx.moveTo(px, py);
				else ctx.lineTo(px, py);
			}
			ctx.closePath();
			break;
			
		case 'cloud': // 云朵形
			const cloudW = w / 2;
			const cloudH = h / 2;
			ctx.arc(x - cloudW/2, y, cloudH * 0.6, 0, Math.PI * 2);
			ctx.arc(x, y - cloudH/4, cloudH * 0.7, 0, Math.PI * 2);
			ctx.arc(x + cloudW/2, y, cloudH * 0.6, 0, Math.PI * 2);
			break;
			
		default: // 矩形（圆角）
			roundRect(x - w/2, y - h/2, w, h, 10);
			break;
	}
	
	if (strokeOnly) {
		ctx.stroke();
	} else {
		ctx.fill();
	}
}

function roundRect(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();}

function spawnItem() {
	try {
		if (items.length >= LEVELS[STATE.level - 1].maxItems) return;
		if (typeof sampleWord !== 'function') { showToast('词库未加载，请检查 words_*.js 引用', '#b91c1c'); return; }
		
		// 每9个正确词必出1个错误词
		let forceWrong = false;
		if (STATE.correctCounter >= 9) {
			forceWrong = true;
			STATE.correctCounter = 0; // 重置计数器
		}
		
		const w = sampleWord(STATE.probWrong, forceWrong);
		const x = 80 + Math.random() * (canvas.width - 160);
		const y = 80 + Math.random() * (canvas.height - 220);
		const cardW = 140, cardH = 56;
		
		// 随机形状类型：圆形、椭圆、菱形、六边形、星形、云朵形
		const shapes = ['circle', 'ellipse', 'diamond', 'hexagon', 'star', 'cloud', 'rect'];
		const shape = shapes[Math.floor(Math.random() * shapes.length)];
		
		// 随机颜色（多彩词条）
		const colors = [
			['#ffe08a', '#ffc241'], // 金黄
			['#ffc1e0', '#ff8ac9'], // 粉红
			['#a8e6ff', '#6ec5ff'], // 浅蓝
			['#c8ffb3', '#8fff7f'], // 浅绿
			['#ffd4a3', '#ffb366'], // 橙色
			['#e0b3ff', '#c57fff']  // 紫色
		];
		const colorPair = colors[Math.floor(Math.random() * colors.length)];
		
		// 随机卡通图案类型
		const patternTypes = ['apple', 'orange', 'strawberry', 'banana', 'grape', 
		                      'butterfly', 'bee', 'ladybug', 'dragonfly', 
		                      'bird', 'parrot', 'eagle', 'owl',
		                      'cherry', 'watermelon', 'pineapple', 'peach'];
		const patternType = patternTypes[Math.floor(Math.random() * patternTypes.length)];
		
		items.push({ 
			x, y, 
			text: w.text, 
			correct: w.correct, 
			right: w.right, 
			w: cardW, 
			h: cardH, 
			ttl: 8000,
			shape: shape, // 形状类型
			colors: colorPair, // 颜色对
			patternType: patternType // 卡通图案类型
		});
	} catch (err) {
		console.error(err);
		showToast('生成词条失败', '#b91c1c');
	}
}

function update() {
	if (!STATE.running || STATE.paused) return;
	
	// 更新错误提示动画
	updateErrorPrompt();
	
	// 如果错误提示正在显示，暂停其他更新
	if (errorPrompt.active) {
		return;
	}
	
	// 更新粒子和浮动文字
	updateParticles();
	updateFloatingTexts();
	
	// 鸟的移动逻辑
	if (bird.target) {
		// 有目标：朝向目标移动
		bird.idleMode = false;
		bird.idleTimer = 0;
		
		const spd = LEVELS[STATE.level - 1].birdSpeed;
		const dx = bird.target.x - bird.x;
		const dy = bird.target.y - bird.y;
		const dist = Math.hypot(dx, dy);
		if (dist <= spd) {
			// 到达，吞食
			const idx = bird.target.index;
			if (idx != null && items[idx]) {
				const it = items[idx];
				const itemX = it.x, itemY = it.y; // 记录词条位置
				items.splice(idx, 1);
				if (it.correct) {
					STATE.score += 10; STATE.correct += 1;
					STATE.correctCounter += 1; // 增加连续正确计数
					bird.size = Math.min(bird.size + 1.5, 40);
					// 正确时的粒子特效（绿色）
					createParticles(bird.x, bird.y, '#16a34a', 15);
					// 在词条位置显示浮动文字
					createFloatingText(itemX, itemY, '✓ 正确！', '#16a34a');
					showToast('✓ 正确！', '#16a34a');
					maybeLevelUp();
				} else {
					STATE.score = Math.max(0, STATE.score - 5); STATE.wrong += 1;
					// 错误词不重置计数器，保持9:1的严格比例
					bird.size = Math.max(bird.size - 1.5, 10);
					// 错误时的粒子特效（红色）
					createParticles(bird.x, bird.y, '#dc2626', 15);
					// 在词条位置显示浮动文字
					createFloatingText(itemX, itemY, '✗ ' + it.right, '#dc2626');
					showToast('✗ 错误！应为：' + it.right, '#dc2626');
					
					// 暂停游戏，显示错误提示（放大效果）
					showErrorPrompt(it.word, it.right, itemX, itemY);
				}
			}
			bird.target = null;
			bird.idleTimer = 0; // 重置空闲计时器
		} else {
			bird.x += (dx / dist) * spd;
			bird.y += (dy / dist) * spd;
		}
	} else {
		// 无目标：进入空闲模式，自由飞行
		bird.idleTimer++;
		
		// 空闲2秒后开始自由飞行
		if (bird.idleTimer > 120) {
			bird.idleMode = true;
			updateIdleFlight();
		}
	}
	
	// 道具 TTL
	const left = [];
	for (const it of items) {
		it.ttl -= 16;
		if (it.ttl > 0) left.push(it);
	}
	items = left;
}

// 显示错误提示（放大效果）
function showErrorPrompt(wrongWord, rightWord, x, y) {
	errorPrompt.active = true;
	errorPrompt.wrongWord = wrongWord;
	errorPrompt.rightWord = rightWord;
	errorPrompt.x = x;
	errorPrompt.y = y;
	errorPrompt.scale = 0;
	errorPrompt.timer = 0;
}

// 更新错误提示动画
function updateErrorPrompt() {
	if (!errorPrompt.active) return;
	
	errorPrompt.timer++;
	
	// 前20帧：放大动画 0 -> 1.5
	if (errorPrompt.timer <= 20) {
		errorPrompt.scale = (errorPrompt.timer / 20) * 1.5;
	}
	// 20-320帧：保持放大，轻微脉冲（5秒）
	else if (errorPrompt.timer <= 320) {
		const pulse = Math.sin((errorPrompt.timer - 20) * 0.1) * 0.05;
		errorPrompt.scale = 1.5 + pulse;
	}
	// 320-340帧：缩小消失
	else if (errorPrompt.timer <= 340) {
		errorPrompt.scale = 1.5 * (1 - (errorPrompt.timer - 320) / 20);
	}
	// 结束
	else {
		errorPrompt.active = false;
		errorPrompt.scale = 0;
	}
}

// 绘制错误提示
function drawErrorPrompt() {
	if (!errorPrompt.active || errorPrompt.scale <= 0) return;
	
	ctx.save();
	
	// 半透明背景遮罩
	ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	// 提示框位置（居中）
	const boxX = canvas.width / 2;
	const boxY = canvas.height / 2;
	const boxWidth = 400 * errorPrompt.scale;
	const boxHeight = 200 * errorPrompt.scale;
	
	// 提示框背景（白色圆角矩形）
	ctx.fillStyle = '#fff';
	ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
	ctx.shadowBlur = 20 * errorPrompt.scale;
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 10 * errorPrompt.scale;
	roundRect(boxX - boxWidth/2, boxY - boxHeight/2, boxWidth, boxHeight, 20 * errorPrompt.scale);
	ctx.fill();
	
	ctx.shadowBlur = 0;
	ctx.shadowOffsetY = 0;
	
	// 错误图标（大红叉）
	ctx.strokeStyle = '#dc2626';
	ctx.lineWidth = 8 * errorPrompt.scale;
	ctx.lineCap = 'round';
	const iconSize = 40 * errorPrompt.scale;
	const iconY = boxY - boxHeight/2 + 60 * errorPrompt.scale;
	ctx.beginPath();
	ctx.moveTo(boxX - iconSize, iconY - iconSize);
	ctx.lineTo(boxX + iconSize, iconY + iconSize);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(boxX + iconSize, iconY - iconSize);
	ctx.lineTo(boxX - iconSize, iconY + iconSize);
	ctx.stroke();
	
	// 错误的词（红色，删除线）
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.font = `bold ${32 * errorPrompt.scale}px "Microsoft YaHei", SimHei, Arial`;
	ctx.fillStyle = '#dc2626';
	const wrongY = boxY - 10 * errorPrompt.scale;
	ctx.fillText(errorPrompt.wrongWord, boxX, wrongY);
	
	// 删除线
	ctx.strokeStyle = '#dc2626';
	ctx.lineWidth = 4 * errorPrompt.scale;
	const textWidth = ctx.measureText(errorPrompt.wrongWord).width;
	ctx.beginPath();
	ctx.moveTo(boxX - textWidth/2 - 10, wrongY);
	ctx.lineTo(boxX + textWidth/2 + 10, wrongY);
	ctx.stroke();
	
	// 箭头
	ctx.fillStyle = '#666';
	ctx.font = `${28 * errorPrompt.scale}px Arial`;
	ctx.fillText('↓', boxX, wrongY + 40 * errorPrompt.scale);
	
	// 正确的词（绿色）
	ctx.font = `bold ${36 * errorPrompt.scale}px "Microsoft YaHei", SimHei, Arial`;
	ctx.fillStyle = '#16a34a';
	ctx.fillText(errorPrompt.rightWord, boxX, wrongY + 75 * errorPrompt.scale);
	
	// 正确图标（绿色勾）
	ctx.strokeStyle = '#16a34a';
	ctx.lineWidth = 6 * errorPrompt.scale;
	ctx.beginPath();
	ctx.moveTo(boxX - 100 * errorPrompt.scale, wrongY + 75 * errorPrompt.scale);
	ctx.lineTo(boxX - 80 * errorPrompt.scale, wrongY + 90 * errorPrompt.scale);
	ctx.lineTo(boxX - 60 * errorPrompt.scale, wrongY + 60 * errorPrompt.scale);
	ctx.stroke();
	
	ctx.restore();
}

// 空闲飞行逻辑
function updateIdleFlight() {
	// 如果没有下一个目标点，或已经接近目标点，生成新的随机目标
	if (!bird.nextIdleTarget || 
		Math.hypot(bird.nextIdleTarget.x - bird.x, bird.nextIdleTarget.y - bird.y) < 30) {
		// 生成新的随机目标点（避开边缘）
		const margin = 80;
		bird.nextIdleTarget = {
			x: margin + Math.random() * (canvas.width - margin * 2),
			y: margin + Math.random() * (canvas.height - 200) // 避开地面
		};
	}
	
	// 朝向下一个目标点移动（速度较慢）
	const idleSpeed = 2 + Math.random() * 1.5; // 随机速度2-3.5
	const dx = bird.nextIdleTarget.x - bird.x;
	const dy = bird.nextIdleTarget.y - bird.y;
	const dist = Math.hypot(dx, dy);
	
	if (dist > 0) {
		// 添加一些随机波动，让运动更自然
		const wobble = Math.sin(Date.now() * 0.005) * 0.5;
		bird.x += (dx / dist) * idleSpeed + wobble;
		bird.y += (dy / dist) * idleSpeed + Math.cos(Date.now() * 0.003) * 0.3;
		
		// 边界检测（防止飞出屏幕）
		const margin = 50;
		if (bird.x < margin) bird.x = margin;
		if (bird.x > canvas.width - margin) bird.x = canvas.width - margin;
		if (bird.y < margin) bird.y = margin;
		if (bird.y > canvas.height - 150) bird.y = canvas.height - 150;
	}
}

function draw() {
	drawBackground();
	drawItems();
	drawBird();
	drawParticles(); // 绘制粒子特效
	drawFloatingTexts(); // 绘制浮动文字提示
	
	// 绘制错误提示（最上层）
	if (errorPrompt.active) {
		drawErrorPrompt();
	}
	
	updateUI();
}

function loop() {
	if (!STATE.running) return;
	update();
	draw();
	animationId = requestAnimationFrame(loop);
}

function startLoops() {
	clearInterval(spawnTimer);
	spawnTimer = setInterval(spawnItem, LEVELS[STATE.level - 1].spawnMs);
	loop();
}

function maybeLevelUp() {
	// 每吞食正确 15 个升一级，最高 5 级
	if (STATE.correct > 0 && STATE.correct % 15 === 0 && STATE.level < LEVELS.length) {
		STATE.level += 1;
		showToast('升级到 Lv.' + STATE.level + ' · 更快更准！', '#2563eb');
		startLoops();
	}
}

function onClickCanvas(e) {
	if (!STATE.running || STATE.paused) return;
	const rect = canvas.getBoundingClientRect();
	
	// 计算缩放比例（Canvas实际显示大小 vs Canvas逻辑大小）
	const scaleX = canvas.width / rect.width;
	const scaleY = canvas.height / rect.height;
	
	// 根据缩放比例调整坐标
	const mx = (e.clientX - rect.left) * scaleX;
	const my = (e.clientY - rect.top) * scaleY;
	
	// 记录点击位置，用于树木摆动
	lastClickX = mx;
	
	// 让树木根据点击方向摆动
	for (const tree of trees) {
		const direction = mx < tree.x ? -1 : 1; // 点击在树左边还是右边
		const distance = Math.abs(mx - tree.x);
		const maxDistance = canvas.width / 2;
		const swayStrength = Math.max(0, 1 - distance / maxDistance) * 0.15; // 距离越近摆动越大
		tree.targetSway = direction * swayStrength;
	}
	
	// 找到点击点附近的第一条词（命中卡片区域）
	let hitIndex = -1;
	for (let i = 0; i < items.length; i++) {
		const it = items[i];
		if (mx >= it.x - it.w/2 && mx <= it.x + it.w/2 && my >= it.y - it.h/2 && my <= it.y + it.h/2) {
			hitIndex = i; break;
		}
	}
	if (hitIndex >= 0) {
		const it = items[hitIndex];
		bird.target = { x: it.x, y: it.y, index: hitIndex };
	} else {
		// 点击空白：飞向点击点但不吞食
		bird.target = { x: mx, y: my, index: null };
	}
}

function startGame() {
	if (STATE.running) return;
	STATE.running = true; STATE.paused = false;
	overlay.classList.add('hidden');
	startBtn.disabled = true; pauseBtn.disabled = false;
	
	// 播放背景音乐（如果已启用）
	if (bgMusic && musicEnabled) {
		bgMusic.play().catch(err => {
			console.log('背景音乐播放失败:', err);
		});
	}
	
	startLoops(); spawnItem(); spawnItem();
}

function pauseGame() {
	if (!STATE.running) return;
	STATE.paused = !STATE.paused;
	if (STATE.paused) {
		clearInterval(spawnTimer);
		// 暂停背景音乐
		if (bgMusic && musicEnabled) {
			bgMusic.pause();
		}
		showToast('已暂停 (P)', '#334155');
		pauseBtn.textContent = '继续';
	} else {
		startLoops();
		// 继续播放背景音乐（如果已启用）
		if (bgMusic && musicEnabled) {
			bgMusic.play().catch(err => {
				console.log('背景音乐播放失败:', err);
			});
		}
		pauseBtn.textContent = '暂停';
		showToast('继续', '#334155');
	}
}

function resetGame() {
	cancelAnimationFrame(animationId);
	clearInterval(spawnTimer);
	STATE.running = false; STATE.paused = false;
	startBtn.disabled = false; pauseBtn.disabled = true; pauseBtn.textContent = '暂停';
	bird.target = null; items = [];
	STATE.score = 0; STATE.level = 1; STATE.correct = 0; STATE.wrong = 0; bird.size = 16; bird.x = 120; bird.y = canvas.height - 120;
	
	// 停止背景音乐
	if (bgMusic) {
		bgMusic.pause();
		bgMusic.currentTime = 0;
	}
	
	updateUI();
	overlay.classList.remove('hidden');
	draw();
}

function showToast(text, color) {
	toast.textContent = text; toast.style.background = color;
	toast.classList.remove('hidden');
	clearTimeout(showToast._t);
	showToast._t = setTimeout(() => toast.classList.add('hidden'), 1400);
}

function handleKey(e) {
	// Shift+W 切换词库管理按钮显示
	if (e.shiftKey && !e.ctrlKey && (e.key === 'w' || e.key === 'W')) {
		e.preventDefault();
		const wordBankButtons = document.getElementById('wordBankButtons');
		if (wordBankButtons) {
			const isVisible = wordBankButtons.style.display !== 'none';
			wordBankButtons.style.display = isVisible ? 'none' : 'flex';
			showToast(isVisible ? '词库管理已隐藏' : '词库管理已激活', isVisible ? '#6c757d' : '#16a34a');
		}
		return;
	}
	
	switch (e.key) {
		case 'p': case 'P': pauseGame(); break;
		case 'r': case 'R': resetGame(); break;
	}
}

// 音乐控制函数
function toggleMusic() {
	musicEnabled = !musicEnabled;
	if (musicEnabled) {
		musicBtn.textContent = '🔊';
		musicBtn.title = '关闭音乐';
		// 如果游戏正在运行且未暂停，播放音乐
		if (STATE.running && !STATE.paused && bgMusic) {
			bgMusic.play().catch(err => {
				console.log('背景音乐播放失败:', err);
			});
		}
		showToast('🔊 音乐已开启', '#16a34a');
	} else {
		musicBtn.textContent = '🔇';
		musicBtn.title = '开启音乐';
		// 停止音乐
		if (bgMusic) {
			bgMusic.pause();
		}
		showToast('🔇 音乐已关闭', '#dc2626');
	}
}

// ========== 长按打开词库导入（3秒）==========
let longPressTimer = null;
let longPressStartTime = 0;
let longPressIndicator = null;

function startLongPress(e) {
	// 如果是在游戏进行中点击词条，不触发长按
	if (STATE.running && !STATE.paused) {
		const rect = canvas.getBoundingClientRect();
		
		// 计算缩放比例
		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;
		
		// 根据缩放比例调整坐标
		const mx = (e.clientX - rect.left) * scaleX;
		const my = (e.clientY - rect.top) * scaleY;
		
		// 检查是否点击了词条
		for (const it of items) {
			if (mx >= it.x - it.w/2 && mx <= it.x + it.w/2 &&
			    my >= it.y - it.h/2 && my <= it.y + it.h/2) {
				return; // 点击了词条，不触发长按
			}
		}
	}
	
	longPressStartTime = Date.now();
	
	// 创建视觉提示
	if (!longPressIndicator) {
		longPressIndicator = document.createElement('div');
		longPressIndicator.style.cssText = `
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			background: rgba(0, 0, 0, 0.8);
			color: white;
			padding: 20px 30px;
			border-radius: 12px;
			font-size: 16px;
			font-weight: bold;
			z-index: 9999;
			pointer-events: none;
			display: none;
		`;
		longPressIndicator.innerHTML = `
			<div style="text-align: center;">
				<div style="margin-bottom: 10px;">📥 松开打开词库导入</div>
				<div style="width: 200px; height: 6px; background: rgba(255,255,255,0.3); border-radius: 3px; overflow: hidden;">
					<div id="longPressProgress" style="width: 0%; height: 100%; background: #10b981; transition: width 0.1s linear;"></div>
				</div>
			</div>
		`;
		document.body.appendChild(longPressIndicator);
	}
	
	longPressIndicator.style.display = 'block';
	const progressBar = document.getElementById('longPressProgress');
	
	// 更新进度条
	const updateProgress = () => {
		if (!longPressStartTime) return;
		
		const elapsed = Date.now() - longPressStartTime;
		const progress = Math.min((elapsed / 3000) * 100, 100);
		
		if (progressBar) {
			progressBar.style.width = progress + '%';
		}
		
		if (elapsed < 3000) {
			requestAnimationFrame(updateProgress);
		}
	};
	updateProgress();
	
	// 3秒后打开导入对话框
	longPressTimer = setTimeout(() => {
		cancelLongPress();
		openImportModal();
		showToast('📥 长按成功！打开词库导入', '#10b981');
	}, 3000);
}

function cancelLongPress() {
	if (longPressTimer) {
		clearTimeout(longPressTimer);
		longPressTimer = null;
	}
	longPressStartTime = 0;
	
	if (longPressIndicator) {
		longPressIndicator.style.display = 'none';
		const progressBar = document.getElementById('longPressProgress');
		if (progressBar) {
			progressBar.style.width = '0%';
		}
	}
}

function openImportModal() {
	if (importModal) {
		importModal.classList.remove('hidden');
		if (wordInput) wordInput.focus();
	}
}

// 事件
canvas.addEventListener('click', onClickCanvas);

// 长按事件（鼠标）
canvas.addEventListener('mousedown', startLongPress);
canvas.addEventListener('mouseup', cancelLongPress);
canvas.addEventListener('mouseleave', cancelLongPress);

// 触摸事件处理（移动端）
let touchStartTime = 0;
let touchStartPos = null;

canvas.addEventListener('touchstart', (e) => {
	const touch = e.touches[0];
	touchStartTime = Date.now();
	touchStartPos = { x: touch.clientX, y: touch.clientY };
	
	const mouseEvent = new MouseEvent('mousedown', {
		clientX: touch.clientX,
		clientY: touch.clientY
	});
	startLongPress(mouseEvent);
}, { passive: true });

canvas.addEventListener('touchend', (e) => {
	cancelLongPress();
	
	// 如果是快速点击（不是长按），触发点击事件
	const touchDuration = Date.now() - touchStartTime;
	if (touchDuration < 500 && touchStartPos) {
		const touch = e.changedTouches[0];
		const moveDistance = Math.hypot(touch.clientX - touchStartPos.x, touch.clientY - touchStartPos.y);
		
		// 如果移动距离很小，认为是点击
		if (moveDistance < 10) {
			const mouseEvent = new MouseEvent('click', {
				clientX: touch.clientX,
				clientY: touch.clientY,
				bubbles: true
			});
			onClickCanvas(mouseEvent);
		}
	}
	
	touchStartPos = null;
});

canvas.addEventListener('touchcancel', cancelLongPress);

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
resetBtn.addEventListener('click', resetGame);
overlayStart.addEventListener('click', startGame);
musicBtn.addEventListener('click', toggleMusic);
window.addEventListener('keydown', handleKey);

// ========== 导入/清除词库功能 ==========
const importBtn = document.getElementById('importBtn');
const clearBtn = document.getElementById('clearBtn');
const importModal = document.getElementById('importModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const confirmBtn = document.getElementById('confirmBtn');
const wordInput = document.getElementById('wordInput');
const autoDistractor = document.getElementById('autoDistractor');
const errorRate = document.getElementById('errorRate');

let customWordBank = null; // 自定义词库

// 打开导入对话框
if (importBtn) {
	importBtn.addEventListener('click', () => {
		importModal.classList.remove('hidden');
		wordInput.focus();
	});
}

// 关闭对话框
function closeImportModal() {
	importModal.classList.add('hidden');
	wordInput.value = '';
}
if (closeModal) closeModal.addEventListener('click', closeImportModal);
if (cancelBtn) cancelBtn.addEventListener('click', closeImportModal);

// 从本地存储加载词库
function loadWordBankFromStorage() {
	try {
		const saved = localStorage.getItem('啄木鸟_自定义词库');
		if (saved) {
			customWordBank = JSON.parse(saved);
			// 替换sampleWord函数
			window.sampleWord = function(probWrong = 0.10, forceWrong = false) {
				const wrongs = customWordBank.filter(w => !w.correct);
				const rights = customWordBank.filter(w => w.correct);
				// 如果强制错误，直接返回错误词
				if (forceWrong && wrongs.length > 0) {
					const w = wrongs[Math.floor(Math.random() * wrongs.length)];
					return { text: w.word, correct: false, right: w.right };
				}
				// 否则按概率随机
				const useWrong = Math.random() < probWrong && wrongs.length > 0;
				if (useWrong) {
					const w = wrongs[Math.floor(Math.random() * wrongs.length)];
					return { text: w.word, correct: false, right: w.right };
				}
				const r = rights[Math.floor(Math.random() * rights.length)];
				return { text: r.word, correct: true };
			};
			const correctCount = customWordBank.filter(w => w.correct).length;
			const wrongCount = customWordBank.filter(w => !w.correct).length;
			console.log(`✅ 已加载自定义词库：正确词${correctCount}，干扰项${wrongCount}`);
			console.log(`📌 默认词库已暂停使用`);
			return true;
		}
	} catch (err) {
		console.error('加载词库失败:', err);
	}
	return false;
}

// 保存词库到本地存储
function saveWordBankToStorage(wordBank) {
	try {
		localStorage.setItem('啄木鸟_自定义词库', JSON.stringify(wordBank));
		console.log('词库已保存到本地存储');
		return true;
	} catch (err) {
		console.error('保存词库失败:', err);
		showToast('保存失败：存储空间不足', '#dc2626');
		return false;
	}
}

// 确认导入
if (confirmBtn) {
	confirmBtn.addEventListener('click', () => {
		const text = wordInput.value.trim();
		if (!text) {
			showToast('请输入词库内容', '#dc2626');
			return;
		}
		
		try {
			const lines = text.split('\n').map(l => l.trim()).filter(l => l);
			const correctWords = [];
			const distractors = [];
			
			// 解析输入
			for (const line of lines) {
				if (line.includes('/')) {
					const [wrong, right] = line.split('/').map(s => s.trim());
					distractors.push({ word: wrong, correct: false, right: right });
					if (!correctWords.find(w => w.word === right)) {
						correctWords.push({ word: right, correct: true });
					}
				} else {
					correctWords.push({ word: line, correct: true });
				}
			}
			
			// 自动生成干扰项
			if (autoDistractor.checked && correctWords.length > 0) {
				const rate = parseInt(errorRate.value) / 100;
				const confuse = {
					'朗':'郎','郎':'朗','蕴':'酝','酝':'蕴','序':'絮','絮':'序',
					'青':'清','清':'青','旷':'犷','犷':'旷','脆':'悴','悴':'脆',
					'省':'醒','醒':'省','悦':'说','说':'悦','罔':'惘','惘':'罔',
					'殆':'怠','怠':'殆','优':'忧','忧':'优','造':'凿','凿':'造',
					'岐':'歧','歧':'岐','尔':'而','而':'尔','新':'欣','欣':'新'
				};
				const count = Math.ceil(correctWords.length * rate);
				for (let i = 0; i < count && i < correctWords.length; i++) {
					const word = correctWords[i].word;
					let wrong = null;
					for (let j = 0; j < word.length; j++) {
						if (confuse[word[j]]) {
							wrong = word.substring(0, j) + confuse[word[j]] + word.substring(j + 1);
							break;
						}
					}
					if (!wrong && word.length === 2) {
						wrong = word[1] + word[0];
					}
					if (wrong && !distractors.find(d => d.word === wrong)) {
						distractors.push({ word: wrong, correct: false, right: word });
					}
				}
			}
			
			// 合并并打乱
			customWordBank = [...correctWords, ...distractors];
			for (let i = customWordBank.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[customWordBank[i], customWordBank[j]] = [customWordBank[j], customWordBank[i]];
			}
			
			// 保存到本地存储
			saveWordBankToStorage(customWordBank);
			
			// 替换sampleWord函数
			window.sampleWord = function(probWrong = 0.10, forceWrong = false) {
				const wrongs = customWordBank.filter(w => !w.correct);
				const rights = customWordBank.filter(w => w.correct);
				// 如果强制错误，直接返回错误词
				if (forceWrong && wrongs.length > 0) {
					const w = wrongs[Math.floor(Math.random() * wrongs.length)];
					return { text: w.word, correct: false, right: w.right };
				}
				// 否则按概率随机
				const useWrong = Math.random() < probWrong && wrongs.length > 0;
				if (useWrong) {
					const w = wrongs[Math.floor(Math.random() * wrongs.length)];
					return { text: w.word, correct: false, right: w.right };
				}
				const r = rights[Math.floor(Math.random() * rights.length)];
				return { text: r.word, correct: true };
			};
			
			closeImportModal();
			resetGame();
			updateWordBankStatus(); // 更新状态显示
			showToast(`✅ 自定义词库已启用！（默认词库已暂停）\n正确词：${correctWords.length}，干扰项：${distractors.length}`, '#16a34a');
		} catch (err) {
			console.error(err);
			showToast('导入失败：' + err.message, '#dc2626');
		}
	});
}

// 清除词库
if (clearBtn) {
	clearBtn.addEventListener('click', () => {
		if (!customWordBank) {
			showToast('当前使用默认词库', '#f59e0b');
			return;
		}
		if (confirm('确定要清除自定义词库并恢复默认词库吗？\n（自定义词库将被删除）')) {
			customWordBank = null;
			// 从本地存储中删除
			localStorage.removeItem('啄木鸟_自定义词库');
			showToast('✅ 已恢复默认词库（自定义词库已暂停）\n即将刷新...', '#f59e0b');
			// 延迟刷新，让用户看到提示
			setTimeout(() => location.reload(), 1000);
		}
	});
}

// 更新词库状态显示
function updateWordBankStatus() {
	const statusEl = document.getElementById('wordBankStatus');
	if (!statusEl) return;
	
	if (customWordBank) {
		const correctCount = customWordBank.filter(w => w.correct).length;
		const wrongCount = customWordBank.filter(w => !w.correct).length;
		statusEl.textContent = `📚 自定义词库（${correctCount}词）`;
		statusEl.style.backgroundColor = '#dbeafe';
		statusEl.style.color = '#1e40af';
		statusEl.title = `自定义词库：${correctCount}个正确词，${wrongCount}个干扰项\n默认词库已暂停`;
	} else {
		statusEl.textContent = '📚 默认词库';
		statusEl.style.backgroundColor = '#fef3c7';
		statusEl.style.color = '#92400e';
		statusEl.title = '七年级期中词库（约300+词条）';
	}
}

// 页面加载时尝试从本地存储加载词库
const hasCustomWordBank = loadWordBankFromStorage();
if (hasCustomWordBank) {
	const correctCount = customWordBank.filter(w => w.correct).length;
	const wrongCount = customWordBank.filter(w => !w.correct).length;
	// 在游戏开始时提示用户当前使用的词库
	console.log(`✅ 使用自定义词库：${correctCount}个正确词，${wrongCount}个干扰项`);
	console.log(`📌 默认词库已暂停（七年级期中词库不会出现）`);
	
	// 在开始游戏时显示提示
	const originalStartGame = startGame;
	startGame = function() {
		if (hasCustomWordBank && !STATE.running) {
			showToast('📚 当前使用：自定义词库（默认词库已暂停）', '#2563eb');
		}
		originalStartGame.call(this);
	};
} else {
	console.log(`📚 使用默认词库：七年级期中版（约300+词条）`);
	
	// 在开始游戏时显示提示
	const originalStartGame = startGame;
	startGame = function() {
		if (!customWordBank && !STATE.running) {
			showToast('📚 当前使用：默认词库（七年级期中版）', '#2563eb');
		}
		originalStartGame.call(this);
	};
}

// 更新状态显示
updateWordBankStatus();

// 初始
resetGame();
