<template>
    <tr class="portfolio-item-row tablesorter-hasChildRow" @click="expanded = !expanded">
        <td v-bind:class="{'sb-row-marker' : markType === 'sb'}" :data-text="item.name">
            <span class="material-icons row-expand-icon">{{ expanded ? 'expand_more' : 'chevron_right' }}</span>
            <a @click.stop="setChart(item.item_id, item.name)">
                {{ item.name }}
            </a>
            <span v-if="relevantPositions.length > 1">
                ({{ relevantPositions.length }})
            </span>
        </td>
        <td class="right-align hide-mobile">{{ itemQty.toLocaleString() }}</td>
        <td class="right-align hide-mobile shrink-wrap">
            {{ itemAverageBuyPrice.toLocaleString(...localeStringOpts) + currencySuffix}}
        </td>
        <td class="right-align shrink-wrap">
            {{ itemBookValue.toLocaleString(...localeStringOpts) + currencySuffix }}
            <div class="book-value-mobile-hint">
                {{ itemQty.toLocaleString() }} @ {{ itemAverageBuyPrice.toLocaleString(...localeStringOpts) + currencySuffix }}
            </div>
        </td>
        <td class="right-align shrink-wrap" v-bind:class="getColorClass(itemChangePercent)">
            {{ itemMarketValue.toLocaleString(...localeStringOpts) + currencySuffix }}
        </td>
        <td class="right-align" v-bind:class="getColorClass(itemChangePercent)">
            {{ formatPercent(itemChangePercent) }}
        </td>
        <td class="right-align hide-mobile">
            {{ itemPortfolioPercent.toFixed(1) + '%' }}
        </td>
        <td v-if="isDebugEnabled()">{{ item.item_id }}</td>
        <td class="right-align button-container">
            <span class="material-icons">add</span>
            <span class="material-icons">sell</span>
        </td>
    </tr>
<!--    <template>-->
        <PortfolioPositionRow v-for="position in relevantPositions" :key="position.uid"
            class="tablesorter-childRow"
            :class="{'hidden': !expanded}"
            :position="position"
            :itemData="item"
            :portfolioTotals="portfolioTotals"
        ></PortfolioPositionRow>
<!--    </template>-->
</template>

<script>
import PortfolioPositionRow from "./PortfolioPositionRow.vue";
export default {
    name: "PortfolioItemRow",
    components: {
        PortfolioPositionRow
    },
    props: ['portfolio', 'markType', 'item', 'portfolioTotals'],
    data() {
        return {
            expanded: false,
        }
    },
    computed: {
        relevantPositions() {
            return this.portfolio.positions.filter(position => {
                return position.item_id === this.item.item_id && position.mark_type === this.markType;
            });
        },
        currentItemPrice() {
            return this.markType === 'gold' ? this.item.latest_price : this.item.latest_sb_price;
        },
        itemQty() {
            return this.relevantPositions.reduce((sum, position) => {
                return sum += position.qty;
            }, 0);
        },
        itemAverageBuyPrice() {
            return this.itemBookValue / this.itemQty;
        },
        itemBookValue() {
            return this.relevantPositions.reduce((sum, position) => {
                return sum += position.qty * position.mark;
            }, 0);
        },
        itemMarketValue() {
            return this.currentItemPrice * this.itemQty;
        },
        itemChangePercent() {
            return (this.currentItemPrice / this.itemAverageBuyPrice - 1) * 100;
        },
        itemPortfolioPercent() {
            const goldConversionFactor = this.markType === 'sb' ? appData.itemData[114].latest_price : 1
            return (this.itemMarketValue * goldConversionFactor / this.portfolioTotals.total) * 100;
        },
        localeStringOpts() {
            return getMarkTypeLocaleStringOpts(this.markType);
        },
        currencySuffix() {
            return getMarkTypeAppendText(this.markType);
        }
    },
    methods: {
        formatPercent(num) {
            return formatPercent(num);
        },
        getColorClass(num) {
            return getVueColorClassBinding(num);
        },
        isDebugEnabled() {
            return isDebugModeEnabled();
        },
        setChart(itemId, headerText) {
            document.getElementById('chartSelector').value = itemId;
            renderChartWithItemId(itemId, headerText);
            window.history.replaceState({}, headerText, "/portfolio.php?item_id=" + itemId);
        }
    }
}
</script>

<style scoped>
.portfolio-item-row {
    cursor: pointer;
    user-select: none;
}

.row-expand-icon {
    font-size: 18px;
    margin-right: 4px;
    vertical-align: top;
    color: var(--highlight-color);
}
</style>