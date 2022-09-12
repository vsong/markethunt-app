<template>
    <tr :class="{'clickable': item.positions.length > 1}" @click="expand">
        <td v-bind:class="{'sb-row-marker' : markType === 'sb'}" :data-text="item.name">
            <span class="material-icons row-expand-icon" :class="{'invisible': item.positions.length <= 1}">
                {{ expanded ? 'expand_more' : 'chevron_right' }}
            </span>
            <a @click.stop="setChart(item.itemId.toString(), item.name)">
                {{ item.name }}
            </a>
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
            <!--    edit sell delete-->
            <!--    qty badge sell delete-->

            <div class="qty-badge" v-if="item.positions.length > 1">{{ item.positions.length }}</div>
            <span class="material-icons" v-if="item.positions.length === 1">edit</span>
            <span class="material-icons">sell</span>
            <span class="material-icons">delete</span>
        </td>
    </tr>
    <template v-if="expanded">
        <PortfolioPositionRow v-for="position in item.positions" :key="position.uid"
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
        expand() {
            if (this.item.positions.length > 1) {
                this.expanded = !this.expanded;
            }
        },
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
.clickable {
    cursor: pointer;
}

.clickable:hover {
    background-color: var(--highlight-color-light);
}

.row-expand-icon {
    font-size: 18px;
    margin-right: 4px;
    vertical-align: top;
    color: var(--highlight-color);
}

.invisible {
    opacity: 0;
}

.qty-badge {
    display: inline-block;
    font-size: 0.8em;
    color: white;
    background-color: var(--highlight-color);
    padding: 0.3em;
    border-radius: 99em;
    width: 12px;
    height: 12px;
    text-align: center;
    box-shadow: 1px 1px 1px #aaaaaa;
    margin-right: 2px;
}
</style>