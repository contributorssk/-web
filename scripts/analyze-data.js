const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./lists/processed-medical-death-list.json'));

// 统计分析
function analyzeData(data) {
  const stats = {
    total: data.length,
    byGender: {},
    byOccupation: {},
    byProvince: {},
    byCause: {},
    byAge: {
      '20-30': 0,
      '31-40': 0,
      '41-50': 0,
      '51-60': 0,
      '60+': 0
    },
    byMonth: {}
  };

  data.forEach(item => {
    // 性别统计
    stats.byGender[item.gender] = (stats.byGender[item.gender] || 0) + 1;
    
    // 职业统计
    stats.byOccupation[item.occupation] = (stats.byOccupation[item.occupation] || 0) + 1;
    
    // 地区统计
    stats.byProvince[item.location.province] = (stats.byProvince[item.location.province] || 0) + 1;
    
    // 死因统计
    stats.byCause[item.cause_of_death] = (stats.byCause[item.cause_of_death] || 0) + 1;
    
    // 年龄段统计
    if(item.age) {
      if(item.age <= 30) stats.byAge['20-30']++;
      else if(item.age <= 40) stats.byAge['31-40']++;
      else if(item.age <= 50) stats.byAge['41-50']++;
      else if(item.age <= 60) stats.byAge['51-60']++;
      else stats.byAge['60+']++;
    }
    
    // 月份统计
    const month = item.date.slice(0, 7);
    stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
  });

  return stats;
}

// 生成报告
const stats = analyzeData(data);
fs.writeFileSync(
  './reports/statistics.json',
  JSON.stringify(stats, null, 2)
); 