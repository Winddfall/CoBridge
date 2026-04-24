import { defineConfig, presets } from 'sponsorkit'

export default defineConfig({
  // 这里的配置会影响生成的图片样式
  tiers: [
    {
      title: 'Past Sponsors',
      monthlyDollars: -1,
      preset: presets.xs,
    },
    {
      title: 'Backers',
      preset: presets.base,
    },
    {
      title: 'Sponsors',
      monthlyDollars: 10,
      preset: presets.medium,
    },
    {
      title: 'Silver Sponsors',
      monthlyDollars: 50,
      preset: presets.large,
    },
    
  ],
  // 将文件输出到 assets 文件夹下
  // 如果文件夹不存在，SponsorKit 通常会自动创建
  outputDir: 'public/assets',
  name: 'sponsors',
  
  // 你也可以指定多种格式
  formats: ['svg'],

  // 重点：配置爱发电
  afdian: {
    // 你的爱发电 user_id 和 token 建议通过环境变量传入
    userId: process.env.AFDIAN_USER_ID,
    token: process.env.AFDIAN_TOKEN,
  },
})