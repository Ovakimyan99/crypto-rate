<template>
  <section>
    <!--   Header   -->
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700">
          Тикер
        </label>
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="ticker"
            @keydown.enter="add"
            type="text"
            name="wallet"
            id="wallet"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
          />
        </div>
        <div class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap">
          <span
            v-if="false"
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
          >
            крипта
          </span>
        </div>
        <div class="text-sm text-red-600">
          Такой тикер уже добавлен
        </div>
      </div>
    </div>
    <add-ticker-btn
      @click="add"
      :disabled="disabled"
      class="my-4"
    />
  </section>
</template>

<script>
import AddTickerBtn from '@/components/AddTickerBtn'

export default {
  name: 'AddTicker',
  components: {
    AddTickerBtn
  },
  props: {
    disabled: {
      type: Boolean,
      default: true,
      required: true
    }
  },
  data() {
    return {
      ticker: ''
    }
  },
  emits: {
    'add-ticker': values => values.length > 0 && typeof values === 'string'
  },
  methods: {
    add() {
      if (this.disabled || !this.ticker) return
      this.$emit('add-ticker', this.ticker)
      this.ticker = ''
    }
  }
}
</script>

<style scoped>

</style>
