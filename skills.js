window.skillSystem = {
    skills: {
        '基础剑法': {
            name: '基础剑法',
            description: '最基础的剑法，可提升修炼速度',
            effect: {
                type: 'passive',
                power: 1.2,
                description: '修炼速度提升20%'
            }
        },
        '御剑术': {
            name: '御剑术',
            description: '御剑飞行的基础',
            effect: {
                type: 'passive',
                spirit: 1.3,
                description: '神识提升30%'
            }
        },
        '基础丹术': {
            name: '基础丹术',
            description: '炼丹的基础技巧',
            effect: {
                type: 'passive',
                itemRate: 1.2,
                description: '物品获取率提升20%'
            }
        },
        '药理': {
            name: '药理',
            description: '对药材的深入理解',
            effect: {
                type: 'active',
                cooldown: 300,
                description: '使用后30分钟内物品获取翻倍'
            }
        },
        '炼体术': {
            name: '炼体术',
            description: '锻炼体魄的基本功法',
            effect: {
                type: 'passive',
                strength: 1.2,
                description: '体魄提升速度增加20%'
            }
        },
        '金刚不坏': {
            name: '金刚不坏',
            description: '强化肉身的神通',
            effect: {
                type: 'active',
                cooldown: 600,
                description: '使用后10分钟内体魄提升翻倍'
            }
        }
    },

    // 技能效果计算
    calculateSkillEffect(skill, baseValue) {
        if (skill.effect.type === 'passive') {
            return baseValue * (skill.effect.power || 1);
        }
        return baseValue;
    }
}; 