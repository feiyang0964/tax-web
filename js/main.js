// 等待DOM加载完成
$(document).ready(function() {
    // ===== 1. 初始化世界地图（底层） =====
    $('#world-map').vectorMap({
        map: 'world_mill',
        backgroundColor: '#f5f7fa',
        borderColor: '#ffffff',
        borderWidth: 1,
        borderOpacity: 0.8,
        
        regionStyle: {
            initial: {
                fill: '#95a5a6',
                stroke: '#ffffff',
                strokeWidth: 1
            },
            hover: {
                fill: '#3498db',
                stroke: '#ffffff',
                strokeWidth: 1
            }
        },
        
        series: {
            regions: [{
                values: {
                    'US': '#3498db'
                },
                attribute: 'fill'
            }]
        },
        
        onRegionClick: function(event, code) {
            if (code !== 'US') {
                event.preventDefault();
                
                const countryMessages = {
                    'CA': '🇨🇦 加拿大税务信息即将上线，敬请期待！',
                    'GB': '🇬🇧 英国税务信息即将上线，敬请期待！',
                    'AU': '🇦🇺 澳大利亚税务信息即将上线，敬请期待！',
                    'DE': '🇩🇪 德国税务信息即将上线，敬请期待！',
                    'FR': '🇫🇷 法国税务信息即将上线，敬请期待！',
                    'JP': '🇯🇵 日本税务信息即将上线，敬请期待！'
                };
                
                alert(countryMessages[code] || '该地区税务信息即将上线，敬请期待！');
            }
        }
    });

    // ===== 2. 初始化美国分州地图 =====
    $('#us-map').vectorMap({
        map: 'us_mill_en',
        backgroundColor: 'transparent',
        borderColor: '#ffffff',
        borderWidth: 1,
        borderOpacity: 0.8,
        color: '#3498db',
        hoverColor: '#e67e22',
        hoverOpacity: 0.8,
        
        series: {
            regions: [{
                values: {
                    'US-CA': '#e74c3c',
                    'US-WA': '#e74c3c'
                },
                attribute: 'fill'
            }]
        },
        
        onRegionClick: function(event, code) {
            event.preventDefault();
            
            if (code === 'US-CA') {
                window.location.href = 'pages/us-ca.html';
            } else if (code === 'US-WA') {
                window.location.href = 'pages/us-wa.html';
            } else {
                const stateName = getStateName(code);
                alert(`${stateName} 税务信息即将上线，敬请期待！`);
            }
        },
        
        onRegionLabelShow: function(event, label, code) {
            const stateName = getStateName(code);
            
            if (code === 'US-CA' || code === 'US-WA') {
                label.html(`${stateName} - 点击查看详情`);
            } else {
                label.html(`${stateName} - 即将上线`);
            }
        }
    });

    // ===== 3. 视图控制（带提示） =====
    $('#view-global').click(function() {
        $(this).addClass('active');
        $('#view-us').removeClass('active');
        alert('🌍 全球视图：点击其他国家可查看开发进度');
    });
    
    $('#view-us').click(function() {
        $(this).addClass('active');
        $('#view-global').removeClass('active');
        alert('🇺🇸 美国视图：红色州(CA/WA)可直接点击跳转');
    });

    // ===== 4. 更新时间 =====
    function updateDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const dateStr = `${year}年${month}月${day}日`;
        $('#update-time').text(dateStr);
    }
    updateDate();

    // ===== 5. 卡片点击事件（如果没用onclick可以启用） =====
    // 已注释掉，避免与HTML中的onclick冲突
    /*
    $('.region-card.us-highlight').click(function() {
        const stateName = $(this).find('.region-name').text().trim();
        alert(`${stateName} 税务信息即将上线，敬请期待！`);
    });
    
    $('.region-card:not(.us-highlight):not(.ca):not(.wa)').click(function() {
        const countryName = $(this).find('.region-name').text().trim();
        alert(`${countryName} 税务信息即将上线，敬请期待！`);
    });
    */

    // ===== 6. AI小助手初始化 =====
    initAIAssistant();
});

// ===== AI小助手模块 =====
function initAIAssistant() {
    // AI对话悬浮窗控制
    $('#ai-chat-toggle').click(function() {
        $('#ai-chat-window').toggleClass('show');
    });
    
    $('#ai-chat-close').click(function() {
        $('#ai-chat-window').removeClass('show');
    });
    
    // 发送消息（修正ID）
    $('#ai-chat-send').click(function() {
        sendAIMessage();
    });
    
    // 回车发送
    $('#ai-chat-input input').keypress(function(e) {
        if (e.which === 13) {
            sendAIMessage();
        }
    });
}

// 发送消息到AI助手
function sendAIMessage() {
    const input = $('#ai-chat-input input');
    const message = input.val().trim();
    if (!message) return;
    
    const messagesDiv = $('#ai-chat-messages');
    
    messagesDiv.append(`
        <div class="message user-message">${escapeHtml(message)}</div>
    `);
    
    input.val('');
    messagesDiv.scrollTop(messagesDiv[0].scrollHeight);
    
    setTimeout(function() {
        getAIResponse(message);
    }, 500);
}

// 获取AI回复
function getAIResponse(userMessage) {
    const messagesDiv = $('#ai-chat-messages');
    
    messagesDiv.append(`
        <div class="message ai-message">🤔 正在查询...</div>
    `);
    
    setTimeout(function() {
        $('.ai-message:contains("正在查询")').last().remove();
        
        let reply = generateDemoReply(userMessage);
        
        messagesDiv.append(`
            <div class="message ai-message">${reply}</div>
        `);
        
        messagesDiv.scrollTop(messagesDiv[0].scrollHeight);
    }, 800);
}

// 回复生成
function generateDemoReply(message) {
    const lowerMsg = message.toLowerCase();
    const currentPage = window.location.pathname;
    const isCAPage = currentPage.includes('us-ca.html');
    const isWAPage = currentPage.includes('us-wa.html');
    
    // 如果在CA详情页
    if (isCAPage) {
        if (lowerMsg.includes('税率') || lowerMsg.includes('rate')) {
            return '加州 (CA) 销售税基准税率 7.25%，加上地方附加税后综合税率 7.25%-10.75%。企业所得税率 8.84%。';
        } else if (lowerMsg.includes('截止') || lowerMsg.includes('deadline')) {
            return '加州 (CA) 销售税申报截止日：月度申报为次月20日；公司税截止日：4月15日。';
        } else if (lowerMsg.includes('sop') || lowerMsg.includes('步骤')) {
            return '加州报税SOP：1.下载数据 2.导入模板 3.PQ刷新 4.核对 5.CDTFA官网申报 6.保存回执';
        } else {
            return '我是加州税务助手，你可以问我：销售税率、企业所得税、截止日、SOP步骤等。';
        }
    }
    
    // 如果在WA详情页
    if (isWAPage) {
        if (lowerMsg.includes('税率') || lowerMsg.includes('rate')) {
            return '华盛顿州 (WA) 销售税基准税率 6.5%，加上地方附加税后综合税率 6.5%-10.4%。B&O税零售业0.471%，服务业1.5%。';
        } else if (lowerMsg.includes('截止') || lowerMsg.includes('deadline')) {
            return '华盛顿州 (WA) 销售税/B&O税申报截止日：月度申报为次月25日。';
        } else if (lowerMsg.includes('b&o') || lowerMsg.includes('营业税')) {
            return 'B&O税：零售业0.471%，制造业0.484%，服务业1.5%，按总收入全额计税，无成本扣除。';
        } else {
            return '我是华州税务助手，你可以问我：销售税率、B&O税、截止日、SOP步骤等。';
        }
    }
    
    // 首页通用回复
    if (lowerMsg.includes('税率') || lowerMsg.includes('rate')) {
        if (lowerMsg.includes('ca') || lowerMsg.includes('加州')) {
            return '加州 (CA) 销售税基准税率 7.25% + 地方税，企业所得税 8.84%。';
        } else if (lowerMsg.includes('wa') || lowerMsg.includes('华州')) {
            return '华盛顿州 (WA) 销售税基准税率 6.5% + 地方税，B&O税零售0.471%。';
        } else {
            return '你想查询哪个州的税率？我可以帮你查 CA（加州）或 WA（华盛顿州）。';
        }
    }
    
    if (lowerMsg.includes('截止') || lowerMsg.includes('deadline')) {
        return 'CA销售税：次月20日；WA销售税：次月25日；公司税统一4月15日。';
    }
    
    if (lowerMsg.includes('sop') || lowerMsg.includes('步骤')) {
        return '报税基本步骤：1.下载数据 2.导入模板 3.PQ刷新 4.核对 5.官网申报 6.保存回执';
    }
    
    if (lowerMsg.includes('更新') || lowerMsg.includes('提醒')) {
        return '税率更新提醒功能即将上线，未来会主动推送变化通知。';
    }
    
    return '你好！我是税务AI助手，可以帮你查询：\n• 各州税率\n• 申报截止日\n• SOP步骤\n• 税率变化提醒';
}

// 防XSS转义
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 州名映射
function getStateName(code) {
    const stateNames = {
        'US-AL': '阿拉巴马州 (AL)',
        'US-AK': '阿拉斯加州 (AK)',
        'US-AZ': '亚利桑那州 (AZ)',
        'US-AR': '阿肯色州 (AR)',
        'US-CA': '加利福尼亚州 (CA)',
        'US-CO': '科罗拉多州 (CO)',
        'US-CT': '康涅狄格州 (CT)',
        'US-DE': '特拉华州 (DE)',
        'US-FL': '佛罗里达州 (FL)',
        'US-GA': '佐治亚州 (GA)',
        'US-HI': '夏威夷州 (HI)',
        'US-ID': '爱达荷州 (ID)',
        'US-IL': '伊利诺伊州 (IL)',
        'US-IN': '印第安纳州 (IN)',
        'US-IA': '爱荷华州 (IA)',
        'US-KS': '堪萨斯州 (KS)',
        'US-KY': '肯塔基州 (KY)',
        'US-LA': '路易斯安那州 (LA)',
        'US-ME': '缅因州 (ME)',
        'US-MD': '马里兰州 (MD)',
        'US-MA': '马萨诸塞州 (MA)',
        'US-MI': '密歇根州 (MI)',
        'US-MN': '明尼苏达州 (MN)',
        'US-MS': '密西西比州 (MS)',
        'US-MO': '密苏里州 (MO)',
        'US-MT': '蒙大拿州 (MT)',
        'US-NE': '内布拉斯加州 (NE)',
        'US-NV': '内华达州 (NV)',
        'US-NH': '新罕布什尔州 (NH)',
        'US-NJ': '新泽西州 (NJ)',
        'US-NM': '新墨西哥州 (NM)',
        'US-NY': '纽约州 (NY)',
        'US-NC': '北卡罗来纳州 (NC)',
        'US-ND': '北达科他州 (ND)',
        'US-OH': '俄亥俄州 (OH)',
        'US-OK': '俄克拉荷马州 (OK)',
        'US-OR': '俄勒冈州 (OR)',
        'US-PA': '宾夕法尼亚州 (PA)',
        'US-RI': '罗德岛州 (RI)',
        'US-SC': '南卡罗来纳州 (SC)',
        'US-SD': '南达科他州 (SD)',
        'US-TN': '田纳西州 (TN)',
        'US-TX': '德克萨斯州 (TX)',
        'US-UT': '犹他州 (UT)',
        'US-VT': '佛蒙特州 (VT)',
        'US-VA': '弗吉尼亚州 (VA)',
        'US-WA': '华盛顿州 (WA)',
        'US-WV': '西弗吉尼亚州 (WV)',
        'US-WI': '威斯康星州 (WI)',
        'US-WY': '怀俄明州 (WY)',
        'US-DC': '华盛顿特区 (DC)'
    };
    return stateNames[code] || code.replace('US-', '') + '州';
}