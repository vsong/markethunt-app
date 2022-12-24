<template>
    <OAutocomplete
        v-model="name"
        open-on-focus
        keep-first
        placeholder="Search for Marketplace Item"
        icon="magnify"
        icon-right="chevron-down"
        clearable
        :debounce-typing="500"
        :data="filteredData"
        field="name"
        @select="option => selectedItem = option"
        check-infinite-scroll
        @infinite-scroll="increaseFilteredData"
        :loading="isLoading"
    >
        <template #default="props">
            <div class="lookup-row">
                <div class="thumbnail-container">
                    <img :src="`https://cdn.markethunt.win/thumbnail/item/${props.option.item_id}.gif`" class="item-lookup-thumbnail">
                </div>
                <div>
                    {{ props.option.name }}
                </div>
            </div>
        </template>
    </OAutocomplete>
    <div>{{ name }}</div>
    <div>{{ selectedItem }}</div>
</template>

<script>
import { OAutocomplete } from '@oruga-ui/oruga-next';

export default {
    name: "ItemSelector",
    components: { OAutocomplete },
    data() {
        return {
            name: 'Rare Map Dust',
            selectedItem: itemData[926],
            pageSize:50,
            pageLimit: 1,
            isLoading: false
        }
    },
    computed: {
        sortedItemData() {
            let values = Object.values(itemData);
            values.sort((a, b) => a.name > b.name ? 1 : -1);
            return values;
        },
        filteredData() {
            return this.sortedItemData
                .filter(x => x.name.toLowerCase().includes(this.name.toLowerCase()))
                .slice(0, this.pageLimit * this.pageSize);
        }
    },
    methods: {
        increaseFilteredData() {
            this.pageLimit += 1;
        }
    },
    watch: {
        name(newVal) {
            this.pageLimit = 1;
        }
    }
}
</script>

<style scoped>
.lookup-row {
    display: flex;
    align-items: center;
}
.thumbnail-container {
    width: 30px;
    height: 30px;
    margin-right: 10px;
}
.item-lookup-thumbnail {
    width: 100%;
    height: 100%;
    object-fit: contain;
}
</style>