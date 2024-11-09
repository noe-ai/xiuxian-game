window.characterSystem = {
    // 预设角色模板
    characterTemplates: [
        {
            type: "剑修",
            description: "天生剑骨，对剑道有着超乎常人的悟性",
            skills: ['基础剑法', '御剑术'],
            specialty: "剑法修炼速度提升50%",
            bonuses: {
                powerRate: 1.5,
                spiritRate: 1.2
            },
            attributeWeights: {
                spirit: 1.2,    // 偏重神识
                strength: 1.0,
                agility: 1.1,   // 较高敏捷
                talent: 1.0
            }
        },
        {
            type: "丹修",
            description: "天生药骨，对丹道有着独特的感知",
            skills: ['基础丹术', '药理'],
            specialty: "炼丹成功率提升30%",
            bonuses: {
                itemRate: 1.3,
                spiritRate: 1.3
            },
            attributeWeights: {
                spirit: 1.1,
                strength: 0.8,
                agility: 1.0,
                talent: 1.3     // 偏重悟性
            }
        },
        {
            type: "体修",
            description: "百炼之体，肉身蕴含无穷潜力",
            skills: ['炼体术', '金刚不坏'],
            specialty: "体魄修炼速度提升40%",
            bonuses: {
                strengthRate: 1.4,
                powerRate: 1.2
            },
            attributeWeights: {
                spirit: 0.8,
                strength: 1.4,  // 偏重体魄
                agility: 1.1,
                talent: 0.9
            }
        }
    ],

    // 随机名字生成
    nameGenerators: {
        firstName: ['青', '玄', '紫', '白', '赤', '金', '木', '水', '火', '土'],
        middleName: ['云', '霄', '天', '地', '山', '河', '海', '月', '星', '日'],
        lastName: ['子', '君', '道', '仙', '真', '人', '童', '郎', '客', '生']
    },

    generateRandomName() {
        const { firstName, middleName, lastName } = this.nameGenerators;
        return firstName[Math.floor(Math.random() * firstName.length)] +
               middleName[Math.floor(Math.random() * middleName.length)] +
               lastName[Math.floor(Math.random() * lastName.length)];
    },

    // 生成随机属性
    generateRandomAttributes(weights = {}) {
        const baseMin = 8;  // 最小基础值
        const baseMax = 15; // 最大基础值
        const attrs = {};
        
        // 为每个属性生成随机值
        ['spirit', 'strength', 'agility', 'talent'].forEach(attr => {
            const weight = weights[attr] || 1;
            const min = Math.floor(baseMin * weight);
            const max = Math.floor(baseMax * weight);
            attrs[attr] = Math.floor(Math.random() * (max - min + 1)) + min;
        });

        return attrs;
    },

    // 生成随机角色
    generateRandomCharacter(customName = '') {
        // 随机选择一个角色模板
        const template = this.characterTemplates[
            Math.floor(Math.random() * this.characterTemplates.length)
        ];

        // 生成属性
        const attributes = this.generateRandomAttributes(template.attributeWeights);

        return {
            name: customName || this.generateRandomName(),
            type: template.type,
            description: template.description,
            attributes: attributes,
            skills: template.skills,
            specialty: template.specialty,
            bonuses: template.bonuses
        };
    }
}; 