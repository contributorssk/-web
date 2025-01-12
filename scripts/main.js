/* JavaScript written by Ruoxin Mao */
const version = "24w01a";
const splashScreen = 1;
let list = [];
let flowerCount = parseInt(localStorage.getItem('flowerCount')) || 0;

console.log("\n纪念所有在这些苦难中逝去的生命\n\n 2024 contribute\nversion " + version + "\n\n");

// 禁用右键和保存
window.oncontextmenu = () => false;
window.onkeydown = e => { 
    if ((e.ctrlKey || e.metaKey) && e.keyCode == 83) return false;
};

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    loadList("date");
    updateFlowerCount();
});

// 初始化UI元素
function initializeUI() {
    // 添加事件监听器
    btnScrollDown.onclick = () => {
        window.scrollTo({ 
            top: mainContainer.offsetTop, 
            behavior: "smooth" 
        });
    };

    btnBacktoTop.onclick = () => {
        window.scrollTo({ 
            top: 0, 
            behavior: "smooth" 
        });
    };

    selectListSort.onchange = () => {
        loadList(selectListSort.value);
    };

    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce(() => {
        filterList(searchInput.value.toLowerCase());
    }, 300));

    // 献花功能
    const addFlowerBtn = document.getElementById('addFlower');
    addFlowerBtn.addEventListener('click', () => {
        addFlower();
    });

    // 暗色主题图标
    if (matchMedia("(prefers-color-scheme:dark)").matches) {
        document.querySelector('link[rel="shortcut icon"]').href = "favicon-dark-theme.ico";
    }

    // 启动画面
    if (splashScreen === 1) {
        setTimeout(() => {
            splashScr.style.opacity = "0";
            setTimeout(() => {
                splashScr.remove();
            }, 500);
        }, 3000);
    } else {
        splashScr.remove();
    }
}

// 加载名单
async function loadList(key) {
    try {
        if (list.length === 0) {
            const response = await fetch("https://ncov19.cn/lists/medical-death-list.json");
            if (!response.ok) throw new Error('Network response was not ok');
            list = await response.json();
            txtTotalDeath.innerText = list.length + "位";
        }
        renderList(list, key);
    } catch (error) {
        console.error('Error loading list:', error);
        listItemsContainer.innerHTML = '<div class="error-message">加载数据失败，请稍后重试</div>';
    }
}

// 渲染名单
function renderList(data, sortKey) {
    listItemsContainer.innerHTML = "";
    const sortedList = [...data].sort((a, b) => {
        if (sortKey === 'date') {
            return new Date(b.date) - new Date(a.date);
        }
        return a[sortKey].localeCompare(b[sortKey]);
    });

    sortedList.forEach(item => {
        const listItem = createListItem(item);
        listItemsContainer.appendChild(listItem);
    });
}

// 创建列表项
function createListItem(data) {
    const listItem = document.createElement('div');
    listItem.className = 'listItem';
    
    const content = `
        <div class="listName bold">${data.name}</div>
        <div class="listInnerItem">
            <div class="listInnerItemTitle">年龄</div>
            <div class="listInnerItemContent">${data.age}</div>
        </div>
        <div class="listInnerItem">
            <div class="listInnerItemTitle">职务</div>
            <div class="listInnerItemContent">${data.occupation}</div>
        </div>
        <div class="listInnerItem">
            <div class="listInnerItemTitle">所在地</div>
            <div class="listInnerItemContent">${data.location}</div>
        </div>
        <div class="listInnerItem">
            <div class="listInnerItemTitle">牺牲原因</div>
            <div class="listInnerItemContent">${data.cause_of_death}</div>
        </div>
        <div class="listInnerItem">
            <div class="listInnerItemTitle">牺牲时间</div>
            <div class="listInnerItemContent">${data.date}</div>
        </div>
    `;
    
    listItem.innerHTML = content;
    return listItem;
}

// 搜索过滤
function filterList(query) {
    const filteredList = list.filter(item => {
        return Object.values(item).some(value => 
            value.toString().toLowerCase().includes(query)
        );
    });
    renderList(filteredList, selectListSort.value);
}

// 献花功能
function addFlower() {
    flowerCount++;
    localStorage.setItem('flowerCount', flowerCount);
    updateFlowerCount();
    
    const btn = document.getElementById('addFlower');
    btn.classList.add('active');
    setTimeout(() => btn.classList.remove('active'), 200);
    
    // 添加花朵动画效果
    const flower = document.createElement('div');
    flower.className = 'flower-animation';
    flower.innerHTML = '';
    document.getElementById('virtualFlowersContainer').appendChild(flower);
    
    setTimeout(() => flower.remove(), 1000);
}

// 更新献花数量
function updateFlowerCount() {
    document.getElementById('flowerCount').textContent = flowerCount;
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}