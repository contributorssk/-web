const fs = require('fs');

// 读取原始数据
const rawData = JSON.parse(fs.readFileSync('./lists/medical-death-list.json'));

// 数据处理函数
function processData(data) {
  return data.map((item, index) => {
    // 解析地理位置
    const [province, city] = item.location.split(/[省市]/).filter(Boolean);
    
    // 标准化日期
    const date = item.date.replace(/年|月|日/g, '-').slice(0, -1);
    
    // 生成标签
    const tags = [];
    if(item.occupation.includes('医') || item.occupation.includes('护')) {
      tags.push('医护人员');
    }
    if(item.political_identity === '党员') {
      tags.push('党员');
    }
    
    return {
      id: String(index + 1).padStart(3, '0'),
      name: item.name,
      gender: item.gender,
      age: parseInt(item.age) || null,
      occupation: item.occupation,
      political_identity: item.political_identity,
      location: {
        province,
        city
      },
      cause_of_death: item.cause_of_death,
      date,
      details: '',
      memorial_url: '',
      source: '',
      tags
    };
  });
}

// 处理并保存数据
const processedData = processData(rawData);
fs.writeFileSync(
  './lists/processed-medical-death-list.json',
  JSON.stringify(processedData, null, 2)
); 