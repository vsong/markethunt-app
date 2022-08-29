<template>
    <div style="text-align: center">
        <h1>Portfolio</h1>
    </div>
    <div v-cloak id="vue-container" class="watchlist-tabs-container">
        <ul>
            <li v-for="(portfolio, pidx) in appData.portfolios" class="watchlist-tab">
                <a v-bind:href="'#' + portfolio.uid" @click="setTabIndex(pidx)">{{ portfolio.name }}</a>
                <div class="tab-control-container">
                    <i class="ui-icon light-ui tablesorter-icon ui-icon-pencil" @click="editPortfolio(pidx)"></i>
                    <i class="ui-icon light-ui tablesorter-icon ui-icon-close" @click="removePortfolio(pidx)"></i>
                </div>
            </li>
            <li class="watchlist-tab"><a style="padding: 0px;" href="#newportfolio" @click="newPortfolio()"><span style="margin: 4px 1px;" class="material-icons">add</span></a></li>
        </ul>
        <div v-for="(portfolio, pidx) in appData.portfolios" v-bind:id="portfolio.uid" class="watchlist-tab-content">
            <template v-if="portfolio.uid === appData.portfolios[selectedPortfolioIdx].uid">
                <table class="pure-table pure-table-striped small-td-text table-sortable" style="width:100%; background-color: white;">
                    <thead>
                        <tr>
                            <!-- Must close th on same line to prevent extra space between text and sort arrows -->
                            <th>
                                Item<i class="ui-icon light-ui tablesorter-icon ui-icon-caret-1-n"></i></th>
                            <th class="right-align shrink-wrap hide-mobile">
                                Qty<i class="ui-icon light-ui tablesorter-icon ui-icon-caret-2-n-s"></i></th>
                            <th class="right-align shrink-wrap hide-mobile">
                                Buy Price<i class="ui-icon light-ui tablesorter-icon ui-icon-caret-2-n-s"></i></th>
                            <th class="right-align shrink-wrap">
                                Book Value<i class="ui-icon light-ui tablesorter-icon ui-icon-caret-2-n-s"></i></th>
                            <th class="right-align shrink-wrap">
                                Market Value<i class="ui-icon light-ui tablesorter-icon ui-icon-caret-2-n-s"></i></th>
                            <th class="right-align shrink-wrap">
                                Chg%<i class="ui-icon light-ui tablesorter-icon ui-icon-caret-2-n-s"></i></th>
                            <th class="right-align shrink-wrap hide-mobile">
                                Portfolio%<i class="ui-icon light-ui tablesorter-icon ui-icon-caret-2-n-s"></i></th>
                            <th class="shrink-wrap sorter-false" style="background-color: rgb(216, 0, 0)" v-if="isDebugEnabled()">Debug</th>
                            <th class="button-container sorter-false"></th>
                        </tr>
                    </thead>
                    <template v-for="markType in ['sb', 'gold']">
                        <template v-if="portfolio.positions.filter(position => position.mark_type === markType).length >= 1 && portfolio.positions.length >= 2">
                            <tbody class="tablesorter-infoOnly" style="border-bottom: 1px dashed grey">
                                <tr class="portfolio-summary-row">
                                    <td v-if="markType === 'gold'">Total gold value</td>
                                    <td v-if="markType === 'sb'" >Total SB value</td>
                                    <td class="right-align hide-mobile">{{ getPortfolioTotalQty(portfolio, markType).toLocaleString() }}</td>
                                    <td class="right-align hide-mobile">{{ getPortfolioAvgBuyPrice(portfolio, markType).toLocaleString(...getLocaleStringOpts(markType)) + getMarkTypeAppendText(markType) }}</td>
                                    <td class="right-align">{{ getPortfolioTotalBookValue(portfolio, markType).toLocaleString(...getLocaleStringOpts(markType)) + getMarkTypeAppendText(markType) }}</td>
                                    <td class="right-align" v-bind:class="getColorClass(portfolioTotalMarketValues[markType] / getPortfolioTotalBookValue(portfolio, markType) - 1)">
                                        {{ portfolioTotalMarketValues[markType].toLocaleString(...getLocaleStringOpts(markType)) + getMarkTypeAppendText(markType) }}
                                    </td>
                                    <td class="right-align" v-bind:class="getColorClass(portfolioTotalMarketValues[markType] / getPortfolioTotalBookValue(portfolio, markType) - 1)">
                                        {{ formatPercent((portfolioTotalMarketValues[markType] / getPortfolioTotalBookValue(portfolio, markType) - 1) * 100) }}
                                    </td>
                                    <td class="right-align hide-mobile">
                                        {{ (portfolioTotalMarketValues[markType] * (markType === 'sb' ? appData.itemData[114].latest_price : 1) / portfolioTotalMarketValues.total * 100).toFixed(1) }}%
                                    </td>
                                    <td v-if="isDebugEnabled()"></td>
                                    <td></td>
                                </tr>
                                <tr class="portfolio-summary-row" style="font-weight: normal" v-if="markType === 'gold' && portfolio.inventory_gold">
                                    <td>Inventory gold</td>
                                    <td class="right-align hide-mobile"></td>
                                    <td class="right-align hide-mobile"></td>
                                    <td class="right-align">{{ portfolio.inventory_gold.toLocaleString(...getLocaleStringOpts('gold')) }}</td>
                                    <td class="right-align">{{ portfolio.inventory_gold.toLocaleString(...getLocaleStringOpts('gold')) }}</td>
                                    <td class="right-align"></td>
                                    <td class="right-align hide-mobile">{{ ((portfolio.inventory_gold ?? 0) / portfolioTotalMarketValues.total * 100).toFixed(1) }}%</td>
                                    <td v-if="isDebugEnabled()"></td>
                                    <td></td>
                                </tr>
                            </tbody>
                            <tbody>
                                <PortfolioItemRow
                                    v-for="itemId in itemIdsInSelectedPortfolio(markType)"
                                    :key="itemId"
                                    :portfolio="portfolio"
                                    :markType="markType"
                                    :item="appData.itemData[itemId]"
                                    :portfolioTotals="portfolioTotalMarketValues"
                                ></PortfolioItemRow>
                            </tbody>
                        </template>
                    </template>
                </table>
                <div v-if="portfolio.positions.length === 0" class="empty-watchlist-message">This portfolio is empty.</div>
                <div class="hide-mobile" style="margin-top: 10px; text-align: right">
                    <a href="https://greasyfork.org/en/scripts/441382-mousehunt-markethunt-inventory-export">
                        <span class="material-icons">download</span>Import inventory from Mousehunt
                    </a>
                </div>
            </template>
        </div>
        <div id="newportfolio" class="watchlist-tab-content"></div>
        <div v-if="appData.portfolios.length === 0">
            <p>You deleted all your portfolios! Click the <span style="font-size: 16px" class="material-icons">add</span> icon above to create a new portfolio. </p>
            <img src="/assets/img/NotLikeDuck.png"  alt="SB position indicator"/>
        </div>
        <MyCheckbox v-if="isDebugEnabled()"></MyCheckbox>
    </div>
</template>

<script>
import MyCheckbox from './PortfolioDebugger.vue';
import PortfolioItemRow from "./PortfolioItemRow.vue";

export default {
    name: "PortfolioApp.vue",
    components: {
        MyCheckbox,
        PortfolioItemRow
    },
    data() {
        return {
            appData,
            selectedPortfolioIdx: 0,
            debugMode
        }
    },
    computed: {
        portfolioTotalMarketValues() {
            const portfolio = appData.portfolios[this.selectedPortfolioIdx];
            let totalGoldValue = 0;
            let totalSbValue = 0;

            for (const position of portfolio.positions) {
                if (position.mark_type === "gold") {
                    totalGoldValue += position.qty * appData.itemData[position.item_id].latest_price;
                } else if (position.mark_type === "sb") {
                    totalSbValue += position.qty * appData.itemData[position.item_id].latest_sb_price;
                }
            }

            totalGoldValue += portfolio.inventory_gold ?? 0;

            return {
                gold: totalGoldValue,
                sb: totalSbValue,
                total: totalGoldValue + totalSbValue * appData.itemData[114].latest_price
            }
        }
    },
    methods: {
        getMarkTypeAppendText(markType) {
            return getMarkTypeAppendText(markType);
        },
        itemIdsInSelectedPortfolio(markType) {
            const itemIds = appData.portfolios[this.selectedPortfolioIdx].positions
                .filter(position => position.mark_type === markType)
                .map(position => {
                    return position.item_id;
                });

            return new Set(itemIds);
        },
        getLocaleStringOpts(markType) {
            return getMarkTypeLocaleStringOpts(markType);
        },
        formatPercent(num) {
            return formatPercent(num);
        },
        getColorClass(num) {
            return getVueColorClassBinding(num);
        },
        getPortfolioTotalQty(portfolio, markType) {
            return portfolio.positions.reduce(function(totalQty, position) {
                if (position.mark_type === markType) {
                    return totalQty + position.qty;
                } else {
                    return totalQty;
                }
            }, 0);
        },
        getPortfolioTotalBookValue(portfolio, markType) {
            let totalBookValue = portfolio.positions.reduce(function(totalBook, position) {
                if (position.mark_type === markType) {
                    return totalBook + position.qty * position.mark;
                } else {
                    return totalBook;
                }
            }, 0);

            if (markType === 'gold') {
                totalBookValue += (portfolio.inventory_gold ?? 0);
            }

            return totalBookValue;
        },
        getPortfolioAvgBuyPrice(portfolio, markType) {
            var avgPrice = this.getPortfolioTotalBookValue(portfolio, markType) / this.getPortfolioTotalQty(portfolio, markType);
            if (markType == "gold") {
                return Math.round(avgPrice);
            } else {
                return Math.round(avgPrice * 100) / 100;
            }
        },
        removePortfolio(pidx) {
            showUndeleteToast(getPortfolioObjKey());
            if (pidx < this.selectedPortfolioIdx || this.selectedPortfolioIdx === appData.portfolios.length - 1) {
                this.selectedPortfolioIdx--;
                $("#vue-container").tabs("option", "active", this.selectedPortfolioIdx);
            }
            appData.portfolios.splice(pidx, 1);
            this.appData.redrawTabs = true;
            setPortfolioObj(appData.portfolios);
        },
        editPortfolio(pidx) {
            newPortfolioModal(pidx);
        },
        setTabIndex(pidx) {
            this.selectedPortfolioIdx = pidx;
            $('#portfolio-select').val(pidx);
        },
        newPortfolio() {
            newPortfolioModal();
        },
        isDebugEnabled() {
            return isDebugModeEnabled();
        }
    },
    updated() {
        if (this.appData.redrawTabs) {
            this.appData.redrawTabs = false;
            try {
                $("#vue-container").tabs('refresh');
            } catch (e) {
                // do nothing
            }
        }

        // Re-init tablesorter after every update because we may have switched tabs and the tables got destroyed
        // and update tablesorter tbody cache in case it's the same table, but with updated rows
        initTablesorter();
        $(".table-sortable").trigger('update');
    },
    mounted() {
        // initial jquery tabs update
        $("#vue-container").tabs({
            beforeActivate: function(event, ui) {
                if (ui.newPanel.attr('id') === 'newportfolio'){
                    event.preventDefault();
                }
            }
        });

        initTablesorter();
    }
}
</script>

<style scoped>

</style>