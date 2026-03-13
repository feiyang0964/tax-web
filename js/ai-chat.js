// ========== AI助手功能开关 ==========
// false: 仅展示提示（默认）
// true: 启用完整回复功能
const AI_ASSISTANT_ENABLED = false; // 后续确认后改为true

// ========== 防XSS转义函数 ==========
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ========== 获取当前页面类型 ==========
function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('us-ca.html')) return 'ca';
    if (path.includes('us-wa.html')) return 'wa';
    return 'home';
}

// ========== AI对话开关（统一用class控制）==========
document.getElementById('ai-chat-toggle').addEventListener('click', function() {
    document.getElementById('ai-chat-window').classList.toggle('show');
});

document.getElementById('ai-chat-close').addEventListener('click', function() {
    document.getElementById('ai-chat-window').classList.remove('show');
});

// ========== 回车发送消息 ==========
document.getElementById('ai-chat-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendAIMessage();
    }
});

// ========== 发送AI消息 ==========
async function sendAIMessage() {
    const input = document.getElementById('ai-chat-input');
    const message = input.value.trim();
    if (!message) return;

    const messagesContainer = document.getElementById('ai-chat-messages');
    const currentPage = getCurrentPage();

    // 添加用户消息（转义处理）
    messagesContainer.innerHTML += `<div class="message user-message">${escapeHtml(message)}</div>`;
    input.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // ========== 开关判断 ==========
    if (!AI_ASSISTANT_ENABLED) {
        messagesContainer.innerHTML += `<div class="message ai-message" style="color:#999;">🔒 AI助手功能暂未启用，如需使用请联系税务组开通。</div>`;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return;
    }

    // ========== 启用状态：显示"正在输入" ==========
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message ai-message typing';
    typingIndicator.textContent = '🤔 正在查询...';
    messagesContainer.appendChild(typingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // ========== 模拟API延迟 ==========
    setTimeout(() => {
        // 移除"正在输入"提示
        typingIndicator.remove();

        // 生成回复（根据页面类型）
        let aiReply = '';
        const lowerMsg = message.toLowerCase();

        // 加州页面
        if (currentPage === 'ca') {
            if (lowerMsg.includes('税率') || lowerMsg.includes('rate')) {
                aiReply = '加州(CA)：销售税基准7.25% + 地方税(0-3.5%)，综合税率7.25%-10.75%；企业所得税8.84%（固定税率）。';
            } else if (lowerMsg.includes('截止') || lowerMsg.includes('deadline')) {
                aiReply = '加州(CA)：销售税月度申报截止次月20日；公司税年度截止4月15日；个人税4月18日（2026年）。';
            } else if (lowerMsg.includes('sop') || lowerMsg.includes('步骤')) {
                aiReply = '加州报税SOP：1.下载数据 2.打开模板 3.PQ刷新 4.核对 5.CDTFA官网申报 6.保存回执';
            } else if (lowerMsg.includes('豁免') || lowerMsg.includes('免税')) {
                aiReply = '加州常见免税：食品杂货、处方药、转售交易(需Resale Certificate)、制造业设备(需申请豁免)。';
            } else {
                aiReply = '我是加州税务助手，你可以问我：税率、截止日、SOP步骤、免税规则等。';
            }
        }
        // 华州页面
        else if (currentPage === 'wa') {
            if (lowerMsg.includes('税率') || lowerMsg.includes('rate')) {
                aiReply = '华州(WA)：销售税基准6.5% + 地方税(0.5%-3.9%)；B&O税零售0.471%、服务业1.5%、制造业0.484%。';
            } else if (lowerMsg.includes('b&o') || lowerMsg.includes('营业税')) {
                aiReply = 'B&O税：按总收入全额计税，无成本扣除。零售0.471%，服务1.5%，制造0.484%，批发0.484%。';
            } else if (lowerMsg.includes('截止') || lowerMsg.includes('deadline')) {
                aiReply = '华州(WA)：销售税/B&O税月度申报截止次月25日，季度申报季后月底前。';
            } else if (lowerMsg.includes('sop') || lowerMsg.includes('步骤')) {
                aiReply = '华州报税SOP：1.下载数据 2.打开模板 3.PQ刷新 4.核对 5.DOR官网申报 6.保存回执';
            } else {
                aiReply = '我是华州税务助手，你可以问我：销售税率、B&O税、截止日、SOP步骤等。';
            }
        }
        // 首页通用
        else {
            if (lowerMsg.includes('ca') || lowerMsg.includes('加州')) {
                aiReply = '加州(CA)：销售税7.25%+地方税，企业所得税8.84%。点击地图上加州可查看详情。';
            } else if (lowerMsg.includes('wa') || lowerMsg.includes('华州')) {
                aiReply = '华州(WA)：销售税6.5%+地方税，B&O税零售0.471%。点击地图上华州可查看详情。';
            } else if (lowerMsg.includes('税率')) {
                aiReply = '你想查询哪个州？我可以帮你查CA(加州)或WA(华州)的税率信息。';
            } else {
                aiReply = '你好！我是税务AI助手，可以帮你查询CA/WA的税率、截止日、SOP步骤。';
            }
        }

        // 添加AI回复
        messagesContainer.innerHTML += `<div class="message ai-message">${aiReply}</div>`;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

    }, 800); // 延迟800ms模拟思考
}