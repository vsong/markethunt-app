<template>
    <tr class="portfolio-item-row tablesorter-hasChildRow" @click="expanded = !expanded">
        <td v-bind:class="{'sb-row-marker' : markType === 'sb'}" :data-text="item.name">
            <span class="material-icons row-expand-icon">{{ expanded ? 'expand_more' : 'chevron_right' }}</span>
            <a @click.stop="setChart(item.itemId.toString(), item.name)">
                {{ item.name }}
            </a>
            <span v-if="relevantPositions.length > 1">
                ({{ relevantPositions.length }})
            </span>
        </td>
        <td class="right-align hide-mobile">{{ item.qty.toLocaleString() }}</td>
        <td class="right-align hide-mobile shrink-wrap">
            {{ item.avgBuyPrice.toLocaleString(...localeStringOpts) + currencySuffix}}
        </td>
        <td class="right-align shrink-wrap">
            {{ item.bookValue.toLocaleString(...localeStringOpts) + currencySuffix }}
            <div class="book-value-mobile-hint">
                {{ item.qty.toLocaleString() }} @ {{ item.avgBuyPrice.toLocaleString(...localeStringOpts) + currencySuffix }}
            </div>
        </td>
        <td class="right-align shrink-wrap" v-bind:class="getColorClass(item.changePercent)">
            {{ item.marketValue.toLocaleString(...localeStringOpts) + currencySuffix }}
        </td>
        <td class="right-align" v-bind:class="getColorClass(item.changePercent)">
            {{ formatPercent(item.changePercent) }}
        </td>
        <td class="right-align hide-mobile">
            {{ item.portfolioPercent.toFixed(1) + '%' }}
        </td>
        <td v-if="isDebugEnabled()">{{ item.itemId }}</td>
        <td class="right-align button-container">
            <span class="material-icons" v-if="relevantPositions.length === 1">edit</span>
            <span class="material-icons" v-if="relevantPositions.length > 1">add</span>
            <span class="material-icons">sell</span>
            <span class="material-icons">delete</span>
        </td>
    </tr>
    <template v-if="expanded">
        <PortfolioPositionRow v-for="position in relevantPositions" :key="position.uid"
            class="tablesorter-childRow"
            :position="position"
            :itemData="item"
            :portfolioTotals="portfolioTotals"
        ></PortfolioPositionRow>
    </template>
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
                return position.item_id === this.item.itemId && position.mark_type === this.markType;
            });
        },
        currentItemPrice() {
            return this.markType === 'gold' ? this.item.latest_price : this.item.latest_sb_price;
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