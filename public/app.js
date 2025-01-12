class MemorialApp {
  constructor() {
    this.data = [];
    this.filteredData = [];
    this.currentView = 'grid'; // grid or map
    this.filters = {
      occupation: 'all',
      ageRange: 'all',
      province: 'all'
    };
    this.init();
  }

  async init() {
    await this.loadData();
    this.setupEventListeners();
    this.renderUI();
    this.initializeMap();
    this.setupCharts();
  }

  async loadData() {
    try {
      const response = await fetch('/data/processed-medical-death-list.json');
      this.data = await response.json();
      this.filteredData = [...this.data];
    } catch (error) {
      console.error('数据加载失败:', error);
      this.showError('数据加载失败，请刷新页面重试');
    }
  }

  setupEventListeners() {
    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', this.debounce(e => {
      this.handleSearch(e.target.value);
    }, 300));

    // 视图切换
    document.getElementById('viewToggle').addEventListener('click', () => {
      this.toggleView();
    });

    // 筛选器事件
    document.querySelectorAll('.filter-select').forEach(select => {
      select.addEventListener('change', () => this.applyFilters());
    });

    // 排序功能
    document.getElementById('sortSelect').addEventListener('change', (e) => {
      this.sortData(e.target.value);
    });
  }

  handleSearch(query) {
    query = query.toLowerCase();
    this.filteredData = this.data.filter(person => 
      person.name.toLowerCase().includes(query) ||
      person.location.province.toLowerCase().includes(query) ||
      person.occupation.toLowerCase().includes(query)
    );
    this.renderList();
    this.updateMap();
  }

  renderUI() {
    this.renderStats();
    this.renderList();
    this.renderFilters();
  }

  renderStats() {
    const stats = this.calculateStats();
    const statsContainer = document.getElementById('stats');
    
    statsContainer.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <h3>总计人数</h3>
          <div class="stat-number">${stats.total}</div>
        </div>
        <div class="stat-card">
          <h3>平均年龄</h3>
          <div class="stat-number">${stats.averageAge}岁</div>
        </div>
        <div class="stat-card">
          <h3>最多职业</h3>
          <div class="stat-number">${stats.topOccupation}</div>
        </div>
      </div>
    `;
  }

  renderList() {
    const list = document.getElementById('peopleList');
    const animation = 'animate__animated animate__fadeIn';
    
    list.innerHTML = this.filteredData.map(person => `
      <div class="person-card ${animation}">
        <div class="card-header">
          <h3>${person.name}</h3>
          <span class="age">${person.age}岁</span>
        </div>
        <div class="card-body">
          <p><i class="fas fa-briefcase"></i> ${person.occupation}</p>
          <p><i class="fas fa-map-marker-alt"></i> ${person.location.province}${person.location.city}</p>
          <p><i class="fas fa-calendar"></i> ${person.date}</p>
        </div>
        <div class="card-footer">
          <button onclick="app.showDetails('${person.id}')" class="btn-details">
            查看详情
          </button>
        </div>
      </div>
    `).join('');
  }

  showDetails(id) {
    const person = this.data.find(p => p.id === id);
    const modal = new Modal({
      title: person.name,
      content: this.generateDetailContent(person),
      footer: `
        <button class="btn-primary" onclick="app.showMemorial('${id}')">
          献花悼念
        </button>
      `
    });
    modal.show();
  }

  initializeMap() {
    // 使用高德地图或百度地图API初始化地图
    // 显示所有人员的地理分布
  }

  setupCharts() {
    // 使用 Chart.js 创建各种统计图表
    this.createOccupationChart();
    this.createAgeDistributionChart();
    this.createTimelineChart();
  }

  // 工具方法
  debounce(func, wait) {
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

  showError(message) {
    const toast = document.createElement('div');
    toast.className = 'toast error';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
}

// 初始化应用
const app = new MemorialApp(); 