<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div
      v-if="false"
      class="fixed w-100 h-100 opacity-80 bg-purple-800 inset-0 z-50 flex items-center justify-center"
    >
      <svg
        class="animate-spin -ml-1 mr-3 h-12 w-12 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
    <div class="container">
      <add-ticker
        @addTicker="add"
        :disabled="disabledAddTickerBtn"
      />

      <!--   Buttons control   -->
      <hr class="w-full border-t border-gray-600 my-4" />
      <div>
        <button
          v-if="page > 1"
          @click="page-= 1"
          class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Назад
        </button>
        <button
          v-if="hasNextPage"
          @click="page+= 1"
          class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Вперед
        </button>
        <div>
          Фильтр
          <input v-model="filter" type="text" class="mx-2">
        </div>
      </div>

      <!--   View Tickers   -->
      <template v-if="tickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <!--   Tickers List   -->
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="ticker of paginatedTickers"
            :key="ticker.name"
            @click="setTicker(ticker)"
            :class="{
              'border-4': selectedTicker === ticker,
              'bg-red-100': typeof ticker.price !== 'number'
            }"
            class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ ticker.name }} - USD
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ normilizePrice(ticker.price) }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              @click.stop="handleDelete(ticker)"
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path></svg
              >Удалить
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>
      <!--   Graph   -->
      <ticker-graph
        :graph="graphView"
        :ticker="selectedTicker"
        @closeGraph="selectedTicker = null"
        @changeGraphWidth="changeWidthGraph"
      />
    </div>
  </div>
</template>

<script>
// [x] 6. Наличие в состоянии ЗАВИСИМЫХ ДАННЫХ | Критичность: 5+
// [x] 4. Запросы напрямую внутри компонента (???) | Критичность: 5
// [x] 2. При удалении остается подписка на загрузку тикера | Критичность: 5
// [ ] 5. Обработка ошибок API | Критичность: 5
// [x] 3. Количество запросов | Критичность: 4
// [x] 8. При удалении тикера не изменяется localStorage | Критичность: 4
// [x] 1. Одинаковый код в watch | Критичность: 3
// [ ] 9. localStorage и анонимные вкладки | Критичность: 3
// [ ] 7. График ужасно выглядит если будет много цен | Критичность: 2
// [ ] 10. Магические строки и числа (URL, 5000 миллисекунд задержки, ключ локал стораджа, количество на странице) |  Критичность: 1

// Параллельно
// [x] График сломан если везде одинаковые значения
// [x] При удалении тикера остается выбор
import {
  subscriberToTickers,
  unsubscriberFromTickers
} from '@/apiSubscribe'
import AddTicker from '@/components/AddTicker'
import TickerGraph from '@/components/TickerGraph'

const saveStorageData = 'criptonomicon-list'
const PAGE_ELEMENTS = 6

export default {
  name: 'App',
  components: {
    AddTicker,
    TickerGraph
  },
  data() {
    return {
      filter: '',

      tickers: [],
      selectedTicker: null,

      graph: [],
      graphLineWidth: 40,
      graphWidth: 0,

      page: 1
    }
  },
  computed: {
    maxGraphElements() {
      if (!this.graphWidth) return 1

      return  Math.floor(this.graphWidth / this.graphLineWidth)
    },
    disabledAddTickerBtn() {
      return this.tickers.length >= 4
    },
    startIndex() {
      return PAGE_ELEMENTS * (this.page - 1)
    },
    endIndex() {
      return PAGE_ELEMENTS * this.page
    },
    hasNextPage() {
      return this.filteredTickers.length > this.endIndex
    },
    filteredTickers() {
      return this.tickers
        .filter(ticker => ticker.name.includes(this.filter))
    },
    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex)
    },
    graphView() {
      const minValue = Math.min(...this.graph)
      const maxValue = Math.max(...this.graph)

      if (maxValue === minValue) {
        return this.graph.map(() => 50)
      }

      return this.graph.map(
        price => Number(5 + ((price - minValue) * 95) / (maxValue - minValue)).toFixed(1)
      )
    },
    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page
      }
    }
  },
  methods: {
    changeWidthGraph(event) {
      this.graphWidth = event
    },

    normilizePrice(price) {
      if (!price || price === '-') {
        return '-'
      }
      return price > 1 ? Number(price).toFixed(2) : Number(price).toPrecision(2)
    },

    updateTickers(tickerName, price) {
      const t = this.tickers.find(ticker => ticker.name === tickerName)
      if (t) {
        t.price = price
      }

      if (t === this.selectedTicker) {
        this.graph.push(price)
        if (this.graph.length > this.maxGraphElements) {
          this.graph = this.graph.slice(this.graph.length - this.maxGraphElements)
        }
      }
    },

    add(ticker) {
      const currentTicker = {
        name: ticker,
        price: '-'
      }

      this.tickers = [...this.tickers, currentTicker]
      this.filter = ''

      subscriberToTickers(currentTicker.name, this.updateTickers)
    },

    handleDelete(removeTiker) {
      this.tickers = this.tickers.filter((t) => t !== removeTiker)
      unsubscriberFromTickers(removeTiker.name)

      if(removeTiker === this.selectedTicker) {
        this.selectedTicker = null
      }
    },

    setTicker(ticker) {
      this.selectedTicker = ticker
    }
  },
  watch: {
    selectedTicker() {
      this.graph = []
    },

    tickers() {
      localStorage.setItem(saveStorageData, JSON.stringify(this.tickers))
    },

    pageStateOptions(value) {
      history.pushState(
        null,
        document.title,
        `${window.location.pathname}?page=${value.page}&filter=${value.filter}`)
    },

    paginatedTickers() {
      if(this.paginatedTickers.length === 0 && this.page > 1) {
        this.page -= 1
      }
    },

    filter() {
      this.page = 1
    }
  },
  created() {
    const windowData = Object.fromEntries(new URL(window.location).searchParams.entries())

    const KEYS = ['page', 'filter']

    KEYS.forEach(key => {
      if (windowData[key]) {
        this[key] = windowData[key]
      }
    })

    const list = window.localStorage.getItem(saveStorageData)

    if (list) {
      this.tickers = JSON.parse(list)
      this.tickers.forEach(ticker => {
        subscriberToTickers(ticker.name, this.updateTickers)
      })
    }
  }
}
</script>
