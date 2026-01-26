<template>
  <app-layout>
    <div class="price-page">
      <page-title title="收费标准" @back="router.back()" />

      <div v-if="loading" class="price-loading">
        <van-loading vertical>加载中...</van-loading>
      </div>

      <div v-else-if="!priceListUrl" class="price-empty">
        <van-empty description="暂无收费标准" />
      </div>

      <div v-else-if="parseError" class="price-error">
        <van-empty :description="parseError" />
      </div>

      <div v-else class="price-content">
        <div class="price-preview">
          <!-- 表格内容 -->
          <div v-if="!currentSheet?.rows?.length" class="sheet-empty">
            <van-empty description="本表暂无数据" />
          </div>
          <div
            v-else
            class="table-wrapper"
            @touchmove.stop
          >
            <table class="price-table">
              <thead>
                <tr
                  v-for="(renderRow, rowIndex) in (getHeaderRows(currentSheet) || [])"
                  :key="'h-' + rowIndex"
                >
                  <th
                    v-for="(cell, colIndex) in renderRow"
                    :key="colIndex"
                    :rowspan="cell.rowspan"
                    :colspan="cell.colspan"
                  >
                    {{ cell.value }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(renderRow, rowIndex) in (getBodyRows(currentSheet) || [])"
                  :key="'b-' + rowIndex"
                >
                  <td
                    v-for="(cell, colIndex) in renderRow"
                    :key="colIndex"
                    :rowspan="cell.rowspan"
                    :colspan="cell.colspan"
                  >
                    {{ cell.value }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- 自定义 tab 栏，固定在底部 -->
        <div class="custom-tabs">
          <div ref="tabsScrollRef" class="tabs-scroll">
            <div
              v-for="(sheet, idx) in sheetsData"
              :key="idx"
              :ref="(el) => { if (el) tabItemRefs[idx] = el }"
              class="tab-item"
              :class="{ active: activeSheetIndex === idx }"
              @click="switchTab(idx)"
            >
              {{ sheet.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </app-layout>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import * as XLSX from 'xlsx'
import AppLayout from '@/components/layout/AppLayout.vue'
import PageTitle from '@/components/common/PageTitle.vue'
import { useCompanyStore } from '@/stores/company'
import { getPriceListFile } from '@/api/company'

const router = useRouter()
const companyStore = useCompanyStore()

/**
 * 加载状态
 */
const loading = ref(true)

/**
 * 解析错误信息
 */
const parseError = ref('')

/**
 * 所有工作表数据 [{ name, rows }, ...]
 */
const sheetsData = ref([])

/**
 * 当前选中的工作表索引
 */
const activeSheetIndex = ref(0)

/**
 * 价格列表 URL（companyInfo.price_list）
 */
const priceListUrl = computed(() => {
  return companyStore.companyInfo?.price_list || ''
})

/**
 * 当前选中的工作表
 */
const currentSheet = computed(() => {
  return sheetsData.value[activeSheetIndex.value] || null
})

/**
 * Tab 滚动容器引用
 */
const tabsScrollRef = ref(null)

/**
 * Tab 项引用对象（索引 -> DOM 元素）
 */
const tabItemRefs = ref({})

/**
 * 切换 tab
 * @param {number} index - 工作表索引
 */
function switchTab(index) {
  activeSheetIndex.value = index
  scrollToActiveTab()
}

/**
 * 滚动到当前激活的 tab
 */
function scrollToActiveTab() {
  nextTick(() => {
    if (!tabsScrollRef.value || !tabItemRefs.value[activeSheetIndex.value]) return
    
    const activeTab = tabItemRefs.value[activeSheetIndex.value]
    const scrollContainer = tabsScrollRef.value
    const scrollLeft = scrollContainer.scrollLeft
    const tabLeft = activeTab.offsetLeft
    const tabWidth = activeTab.offsetWidth
    const containerWidth = scrollContainer.clientWidth
    const padding = 16 // 16px 的边距
    
    // 如果 tab 在左侧不可见区域
    if (tabLeft < scrollLeft) {
      scrollContainer.scrollTo({
        left: tabLeft - padding,
        behavior: 'smooth'
      })
    }
    // 如果 tab 在右侧不可见区域
    else if (tabLeft + tabWidth > scrollLeft + containerWidth) {
      scrollContainer.scrollTo({
        left: tabLeft + tabWidth - containerWidth + padding,
        behavior: 'smooth'
      })
    }
  })
}

/**
 * 监听 activeSheetIndex 变化，自动滚动到可见区域
 */
watch(activeSheetIndex, () => {
  scrollToActiveTab()
})

/**
 * 使用 FileReader 读取 Blob 为 ArrayBuffer
 * @param {Blob} blob
 * @returns {Promise<ArrayBuffer>}
 */
function readBlobAsArrayBuffer(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(blob)
  })
}

/**
 * 使用 xlsx 解析 ArrayBuffer，提取全部工作表的二维数组及合并信息
 * @param {ArrayBuffer} arrayBuffer
 * @returns {{ name: string, rows: string[][], merges: { s: { r, c }, e: { r, c } }[] }[]}
 */
function parseXlsx(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })
  const names = workbook.SheetNames || []
  if (names.length === 0) {
    throw new Error('工作簿中无工作表')
  }
  return names.map((name) => {
    const ws = workbook.Sheets[name]
    
    // 获取工作表的数据范围（如 "A1:D100"）
    const range = ws['!ref']
    if (!range) {
      return { name, rows: [], merges: [], worksheet: ws }
    }
    
    // 解析范围，获取最大行列数
    const rangeMatch = range.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/)
    if (!rangeMatch) {
      // 如果范围格式不对，回退到 sheet_to_json
      const rows = XLSX.utils.sheet_to_json(ws, {
        header: 1,
        defval: '',
        blankrows: true // 改为 true，保留空行
      })
      const merges = ws && ws['!merges'] ? ws['!merges'] : []
      return { name, rows: rows || [], merges, worksheet: ws }
    }
    
    // 解析列字母为数字（A=0, B=1, ...）
    function colToNum(col) {
      let num = 0
      for (let i = 0; i < col.length; i++) {
        num = num * 26 + (col.charCodeAt(i) - 64)
      }
      return num - 1
    }
    
    const startCol = colToNum(rangeMatch[1])
    const startRow = parseInt(rangeMatch[2]) - 1
    const endCol = colToNum(rangeMatch[3])
    const endRow = parseInt(rangeMatch[4]) - 1
    
    // 遍历所有行，包括空行
    const rows = []
    for (let r = startRow; r <= endRow; r++) {
      const row = []
      for (let c = startCol; c <= endCol; c++) {
        const cellRef = getCellRef(r, c)
        const cell = ws[cellRef]
        // 读取单元格值，优先使用 .v（值），如果没有则使用 .w（格式化文本），都没有则为空字符串
        const value = cell ? (cell.v !== undefined ? String(cell.v) : (cell.w || '')) : ''
        row.push(value)
      }
      rows.push(row)
    }
    
    const merges = ws && ws['!merges'] ? ws['!merges'] : []
    return { name, rows, merges, worksheet: ws }
  })
}

/**
 * 将行列索引转换为 Excel 单元格引用（如 0,0 -> A1）
 * @param {number} r - 行索引（0-based）
 * @param {number} c - 列索引（0-based）
 * @returns {string}
 */
function getCellRef(r, c) {
  let col = ''
  let n = c + 1
  while (n > 0) {
    const remainder = (n - 1) % 26
    col = String.fromCharCode(65 + remainder) + col
    n = Math.floor((n - 1) / 26)
  }
  return col + (r + 1)
}

/**
 * 根据 rows 与 merges 生成带 rowspan/colspan 的渲染行
 * @param {{ rows: string[][], merges: object[], worksheet: object }} sheet
 * @returns {{ value: string, rowspan: number, colspan: number }[][]}
 */
function buildTableWithMerges(sheet) {
  const rows = sheet?.rows || []
  const merges = sheet?.merges || []
  const worksheet = sheet?.worksheet
  const numRows = rows.length
  const numCols = Math.max(0, ...rows.map((r) => (r && r.length) || 0))
  const cellMap = Object.create(null)

  for (const m of merges) {
    const { s, e } = m
    const rowspan = (e.r - s.r || 0) + 1
    const colspan = (e.c - s.c || 0) + 1
    // 优先从 worksheet 直接读取合并单元格左上角的值，确保读取正确
    let val = ''
    if (worksheet) {
      const cellRef = getCellRef(s.r, s.c)
      const cell = worksheet[cellRef]
      if (cell && cell.v !== undefined) {
        val = String(cell.v)
      } else {
        val = (rows[s.r] && rows[s.r][s.c]) ?? ''
      }
    } else {
      val = (rows[s.r] && rows[s.r][s.c]) ?? ''
    }
    cellMap[`${s.r},${s.c}`] = { value: val, rowspan, colspan }
    for (let r = s.r; r <= e.r; r++) {
      for (let c = s.c; c <= e.c; c++) {
        if (r !== s.r || c !== s.c) {
          cellMap[`${r},${c}`] = 'covered'
        }
      }
    }
  }

  const result = []
  for (let r = 0; r < numRows; r++) {
    const rowCells = []
    for (let c = 0; c < numCols; c++) {
      const key = `${r},${c}`
      if (cellMap[key] === 'covered') continue
      
      let cell = cellMap[key]
      if (!cell) {
        // 对于非合并单元格，也从 worksheet 直接读取，确保值正确
        let val = (rows[r] && rows[r][c]) ?? ''
        if (worksheet) {
          const cellRef = getCellRef(r, c)
          const wsCell = worksheet[cellRef]
          if (wsCell && wsCell.v !== undefined) {
            val = String(wsCell.v)
          }
        }
        cell = { value: val, rowspan: 1, colspan: 1 }
      }
      rowCells.push(cell)
      c += cell.colspan - 1
    }
    result.push(rowCells)
  }
  return result
}

/**
 * 获取当前工作表的渲染行（供模板调用）
 * @param {{ name: string, rows: string[][], merges: object[] }} sheet
 * @returns {{ value: string, rowspan: number, colspan: number }[][]}
 */
function getRenderRows(sheet) {
  if (!sheet?.rows?.length) return []
  return buildTableWithMerges(sheet)
}

/**
 * 表头行数：取首行单元格最大 rowspan，多行表头（如「品名/规格/克重」rowspan=2 + 「品牌」下「维通利华/华阜康/子源」）都算 thead
 * @param {{ name: string, rows: string[][], merges: object[] }} sheet
 * @returns {number}
 */
function getHeaderRowCount(sheet) {
  const rows = getRenderRows(sheet)
  const first = rows[0]
  if (!first?.length) return 1
  let max = 1
  for (const cell of first) {
    if (cell?.rowspan > max) max = cell.rowspan
  }
  return max
}

/**
 * 表头渲染行（多行表头时包含「维通利华/华阜康/子源」等子表头）
 * @param {{ name: string, rows: string[][], merges: object[] }} sheet
 * @returns {{ value: string, rowspan: number, colspan: number }[][]}
 */
function getHeaderRows(sheet) {
  const all = getRenderRows(sheet)
  const n = getHeaderRowCount(sheet)
  return all.slice(0, n)
}

/**
 * 表体渲染行（表头之后为数据行）
 * @param {{ name: string, rows: string[][], merges: object[] }} sheet
 * @returns {{ value: string, rowspan: number, colspan: number }[][]}
 */
function getBodyRows(sheet) {
  const all = getRenderRows(sheet)
  const n = getHeaderRowCount(sheet)
  return all.slice(n)
}

/**
 * 加载并解析 xlsx，更新 tableData
 * 通过后端代理获取 xlsx（避免直连 OSS 的 CORS），再用 FileReader + xlsx 解析
 */
async function loadData() {
  try {
    loading.value = true
    parseError.value = ''
    sheetsData.value = []
    activeSheetIndex.value = 0

    if (!companyStore.loaded) {
      await companyStore.loadCompanyInfo()
    }

    if (!priceListUrl.value) {
      loading.value = false
      return
    }

    const blob = await getPriceListFile()
    const arrayBuffer = await readBlobAsArrayBuffer(blob)
    const sheets = parseXlsx(arrayBuffer)

    if (!sheets || sheets.length === 0) {
      throw new Error('表格无数据')
    }
    sheetsData.value = sheets
  } catch (e) {
    console.error('加载收费标准失败:', e)
    parseError.value = e?.message || '加载或解析失败'
    showToast(parseError.value)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="less" scoped>
.price-page {
  padding-top: @padding-md;
  
  .price-loading {
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: @padding-xl;
  }

  .price-empty,
  .price-error {
    padding: @padding-xl;
  }

  .price-content {
    position: relative;
    padding-bottom: 60px; // 为底部 tab 留出空间

    .price-preview {
      .sheet-empty {
        padding: @padding-xl 0;
        min-height: 120px;
      }
    }

    .table-wrapper {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      background-color: var(--bg-color-white, #fff);
      border-radius: @border-radius-md;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }

    .price-table {
      width: 100%;
      border-collapse: collapse;
      font-size: @font-size-sm;
      table-layout: auto;
      min-width: 480px;

      th,
      td {
        padding: @padding-sm @padding-md;
        border: 1px solid var(--van-border-color, #ebedf0);
        text-align: left;
        white-space: nowrap;
      }

      th {
        background-color: var(--van-gray-1, #f7f8fa);
        font-weight: 600;
        color: var(--text-color, #323233);
      }

      td {
        color: var(--text-color-2, #646566);
      }

      tbody tr:nth-child(even) {
        background-color: var(--van-gray-1, #f7f8fa);
      }
    }

    // 自定义 tab 栏，固定在底部
    .custom-tabs {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: var(--bg-color-white, #fff);
      border-top: 1px solid var(--van-border-color, #ebedf0);
      z-index: 100;
      box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);

      .tabs-scroll {
        display: flex;
        overflow-x: auto;
        overflow-y: hidden;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none; // Firefox
        -ms-overflow-style: none; // IE/Edge

        &::-webkit-scrollbar {
          display: none; // Chrome/Safari
        }

        .tab-item {
          flex-shrink: 0;
          padding: @padding-md @padding-lg;
          font-size: @font-size-md;
          color: var(--text-color-2, #646566);
          white-space: nowrap;
          cursor: pointer;
          position: relative;
          transition: color 0.2s;

          &:active {
            background-color: var(--van-gray-1, #f7f8fa);
          }

          &.active {
            color: @primary-color;
            font-weight: 600;

            &::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: @padding-lg;
              right: @padding-lg;
              height: 2px;
              background-color: @primary-color;
            }
          }
        }
      }
    }
  }
}
</style>
