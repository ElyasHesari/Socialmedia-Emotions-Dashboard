import Chart from 'chart.js/auto'

export default {
  install: (app) => {
    app.provide('$chart', Chart)
    app.config.globalProperties.$chart = Chart
  }
}