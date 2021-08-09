<template>
  <el-row>
    <el-col :span="12">
      <div id="chartColumn" style="width:100%; height:400px;"></div>
    </el-col>
    <el-col :span="12">
      <div id="chartScatter" style="width:100%; height:400px;"></div>
    </el-col>
    <el-col :span="24" style="margin-top: 10px">
      <el-table
          :data="tableData"
          style="width: 100%"
          :header-cell-style="{background:'#CCFFFF',color:'#555'}">
        <el-table-column
            prop="execId"
            label="执行结果编号"
        >
        </el-table-column>
        <el-table-column
            prop="total"
            label="用例总数"
        >
        </el-table-column>
        <el-table-column
            prop="success"
            label="成功条数"
        >
        </el-table-column>
        <el-table-column
            prop="failed"
            label="失败条数"
        >
        </el-table-column>

        <el-table-column
            prop="skip"
            label="跳过条数"
        >
        </el-table-column>

        <el-table-column
            prop="other"
            label="其他状态"
        >
        </el-table-column>
        <el-table-column
            prop="startDate"
            label="开始时间">
        </el-table-column>
        <el-table-column
            prop="endDate"
            label="结束时间">
        </el-table-column>
      </el-table>
    </el-col>
  </el-row>
</template>

<script>
import * as echarts from 'echarts';
import axios from "axios";

export default {
  data() {
    return {
      chartColumn: null,
      drawColumnChartData: null,
      chartScatter: null,
      chartScatterData: null,
      tableData: []
    }
  },

  methods: {
    drawColumnChart: async function () {
      await axios.get('/api/drawColumnChart').then(
          (resp) => {
            this.drawColumnChartData = JSON.parse(JSON.stringify(resp.data));
          }
      )

      let cData = this.drawColumnChartData;
      //x轴
      let xData = cData.xData;
      let timeData = cData.timeData;
      let totalData = cData.totalData;
      let successData = cData.successData;
      let failedData = cData.failedData;
      let skipData = cData.skipData;

      this.chartColumn = echarts.init(document.getElementById('chartColumn'));
      this.chartColumn.setOption({
        title: [{
          text: '最近10次执行结果与执行时长',
          left: 'center',
          top: 10,
          textStyle: {
            fontWeight: 'normal',
            // fontSize: 20
          }
        },
          {
            top: '40%',
            left: 10,
            subtextStyle: {
              align: 'left',
              color: '#444444',
              fontSize: 12,
            },
            subtext: '用\n例\n数'//   \n换行
          },
          {
            top: '40%',
            right: 10,
            subtextStyle: {
              align: 'right',
              color: '#444444',
              fontSize: 12,
            },
            subtext: '执\n行\n时\n长'
          }
        ],
        grid: {
          top: 50
        },
        backgroundColor: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          /*          colorStops: [{
                      offset: 0, color: 'rgba(70, 131, 254, 0)' // 0% 处的颜色
                    }, {
                      offset: 1, color: 'rgba(70, 131, 254, 0.5)' // 100% 处的颜色
                    }],*/
          global: false // 缺省为 false
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              // color: '#999'
            }
          }
        },
        legend: {
          data: [
            {name: '执行用例总数'},
            {name: '成功用例数'},
            {name: '失败用例数'},
            {name: '跳过用例数'},
            {name: '执行时长', icon: 'circle'}
          ],
          textStyle: {
            // color: '#ffffff',
            fontSize: 11
          },
          y: 'bottom',
          x: 'center',
        },
        xAxis: [
          {
            type: 'category',
            name: '执行结果',
            nameGap: 25,
            nameLocation: 'middle',
            axisLine: {
              lineStyle: {
                // color: '#1F7EFF',
                width: 1
              }
            },
            data: xData,
            axisPointer: {
              type: 'shadow'
            },
            axisLabel: {
              interval: 0,//横轴信息全部显示
              textStyle: {
                // color: '#fff'
              },
              fontSize: 11,
              // rotate:45,//度角倾斜显示
              formatter: function (value) {
                return value.length > 5 ? value.substring(4, 8) + '...' : value;
              }
            }
          }
        ],
        yAxis: [//这里配置两条Y轴
          {
            type: 'value',
            splitLine: {
              show: true,
              lineStyle: {
                // color: '#021439',
                width: 1,
                type: 'dashed'
              }
            },
            axisLine: {
              lineStyle: {
                // color: '#1F7EFF',
                width: 1
              }
            },
            axisLabel: {
              show: true,
              textStyle: {
                // color: '#fff'
              },
              fontSize: 11,
              interval: 'auto',
              formatter: '{value}'
            },
            name: '单位（条）',
            nameTextStyle: {
              // color: '#fff',
              fontSize: 11,
            }
          },
          {
            type: 'value',
            splitLine: {
              show: true,
              lineStyle: {
                // color: '#021439',
                width: 1
              }
            },
            axisLine: {
              lineStyle: {
                // color: '#1F7EFF',
                width: 1
              }
            },
            axisLabel: {
              show: true,
              textStyle: {
                // color: '#fff'
              },
              fontSize: 11,
              interval: 'auto',
              formatter: '{value}'
            },
            name: '单位（min）',
            nameTextStyle: {
              // color: '#fff'
            }
          }
        ],
        series: [
          {
            name: '执行用例总数',
            barWidth: '30%',
            type: 'line',
            itemStyle: {
              normal: {
                lineStyle: {
                  color: '#00FFFF'
                },
                fontSize: 11,
                color: '#00FFFF',
              }
            },
            symbol: 'circle',
            symbolSize: 10, //折线点的大小
            yAxisIndex: 0,
            data: totalData
          },
          {
            name: '执行时长',
            barWidth: '30%',
            type: 'bar',
            itemStyle: {
              normal: {
                lineStyle: {
                  color: '#E09C19'
                },
                color: '#5184F2',
              }
            },
            yAxisIndex: 1, //使用的 y 轴的 index，在单个图表实例中存在多个 y轴的时候有用。
            data: timeData
          },
          {
            name: '成功用例数',
            barWidth: '30%',
            type: 'line',
            itemStyle: {
              normal: {
                lineStyle: {
                  color: '#42C96E'
                },
                fontSize: 11,
                color: '#42C96E',
              }
            },
            symbol: 'circle',
            symbolSize: 10, //折线点的大小
            yAxisIndex: 1,
            data: successData
          }, {
            name: '失败用例数',
            barWidth: '30%',
            type: 'line',
            itemStyle: {
              normal: {
                lineStyle: {
                  color: '#E63234'
                },
                fontSize: 11,
                color: '#E63234',
              }
            },
            symbol: 'circle',
            symbolSize: 10, //折线点的大小
            yAxisIndex: 1, ////使用的 y 轴的 index，在单个图表实例中存在多个 y轴的时候有用。
            data: failedData
          }, {
            name: '跳过用例数',
            barWidth: '30%',
            type: 'line',
            itemStyle: {
              normal: {
                lineStyle: {
                  color: '#E09C19'
                },
                fontSize: 11,
                color: '#E09C19',
              }
            },
            symbol: 'circle',
            symbolSize: 10, //折线点的大小
            yAxisIndex: 1,
            data: skipData
          }
        ],
      });
    },
    getScatterChart: async function () {
      await axios.get('/api/drawScatterChart').then(
          (resp) => {
            this.chartScatterData = JSON.parse(JSON.stringify(resp.data));
          }
      )
    },
    drawScatterChart: async function () {
      await this.getScatterChart();
      this.chartScatter = echarts.init(document.getElementById('chartScatter'));
      let mydata = this.chartScatterData;
      let itemStyle = {
        opacity: 0.8
      };
      let sizeFunction = function (x, y) {
        let size;
        if (x > 100 || y == 100) {
          size = 50;
        } else if (y == 0 && x < 10) {
          size = 5;
        } else {
          size = (x + y) / 2
        }
        return size;
      };
      // Schema:
      let schema = [
        {name: 'execTime', index: 0, text: '执行时长', unit: 's'},
        {name: 'failedRate', index: 1, text: '失败率', unit: '%'},
        {name: 'caseId', index: 2, text: '用例ID', unit: ''},
        {name: 'execId', index: 3, text: '执行结果', unit: ''}
      ];

      let option = {
        baseOption: {
          timeline: {
            axisType: 'category',
            orient: 'vertical',
            autoPlay: true,
            inverse: true,
            playInterval: 5000,
            left: null,
            right: 0,
            top: 20,
            bottom: 20,
            width: 55,
            height: null,
            symbol: 'none',
            checkpointStyle: {
              borderWidth: 2
            },
            controlStyle: {
              showNextBtn: false,
              showPrevBtn: false
            },
            data: []
          },
          title: [{
            // text: mydata.timeline[0]
            textAlign: 'right',
            left: '80%',
            top: '10%',
            textStyle: {
              fontSize: 20,
              color: '#008080'
            }
          }, {
            text: '最近10次执行每条用例执行失败率和时长演变',
            left: 'center',
            top: 10,
            textStyle: {
              fontWeight: 'normal',
              // fontSize: 20
            }
          }],
          tooltip: {
            padding: 5,
            borderWidth: 1,
            formatter: function (obj) {
              let value = obj.value;
              return '<div style="text-align:left">' + schema[2].text + '：' + value[2] + schema[2].unit + '<br>'
                  + schema[3].text + '：' + value[3] + schema[3].unit + '<br>'
                  + schema[1].text + '：' + value[1] + schema[1].unit + '<br>'
                  + schema[0].text + '：' + value[0] + schema[0].unit + '</div>';
            }
          },
          grid: {
            top: 50,
            containLabel: true,
            left: 30,
            right: '110'
          },
          xAxis: {
            type: 'log',
            name: '执行时长',
            /*        max: 100000,
                    min: 300,*/
            max: 300,
            nameGap: 25,
            nameLocation: 'middle',
            // nameTextStyle: {
            //   fontSize: 18
            // },
            splitLine: {
              show: false
            },
            axisLabel: {
              formatter: '{value} s'
            }
          },
          yAxis: {
            type: 'value',
            name: '失败率',
            max: 100,
            nameTextStyle: {
              // fontSize: 18
            },
            splitLine: {
              show: false
            },
            axisLabel: {
              formatter: '{value} %'
            }
          },
          visualMap: [
            {
              show: false,
              dimension: 3,
              categories: mydata.counties,
              inRange: {
                color: (function () {
                  let colors = ['#51689b', '#ce5c5c', '#fbc357', '#8fbf8f', '#659d84',
                    '#fb8e6a', '#c77288', '#786090', '#91c4c5', '#6890ba'];
                  return colors.concat(colors);
                })()
              }
            }
          ],
          series: [
            {
              type: 'scatter',
              itemStyle: itemStyle,
              // data: mydata.series[0],
              symbolSize: function (val) {
                return sizeFunction(val[0], val[1]);
              }
            }
          ],
          animationDurationUpdate: 1000,
          animationEasingUpdate: 'quinticInOut'
        },
        options: []
      };

      for (let n = 0; n < mydata.timeline.length; n++) {
        option.baseOption.timeline.data.push(mydata.timeline[n]);
        option.options.push({
          title: {
            show: true,
            'text': mydata.timeline[n] + ''
          },
          series: {
            name: mydata.timeline[n],
            type: 'scatter',
            itemStyle: itemStyle,
            data: mydata.series[n],
            symbolSize: function (val) {
              return sizeFunction(val[0], val[1]);
            }
          }
        });
      }

      this.chartScatter.setOption(option);

    },
    drawCharts() {
      this.drawColumnChart()
      this.drawScatterChart()
    },
    getRecentExec() {
      axios.get('/api/recentExec').then(
          (resp) => {
            this.tableData = resp.data;
          }
      )
    }
  },

  mounted: function () {
    this.drawCharts();
    this.getRecentExec();
  },
  updated: function () {
    this.drawCharts();
    this.getRecentExec();
  }
}
</script>

<style lang="scss" scoped>
</style>