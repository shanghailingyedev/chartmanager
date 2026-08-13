import ReactEcharts from "echarts-for-react";
import React, {useRef, useState} from "react";
import * as XLSX from "xlsx";
import { Switch } from 'antd';

const MainChart = () => {

    const [optionData, setOptionData] = useState(null);
    const chartRef = useRef(null);
    var option = {
        grid: {
            top: '0%',    // 顶部留白，防止标题被遮挡
            bottom: '10%', // 底部留白，防止X轴标签被裁剪
            left: '0%',   // 左侧留白，防止Y轴数值被遮挡
            right: '0%'    // 右侧留白，防止右侧内容溢出
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
        },
        xAxis: {
            splitLine: {
                show: false  // 隐藏 Y 轴的竖线
            },
            axisLabel: {
                show: true,
                interval: 0, // 强制显示所有标签
            }
        },
        yAxis: {
            show:  false
        },
        series: [
        ]
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const ab = e.target.result;
            const workbook = XLSX.read(ab, { type: 'array', cellDates: true });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            const items = jsonData[0]
            items.shift()
            items.unshift("placeholder")
            let keyData = []
            // eslint-disable-next-line array-callback-return
            items.map((item,itemIndex) => {
                let itemData = [];
                let data = {};
                let data1 = {};
                jsonData.slice(0).map((row, index) => {
                    console.log("eeeee----", row);
                    console.log("eeeee----length", row.length);
                    var handleData = Array.from(row, x => x ?? 0);
                    let i = handleData.length - 1;
                    if (handleData.length < items.length) {
                        while (i < items.length) {
                            handleData.push(0)
                            i++;
                        }
                    }
                    // 这里处理解析中可能出现的稀疏数组，如[1, , 3]，数组长度为 3，但索引 1 处是一个‌空槽（Empty Slot）‌，而不是 undefined。（不处理会跳过这个空槽）
                    // eslint-disable-next-line array-callback-return
                    handleData.slice(0).map((cell, cellIndex) => {
                        if (cellIndex === itemIndex) {
                            if (cellIndex === 0) {
                                itemData.push(formatDateToYMD(cell.toString()))
                            } else {
                                if (typeof cell !== "string" && cell !== null && cell !== undefined) {
                                    itemData.push(cell.toFixed(2))
                                } else {
                                    itemData.push(0)
                                }
                            }

                        }
                    })
                })
                if (itemIndex === 0) {
                    keyData = itemData
                    option.xAxis.data = itemData
                } else {
                    itemData = mergeToOneToOneArray(keyData, itemData)
                    let color = getRandomColor()
                    console.log("1231231231", item)
                    data = {
                        name: item,
                        type: 'scatter',
                        symbolSize: 6,
                        color: color,
                        data: itemData,
                        label: {show: true,  position: 'top'},
                    }
                    data1 = {
                        name: item,
                        type: 'line',
                        // stack: 'Total',
                        symbolSize: 6,
                        data: itemData,
                        // label: {show: true,  position: 'top'},
                        symbol: 'none', // 关键：隐藏折线图的节点，只显示线
                        color: color,
                        lineStyle: {
                            width: 2,
                            type: 'solid'
                        },
                        zlevel: 1 // 确保连线在散点下方
                    }
                    option.series.push(data)
                    option.series.push(data1)
                }
            })
            console.log("1231231231",items)
            option.legend.data = items
            setOptionData(option)
        };
        reader.readAsArrayBuffer(file);
    };

    function mergeToOneToOneArray(arr1, arr2) {
        let result = [];
        for (let i = 0; i < Math.min(arr1.length, arr2.length); i++) {
            result.push([arr1[i], arr2[i]]);
        }
        return result;
    }

    function getRandomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgb(${r},${g},${b})`;
    }

    function formatDateToYMD(input) {
        if (!input) return '';
        const date = input instanceof Date ? input : new Date(input);
        // 检查日期是否有效
        if (isNaN(date.getTime())) {
            console.error('无效的日期格式:', input);
            return '';
        }
        const year = date.getFullYear();
        // getMonth() 返回 0-11，需 +1；padStart 确保两位数
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()+1).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    const handleExport = () => {
        const chart = chartRef.current.getEchartsInstance();
        // 设置 pixelRatio 为 2 或 window.devicePixelRatio 以获取高清图
        const url = chart.getDataURL({ type: 'png', pixelRatio: window.devicePixelRatio, backgroundColor: '#fff' });
        const link = document.createElement('a');
        link.download = 'chart.png';
        link.href = url;
        link.click();
    };

    return (
        <div style={{width: '100%', height: '100%'}}>
            <div>
                <input type="file" onChange={handleFileUpload} />
                <button onClick={handleExport}>下载高清图</button>
                {optionData && (
                    <ReactEcharts ref={chartRef} style={{width: (960*3084/1475),backgroundColor: "white", height: 960}} option={optionData}>
                    </ReactEcharts>
                )}
            </div>
        </div>
    )

}

export default MainChart;

