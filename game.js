class Game {
    constructor() {
        // 基础属性
        this.power = 0;
        this.spirit = 0;
        this.strength = 0;
        this.talent = 0;
        this.level = '凡人';
        
        // 修炼方式
        this.dailyActivities = [
            { 
                name: '打坐', 
                power: 1,
                gains: { spirit: 0.5 }
            },
            { 
                name: '习武', 
                power: 1,
                gains: { strength: 0.5 }
            },
            { 
                name: '采药', 
                power: 0.8,
                gains: { spirit: 0.2 }
            },
            { 
                name: '寻宝', 
                power: 0.8,
                gains: { strength: 0.2 }
            }
        ];
        this.currentActivity = this.dailyActivities[0];
        
        // 修炼状态
        this.isCultivating = false;
        this.cultivateInterval = null;
        
        // 添加故事相关状态
        this.unlockedStories = new Set();  // 记录已触发的主线剧情
        this.lastEventTime = Date.now();   // 记录上次��件触发时间
        this.eventCooldown = 2000;         // 事件冷却时间（毫秒）
        
        // 添加背包系统
        this.inventory = {
            '灵石': { 
                count: 0, 
                effect: '增加100点修为和1点根骨',
                use: () => {
                    this.power += 100;
                    this.talent += 1;  // 增加根骨值
                    this.showMessage('使用灵石，修为+100，根骨+1');
                    this.updateUI();
                }
            },
            '丹药': { 
                count: 0, 
                effect: '提升修炼效率50%，持续300秒',
                use: () => {
                    this.powerMultiplier = 1.5;
                    this.showMessage('服用丹药，修炼效率提升50%');
                    setTimeout(() => {
                        this.powerMultiplier = 1;
                        this.showMessage('丹药效果已消失');
                        this.updateUI();
                    }, 300000);
                }
            },
            '灵草': { 
                count: 0, 
                effect: '提升体魄和神识各10点',
                use: () => {
                    this.spirit += 10;
                    this.strength += 10;
                    this.showMessage('���用灵草，神识和体魄各+10');
                    this.updateUI();
                }
            }
        };
        
        // 探索系统
        this.isExploring = false;
        this.exploreInterval = null;
        this.exploreDuration = 60000; // 探索持续时间（毫秒）
        
        // 添加技能系统
        this.skills = new Set();  // 已学会的技能
        this.skillPoints = 0;     // 技能点数
        
        // 添加升级系统
        this.levels = [
            {name: '凡人', threshold: 0},
            {name: '练气初期', threshold: 100, reward: 1},  // 突破给1个技能点
            {name: '练气中期', threshold: 500, reward: 2},
            {name: '练气后期', threshold: 1000, reward: 2},
            {name: '筑基期', threshold: 5000, reward: 3},
            {name: '金丹期', threshold: 10000, reward: 3}
        ];
        
        // 初始化
        this.bindEvents();
        this.showInitialStory();
        this.updateUI();
        
        // 绑定快速操作按钮
        this.bindQuickActions();
    }

    bindEvents() {
        // 修炼按钮
        const cultivateBtn = document.getElementById('cultivate');
        cultivateBtn.addEventListener('click', () => {
            if (!this.isCultivating) {
                this.startCultivation();
            } else {
                this.stopCultivation();
            }
        });
        cultivateBtn.textContent = `开始${this.currentActivity.name}`;

        // 切换修炼方式按钮
        document.getElementById('change-method').addEventListener('click', () => {
            this.changeActivity();
        });

        // 探索按钮
        const exploreBtn = document.getElementById('explore');
        exploreBtn.addEventListener('click', () => this.toggleExplore());
        
        // 背包按钮
        const inventoryBtn = document.getElementById('inventory-btn');
        inventoryBtn.addEventListener('click', () => this.toggleInventory());
        
        // 背包关闭按钮
        const closeBtn = document.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => this.toggleInventory());
    }

    startCultivation() {
        this.isCultivating = true;
        document.getElementById('cultivate').textContent = `停止${this.currentActivity.name}`;
        
        this.cultivateInterval = setInterval(() => {
            // 基础修为增长
            this.power += this.currentActivity.power;
            
            // 属性增益
            if (this.currentActivity.gains.spirit) {
                this.spirit += this.currentActivity.gains.spirit;
            }
            if (this.currentActivity.gains.strength) {
                this.strength += this.currentActivity.gains.strength;
            }
            
            // 每次修炼都触发事件
            this.triggerDailyEvent();
            
            // 检查境界突破
            this.checkBreakthrough();
            
            this.updateUI();
        }, 1000);
    }

    stopCultivation() {
        this.isCultivating = false;
        document.getElementById('cultivate').textContent = `开始${this.currentActivity.name}`;
        clearInterval(this.cultivateInterval);
    }

    changeActivity() {
        const currentIndex = this.dailyActivities.indexOf(this.currentActivity);
        const nextIndex = (currentIndex + 1) % this.dailyActivities.length;
        this.currentActivity = this.dailyActivities[nextIndex];
        
        // 更新修炼按钮文本
        document.getElementById('cultivate').textContent = 
            `${this.currentActivity.name}修炼`;
        
        this.updateUI();
    }

    updateUI() {
        document.getElementById('power').textContent = Math.floor(this.power);
        document.getElementById('spirit').textContent = Math.floor(this.spirit);
        document.getElementById('strength').textContent = Math.floor(this.strength);
        document.getElementById('talent').textContent = Math.floor(this.talent);  // 更新根骨显示
        document.getElementById('level').textContent = this.level;
        document.getElementById('current-activity').textContent = this.currentActivity.name;
    }

    showInitialStory() {
        const storyContent = document.getElementById('story-content');
        if (storyContent && storySystem.prologue) {
            storyContent.innerHTML = '';
            
            // 将序言文本按行分割
            const lines = storySystem.prologue.text.split('\n')
                .filter(line => line.trim())
                .map(line => line.trim());
            
            // 逐行显示序言
            lines.forEach((line, index) => {
                setTimeout(() => {
                    const paragraph = document.createElement('div');
                    paragraph.className = 'story-event main';
                    paragraph.innerHTML = `<div class="story-text">${line}</div>`;
                    storyContent.appendChild(paragraph);
                }, index * 1000); // 每行延迟1秒显示
            });
        }
    }

    // 事件检查方法
    checkEvents() {
        const now = Date.now();
        if (now - this.lastEventTime < this.eventCooldown) return;

        // 1. 检查境界突破（�����级最高）
        if (this.checkBreakthrough()) {
            this.lastEventTime = now;
            return;
        }

        // 2. 检查特殊事件（10%概率）
        if (Math.random() < 0.1) {
            if (this.triggerSpecialEvent()) {
                this.lastEventTime = now;
                return;
            }
        }

        // 3. 触发日常事件（90%概率）
        if (Math.random() < 0.9) {
            this.triggerDailyEvent();
        }
        
        this.lastEventTime = now;
    }

    // 境界突破检查
    checkBreakthrough() {
        const stories = storySystem.breakthroughStories;
        for (let [id, story] of Object.entries(stories)) {
            if (!this.unlockedStories.has(id) && this.power >= story.trigger) {
                this.showMainStory(id, story);
                this.unlockedStories.add(id);
                return true;
            }
        }
        return false;
    }

    // 特殊事件触发
    triggerSpecialEvent() {
        const availableEvents = storySystem.specialEvents.filter(event => 
            !this.unlockedStories.has(event.id) && this.meetConditions(event.condition)
        );

        if (availableEvents.length > 0) {
            const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];
            this.showSpecialEvent(event);
            return true;
        }
        return false;
    }

    // 日常事件触发
    triggerDailyEvent() {
        const events = storySystem.dailyEvents[this.currentActivity.name];
        if (!events || events.length === 0) return;

        const event = events[Math.floor(Math.random() * events.length)];
        const storyContent = document.getElementById('story-content');
        
        // 创建事件元素
        const eventDiv = document.createElement('div');
        eventDiv.className = 'story-event daily';
        eventDiv.innerHTML = `<div class="story-text">${event.text}</div>`;
        
        // 将新事件插入到顶部
        if (storyContent.firstChild) {
            storyContent.insertBefore(eventDiv, storyContent.firstChild);
        } else {
            storyContent.appendChild(eventDiv);
        }

        // 处理事件效果
        if (event.effect) {
            setTimeout(() => {
                const rewardDiv = document.createElement('div');
                rewardDiv.className = 'story-event reward';
                rewardDiv.innerHTML = `<div class="story-text">${event.effect}</div>`;
                storyContent.insertBefore(rewardDiv, storyContent.firstChild);
            }, 1000);
        }

        // 应用属性增益
        if (event.power) this.power += event.power;
        if (event.spirit) this.spirit += event.spirit;
        if (event.strength) this.strength += event.strength;
        if (event.items) {
            Object.entries(event.items).forEach(([item, count]) => {
                this.inventory[item].count += count;
            });
        }

        this.updateUI();
    }

    // 显示消息
    showMessage(text) {
        const storyContent = document.getElementById('story-content');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'story-event daily';
        messageDiv.innerHTML = `<div class="story-text">${text}</div>`;
        
        if (storyContent.firstChild) {
            storyContent.insertBefore(messageDiv, storyContent.firstChild);
        } else {
            storyContent.appendChild(messageDiv);
        }
    }

    // 探索系统
    toggleExplore() {
        if (this.isExploring) return;
        
        // 触发一次探索事件
        const events = [
            {
                text: "你在山涧处发现了一簇不知名的灵芝...",
                reward: { item: '灵草', count: 2 }
            },
            {
                text: "溪水冲刷下露出一块温润的玉石...",
                reward: { item: '灵石', count: 1 }
            },
            {
                text: "一只小狐狸留下了一颗晶莹的珠子...",
                reward: { item: '灵石', count: 2 }
            },
            {
                text: "你在废弃的草庐中找到一个布满尘土的盒子...",
                reward: { item: '丹药', count: 1 }
            },
            {
                text: "一阵微风吹过，卷来一张古旧的符箓...",
                reward: { power: 50, description: "获得一些感悟" }
            }
        ];

        // 随机选择一个事件
        const event = events[Math.floor(Math.random() * events.length)];
        
        // 显示事件文本
        this.showMessage(event.text);
        
        // 处理奖励
        if (event.reward) {
            setTimeout(() => {
                if (event.reward.item) {
                    this.inventory[event.reward.item].count += event.reward.count;
                    this.showMessage(`获得：${event.reward.item} x${event.reward.count}`);
                }
                if (event.reward.power) {
                    this.power += event.reward.power;
                    this.showMessage(event.reward.description);
                }
                this.updateUI();
                this.updateInventoryDisplay();
            }, 1000);
        }
    }

    giveExploreReward() {
        const rewards = [
            { item: '灵石', chance: 0.4, count: 1, text: "你找到了一块灵石" },
            { item: '丹药', chance: 0.3, count: 1, text: "你发现了一颗丹药" },
            { item: '灵草', chance: 0.3, count: 1, text: "你采集到了一株灵草" }
        ];
        
        rewards.forEach(reward => {
            if (Math.random() < reward.chance) {
                this.inventory[reward.item].count += reward.count;
                this.showMessage(reward.text);
            }
        });
        
        this.updateInventoryDisplay();
    }

    // 背包系统
    toggleInventory() {
        const panel = document.getElementById('inventory-panel');
        panel.classList.toggle('active');
        if (panel.classList.contains('active')) {
            this.updateInventoryDisplay();
        }
    }

    updateInventoryDisplay() {
        const content = document.getElementById('inventory-content');
        content.innerHTML = '';
        
        Object.entries(this.inventory).forEach(([itemName, item]) => {
            if (item.count > 0) {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'inventory-item';
                itemDiv.innerHTML = `
                    <div class="item-name">${itemName} x${item.count}</div>
                    <div class="item-effect">${item.effect}</div>
                    <button class="use-btn">使用</button>
                `;
                
                // 添加使用按钮事件监听
                const useBtn = itemDiv.querySelector('.use-btn');
                useBtn.addEventListener('click', () => {
                    this.useItem(itemName);
                });
                
                content.appendChild(itemDiv);
            }
        });
    }

    useItem(itemName) {
        const item = this.inventory[itemName];
        if (item && item.count > 0) {
            item.count--;
            item.use();
            this.updateUI();
            this.updateInventoryDisplay();
        }
    }

    bindQuickActions() {
        // 冥想：增加神识
        document.getElementById('meditate').addEventListener('click', () => {
            this.spirit += 1;
            this.showMessage("静心冥想，神识+1");
            this.updateUI();
        });

        // 练习：增加体魄
        document.getElementById('practice').addEventListener('click', () => {
            this.strength += 1;
            this.showMessage("勤加练习，体魄+1");
            this.updateUI();
        });

        // 感悟：增加修为
        document.getElementById('comprehend').addEventListener('click', () => {
            this.power += 5;
            this.showMessage("顿有感悟，修为+5");
            this.updateUI();
        });
    }

    // 检查升级
    checkLevelUp() {
        for (let i = this.levels.length - 1; i >= 0; i--) {
            const level = this.levels[i];
            if (this.power >= level.threshold && this.level !== level.name) {
                // 升级奖励
                if (level.reward) {
                    this.skillPoints += level.reward;
                    this.showMessage(`突破成功！获得${level.reward}个技能点`);
                }
                this.level = level.name;
                return true;
            }
        }
        return false;
    }

    // 显示技能面板
    showSkillPanel() {
        const content = document.getElementById('story-content');
        content.innerHTML = `
            <div class="skill-panel">
                <h3>可学习的技能（技能点：${this.skillPoints}）</h3>
                <div class="skill-list">
                    ${this.getAvailableSkills()}
                </div>
            </div>
        `;
    }

    // 获取可学习的技能列表
    getAvailableSkills() {
        return Object.entries(skillSystem.skills)
            .filter(([name]) => !this.skills.has(name))
            .map(([name, skill]) => `
                <div class="skill-item">
                    <div class="skill-info">
                        <div class="skill-name">${skill.name}</div>
                        <div class="skill-desc">${skill.description}</div>
                        <div class="skill-effect">${skill.effect.description}</div>
                    </div>
                    ${this.skillPoints > 0 ? 
                        `<button onclick="game.learnSkill('${name}')">学习</button>` : 
                        '<button disabled>技能点不足</button>'}
                </div>
            `).join('');
    }

    // 学习技能
    learnSkill(skillName) {
        if (this.skillPoints > 0 && !this.skills.has(skillName)) {
            this.skills.add(skillName);
            this.skillPoints--;
            this.showMessage(`学会了${skillName}！`);
            this.showSkillPanel();  // 刷新技能面板
            this.updateUI();
        }
    }
}

// 初始化游戏
window.onload = () => new Game(); 